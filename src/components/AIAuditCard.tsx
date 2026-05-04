import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Clock,
  Download,
  ShieldCheck,
  Loader2,
  History,
  Lock,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation, type Language } from "@/i18n/context";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { toast } from "sonner";

type EvidenceStatus = "validated" | "in-progress" | "planned";
type FilterValue = "all" | EvidenceStatus;

interface EvidenceField {
  id: string;
  label: string;
  value: string;
  status: EvidenceStatus;
  version: string;
  lastVerified: string;
  source?: { label: string; href: string };
}

interface PanelCopy {
  title: string;
  subtitle: string;
  framework: string;
  policy: string;
  policyVersion: string;
  statusLabels: Record<EvidenceStatus, string>;
  versionLabel: string;
  verifiedLabel: string;
  filterAll: string;
  filterCount: (n: number) => string;
  exportPdf: string;
  exportFilename: string;
  pdfHeaders: { row: string; status: string; version: string; verified: string; source: string };
  confirmCta: string;
  confirmedAt: string;
  confirming: string;
  confirmTitle: string;
  confirmHint: string;
  noteLabel: string;
  noteSubmit: string;
  noteCancel: string;
  signedInRequired: string;
  unauthorized: string;
  confirmSuccess: string;
  confirmError: string;
  historyCta: string;
  historyTitle: string;
  historyEmpty: string;
  historyLoading: string;
  historyClose: string;
  historySelf: string;
  fields: EvidenceField[];
}

const FIELDS_EN: EvidenceField[] = [
  { id: "architecture", label: "Architecture", value: "Denoising U-Net + super-resolution + EMI suppression — open model card.", status: "in-progress", version: "model-card v0.2", lastVerified: "2026-04-12", source: { label: "Zenodo (placeholder DOI)", href: "https://zenodo.org/" } },
  { id: "training-data", label: "Training data", value: "Public phantom + simulated low-field datasets; no patient data used at this stage.", status: "validated", version: "dataset v0.1", lastVerified: "2026-03-28", source: { label: "Dataset card (Zenodo)", href: "https://zenodo.org/" } },
  { id: "validation-data", label: "Validation data", value: "Independent phantom set (n placeholder) — clinical validation set frozen at WP2 freeze.", status: "in-progress", version: "split v0.1", lastVerified: "2026-04-10" },
  { id: "performance", label: "Performance", value: "PSNR / SSIM / perceptual metrics (placeholder values until WP2 freeze).", status: "in-progress", version: "report v0.2", lastVerified: "2026-04-12" },
  { id: "robustness", label: "Robustness", value: "Adversarial + out-of-distribution probes — protocol drafted, runs scheduled WP2.", status: "planned", version: "protocol v0.1", lastVerified: "2026-04-02" },
  { id: "calibration", label: "Calibration & uncertainty", value: "Per-pixel uncertainty map + Brier score on calibration cohort.", status: "planned", version: "spec v0.1", lastVerified: "2026-04-02" },
  { id: "hallucination", label: "Hallucination audit", value: "3 % random sample re-read without AI · 0 hallucination cases reported to date (placeholder count).", status: "in-progress", version: "audit v0.3", lastVerified: "2026-04-15", source: { label: "TRIPOD+AI 2024", href: "https://www.tripod-statement.org/" } },
  { id: "code-weights", label: "Code & weights", value: "BSD-3 / MIT, mirrored on Zenodo with DOI per release.", status: "in-progress", version: "repo v0.2", lastVerified: "2026-04-12", source: { label: "GitHub repository", href: "https://github.com/" } },
];

const FIELDS_FR: EvidenceField[] = [
  { id: "architecture", label: "Architecture", value: "U-Net débruitage + super-résolution + suppression EMI — model card ouverte.", status: "in-progress", version: "model-card v0.2", lastVerified: "2026-04-12", source: { label: "Zenodo (DOI placeholder)", href: "https://zenodo.org/" } },
  { id: "training-data", label: "Données d'entraînement", value: "Datasets publics (fantôme + bas champ simulé) ; aucune donnée patient à ce stade.", status: "validated", version: "dataset v0.1", lastVerified: "2026-03-28", source: { label: "Dataset card (Zenodo)", href: "https://zenodo.org/" } },
  { id: "validation-data", label: "Données de validation", value: "Jeu fantôme indépendant (n placeholder) — jeu clinique gelé au freeze WP2.", status: "in-progress", version: "split v0.1", lastVerified: "2026-04-10" },
  { id: "performance", label: "Performance", value: "PSNR / SSIM / perceptuel (valeurs placeholder jusqu'au gel WP2).", status: "in-progress", version: "rapport v0.2", lastVerified: "2026-04-12" },
  { id: "robustness", label: "Robustesse", value: "Sondes adversarial + OOD — protocole rédigé, runs planifiés en WP2.", status: "planned", version: "protocole v0.1", lastVerified: "2026-04-02" },
  { id: "calibration", label: "Calibration & incertitude", value: "Carte d'incertitude par pixel + score de Brier sur cohorte de calibration.", status: "planned", version: "spec v0.1", lastVerified: "2026-04-02" },
  { id: "hallucination", label: "Audit hallucination", value: "Re-lecture aléatoire 3 % sans IA · 0 cas d'hallucination à ce jour (compte placeholder).", status: "in-progress", version: "audit v0.3", lastVerified: "2026-04-15", source: { label: "TRIPOD+AI 2024", href: "https://www.tripod-statement.org/" } },
  { id: "code-weights", label: "Code & poids", value: "BSD-3 / MIT, miroir Zenodo avec DOI par release.", status: "in-progress", version: "dépôt v0.2", lastVerified: "2026-04-12", source: { label: "Dépôt GitHub", href: "https://github.com/" } },
];

const FIELDS_DE: EvidenceField[] = [
  { id: "architecture", label: "Architektur", value: "Denoising-U-Net + Super-Resolution + EMI-Suppression — offene Model Card.", status: "in-progress", version: "model-card v0.2", lastVerified: "2026-04-12", source: { label: "Zenodo (DOI-Platzhalter)", href: "https://zenodo.org/" } },
  { id: "training-data", label: "Trainingsdaten", value: "Öffentliche Phantom- + simulierte Low-Field-Datensätze; bislang keine Patientendaten.", status: "validated", version: "dataset v0.1", lastVerified: "2026-03-28", source: { label: "Dataset Card (Zenodo)", href: "https://zenodo.org/" } },
  { id: "validation-data", label: "Validierungsdaten", value: "Unabhängiges Phantom-Set (n Platzhalter) — klinisches Set bei WP2-Freeze fixiert.", status: "in-progress", version: "split v0.1", lastVerified: "2026-04-10" },
  { id: "performance", label: "Leistung", value: "PSNR / SSIM / perzeptuell (Platzhalterwerte bis WP2-Freeze).", status: "in-progress", version: "report v0.2", lastVerified: "2026-04-12" },
  { id: "robustness", label: "Robustheit", value: "Adversarial- + OOD-Sonden — Protokoll erstellt, Läufe für WP2 geplant.", status: "planned", version: "protokoll v0.1", lastVerified: "2026-04-02" },
  { id: "calibration", label: "Kalibrierung & Unsicherheit", value: "Pixelweise Unsicherheitskarte + Brier-Score auf Kalibrierungskohorte.", status: "planned", version: "spec v0.1", lastVerified: "2026-04-02" },
  { id: "hallucination", label: "Halluzinations-Audit", value: "3 % zufälliger Re-Read ohne KI · bisher 0 Halluzinationsfälle (Platzhalter).", status: "in-progress", version: "audit v0.3", lastVerified: "2026-04-15", source: { label: "TRIPOD+AI 2024", href: "https://www.tripod-statement.org/" } },
  { id: "code-weights", label: "Code & Gewichte", value: "BSD-3 / MIT, Zenodo-Mirror mit DOI pro Release.", status: "in-progress", version: "repo v0.2", lastVerified: "2026-04-12", source: { label: "GitHub-Repository", href: "https://github.com/" } },
];

const COPY: Record<Language, PanelCopy> = {
  en: {
    title: "AI reconstruction — audit panel",
    subtitle: "TRIPOD+AI 2024 alignment for the low-field denoising / super-resolution chain. Each row is versioned and source-linked.",
    framework: "Audit framework",
    policy: "If AI reconstruction modifies the diagnosis vs the non-AI baseline, the case is automatically flagged for DSMB review.",
    policyVersion: "Policy v0.3 — frozen 2026-04-15",
    statusLabels: { validated: "Validated", "in-progress": "In progress", planned: "Planned" },
    versionLabel: "Version",
    verifiedLabel: "Last verified",
    filterAll: "All",
    filterCount: (n) => `${n} row${n === 1 ? "" : "s"}`,
    exportPdf: "Export PDF",
    exportFilename: "ai-audit-evidence",
    pdfHeaders: { row: "Evidence", status: "Status", version: "Version", verified: "Last verified", source: "Source" },
    confirmCta: "Confirm as clinician",
    confirmedAt: "Confirmed",
    confirming: "Confirming…",
    confirmTitle: "Clinician confirmation",
    confirmHint: "Your confirmation is logged in the audit trail and visible to the DSMB.",
    noteLabel: "Optional note",
    noteSubmit: "Confirm",
    noteCancel: "Cancel",
    signedInRequired: "Sign in to confirm evidence rows.",
    unauthorized: "Only clinicians or expert reviewers can confirm evidence.",
    confirmSuccess: "Evidence confirmed and logged.",
    confirmError: "Could not save confirmation.",
    historyCta: "View history",
    historyTitle: "Confirmation history",
    historyEmpty: "No confirmations yet.",
    historyLoading: "Loading history…",
    historyClose: "Close",
    historySelf: "you",
    fields: FIELDS_EN,
  },
  fr: {
    title: "Reconstruction IA — panneau d'audit",
    subtitle: "Alignement TRIPOD+AI 2024 pour la chaîne débruitage / super-résolution bas champ. Chaque ligne est versionnée et sourcée.",
    framework: "Cadre d'audit",
    policy: "Si la reconstruction IA modifie le diagnostic vs la baseline sans IA, le cas est automatiquement signalé au DSMB.",
    policyVersion: "Politique v0.3 — gelée le 2026-04-15",
    statusLabels: { validated: "Validé", "in-progress": "En cours", planned: "Planifié" },
    versionLabel: "Version",
    verifiedLabel: "Dernière vérification",
    filterAll: "Tout",
    filterCount: (n) => `${n} ligne${n === 1 ? "" : "s"}`,
    exportPdf: "Exporter PDF",
    exportFilename: "audit-ia-evidence",
    pdfHeaders: { row: "Évidence", status: "Statut", version: "Version", verified: "Dernière vérification", source: "Source" },
    confirmCta: "Confirmer (clinicien)",
    confirmedAt: "Confirmé",
    confirming: "Confirmation…",
    confirmTitle: "Confirmation clinicien",
    confirmHint: "Votre confirmation est tracée dans l'audit log et visible par le DSMB.",
    noteLabel: "Note (optionnelle)",
    noteSubmit: "Confirmer",
    noteCancel: "Annuler",
    signedInRequired: "Connectez-vous pour confirmer les lignes d'évidence.",
    confirmSuccess: "Évidence confirmée et journalisée.",
    confirmError: "Impossible d'enregistrer la confirmation.",
    fields: FIELDS_FR,
  },
  de: {
    title: "KI-Rekonstruktion — Audit-Panel",
    subtitle: "TRIPOD+AI-2024-konform für die Low-Field-Denoising-/Super-Resolution-Kette. Jede Zeile ist versioniert und mit Quelle verlinkt.",
    framework: "Audit-Rahmen",
    policy: "Wenn die KI-Rekonstruktion die Diagnose gegenüber der Nicht-KI-Baseline verändert, wird der Fall automatisch zur DSMB-Prüfung markiert.",
    policyVersion: "Policy v0.3 — eingefroren am 15.04.2026",
    statusLabels: { validated: "Validiert", "in-progress": "In Arbeit", planned: "Geplant" },
    versionLabel: "Version",
    verifiedLabel: "Zuletzt verifiziert",
    filterAll: "Alle",
    filterCount: (n) => `${n} Zeile${n === 1 ? "" : "n"}`,
    exportPdf: "PDF exportieren",
    exportFilename: "ki-audit-evidenz",
    pdfHeaders: { row: "Evidenz", status: "Status", version: "Version", verified: "Zuletzt verifiziert", source: "Quelle" },
    confirmCta: "Als Klinikerin bestätigen",
    confirmedAt: "Bestätigt",
    confirming: "Bestätige…",
    confirmTitle: "Kliniker-Bestätigung",
    confirmHint: "Ihre Bestätigung wird im Audit-Log protokolliert und ist für das DSMB sichtbar.",
    noteLabel: "Notiz (optional)",
    noteSubmit: "Bestätigen",
    noteCancel: "Abbrechen",
    signedInRequired: "Bitte anmelden, um Evidenzzeilen zu bestätigen.",
    confirmSuccess: "Evidenz bestätigt und protokolliert.",
    confirmError: "Bestätigung konnte nicht gespeichert werden.",
    fields: FIELDS_DE,
  },
};

const STATUS_TONE: Record<EvidenceStatus, string> = {
  validated: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "in-progress": "border-warning/40 bg-warning/10 text-warning",
  planned: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

const STATUS_ICON: Record<EvidenceStatus, typeof CheckCircle2> = {
  validated: CheckCircle2,
  "in-progress": Clock,
  planned: AlertTriangle,
};

interface ConfirmationRecord {
  evidence_id: string;
  evidence_version: string;
  confirmed_at: string;
}

interface Props {
  className?: string;
}

export function AIAuditCard({ className = "" }: Props) {
  const { language } = useTranslation();
  const { user } = useAuth();
  const copy = COPY[language] ?? COPY.en;

  const [filter, setFilter] = useState<FilterValue>("all");
  const [confirmations, setConfirmations] = useState<Record<string, ConfirmationRecord>>({});
  const [openConfirm, setOpenConfirm] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load existing user confirmations
  useEffect(() => {
    if (!user) {
      setConfirmations({});
      return;
    }
    let cancelled = false;
    supabase
      .from("ai_audit_confirmations")
      .select("evidence_id, evidence_version, confirmed_at")
      .eq("user_id", user.id)
      .order("confirmed_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: Record<string, ConfirmationRecord> = {};
        for (const r of data) {
          // keep most recent per evidence_id+version (first because ordered desc)
          const key = `${r.evidence_id}::${r.evidence_version}`;
          if (!map[key]) map[key] = r as ConfirmationRecord;
        }
        setConfirmations(map);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const counts = useMemo(() => {
    const base = { all: copy.fields.length, validated: 0, "in-progress": 0, planned: 0 } as Record<FilterValue, number>;
    for (const f of copy.fields) base[f.status]++;
    return base;
  }, [copy.fields]);

  const visibleFields = useMemo(
    () => (filter === "all" ? copy.fields : copy.fields.filter((f) => f.status === filter)),
    [filter, copy.fields]
  );

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text(copy.title, 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`${copy.framework} · TRIPOD+AI 2024`, 40, 58);
    doc.text(`${copy.policyVersion} · ${new Date().toISOString().slice(0, 10)}`, 40, 72);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 90,
      head: [[copy.pdfHeaders.row, copy.pdfHeaders.status, copy.pdfHeaders.version, copy.pdfHeaders.verified, copy.pdfHeaders.source]],
      body: visibleFields.map((f) => [
        `${f.label}\n${f.value}`,
        copy.statusLabels[f.status],
        f.version,
        f.lastVerified,
        f.source ? `${f.source.label}\n${f.source.href}` : "—",
      ]),
      styles: { fontSize: 9, cellPadding: 6, valign: "top" },
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: { 0: { cellWidth: 280 }, 4: { cellWidth: 180 } },
    });

    const filename = `${copy.exportFilename}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  const submitConfirmation = async (field: EvidenceField) => {
    if (!user) {
      toast.error(copy.signedInRequired);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("ai_audit_confirmations")
      .insert({
        user_id: user.id,
        evidence_id: field.id,
        evidence_version: field.version,
        note: note.trim() || null,
      })
      .select("evidence_id, evidence_version, confirmed_at")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error(copy.confirmError);
      return;
    }
    setConfirmations((prev) => ({
      ...prev,
      [`${field.id}::${field.version}`]: data as ConfirmationRecord,
    }));
    setOpenConfirm(null);
    setNote("");
    toast.success(copy.confirmSuccess);
  };

  const filterButton = (value: FilterValue, label: string, count: number) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      data-testid={`ai-audit-filter-${value}`}
      aria-pressed={filter === value}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
        filter === value
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
      <span className="opacity-70">({count})</span>
    </button>
  );

  return (
    <section
      aria-labelledby="ai-audit-card-title"
      data-testid="ai-audit-card"
      className={`rounded-2xl border bg-card p-5 md:p-6 ${className}`}
    >
      <header className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Brain className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-primary mb-0.5">
            {copy.framework}
          </p>
          <h3 id="ai-audit-card-title" className="text-base md:text-lg font-semibold">
            {copy.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleExportPdf}
          data-testid="ai-audit-export-pdf"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-medium shrink-0"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {copy.exportPdf}
        </button>
      </header>

      <div className="flex flex-wrap gap-1.5 mb-4" role="group" aria-label="status filter">
        {filterButton("all", copy.filterAll, counts.all)}
        {filterButton("validated", copy.statusLabels.validated, counts.validated)}
        {filterButton("in-progress", copy.statusLabels["in-progress"], counts["in-progress"])}
        {filterButton("planned", copy.statusLabels.planned, counts.planned)}
      </div>

      <ul className="space-y-3" role="list">
        {visibleFields.map((f) => {
          const StatusIcon = STATUS_ICON[f.status];
          const confirmation = confirmations[`${f.id}::${f.version}`];
          const isOpen = openConfirm === f.id;
          return (
            <li
              key={f.id}
              data-testid={`ai-audit-row-${f.id}`}
              data-status={f.status}
              className="rounded-xl border bg-background/40 p-3 sm:p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <h4 className="font-medium text-sm">{f.label}</h4>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_TONE[f.status]}`}
                >
                  <StatusIcon className="h-3 w-3" aria-hidden />
                  {copy.statusLabels[f.status]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.value}</p>
              <dl className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/90">
                <div className="flex items-center gap-1">
                  <dt className="font-semibold">{copy.versionLabel}:</dt>
                  <dd className="font-mono">{f.version}</dd>
                </div>
                <div className="flex items-center gap-1">
                  <dt className="font-semibold">{copy.verifiedLabel}:</dt>
                  <dd>
                    <time dateTime={f.lastVerified}>{f.lastVerified}</time>
                  </dd>
                </div>
                {f.source && (
                  <div className="flex items-center gap-1">
                    <dt className="sr-only">Source</dt>
                    <dd>
                      <a
                        href={f.source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {f.source.label}
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-3 pt-2 border-t border-border/60">
                {confirmation ? (
                  <p
                    data-testid={`ai-audit-confirmed-${f.id}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    {copy.confirmedAt} · <time dateTime={confirmation.confirmed_at}>{confirmation.confirmed_at.slice(0, 10)}</time>
                  </p>
                ) : isOpen ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">{copy.confirmHint}</p>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={copy.noteLabel}
                      rows={2}
                      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => submitConfirmation(f)}
                        disabled={submitting}
                        data-testid={`ai-audit-confirm-submit-${f.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                        ) : (
                          <ShieldCheck className="h-3 w-3" aria-hidden />
                        )}
                        {submitting ? copy.confirming : copy.noteSubmit}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenConfirm(null);
                          setNote("");
                        }}
                        className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
                      >
                        {copy.noteCancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        toast.error(copy.signedInRequired);
                        return;
                      }
                      setOpenConfirm(f.id);
                      setNote("");
                    }}
                    data-testid={`ai-audit-confirm-cta-${f.id}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    {copy.confirmCta}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 pt-3 border-t text-xs text-foreground/80 flex gap-2">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden />
        <span>
          {copy.policy}
          <span className="block text-muted-foreground/80 mt-0.5 italic">{copy.policyVersion}</span>
        </span>
      </p>
    </section>
  );
}

export default AIAuditCard;
