import { Link } from "react-router-dom";
import { ArrowLeft, Stethoscope, ScanLine, Target, AlertTriangle } from "lucide-react";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { SEOHead } from "@/components/SEOHead";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import { useTranslation, type Language } from "@/i18n/context";

const COPY: Record<Language, {
  back: string;
  pageTitle: string;
  pageDesc: string;
  hero: { eyebrow: string; title: string; lede: string };
  sections: Array<{ icon: React.ComponentType<{ className?: string }>; title: string; body: string }>;
}> = {
  en: {
    back: "Back to home",
    pageTitle: "Why VASCU-LINK — bridge between Doppler and angiography",
    pageDesc:
      "VASCU-LINK does not replace Doppler — it augments it. Why not standard angiography? Target indications and switch rules.",
    hero: {
      eyebrow: "Why VASCU-LINK",
      title: "Bridging Doppler and angiography — without replacing them",
      lede:
        "Two questions deserve a frontal answer: why not just better Doppler, and why not standard angiography? Here is the evidence-driven positioning.",
    },
    sections: [
      {
        icon: Stethoscope,
        title: "A bridge between Doppler and angiography",
        body:
          "VASCU-LINK does not replace Doppler — it augments it. Doppler remains the first-line haemodynamic foundation, but does not always provide a sufficiently standardised mapping (iliac territory, below-the-knee, severe calcifications, complex anatomies, multi-level lesions, difficult patients).",
      },
      {
        icon: ScanLine,
        title: "Why not standard angiography / CTA / MRA?",
        body:
          "Highly performant modalities — but ionising (CT / angiography), iodinated or gadolinium-based, hospital-centric, expensive, and poorly suited to repeated follow-up in fragile patients.",
      },
      {
        icon: Target,
        title: "Target indications",
        body:
          "(i) Symptomatic PAD requiring pre-revascularisation mapping without contrast/radiation; (ii) clinical–Doppler discordance; (iii) fragile patient (CKD ≥ 3, diabetes, age, polymorbidities); (iv) intermediate / multi-level lesions; (v) traceable longitudinal follow-up.",
      },
      {
        icon: AlertTriangle,
        title: "Non-indications & switch rule",
        body:
          "Not indicated in acute / critical limb ischaemia, nor when the anatomy is non-interpretable. If AquaMR image quality is insufficient: documented switch to standard imaging.",
      },
    ],
  },
  fr: {
    back: "Retour à l'accueil",
    pageTitle: "Pourquoi VASCU-LINK — pont entre Doppler et angiographie",
    pageDesc:
      "VASCU-LINK ne remplace pas le Doppler, il l'augmente. Pourquoi pas l'angiographie standard ? Indications cibles et règles de bascule.",
    hero: {
      eyebrow: "Pourquoi VASCU-LINK",
      title: "Un pont entre Doppler et angiographie — sans les remplacer",
      lede:
        "Deux questions méritent une réponse frontale : pourquoi pas un meilleur Doppler, et pourquoi pas l'angiographie standard ? Voici le positionnement assumé.",
    },
    sections: [
      {
        icon: Stethoscope,
        title: "Pont entre Doppler et angiographie",
        body:
          "VASCU-LINK ne remplace pas le Doppler ; il l'augmente. Le Doppler reste le socle hémodynamique de première ligne, mais ne fournit pas toujours une cartographie standardisée suffisante (territoire iliaque, sous-géniculé, calcifications sévères, anatomies complexes, lésions multi-étagées, patients difficiles).",
      },
      {
        icon: ScanLine,
        title: "Pourquoi pas angiographie / angio-CT / ARM standard ?",
        body:
          "Modalités performantes mais irradiantes (CT / angio), iodées ou gadolinées, hospitalo-centrées, coûteuses, peu adaptées au suivi répété chez les patients fragiles.",
      },
      {
        icon: Target,
        title: "Indications cibles",
        body:
          "(i) AOMI symptomatique nécessitant une cartographie pré-revascularisation sans contraste/rayons ; (ii) discordance clinique–Doppler ; (iii) patient fragile (IRC ≥ 3, diabète, âge, polymorbidités) ; (iv) lésion intermédiaire / multi-étagée ; (v) suivi longitudinal traçable.",
      },
      {
        icon: AlertTriangle,
        title: "Non-indications & règle de bascule",
        body:
          "Non indiqué en ischémie aiguë / critique, ni si l'anatomie est non interprétable. Si la qualité AquaMR est insuffisante : bascule documentée vers l'imagerie standard.",
      },
    ],
  },
  de: {
    back: "Zurück zur Startseite",
    pageTitle: "Warum VASCU-LINK — Brücke zwischen Doppler und Angiographie",
    pageDesc:
      "VASCU-LINK ersetzt den Doppler nicht, sondern ergänzt ihn. Warum keine Standard-Angiographie? Zielindikationen und Umstiegsregeln.",
    hero: {
      eyebrow: "Warum VASCU-LINK",
      title: "Brücke zwischen Doppler und Angiographie — ohne sie zu ersetzen",
      lede:
        "Zwei Fragen verdienen eine direkte Antwort: warum nicht einfach besserer Doppler, und warum keine Standard-Angiographie? Hier die belegte Positionierung.",
    },
    sections: [
      {
        icon: Stethoscope,
        title: "Brücke zwischen Doppler und Angiographie",
        body:
          "VASCU-LINK ersetzt den Doppler nicht, sondern ergänzt ihn. Doppler bleibt das hämodynamische Fundament, liefert aber nicht immer eine ausreichend standardisierte Kartierung (iliakales Gebiet, unterhalb des Knies, schwere Verkalkungen, komplexe Anatomien, mehretagen-Läsionen, schwierige Patienten).",
      },
      {
        icon: ScanLine,
        title: "Warum keine Standard-Angiographie / CTA / MRA?",
        body:
          "Leistungsstarke Modalitäten — aber ionisierend (CT / Angio), jodhaltig oder gadoliniumbasiert, klinikzentriert, teuer, schlecht geeignet für wiederholte Verlaufskontrollen bei fragilen Patienten.",
      },
      {
        icon: Target,
        title: "Zielindikationen",
        body:
          "(i) Symptomatische pAVK mit Kartierungsbedarf vor Revaskularisierung ohne Kontrast/Strahlung; (ii) klinisch-Doppler-Diskordanz; (iii) fragile Patienten (CKD ≥ 3, Diabetes, Alter, Polymorbidität); (iv) intermediäre / mehretagen-Läsionen; (v) nachvollziehbarer Langzeit-Follow-up.",
      },
      {
        icon: AlertTriangle,
        title: "Nicht-Indikationen & Umstiegsregel",
        body:
          "Nicht indiziert bei akuter / kritischer Extremitätenischämie oder bei nicht interpretierbarer Anatomie. Bei unzureichender AquaMR-Bildqualität: dokumentierter Umstieg auf Standardbildgebung.",
      },
    ],
  },
};

export default function WhyVascuLink() {
  const { language, t } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={copy.pageTitle} description={copy.pageDesc} path="/why" />
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
        <section className="container mx-auto px-6 py-16 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            {copy.hero.eyebrow}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            {copy.hero.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {copy.hero.lede}
          </p>
        </section>

        <section className="container mx-auto px-6 pb-20 max-w-4xl">
          <div className="grid gap-6 md:gap-8">
            {copy.sections.map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-2xl border bg-card p-6 md:p-7 card-hover">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold mb-2">{title}</h2>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/trajectory"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {language === "fr" ? "Voir la trajectoire L1 → L3" : language === "de" ? "Trajektorie L1 → L3 ansehen" : "See the L1 → L3 trajectory"}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              {language === "fr" ? "Contacter l'équipe" : language === "de" ? "Team kontaktieren" : "Contact the team"}
            </Link>
          </div>
        </section>
      </main>

      <RegulatoryDisclaimer />
    </div>
  );
}
