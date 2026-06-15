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
  globalHealth: {
    eyebrow: string;
    title: string;
    body: string;
    accessTitle: string;
    accessBody: string;
    points: string[];
    milestoneTitle: string;
    milestoneBody: string;
    caveat: string;
  };
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
        { id: "l1", stage: "L1 — See & Decide", status: "Clinical validation in progress (Moutier (Réseau de l'Arc, CH), n ≈ 250)", fn: "Map · Decide", tone: "active" },
        { id: "l2", stage: "L2 — Simulate & Guide", status: "Research preview (phantom / simulated)", fn: "Simulate · Guide", tone: "preview" },
        { id: "l3", stage: "L3 — Preclinical Intervention", status: "Preclinical only (animal / cadaver)", fn: "Interventional feasibility", tone: "preclinical" },
        { id: "post", stage: "Post-PhD — Selected Revascularisation", status: "Long-term horizon", fn: "Selected elective revascularisation, ambulatory vascular center, hospital backup", tone: "horizon" },
      ],
    },
    signature:
      "L1 proves we can see and decide. L2 proves we can guide in simulation. L3 prepares preclinical intervention. Post-PhD targets selected 4-zero proximity revascularisations.",
    globalHealth: {
      eyebrow: "Global-health horizon",
      title: "Why a non-ionizing, contrast-free pathway matters for access",
      body:
        "This is a horizon, not a thesis claim. The L1 study runs on a certified clinical-field 3T scanner; the low-field, helium-free AquaMR hardware (BoM target < 15 k€) is post-PhD R&D. But if that hardware matures, the motivation is global access: extending vascular assessment to settings where it does not exist today.",
      accessTitle: "The honest access argument",
      accessBody:
        "In a setting with no catheterisation lab and no CT scanner, a non-ionizing, contrast-free vascular map that is reliable enough to triage and decide is not compared to a gold standard — it is compared to having no examination at all. This reframes the goal from \"as good as the gold standard\" (hard to prove) to \"good enough to safely extend access where no alternative exists\" — without ever lowering patient safety, and with conventional imaging remaining mandatory wherever standard-of-care requires it.",
      points: [
        "Non-communicable diseases account for ~74% of global deaths, with ~86% of premature deaths in resource-limited regions; cardiovascular disease ranks first.",
        "No ionizing radiation, no injected iodinated or gadolinium contrast — relevant where contrast supply chains, nephrology backup and radiation protection are scarce.",
        "Recycled rare-earth Halbach magnet, no helium, no cryogenics — designed for proximity deployment and local production / maintenance.",
      ],
      milestoneTitle: "Concrete milestone — WHO Compendium",
      milestoneBody:
        "The WHO Compendium of Innovative Health Technologies for Low-Resource Settings accepts prototypes (not only commercialised products) and assesses across six domains: clinical need, WHO technical specifications, regulatory status, health technology assessment, health technology management, and intellectual property / local production. It is a post-validation visibility and matchmaking milestone targeted once AquaMR low-field reaches a demonstrable prototype.",
      caveat:
        "Inclusion in the WHO Compendium is not a WHO endorsement, a safety/efficacy validation, or funding: WHO conducts no rigorous review of safety, efficacy, quality or cost-acceptability for listed technologies, and does not recommend them. The thesis stands on its own scientific merits; the global-health narrative is motivation and horizon, aligned with Sustainable Development Goal 3.",
    },
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
        { id: "l1", stage: "L1 — Voir & Décider", status: "Validation clinique en cours (Moutier (Réseau de l'Arc, CH), n ≈ 250)", fn: "Cartographier · Décider", tone: "active" },
        { id: "l2", stage: "L2 — Simuler & Guider", status: "Aperçu recherche (fantôme / simulation)", fn: "Simuler · Guider", tone: "preview" },
        { id: "l3", stage: "L3 — Intervention préclinique", status: "Préclinique uniquement (animal / cadavre)", fn: "Faisabilité interventionnelle", tone: "preclinical" },
        { id: "post", stage: "Post-PhD — Revascularisation sélective", status: "Horizon long terme", fn: "Revascularisation élective sélectionnée, centre vasculaire ambulatoire, recours hospitalier", tone: "horizon" },
      ],
    },
    signature:
      "L1 prouve qu'on peut voir et décider. L2 prouve qu'on peut guider en simulation. L3 prépare l'interventionnel préclinique. Le post-PhD vise certaines revascularisations 4-zéro de proximité.",
    globalHealth: {
      eyebrow: "Horizon santé mondiale",
      title: "Pourquoi une voie non irradiante et sans contraste compte pour l'accès",
      body:
        "C'est un horizon, pas une revendication de la thèse. L'étude L1 tourne sur un IRM 3T certifié à champ clinique ; le matériel AquaMR bas-champ et sans hélium (coût matière < 15 k€) relève de la R&D post-doctorat. Mais si ce matériel mûrit, la motivation est l'accès mondial : étendre l'évaluation vasculaire là où elle n'existe pas aujourd'hui.",
      accessTitle: "L'argument d'accès, honnête",
      accessBody:
        "Dans un contexte sans salle de cathétérisme et sans scanner, une cartographie vasculaire non irradiante et sans contraste, suffisamment fiable pour trier et décider, n'est pas comparée à un gold standard — elle est comparée à l'absence totale d'examen. Cela reformule l'objectif de « aussi bon que le gold standard » (difficile à prouver) vers « assez bon pour étendre l'accès en toute sécurité là où aucune alternative n'existe » — sans jamais abaisser la sécurité du patient, l'imagerie conventionnelle restant obligatoire partout où le standard de soin l'exige.",
      points: [
        "Les maladies non transmissibles représentent ~74 % des décès mondiaux, dont ~86 % de décès prématurés dans les régions à ressources limitées ; les maladies cardiovasculaires sont au premier rang.",
        "Aucune irradiation, aucun contraste iodé ou gadolinium injecté — pertinent là où les chaînes d'approvisionnement en contraste, le recours néphrologique et la radioprotection sont rares.",
        "Aimant Halbach en terres rares recyclées, sans hélium, sans cryogénie — conçu pour un déploiement de proximité et une production / maintenance locales.",
      ],
      milestoneTitle: "Jalon concret — Compendium OMS",
      milestoneBody:
        "Le Compendium OMS des technologies de santé innovantes pour les contextes à faibles ressources accepte les prototypes (pas seulement les produits commercialisés) et évalue selon six domaines : besoin clinique, spécifications techniques OMS, statut réglementaire, évaluation des technologies de santé, gestion, et propriété intellectuelle / production locale. C'est un jalon post-validation de visibilité et de mise en relation, visé une fois qu'AquaMR bas-champ atteint un prototype démontrable.",
      caveat:
        "L'inclusion au Compendium OMS n'est ni un endossement de l'OMS, ni une validation de sécurité/efficacité, ni un financement : l'OMS ne conduit aucune revue rigoureuse de sécurité, d'efficacité, de qualité ou d'acceptabilité des coûts pour les technologies listées, et ne les recommande pas. La thèse tient sur sa valeur scientifique propre ; le récit santé mondiale est une motivation et un horizon, alignés sur l'Objectif de développement durable n°3.",
    },
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
        { id: "l1", stage: "L1 — Sehen & Entscheiden", status: "Klinische Validierung läuft (Moutier (Réseau de l'Arc, CH), n ≈ 250)", fn: "Kartieren · Entscheiden", tone: "active" },
        { id: "l2", stage: "L2 — Simulieren & Führen", status: "Forschungs-Preview (Phantom / Simulation)", fn: "Simulieren · Führen", tone: "preview" },
        { id: "l3", stage: "L3 — Präklinische Intervention", status: "Nur präklinisch (Tier / Kadaver)", fn: "Interventionelle Machbarkeit", tone: "preclinical" },
        { id: "post", stage: "Post-PhD — Selektive Revaskularisierung", status: "Langfristiger Horizont", fn: "Ausgewählte elektive Revaskularisierung, ambulantes Gefäßzentrum, Klinik-Backup", tone: "horizon" },
      ],
    },
    signature:
      "L1 zeigt, dass wir sehen und entscheiden können. L2 zeigt, dass wir in der Simulation führen können. L3 bereitet die präklinische Intervention vor. Post-PhD zielt auf ausgewählte 4-Null-Revaskularisierungen wohnortnah.",
    globalHealth: {
      eyebrow: "Globale Gesundheits-Perspektive",
      title: "Warum ein nicht-ionisierender, kontrastfreier Pfad für den Zugang zählt",
      body:
        "Dies ist ein Horizont, keine Aussage der Thesis. Die L1-Studie läuft auf einem zertifizierten 3T-Scanner mit klinischer Feldstärke; die heliumfreie Niederfeld-Hardware AquaMR (BoM-Ziel < 15 k€) ist Post-PhD-Forschung. Reift diese Hardware jedoch, ist die Motivation der globale Zugang: die Gefäßbeurteilung dorthin zu bringen, wo es sie heute nicht gibt.",
      accessTitle: "Das ehrliche Zugangsargument",
      accessBody:
        "In einem Umfeld ohne Herzkatheterlabor und ohne CT-Scanner wird eine nicht-ionisierende, kontrastfreie Gefäßkarte, die zuverlässig genug ist, um zu triagieren und zu entscheiden, nicht mit einem Goldstandard verglichen — sondern mit gar keiner Untersuchung. Das verschiebt das Ziel von „so gut wie der Goldstandard“ (schwer zu beweisen) hin zu „gut genug, um den Zugang sicher dort zu erweitern, wo keine Alternative existiert“ — ohne je die Patientensicherheit zu senken, wobei konventionelle Bildgebung überall dort verpflichtend bleibt, wo der Behandlungsstandard sie erfordert.",
      points: [
        "Nicht übertragbare Krankheiten machen ~74 % der weltweiten Todesfälle aus, mit ~86 % der vorzeitigen Todesfälle in ressourcenarmen Regionen; Herz-Kreislauf-Erkrankungen stehen an erster Stelle.",
        "Keine ionisierende Strahlung, kein injiziertes jodhaltiges oder Gadolinium-Kontrastmittel — relevant dort, wo Kontrastmittel-Lieferketten, nephrologische Absicherung und Strahlenschutz knapp sind.",
        "Halbach-Magnet aus recycelten Seltenen Erden, ohne Helium, ohne Kryotechnik — ausgelegt für wohnortnahen Einsatz und lokale Produktion / Wartung.",
      ],
      milestoneTitle: "Konkreter Meilenstein — WHO-Kompendium",
      milestoneBody:
        "Das WHO-Kompendium innovativer Gesundheitstechnologien für ressourcenarme Settings akzeptiert Prototypen (nicht nur kommerzialisierte Produkte) und bewertet anhand von sechs Bereichen: klinischer Bedarf, technische WHO-Spezifikationen, regulatorischer Status, Health Technology Assessment, Health Technology Management und geistiges Eigentum / lokale Produktion. Es ist ein Post-Validierungs-Meilenstein für Sichtbarkeit und Vernetzung, angestrebt sobald AquaMR-Niederfeld einen demonstrierbaren Prototyp erreicht.",
      caveat:
        "Die Aufnahme in das WHO-Kompendium ist weder eine WHO-Befürwortung noch eine Sicherheits-/Wirksamkeitsvalidierung noch eine Finanzierung: Die WHO führt für gelistete Technologien keine rigorose Prüfung von Sicherheit, Wirksamkeit, Qualität oder Kostenakzeptanz durch und empfiehlt sie nicht. Die Thesis trägt sich aus eigener wissenschaftlicher Substanz; das globale Gesundheits-Narrativ ist Motivation und Horizont, im Einklang mit dem Nachhaltigkeitsziel 3.",
    },
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

          <section className="mt-12 rounded-2xl border-2 border-primary/25 bg-primary/[0.04] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              {copy.globalHealth.eyebrow}
            </p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3">{copy.globalHealth.title}</h2>
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground mb-6">{copy.globalHealth.body}</p>

            <div className="rounded-xl border bg-card p-5 md:p-6 mb-6">
              <h3 className="text-base font-semibold mb-2">{copy.globalHealth.accessTitle}</h3>
              <p className="text-sm md:text-base leading-relaxed">{copy.globalHealth.accessBody}</p>
            </div>

            <ul className="space-y-2 mb-6">
              {copy.globalHealth.points.map((pt, i) => (
                <li key={i} className="flex gap-3 text-sm md:text-base leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border bg-card p-5 md:p-6 mb-4">
              <h3 className="text-base font-semibold mb-2">{copy.globalHealth.milestoneTitle}</h3>
              <p className="text-sm md:text-base leading-relaxed">{copy.globalHealth.milestoneBody}</p>
            </div>

            <p className="text-xs md:text-sm italic leading-relaxed text-muted-foreground">{copy.globalHealth.caveat}</p>
          </section>

          <p className="mt-12 italic text-center text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {copy.signature}
          </p>
        </section>
      </main>

      <RegulatoryDisclaimer />
    </div>
  );
}
