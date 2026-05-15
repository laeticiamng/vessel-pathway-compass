import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { SEOHead } from "@/components/SEOHead";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import { useTranslation, type Language } from "@/i18n/context";

type Stage = {
  id: string;
  stage: string;
  status: string;
  fn: string;
  tone: "active" | "preview" | "preclinical" | "horizon";
};

const COPY: Record<Language, {
  back: string;
  pageTitle: string;
  pageDesc: string;
  eyebrow: string;
  title: string;
  lede: string;
  hypothesis: { title: string; body: string };
  table: { headers: [string, string, string]; rows: Stage[] };
  signature: string;
}> = {
  en: {
    back: "Back to home",
    pageTitle: "Trajectory L1 → L2 → L3 → post-PhD",
    pageDesc:
      "L1 proves we can see and decide. L2 proves we can guide in simulation. L3 prepares preclinical interventional. Post-PhD targets selected 4-zero proximity revascularisations.",
    eyebrow: "Scientific trajectory",
    title: "L1 → L2 → L3 → post-PhD",
    lede:
      "VASCU-LINK is a graduated programme. Each stage tests a specific function — see, decide, simulate, guide, intervene — without conflating current maturity and long-term horizon.",
    hypothesis: {
      title: "Disruption hypothesis",
      body:
        "Test whether part of the angiographic function — mapping, deciding, planning, guiding, treating — can be progressively reconstructed in 4-zero (0 mSv, 0 contrast, 0 helium, BoM target < 15 k€), so that vascular care can leave the radiation suite and move closer to the patient.",
    },
    table: {
      headers: ["Stage", "Status", "Function tested"],
      rows: [
        { id: "l1", stage: "L1 — See & Decide", status: "Clinical validation in progress (Lausanne, n ≈ 250)", fn: "Map · Decide", tone: "active" },
        { id: "l2", stage: "L2 — Simulate & Guide", status: "Research preview (phantom / simulated)", fn: "Simulate · Guide", tone: "preview" },
        { id: "l3", stage: "L3 — Preclinical Intervention", status: "Preclinical only (animal / cadaver)", fn: "Interventional feasibility", tone: "preclinical" },
        { id: "post", stage: "Post-PhD — Selected Revascularisation", status: "Long-term horizon", fn: "Selected elective revascularisation, ambulatory vascular center, hospital backup", tone: "horizon" },
      ],
    },
    signature:
      "L1 proves we can see and decide. L2 proves we can guide in simulation. L3 prepares preclinical intervention. Post-PhD targets selected 4-zero proximity revascularisations.",
  },
  fr: {
    back: "Retour à l'accueil",
    pageTitle: "Trajectoire L1 → L2 → L3 → post-PhD",
    pageDesc:
      "L1 prouve qu'on peut voir et décider. L2 prouve qu'on peut guider en simulation. L3 prépare l'interventionnel préclinique. Le post-PhD vise certaines revascularisations 4-zéro de proximité.",
    eyebrow: "Trajectoire scientifique",
    title: "L1 → L2 → L3 → post-PhD",
    lede:
      "VASCU-LINK est un programme gradué. Chaque étape teste une fonction précise — voir, décider, simuler, guider, intervenir — sans confondre maturité actuelle et horizon long terme.",
    hypothesis: {
      title: "Hypothèse de rupture",
      body:
        "Tester si une partie de la fonction angiographique — cartographier, décider, planifier, guider, traiter — peut être progressivement reconstruite en 4-zéro (0 mSv, 0 contraste, 0 hélium, BoM cible < 15 k€), pour que le soin vasculaire quitte la salle de cathétérisme et se rapproche du patient.",
    },
    table: {
      headers: ["Étape", "Statut", "Fonction testée"],
      rows: [
        { id: "l1", stage: "L1 — Voir & Décider", status: "Validation clinique en cours (Lausanne, n ≈ 250)", fn: "Cartographier · Décider", tone: "active" },
        { id: "l2", stage: "L2 — Simuler & Guider", status: "Aperçu recherche (fantôme / simulation)", fn: "Simuler · Guider", tone: "preview" },
        { id: "l3", stage: "L3 — Intervention préclinique", status: "Préclinique uniquement (animal / cadavre)", fn: "Faisabilité interventionnelle", tone: "preclinical" },
        { id: "post", stage: "Post-PhD — Revascularisation sélective", status: "Horizon long terme", fn: "Revascularisation élective sélectionnée, centre vasculaire ambulatoire, recours hospitalier", tone: "horizon" },
      ],
    },
    signature:
      "L1 prouve qu'on peut voir et décider. L2 prouve qu'on peut guider en simulation. L3 prépare l'interventionnel préclinique. Le post-PhD vise certaines revascularisations 4-zéro de proximité.",
  },
  de: {
    back: "Zurück zur Startseite",
    pageTitle: "Trajektorie L1 → L2 → L3 → Post-PhD",
    pageDesc:
      "L1 zeigt: sehen und entscheiden. L2: in der Simulation führen. L3: präklinisch interventionell. Post-PhD: ausgewählte 4-Null-Revaskularisierungen wohnortnah.",
    eyebrow: "Wissenschaftliche Trajektorie",
    title: "L1 → L2 → L3 → Post-PhD",
    lede:
      "VASCU-LINK ist ein abgestuftes Programm. Jede Stufe testet eine konkrete Funktion — sehen, entscheiden, simulieren, führen, intervenieren — ohne aktuellen Reifegrad und Langzeit-Horizont zu vermischen.",
    hypothesis: {
      title: "Disruptions-Hypothese",
      body:
        "Prüfen, ob ein Teil der angiographischen Funktion — Kartieren, Entscheiden, Planen, Führen, Behandeln — schrittweise im 4-Null-Modus rekonstruiert werden kann (0 mSv, 0 Kontrast, 0 Helium, BoM-Ziel < 15 k€), damit die Gefäßversorgung den Katheter-Raum verlässt und näher zum Patienten rückt.",
    },
    table: {
      headers: ["Stufe", "Status", "Getestete Funktion"],
      rows: [
        { id: "l1", stage: "L1 — Sehen & Entscheiden", status: "Klinische Validierung läuft (Lausanne, n ≈ 250)", fn: "Kartieren · Entscheiden", tone: "active" },
        { id: "l2", stage: "L2 — Simulieren & Führen", status: "Forschungs-Preview (Phantom / Simulation)", fn: "Simulieren · Führen", tone: "preview" },
        { id: "l3", stage: "L3 — Präklinische Intervention", status: "Nur präklinisch (Tier / Kadaver)", fn: "Interventionelle Machbarkeit", tone: "preclinical" },
        { id: "post", stage: "Post-PhD — Selektive Revaskularisierung", status: "Langfristiger Horizont", fn: "Ausgewählte elektive Revaskularisierung, ambulantes Gefäßzentrum, Klinik-Backup", tone: "horizon" },
      ],
    },
    signature:
      "L1 zeigt, dass wir sehen und entscheiden können. L2 zeigt, dass wir in der Simulation führen können. L3 bereitet die präklinische Intervention vor. Post-PhD zielt auf ausgewählte 4-Null-Revaskularisierungen wohnortnah.",
  },
};

const TONE: Record<Stage["tone"], string> = {
  active: "border-success/40 bg-success/5",
  preview: "border-warning/40 bg-warning/5",
  preclinical: "border-destructive/40 bg-destructive/5",
  horizon: "border-primary/30 bg-primary/5",
};

export default function Trajectory() {
  const { language, t } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={copy.pageTitle} description={copy.pageDesc} path="/trajectory" />
      <header className="border-b">
        <div className="container mx-auto h-16 px-6 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Link>
          <span className="ml-auto flex items-center gap-2">
            <AquaMRLogo />
            <span className="flex flex-col leading-tight">
              <span className="font-semibold">{t("branding.programName")}</span>
              <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground/80">
                {t("branding.platformName")}
              </span>
            </span>
          </span>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-16 max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            {copy.eyebrow}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">{copy.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-3xl">{copy.lede}</p>

          <aside className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 md:p-7 mb-10">
            <h2 className="text-base font-semibold mb-2 text-primary">{copy.hypothesis.title}</h2>
            <p className="text-sm md:text-base leading-relaxed">{copy.hypothesis.body}</p>
          </aside>

          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {copy.table.headers.map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copy.table.rows.map((row) => (
                  <tr key={row.id} className={`border-b last:border-b-0 ${TONE[row.tone]}`}>
                    <td className="px-4 py-4 font-semibold whitespace-nowrap">{row.stage}</td>
                    <td className="px-4 py-4 text-muted-foreground">{row.status}</td>
                    <td className="px-4 py-4">{row.fn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-12 italic text-center text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {copy.signature}
          </p>
        </section>
      </main>

      <RegulatoryDisclaimer />
    </div>
  );
}
