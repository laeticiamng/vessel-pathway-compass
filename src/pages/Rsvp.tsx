import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation, type Language } from "@/i18n/context";
import { useLowResourceMode } from "@/hooks/useLowResourceMode";

/* ============================================================================
 * /rsvp — Resource-Stratified Visual Plan (v8.3)
 *
 * Lets clinicians select the resource level (L1/L2/L3) and surfaces
 * cost / delay / LMIC transposability. Default level follows the global
 * low-resource mode preference.
 * ========================================================================== */

type Level = 1 | 2 | 3;

type LevelInfo = {
  level: Level;
  title: string;
  description: string;
  cost: string;
  delay: string;
  lmic: string;
};

type Copy = {
  back: string;
  pageTitle: string;
  pageDesc: string;
  hero: { eyebrow: string; title: string; lede: string };
  selectorLabel: string;
  syncedLabel: string;
  levels: LevelInfo[];
  headers: { cost: string; delay: string; lmic: string };
};

const COPY: Record<Language, Copy> = {
  en: {
    back: "Back to home",
    pageTitle: "RSVP — Resource-Stratified Visual Plan",
    pageDesc: "Choose a resource level (L1/L2/L3) — VASCU-LINK adapts the visual plan accordingly.",
    hero: {
      eyebrow: "RSVP v8.3",
      title: "One protocol, three resource levels",
      lede:
        "Pick the level that matches the local infrastructure. Cost, delay and LMIC-transposability are surfaced — mechanical gesture remains unchanged.",
    },
    selectorLabel: "Resource level",
    syncedLabel: "Synced with low-resource mode",
    levels: [
      { level: 1, title: "L1 — Minimal", description: "Doppler + AquaMR low-field visual layer. No iodine, no gadolinium, no radiation.", cost: "€", delay: "Same day", lmic: "High" },
      { level: 2, title: "L2 — Standard", description: "Adds MRA without gadolinium, structured reporting and audit trail.", cost: "€€", delay: "1–3 days", lmic: "Medium" },
      { level: 3, title: "L3 — Full", description: "Full multi-modal stack — used only when L1/L2 are insufficient and benefit/risk is documented.", cost: "€€€", delay: "1+ week", lmic: "Low" },
    ],
    headers: { cost: "Indicative cost", delay: "Typical delay", lmic: "LMIC transposability" },
  },
  fr: {
    back: "Retour à l'accueil",
    pageTitle: "RSVP — Plan Visuel Stratifié par Ressources",
    pageDesc: "Choisissez un niveau de ressources (L1/L2/L3) — VASCU-LINK adapte le plan visuel.",
    hero: {
      eyebrow: "RSVP v8.3",
      title: "Un protocole, trois niveaux de ressources",
      lede:
        "Choisissez le niveau correspondant à l'infrastructure locale. Coût, délai et transposabilité LMIC sont affichés — le geste mécanique reste inchangé.",
    },
    selectorLabel: "Niveau de ressources",
    syncedLabel: "Synchronisé avec le mode faibles ressources",
    levels: [
      { level: 1, title: "L1 — Minimal", description: "Doppler + couche visuelle AquaMR bas champ. Sans iode, sans gadolinium, sans rayonnement.", cost: "€", delay: "Jour même", lmic: "Élevée" },
      { level: 2, title: "L2 — Standard", description: "Ajoute l'ARM sans gadolinium, le compte-rendu structuré et la traçabilité.", cost: "€€", delay: "1–3 jours", lmic: "Moyenne" },
      { level: 3, title: "L3 — Complet", description: "Stack multi-modal complet — utilisé uniquement si L1/L2 insuffisants, bénéfice/risque documenté.", cost: "€€€", delay: "1+ semaine", lmic: "Faible" },
    ],
    headers: { cost: "Coût indicatif", delay: "Délai typique", lmic: "Transposabilité LMIC" },
  },
  de: {
    back: "Zurück zur Startseite",
    pageTitle: "RSVP — Ressourcen-stratifizierter Bildplan",
    pageDesc: "Wählen Sie eine Ressourcenstufe (L1/L2/L3) — VASCU-LINK passt den Bildplan an.",
    hero: {
      eyebrow: "RSVP v8.3",
      title: "Ein Protokoll, drei Ressourcenstufen",
      lede:
        "Wählen Sie die Stufe entsprechend der lokalen Infrastruktur. Kosten, Verzögerung und LMIC-Transponierbarkeit werden angezeigt — die mechanische Geste bleibt unverändert.",
    },
    selectorLabel: "Ressourcenstufe",
    syncedLabel: "Synchronisiert mit Low-Resource-Modus",
    levels: [
      { level: 1, title: "L1 — Minimal", description: "Doppler + AquaMR-Bildschicht im Niederfeld. Ohne Jod, ohne Gadolinium, ohne Strahlung.", cost: "€", delay: "Gleicher Tag", lmic: "Hoch" },
      { level: 2, title: "L2 — Standard", description: "Plus MRA ohne Gadolinium, strukturierter Bericht und Audit-Trail.", cost: "€€", delay: "1–3 Tage", lmic: "Mittel" },
      { level: 3, title: "L3 — Vollständig", description: "Vollständiger multimodaler Stack — nur wenn L1/L2 unzureichend und Nutzen/Risiko dokumentiert.", cost: "€€€", delay: "1+ Woche", lmic: "Niedrig" },
    ],
    headers: { cost: "Indikative Kosten", delay: "Typische Verzögerung", lmic: "LMIC-Transponierbarkeit" },
  },
};

export default function Rsvp() {
  const { language: lang } = useTranslation();
  const c = COPY[lang];
  const { enabled: lowResource } = useLowResourceMode();
  const [level, setLevel] = useState<Level>(lowResource ? 1 : 2);

  useEffect(() => {
    if (lowResource) setLevel(1);
  }, [lowResource]);

  const active = c.levels.find((l) => l.level === level)!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: c.pageTitle,
    description: c.pageDesc,
    url: "https://aquamr-flow.com/rsvp",
    inLanguage: lang,
    isPartOf: {
      "@type": "WebSite",
      name: "VASCU-LINK · AquaMR Flow",
      url: "https://aquamr-flow.com",
    },
    about: {
      "@type": "MedicalProcedure",
      name: "Resource-Stratified Visual Plan (RSVP) — L1/L2/L3",
    },
  };

  return (
    <>
      <SEOHead title={c.pageTitle} description={c.pageDesc} path="/rsvp" jsonLd={jsonLd} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <ArrowLeft className="h-4 w-4" /> {c.back}
          </Link>

          <header className="mt-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.hero.eyebrow}</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">{c.hero.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl">{c.hero.lede}</p>
          </header>

          <section className="mt-10" aria-label="resource-level-selector">
            <fieldset>
              <legend className="text-sm font-medium">
                {c.selectorLabel}
                {lowResource && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {c.syncedLabel}
                  </span>
                )}
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={c.selectorLabel}>
                {c.levels.map((l) => {
                  const selected = l.level === level;
                  return (
                    <button
                      key={l.level}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setLevel(l.level)}
                      className={`text-left rounded-xl border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="text-sm font-semibold">{l.title}</div>
                      <p className="mt-2 text-xs text-muted-foreground">{l.description}</p>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </section>

          <section className="mt-10 rounded-xl border border-border bg-card p-6" aria-label="active-level-detail">
            <h2 className="text-lg font-semibold">{active.title}</h2>
            <p className="mt-2 text-sm text-foreground/80">{active.description}</p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{c.headers.cost}</dt>
                <dd className="mt-1 font-medium">{active.cost}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{c.headers.delay}</dt>
                <dd className="mt-1 font-medium">{active.delay}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{c.headers.lmic}</dt>
                <dd className="mt-1 font-medium">{active.lmic}</dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
    </>
  );
}
