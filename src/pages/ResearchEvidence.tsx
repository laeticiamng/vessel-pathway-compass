import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  Gauge,
  Lightbulb,
  ListChecks,
  Telescope,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { POWER_DEFAULTS, DSMB_TRIGGERS } from "@/lib/vasculink/adr-data";
import { MODEL_REGISTRY, PIPELINE_ORDER } from "@/lib/aiRecon/modelRegistry";
import { cn } from "@/lib/utils";

/**
 * /research-evidence — Hub de crédibilité scientifique.
 *
 * Index synthétique en 7 sections (hypothèses, limites, statut expérimental,
 * validation TRL, références, simulé vs réel, prospectif). Renvoie vers les
 * pages détaillées existantes : /methodology, /sap, /protocol, /transparence,
 * /audit-limitations, /data-management-plan, /incidental-findings.
 *
 * Source unique de vérité pour les paramètres L1 : `POWER_DEFAULTS` et
 * `DSMB_TRIGGERS` (src/lib/vasculink/adr-data.ts), cohérents avec la mémoire
 * mem://study/l1-clinical-parameters.
 */

// ---- Sections wrapper ---------------------------------------------------

function EvidenceSection({
  id,
  icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border-t border-border/60 pt-10"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {subtitle && <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// ---- Status / TRL chips -------------------------------------------------

type StatusLevel = "clinical" | "pilot" | "rd" | "prospective";

const STATUS_META: Record<StatusLevel, { label: string; cls: string }> = {
  clinical: { label: "Clinique en routine", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  pilot: { label: "Pilote / évaluation", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30" },
  rd: { label: "R&D", cls: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30" },
  prospective: { label: "Prospectif", cls: "bg-muted text-muted-foreground border-border" },
};

function StatusBadge({ level }: { level: StatusLevel }) {
  const m = STATUS_META[level];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", m.cls)}>
      {m.label}
    </span>
  );
}

function TRLChip({ value }: { value: number }) {
  const tone =
    value >= 7 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" :
    value >= 4 ? "bg-sky-500/15 text-sky-700 dark:text-sky-300" :
    "bg-amber-500/15 text-amber-800 dark:text-amber-300";
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold", tone)}>
      TRL {value}
    </span>
  );
}

// ---- Data ---------------------------------------------------------------

const HYPOTHESES = [
  {
    h: "H1 — Chaîne visuelle v8.3",
    body: "VASCU-LINK adresse exclusivement la chaîne visuelle vasculaire (L1/L2/L3/Post-PhD). Le geste mécanique de revascularisation n'est pas modifié par la plateforme.",
  },
  {
    h: "H2 — Imagerie sans iode (AquaMR)",
    body: "Une cartographie vasculaire exploitable peut être obtenue sans contraste iodé ni gadolinium chez les patients à risque CI-AKI élevé, suffisamment pour planifier un geste endovasculaire.",
  },
  {
    h: "H3 — Digital Twin 18 segments",
    body: "Un modèle SVG schématique à 18 segments suffit à transmettre la lésion dominante et la perméabilité distale dans un cadre de décision L1, sans prétendre remplacer l'angiographie diagnostique.",
  },
  {
    h: "H4 — Raisonnement L1 structuré",
    body: "Tracer les alternatives écartées et le rationnel clinique au niveau L1 améliore l'auditabilité des décisions vasculaires sans alourdir le workflow.",
  },
];

const MODULE_STATUS: { module: string; level: StatusLevel; trl: number; note: string }[] = [
  { module: "VascScreen (triage IPS, CFS, Mehran)", level: "pilot", trl: 6, note: "Calculateurs validés individuellement ; intégration en cours d'évaluation." },
  { module: "AquaMR (imagerie sans iode)", level: "rd", trl: 4, note: "Concept matériel en R&D ; aucune autorisation CE/FDA à ce jour." },
  { module: "Digital Twin 18 segments", level: "pilot", trl: 5, note: "Représentation pédagogique et planning ; non diagnostique." },
  { module: "L1 Decision Board", level: "pilot", trl: 6, note: "Aide à la décision documentée ; n'engage pas la responsabilité du clinicien." },
  { module: "Procedure Planner", level: "pilot", trl: 5, note: "Templates structurés ; pas d'aide automatisée au geste." },
  { module: "PROMs longitudinaux (VascuQoL-6, CIVIQ-14)", level: "clinical", trl: 7, note: "Questionnaires validés en anglais, utilisés en routine de recherche." },
  { module: "Démo AOMI guidée (Mme R.)", level: "prospective", trl: 3, note: "Démonstration pédagogique sur données fictives. Aucun patient réel." },
  ...PIPELINE_ORDER.map((id) => {
    const m = MODEL_REGISTRY[id];
    return {
      module: `AI Reconstruction · ${m.name}`,
      level: "rd" as StatusLevel,
      trl: m.trl,
      note: `${m.currentStatus}. Weights: ${m.provenance.weightsOrigin.toLowerCase()}.`,
    };
  }),
];

const LIMITS = [
  "Étude pivot L1 non terminée — aucun résultat clinique publié à ce jour.",
  "Échantillon cible : n ≈ " + POWER_DEFAULTS.nEnrolment + " (analysable ≈ " + POWER_DEFAULTS.nAnalysable + ") sur centre unique au démarrage — généralisabilité limitée.",
  "Comparateur AquaMR vs Doppler + angio-CT ou MRA — pas de comparaison directe à l'angiographie de référence (DSA).",
  "PROMs uniquement disponibles en anglais (VascuQoL-6, CIVIQ-14) — biais linguistique potentiel chez les patients non anglophones.",
  "AI reconstruction : risque d'hallucination contrôlé par re-lecture aléatoire 3 % sans IA (cf. TRIPOD+AI 2024) ; pas de garantie d'exhaustivité.",
  "Pas d'évaluation de l'impact patient-pertinent à long terme (> 12 mois) au stade actuel.",
];

const REAL_VS_SIMULATED: { module: string; real: string; sim: string }[] = [
  { module: "VascScreen", real: "Calculateurs (IPS, Mehran, CFS) sur données saisies par le clinicien.", sim: "Scénarios démo (Mme R.) sur données fictives." },
  { module: "AquaMR (imagerie)", real: "Aucune image patient en production — composant R&D.", sim: "Viewport stylisé dans la démo ; cas DICOM de validation interne uniquement." },
  { module: "Digital Twin", real: "Saisie manuelle des segments touchés par le clinicien.", sim: "Carte schématique 18 segments alimentée par cas démo." },
  { module: "L1 Decision Board", real: "Décisions tracées par utilisateurs authentifiés (RLS, audit).", sim: "Décision pré-calculée pour la démo." },
  { module: "PROMs", real: "Réponses patients réelles, stockage RLS + filtrage server-side par case_id.", sim: "Scores baseline → M3 → M6 fictifs pour Mme R." },
  { module: "Métriques de performance", real: "Aucune publication clinique à ce jour.", sim: "Estimations de workflow (temps gagné, examens évités) à valider prospectivement." },
  { module: "AI Reconstruction Lab", real: "Aucune inférence GPU en production — aucun poids de modèle chargé.", sim: "Sortie 100 % simulée côté client. Baseline zero-filled IFFT obligatoire affichée à côté de toute métrique IA." },
];

const REFERENCES = [
  { authors: "Morgan MA, Frith CD, et al.", year: 2001, title: "Vascular Quality of Life Questionnaire (VascuQoL): development and validation of a new disease-specific health-related quality of life instrument.", journal: "Journal of Vascular Surgery", id: "PMID: 11668335" },
  { authors: "Nordanstig J, et al.", year: 2014, title: "Vascular Quality of Life Questionnaire-6 (VascuQoL-6): short form of the VascuQoL.", journal: "European Journal of Vascular and Endovascular Surgery", id: "PMID: 24582490" },
  { authors: "Launois R, Mansilha A, Jantet G.", year: 2010, title: "International psychometric validation of the Chronic Venous Disease quality of life Questionnaire (CIVIQ-20).", journal: "European Journal of Vascular and Endovascular Surgery", id: "PMID: 20851638" },
  { authors: "Mehran R, Aymong ED, et al.", year: 2004, title: "A simple risk score for prediction of contrast-induced nephropathy after percutaneous coronary intervention.", journal: "Journal of the American College of Cardiology", id: "PMID: 15464318" },
  { authors: "Rockwood K, Song X, et al.", year: 2005, title: "A global clinical measure of fitness and frailty in elderly people.", journal: "CMAJ", id: "PMID: 16129869" },
  { authors: "Rutherford RB, Baker JD, et al.", year: 1997, title: "Recommended standards for reports dealing with lower extremity ischemia: revised version.", journal: "Journal of Vascular Surgery", id: "PMID: 9308598" },
  { authors: "Conte MS, Bradbury AW, et al. (ESVS / SVS / WFVS)", year: 2019, title: "Global Vascular Guidelines on the management of chronic limb-threatening ischemia.", journal: "European Journal of Vascular and Endovascular Surgery", id: "PMID: 31182334" },
  { authors: "Collins GS, Moons KGM, et al.", year: 2024, title: "TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods.", journal: "BMJ", id: "DOI: 10.1136/bmj-2023-078378" },
];

const PROSPECTIVE = [
  { label: "Recrutement L1", body: `Cible n ≈ ${POWER_DEFAULTS.nEnrolment} patients (analysable n ≈ ${POWER_DEFAULTS.nAnalysable}, dropout anticipé ${POWER_DEFAULTS.dropout * 100}%).` },
  { label: "Critère principal", body: `Non-infériorité sur proportion unique (π₀ = ${POWER_DEFAULTS.pi0}, marge δ = ${POWER_DEFAULTS.delta}, α two-sided = ${POWER_DEFAULTS.alpha}, puissance 1−β = ${POWER_DEFAULTS.power}).` },
  { label: "Plan d'analyse", body: "SAP pré-spécifié et gelé : MICE m=20, analyses de sensibilité (complete-case, tipping-point), α 0,05 Bonferroni-Holm." },
  { label: "Jalons DSMB", body: "Revue intermédiaire pré-planifiée à M24 (avant jalon J3) ; déclencheurs ad hoc en cas d'événement indésirable grave ou de taux d'échec qualité-image > 15 % sur 50 patients consécutifs." },
  { label: "Publications attendues", body: "Protocole (déjà publié sur la plateforme) → résultats d'imagerie → résultats cliniques + PROMs M6/M12 → analyse coût-utilité (QALY)." },
];

// ---- Page ---------------------------------------------------------------

export default function ResearchEvidence() {
  return (
    <>
      <SEOHead
        title="Research Evidence — Niveau de validation et limites · VASCU-LINK"
        description="Hub de crédibilité scientifique de VASCU-LINK : hypothèses, limites, statut expérimental, niveau de validation TRL, références, simulé vs réel, et roadmap prospective de l'étude L1."
      />

      <main className="min-h-screen bg-background">
        {/* Hero + statut expérimental */}
        <header className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
          <div className="mx-auto max-w-4xl px-4 py-12">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
              Science · Évidence · Limites
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Research Evidence
            </h1>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl">
              Tout ce qu'il faut savoir pour évaluer la crédibilité scientifique de VASCU-LINK :
              ce qu'on suppose, ce qu'on mesure, ce qu'on simule, ce qu'on prévoit, et ce qu'on
              n'a pas encore prouvé.
            </p>

            <div
              role="alert"
              className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Free Open Beta · Not a medical device · No CE / FDA clearance
                  </p>
                  <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-100/80">
                    VASCU-LINK est une plateforme de recherche clinique et de raisonnement. Elle
                    ne remplace ni l'IRM, ni l'angio-CT, ni la DSA, ni le jugement clinique.
                    Aucune supériorité diagnostique n'est revendiquée vis-à-vis de ces modalités.
                  </p>
                </div>
              </div>
            </div>

            <nav aria-label="Sommaire" className="mt-8 flex flex-wrap gap-2 text-xs">
              {[
                ["hypotheses", "Hypothèses"],
                ["limits", "Limites"],
                ["status", "Statut expérimental"],
                ["validation", "Niveau de validation"],
                ["references", "Références"],
                ["simulated", "Simulé vs réel"],
                ["prospective", "Prospectif"],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-full border border-border/60 px-3 py-1 hover:bg-muted transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-10 space-y-12">
          {/* 1. Hypothèses */}
          <EvidenceSection
            id="hypotheses"
            icon={<Lightbulb className="h-5 w-5" />}
            title="1. Hypothèses"
            subtitle="Les postulats de travail explicites du programme."
          >
            <ul className="space-y-3">
              {HYPOTHESES.map((h) => (
                <li key={h.h} className="rounded-lg border border-border/60 bg-card p-4">
                  <p className="font-semibold text-sm">{h.h}</p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{h.body}</p>
                </li>
              ))}
            </ul>
          </EvidenceSection>

          {/* 2. Limites */}
          <EvidenceSection
            id="limits"
            icon={<AlertTriangle className="h-5 w-5" />}
            title="2. Limites connues"
            subtitle="Ce qu'on ne sait pas encore, ce qui peut introduire un biais."
          >
            <ul className="space-y-2">
              {LIMITS.map((l) => (
                <li key={l} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">{l}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Voir aussi :{" "}
              <Link to="/audit-limitations" className="underline hover:text-foreground">
                Audit Limitations
              </Link>{" "}
              ·{" "}
              <Link to="/incidental-findings" className="underline hover:text-foreground">
                Incidental Findings
              </Link>{" "}
              ·{" "}
              <Link to="/data-management-plan" className="underline hover:text-foreground">
                Data Management Plan (FAIR)
              </Link>
              .
            </p>
          </EvidenceSection>

          {/* 3. Statut expérimental */}
          <EvidenceSection
            id="status"
            icon={<FlaskConical className="h-5 w-5" />}
            title="3. Statut expérimental par module"
            subtitle="Aucun module n'est un dispositif médical certifié. La table ci-dessous indique la maturité d'usage de chaque brique."
          >
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Module</th>
                    <th className="text-left p-3">Statut</th>
                    <th className="text-left p-3">TRL</th>
                    <th className="text-left p-3">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULE_STATUS.map((m) => (
                    <tr key={m.module} className="border-t border-border/60">
                      <td className="p-3 font-medium">{m.module}</td>
                      <td className="p-3"><StatusBadge level={m.level} /></td>
                      <td className="p-3"><TRLChip value={m.trl} /></td>
                      <td className="p-3 text-muted-foreground">{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EvidenceSection>

          {/* 4. Niveau de validation */}
          <EvidenceSection
            id="validation"
            icon={<Gauge className="h-5 w-5" />}
            title="4. Niveau de validation (étude L1)"
            subtitle="Paramètres officiels figés du calcul de puissance et de la charte DSMB."
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["π₀ (proportion attendue)", String(POWER_DEFAULTS.pi0)],
                ["Marge de non-infériorité δ", String(POWER_DEFAULTS.delta)],
                ["α two-sided", String(POWER_DEFAULTS.alpha)],
                ["Puissance (1−β)", String(POWER_DEFAULTS.power)],
                ["n analysable requis", `≈ ${POWER_DEFAULTS.nAnalysable}`],
                ["n recrutement cible", `≈ ${POWER_DEFAULTS.nEnrolment}`],
                ["Drop-out anticipé", `${POWER_DEFAULTS.dropout * 100} %`],
                ["Imputation manquantes", "MICE, m = 20"],
              ].map(([k, v]) => (
                <div key={k} className="rounded border border-border/60 bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
                  <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{v}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Déclencheurs DSMB
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {DSMB_TRIGGERS.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              Détails complets :{" "}
              <Link to="/protocol" className="underline hover:text-foreground">Protocol</Link> ·{" "}
              <Link to="/sap" className="underline hover:text-foreground">Statistical Analysis Plan</Link> ·{" "}
              <Link to="/methodology" className="underline hover:text-foreground">Methodology</Link>.
            </p>
          </EvidenceSection>

          {/* 5. Références */}
          <EvidenceSection
            id="references"
            icon={<BookOpen className="h-5 w-5" />}
            title="5. Références"
            subtitle="Travaux fondateurs sur lesquels VASCU-LINK s'appuie."
          >
            <ol className="space-y-3 text-sm">
              {REFERENCES.map((r, i) => (
                <li key={r.id} className="rounded border border-border/60 bg-card p-3">
                  <p className="text-[11px] text-muted-foreground tabular-nums">[{i + 1}]</p>
                  <p className="font-medium">
                    {r.authors} ({r.year}). <span className="font-normal italic">{r.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{r.journal} · {r.id}</p>
                </li>
              ))}
            </ol>
          </EvidenceSection>

          {/* 6. Simulé vs Réel */}
          <EvidenceSection
            id="simulated"
            icon={<ListChecks className="h-5 w-5" />}
            title="6. Simulé vs réel"
            subtitle="Qu'est-ce qui repose sur des patients réels, et qu'est-ce qui est démonstratif ?"
          >
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Module</th>
                    <th className="text-left p-3">Données réelles</th>
                    <th className="text-left p-3">Simulé / pédagogique</th>
                  </tr>
                </thead>
                <tbody>
                  {REAL_VS_SIMULATED.map((r) => (
                    <tr key={r.module} className="border-t border-border/60 align-top">
                      <td className="p-3 font-medium whitespace-nowrap">{r.module}</td>
                      <td className="p-3 text-muted-foreground">{r.real}</td>
                      <td className="p-3 text-muted-foreground">{r.sim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Les cas pédagogiques (Mme R., M. D., M. B.) sont intégralement fictifs —{" "}
              <Link to="/demo/clinical-cases" className="underline hover:text-foreground">
                parcourir les 3 cas cliniques →
              </Link>
            </p>
          </EvidenceSection>

          {/* 7. Prospectif */}
          <EvidenceSection
            id="prospective"
            icon={<Telescope className="h-5 w-5" />}
            title="7. Prospectif"
            subtitle="Ce qui sera évalué dans l'étude L1 et au-delà."
          >
            <ul className="space-y-3">
              {PROSPECTIVE.map((p) => (
                <li key={p.label} className="rounded-lg border border-border/60 bg-card p-4">
                  <p className="font-semibold text-sm">{p.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Voir aussi :{" "}
              <Link to="/transparence" className="underline hover:text-foreground">Transparence</Link> ·{" "}
              <Link to="/trajectory" className="underline hover:text-foreground">Trajectory</Link>.
            </p>
          </EvidenceSection>

          <footer className="border-t border-border/60 pt-6 text-xs text-muted-foreground">
            Cette page est tenue à jour conjointement par l'équipe scientifique et la plateforme.
            Les paramètres L1 (puissance, MICE, DSMB) sont la source unique de vérité ; toute
            modification doit être tracée par un ADR (cf. <Link to="/transparence" className="underline">Transparence</Link>).
          </footer>
        </div>
      </main>
    </>
  );
}
