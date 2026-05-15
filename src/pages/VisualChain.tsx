import { Link } from "react-router-dom";
import { ArrowLeft, Layers, Microscope, Activity, GraduationCap } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation, type Language } from "@/i18n/context";
import { MedicalDisclaimerStrong } from "@/components/MedicalDisclaimerStrong";

/* ============================================================================
 * /visual-chain — v8.3
 *
 * Positions VASCU-LINK as a *visual* chain (L1/L2/L3/Post-PhD) that augments
 * the mechanical revascularisation gesture without replacing it. Mirrors the
 * memo at mem://positioning/visual-chain-v8.3.
 * ========================================================================== */

type Layer = {
  id: "L1" | "L2" | "L3" | "PostPhD";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  role: string;
  outcome: string;
};

type Copy = {
  back: string;
  pageTitle: string;
  pageDesc: string;
  hero: { eyebrow: string; title: string; lede: string };
  layers: Layer[];
  table: {
    title: string;
    headers: [string, string, string, string];
    rows: Array<[string, string, string, string]>;
  };
  signature: string;
  fourZero: { title: string; items: string[] };
};

const COPY: Record<Language, Copy> = {
  en: {
    back: "Back to home",
    pageTitle: "Visual Chain — VASCU-LINK v8.3",
    pageDesc:
      "VASCU-LINK addresses the visual chain (L1/L2/L3/Post-PhD). The mechanical revascularisation gesture is unchanged.",
    hero: {
      eyebrow: "Visual chain v8.3",
      title: "We do not change the gesture. We change what guides it.",
      lede:
        "Standard angiography, MRA, CTA and the catheter-based gesture remain the reference. VASCU-LINK contributes a four-layer non-ionising visual chain to plan, screen and follow-up.",
    },
    layers: [
      { id: "L1", icon: Microscope, title: "L1 — Pre-revascularisation mapping", role: "Non-ionising mapping for symptomatic PAD without contrast/radiation.", outcome: "Reduces unnecessary CTA / MRA / DSA in fragile patients." },
      { id: "L2", icon: Activity, title: "L2 — Discordance arbitration", role: "Second-line when clinical–Doppler discordance is documented.", outcome: "Auditable arbitration before invasive imaging." },
      { id: "L3", icon: Layers, title: "L3 — Longitudinal follow-up", role: "Repeated, traceable follow-up in CKD ≥3 / diabetes / polymorbidity.", outcome: "Lower cumulative iodine / radiation exposure." },
      { id: "PostPhD", icon: GraduationCap, title: "Post-PhD — Global health layer", role: "LMIC-transposable visual layer at low cost / low footprint.", outcome: "Compatible with WHO essential imaging frameworks." },
    ],
    table: {
      title: "Cost & footprint comparison (indicative)",
      headers: ["Modality", "Per-exam cost", "CO₂e footprint", "LMIC transposability"],
      rows: [
        ["DSA / catheter angiography", "€€€€", "High", "Low"],
        ["CTA (contrast)", "€€€", "Medium-high", "Medium"],
        ["MRA (gadolinium)", "€€€", "Medium", "Low"],
        ["VASCU-LINK visual layer", "€", "Low", "High"],
      ],
    },
    signature: "Same gesture. Less ionising. More auditable.",
    fourZero: {
      title: "4-zero rules",
      items: ["Zero ionising radiation", "Zero iodinated contrast", "Zero gadolinium", "Zero claim of superiority over MRI/MRA/CTA/angiography"],
    },
  },
  fr: {
    back: "Retour à l'accueil",
    pageTitle: "Chaîne visuelle — VASCU-LINK v8.3",
    pageDesc:
      "VASCU-LINK agit sur la chaîne visuelle (L1/L2/L3/Post-PhD). Le geste mécanique de revascularisation reste inchangé.",
    hero: {
      eyebrow: "Chaîne visuelle v8.3",
      title: "Nous ne changeons pas le geste. Nous changeons ce qui le guide.",
      lede:
        "L'angiographie standard, l'ARM, la TDM et le geste cathéter restent la référence. VASCU-LINK propose une chaîne visuelle non ionisante en quatre couches pour planifier, dépister et suivre.",
    },
    layers: [
      { id: "L1", icon: Microscope, title: "L1 — Cartographie pré-revascularisation", role: "Cartographie non ionisante pour AOMI symptomatique, sans produit de contraste.", outcome: "Réduit les CTA / ARM / DSA inutiles chez les patients fragiles." },
      { id: "L2", icon: Activity, title: "L2 — Arbitrage de discordance", role: "Seconde ligne en cas de discordance clinico-Doppler documentée.", outcome: "Arbitrage auditable avant imagerie invasive." },
      { id: "L3", icon: Layers, title: "L3 — Suivi longitudinal", role: "Suivi répété et traçable en IRC ≥3 / diabète / polymorbidité.", outcome: "Diminue l'exposition cumulée à l'iode / rayonnement." },
      { id: "PostPhD", icon: GraduationCap, title: "Post-PhD — Santé globale", role: "Couche visuelle transposable LMIC à faible coût / faible empreinte.", outcome: "Compatible avec les cadres OMS d'imagerie essentielle." },
    ],
    table: {
      title: "Comparaison coût & empreinte (indicatif)",
      headers: ["Modalité", "Coût par examen", "Empreinte CO₂e", "Transposabilité LMIC"],
      rows: [
        ["DSA / angiographie cathéter", "€€€€", "Élevée", "Faible"],
        ["CTA (iodé)", "€€€", "Moyenne-élevée", "Moyenne"],
        ["ARM (gadolinium)", "€€€", "Moyenne", "Faible"],
        ["Couche visuelle VASCU-LINK", "€", "Faible", "Élevée"],
      ],
    },
    signature: "Même geste. Moins d'ionisant. Plus auditable.",
    fourZero: {
      title: "Règles 4-zéro",
      items: ["Zéro rayonnement ionisant", "Zéro produit de contraste iodé", "Zéro gadolinium", "Zéro revendication de supériorité sur IRM/ARM/CTA/angiographie"],
    },
  },
  de: {
    back: "Zurück zur Startseite",
    pageTitle: "Visuelle Kette — VASCU-LINK v8.3",
    pageDesc:
      "VASCU-LINK adressiert die visuelle Kette (L1/L2/L3/Post-PhD). Die mechanische Revaskularisationsgeste bleibt unverändert.",
    hero: {
      eyebrow: "Visuelle Kette v8.3",
      title: "Wir ändern nicht die Geste. Wir ändern, was sie leitet.",
      lede:
        "Standardangiographie, MRA, CTA und der Kathetereingriff bleiben Referenz. VASCU-LINK steuert eine nicht-ionisierende vierschichtige Bildkette für Planung, Screening und Nachsorge bei.",
    },
    layers: [
      { id: "L1", icon: Microscope, title: "L1 — Prä-Revaskularisations-Mapping", role: "Nicht-ionisierendes Mapping bei symptomatischer PAVK ohne Kontrastmittel.", outcome: "Reduziert unnötige CTA / MRA / DSA bei fragilen Patienten." },
      { id: "L2", icon: Activity, title: "L2 — Diskordanz-Arbitrage", role: "Zweite Linie bei dokumentierter klinisch-Doppler-Diskordanz.", outcome: "Auditierbare Arbitrage vor invasiver Bildgebung." },
      { id: "L3", icon: Layers, title: "L3 — Longitudinale Nachsorge", role: "Wiederholbare, nachvollziehbare Nachsorge bei CKD ≥3 / Diabetes / Polymorbidität.", outcome: "Senkt kumulative Jod- / Strahlenbelastung." },
      { id: "PostPhD", icon: GraduationCap, title: "Post-PhD — Global-Health-Schicht", role: "LMIC-transponierbare Bildschicht zu geringen Kosten / Fußabdruck.", outcome: "Kompatibel mit WHO-Rahmenwerken essentieller Bildgebung." },
    ],
    table: {
      title: "Kosten- & Fußabdruckvergleich (Richtwerte)",
      headers: ["Modalität", "Kosten pro Untersuchung", "CO₂e-Fußabdruck", "LMIC-Transponierbarkeit"],
      rows: [
        ["DSA / Katheterangiographie", "€€€€", "Hoch", "Niedrig"],
        ["CTA (Kontrast)", "€€€", "Mittel-hoch", "Mittel"],
        ["MRA (Gadolinium)", "€€€", "Mittel", "Niedrig"],
        ["VASCU-LINK Bildschicht", "€", "Niedrig", "Hoch"],
      ],
    },
    signature: "Gleiche Geste. Weniger Ionisierung. Mehr Auditierbarkeit.",
    fourZero: {
      title: "4-Null-Regeln",
      items: ["Null ionisierende Strahlung", "Null jodhaltiges Kontrastmittel", "Null Gadolinium", "Null Überlegenheitsanspruch gegenüber MRT/MRA/CTA/Angiographie"],
    },
  },
};

export default function VisualChain() {
  const { lang } = useTranslation();
  const c = COPY[lang];

  return (
    <>
      <SEOHead title={c.pageTitle} description={c.pageDesc} canonical="/visual-chain" />
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-5xl px-4 py-10">
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

          <div className="mt-8">
            <MedicalDisclaimerStrong variant="banner" />
          </div>

          <section className="mt-10 grid gap-4 md:grid-cols-2" aria-label="visual-chain-layers">
            {c.layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <article
                  key={layer.id}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="text-lg font-semibold">{layer.title}</h2>
                  </div>
                  <p className="mt-3 text-sm text-foreground/80">{layer.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{layer.outcome}</p>
                </article>
              );
            })}
          </section>

          <section className="mt-12" aria-label="cost-footprint-table">
            <h2 className="text-xl font-semibold">{c.table.title}</h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    {c.table.headers.map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.table.rows.map((row) => (
                    <tr key={row[0]} className="border-t border-border">
                      {row.map((cell, i) => (
                        <td key={i} className="px-4 py-3">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12 rounded-xl border border-border bg-card/40 p-6" aria-label="four-zero">
            <h2 className="text-xl font-semibold">{c.fourZero.title}</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {c.fourZero.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-12 text-center text-base font-medium text-foreground/90 italic">
            {c.signature}
          </p>
        </div>
      </main>
    </>
  );
}
