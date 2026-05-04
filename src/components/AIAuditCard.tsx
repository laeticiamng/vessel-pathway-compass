import { Brain, CheckCircle2, AlertTriangle, ExternalLink, Clock } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

type EvidenceStatus = "validated" | "in-progress" | "planned";

interface EvidenceField {
  /** Stable id for tests / audit trail. */
  id: string;
  /** Display label. */
  label: string;
  /** Versioned, source-linked value. */
  value: string;
  /** Validation lifecycle. */
  status: EvidenceStatus;
  /** Component / model version this row refers to. */
  version: string;
  /** Last verified date (ISO). */
  lastVerified: string;
  /** Optional source link (DOI, repo, registry). */
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
  fields: EvidenceField[];
}

const COPY: Record<Language, PanelCopy> = {
  en: {
    title: "AI reconstruction — audit panel",
    subtitle:
      "TRIPOD+AI 2024 alignment for the low-field denoising / super-resolution chain. Each row is versioned and source-linked.",
    framework: "Audit framework",
    policy:
      "If AI reconstruction modifies the diagnosis vs the non-AI baseline, the case is automatically flagged for DSMB review.",
    policyVersion: "Policy v0.3 — frozen 2026-04-15",
    statusLabels: {
      validated: "Validated",
      "in-progress": "In progress",
      planned: "Planned",
    },
    versionLabel: "Version",
    verifiedLabel: "Last verified",
    fields: [
      {
        id: "architecture",
        label: "Architecture",
        value:
          "Denoising U-Net + super-resolution + EMI suppression — open model card.",
        status: "in-progress",
        version: "model-card v0.2",
        lastVerified: "2026-04-12",
        source: { label: "Zenodo (placeholder DOI)", href: "https://zenodo.org/" },
      },
      {
        id: "training-data",
        label: "Training data",
        value:
          "Public phantom + simulated low-field datasets; no patient data used at this stage.",
        status: "validated",
        version: "dataset v0.1",
        lastVerified: "2026-03-28",
        source: { label: "Dataset card (Zenodo)", href: "https://zenodo.org/" },
      },
      {
        id: "validation-data",
        label: "Validation data",
        value:
          "Independent phantom set (n placeholder) — clinical validation set frozen at WP2 freeze.",
        status: "in-progress",
        version: "split v0.1",
        lastVerified: "2026-04-10",
      },
      {
        id: "performance",
        label: "Performance",
        value:
          "PSNR / SSIM / perceptual metrics (placeholder values until WP2 freeze).",
        status: "in-progress",
        version: "report v0.2",
        lastVerified: "2026-04-12",
      },
      {
        id: "robustness",
        label: "Robustness",
        value:
          "Adversarial + out-of-distribution probes — protocol drafted, runs scheduled WP2.",
        status: "planned",
        version: "protocol v0.1",
        lastVerified: "2026-04-02",
      },
      {
        id: "calibration",
        label: "Calibration & uncertainty",
        value:
          "Per-pixel uncertainty map + Brier score on calibration cohort.",
        status: "planned",
        version: "spec v0.1",
        lastVerified: "2026-04-02",
      },
      {
        id: "hallucination",
        label: "Hallucination audit",
        value:
          "3 % random sample re-read without AI · 0 hallucination cases reported to date (placeholder count).",
        status: "in-progress",
        version: "audit v0.3",
        lastVerified: "2026-04-15",
        source: {
          label: "TRIPOD+AI 2024",
          href: "https://www.tripod-statement.org/",
        },
      },
      {
        id: "code-weights",
        label: "Code & weights",
        value: "BSD-3 / MIT, mirrored on Zenodo with DOI per release.",
        status: "in-progress",
        version: "repo v0.2",
        lastVerified: "2026-04-12",
        source: { label: "GitHub repository", href: "https://github.com/" },
      },
    ],
  },
  fr: {
    title: "Reconstruction IA — panneau d'audit",
    subtitle:
      "Alignement TRIPOD+AI 2024 pour la chaîne débruitage / super-résolution bas champ. Chaque ligne est versionnée et sourcée.",
    framework: "Cadre d'audit",
    policy:
      "Si la reconstruction IA modifie le diagnostic vs la baseline sans IA, le cas est automatiquement signalé au DSMB.",
    policyVersion: "Politique v0.3 — gelée le 2026-04-15",
    statusLabels: {
      validated: "Validé",
      "in-progress": "En cours",
      planned: "Planifié",
    },
    versionLabel: "Version",
    verifiedLabel: "Dernière vérification",
    fields: [
      {
        id: "architecture",
        label: "Architecture",
        value:
          "U-Net débruitage + super-résolution + suppression EMI — model card ouverte.",
        status: "in-progress",
        version: "model-card v0.2",
        lastVerified: "2026-04-12",
        source: { label: "Zenodo (DOI placeholder)", href: "https://zenodo.org/" },
      },
      {
        id: "training-data",
        label: "Données d'entraînement",
        value:
          "Datasets publics (fantôme + bas champ simulé) ; aucune donnée patient à ce stade.",
        status: "validated",
        version: "dataset v0.1",
        lastVerified: "2026-03-28",
        source: { label: "Dataset card (Zenodo)", href: "https://zenodo.org/" },
      },
      {
        id: "validation-data",
        label: "Données de validation",
        value:
          "Jeu fantôme indépendant (n placeholder) — jeu clinique gelé au freeze WP2.",
        status: "in-progress",
        version: "split v0.1",
        lastVerified: "2026-04-10",
      },
      {
        id: "performance",
        label: "Performance",
        value:
          "PSNR / SSIM / perceptuel (valeurs placeholder jusqu'au gel WP2).",
        status: "in-progress",
        version: "rapport v0.2",
        lastVerified: "2026-04-12",
      },
      {
        id: "robustness",
        label: "Robustesse",
        value:
          "Sondes adversarial + OOD — protocole rédigé, runs planifiés en WP2.",
        status: "planned",
        version: "protocole v0.1",
        lastVerified: "2026-04-02",
      },
      {
        id: "calibration",
        label: "Calibration & incertitude",
        value:
          "Carte d'incertitude par pixel + score de Brier sur cohorte de calibration.",
        status: "planned",
        version: "spec v0.1",
        lastVerified: "2026-04-02",
      },
      {
        id: "hallucination",
        label: "Audit hallucination",
        value:
          "Re-lecture aléatoire 3 % sans IA · 0 cas d'hallucination à ce jour (compte placeholder).",
        status: "in-progress",
        version: "audit v0.3",
        lastVerified: "2026-04-15",
        source: {
          label: "TRIPOD+AI 2024",
          href: "https://www.tripod-statement.org/",
        },
      },
      {
        id: "code-weights",
        label: "Code & poids",
        value: "BSD-3 / MIT, miroir Zenodo avec DOI par release.",
        status: "in-progress",
        version: "dépôt v0.2",
        lastVerified: "2026-04-12",
        source: { label: "Dépôt GitHub", href: "https://github.com/" },
      },
    ],
  },
  de: {
    title: "KI-Rekonstruktion — Audit-Panel",
    subtitle:
      "TRIPOD+AI-2024-konform für die Low-Field-Denoising-/Super-Resolution-Kette. Jede Zeile ist versioniert und mit Quelle verlinkt.",
    framework: "Audit-Rahmen",
    policy:
      "Wenn die KI-Rekonstruktion die Diagnose gegenüber der Nicht-KI-Baseline verändert, wird der Fall automatisch zur DSMB-Prüfung markiert.",
    policyVersion: "Policy v0.3 — eingefroren am 15.04.2026",
    statusLabels: {
      validated: "Validiert",
      "in-progress": "In Arbeit",
      planned: "Geplant",
    },
    versionLabel: "Version",
    verifiedLabel: "Zuletzt verifiziert",
    fields: [
      {
        id: "architecture",
        label: "Architektur",
        value:
          "Denoising-U-Net + Super-Resolution + EMI-Suppression — offene Model Card.",
        status: "in-progress",
        version: "model-card v0.2",
        lastVerified: "2026-04-12",
        source: { label: "Zenodo (DOI-Platzhalter)", href: "https://zenodo.org/" },
      },
      {
        id: "training-data",
        label: "Trainingsdaten",
        value:
          "Öffentliche Phantom- + simulierte Low-Field-Datensätze; bislang keine Patientendaten.",
        status: "validated",
        version: "dataset v0.1",
        lastVerified: "2026-03-28",
        source: { label: "Dataset Card (Zenodo)", href: "https://zenodo.org/" },
      },
      {
        id: "validation-data",
        label: "Validierungsdaten",
        value:
          "Unabhängiges Phantom-Set (n Platzhalter) — klinisches Set bei WP2-Freeze fixiert.",
        status: "in-progress",
        version: "split v0.1",
        lastVerified: "2026-04-10",
      },
      {
        id: "performance",
        label: "Leistung",
        value:
          "PSNR / SSIM / perzeptuell (Platzhalterwerte bis WP2-Freeze).",
        status: "in-progress",
        version: "report v0.2",
        lastVerified: "2026-04-12",
      },
      {
        id: "robustness",
        label: "Robustheit",
        value:
          "Adversarial- + OOD-Sonden — Protokoll erstellt, Läufe für WP2 geplant.",
        status: "planned",
        version: "protokoll v0.1",
        lastVerified: "2026-04-02",
      },
      {
        id: "calibration",
        label: "Kalibrierung & Unsicherheit",
        value:
          "Pixelweise Unsicherheitskarte + Brier-Score auf Kalibrierungskohorte.",
        status: "planned",
        version: "spec v0.1",
        lastVerified: "2026-04-02",
      },
      {
        id: "hallucination",
        label: "Halluzinations-Audit",
        value:
          "3 % zufälliger Re-Read ohne KI · bisher 0 Halluzinationsfälle (Platzhalter).",
        status: "in-progress",
        version: "audit v0.3",
        lastVerified: "2026-04-15",
        source: {
          label: "TRIPOD+AI 2024",
          href: "https://www.tripod-statement.org/",
        },
      },
      {
        id: "code-weights",
        label: "Code & Gewichte",
        value: "BSD-3 / MIT, Zenodo-Mirror mit DOI pro Release.",
        status: "in-progress",
        version: "repo v0.2",
        lastVerified: "2026-04-12",
        source: { label: "GitHub-Repository", href: "https://github.com/" },
      },
    ],
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

interface Props {
  className?: string;
}

export function AIAuditCard({ className = "" }: Props) {
  const { language } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  return (
    <section
      aria-labelledby="ai-audit-card-title"
      data-testid="ai-audit-card"
      className={`rounded-2xl border bg-card p-5 md:p-6 ${className}`}
    >
      <header className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Brain className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-primary mb-0.5">
            {copy.framework}
          </p>
          <h3 id="ai-audit-card-title" className="text-base md:text-lg font-semibold">
            {copy.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{copy.subtitle}</p>
        </div>
      </header>

      <ul className="space-y-3" role="list">
        {copy.fields.map((f) => {
          const StatusIcon = STATUS_ICON[f.status];
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
