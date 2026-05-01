import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Activity,
  FlaskConical,
  BadgeCheck,
  Stethoscope,
  Factory,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

/* ============================================================================
 * Scientific Honesty section (formerly "Anti-overpromise")
 *
 * Premium card grid contrasting "Does NOT claim" vs "Actually says".
 * Designed to read as scientific maturity, not as a defensive disclaimer.
 *
 * Used on: Landing page, Protocol page, Transparency & Governance page.
 * ========================================================================== */

type Card = {
  icon: React.ComponentType<{ className?: string }>;
  notClaim: string;
  insteadSays: string;
};

type Content = {
  badge: string;
  title: string;
  subtitle: string;
  intro: string;
  labelNot: string;
  labelInstead: string;
  cards: Card[];
  transparencyLink: string;
  footer: string;
};

const ICONS = [Activity, FlaskConical, BadgeCheck, Stethoscope, Factory, FileText];

const CONTENT: Record<Language, Content> = {
  fr: {
    badge: "Honnêteté scientifique",
    title: "Honnêteté scientifique",
    subtitle: "Chaque ambition est associée à sa limite méthodologique.",
    intro:
      "VASCU-LINK revendique une trajectoire ambitieuse, mais graduée. La plateforme distingue explicitement ce qui est démontré, ce qui est en validation, et ce qui reste préclinique.",
    labelNot: "Ne prétend pas",
    labelInstead: "Dit plutôt",
    cards: [
      {
        icon: ICONS[0],
        notClaim: "Remplacer toute l'angiographie.",
        insteadSays:
          "Reconstruit certaines fonctions angiographiques sur indications ciblées.",
      },
      {
        icon: ICONS[1],
        notClaim: "Réaliser une revascularisation humaine pendant la thèse.",
        insteadSays: "L1 clinique, L2 simulation, L3 préclinique.",
      },
      {
        icon: ICONS[2],
        notClaim: "Être un dispositif médical certifié.",
        insteadSays:
          "Prototype de recherche conçu vers MDR / RGPD / IEC 62304.",
      },
      {
        icon: ICONS[3],
        notClaim: "Être supérieur au Doppler partout.",
        insteadSays: "Utile quand Doppler ou ABI ne suffisent pas.",
      },
      {
        icon: ICONS[4],
        notClaim: "Être prêt industriellement.",
        insteadSays: "Preuve doctorale graduée, pas un produit fini.",
      },
      {
        icon: ICONS[5],
        notClaim: "S'appuyer sur des données cliniques publiées existantes.",
        insteadSays:
          "Fondé sur ADR documentées et un protocole prospectif déclaré.",
      },
    ],
    transparencyLink: "Voir la page Transparence & Gouvernance",
    footer:
      "Toute affirmation jugée exagérée peut être signalée — nous corrigerons publiquement avec date de modification.",
  },
  en: {
    badge: "Scientific honesty",
    title: "Scientific honesty",
    subtitle: "Every ambition is paired with its methodological limit.",
    intro:
      "VASCU-LINK claims an ambitious but graded trajectory. The platform explicitly distinguishes what is demonstrated, what is under validation, and what remains preclinical.",
    labelNot: "Does not claim",
    labelInstead: "Actually says",
    cards: [
      {
        icon: ICONS[0],
        notClaim: "To replace all angiography.",
        insteadSays:
          "Rebuilds some angiography functions on targeted indications.",
      },
      {
        icon: ICONS[1],
        notClaim: "To perform human revascularisation during the thesis.",
        insteadSays: "L1 clinical, L2 simulation, L3 preclinical.",
      },
      {
        icon: ICONS[2],
        notClaim: "To be a certified medical device.",
        insteadSays:
          "Research prototype designed toward MDR / GDPR / IEC 62304.",
      },
      {
        icon: ICONS[3],
        notClaim: "To outperform Doppler everywhere.",
        insteadSays: "Useful when Doppler or ABI fall short.",
      },
      {
        icon: ICONS[4],
        notClaim: "To be industrially ready.",
        insteadSays: "Graded doctoral proof, not a finished product.",
      },
      {
        icon: ICONS[5],
        notClaim: "To rely on existing published clinical data.",
        insteadSays:
          "Based on documented ADRs and a declared prospective protocol.",
      },
    ],
    transparencyLink: "See the Transparency & Governance page",
    footer:
      "Any claim that looks exaggerated can be reported — we will correct it publicly, with a dated change.",
  },
  de: {
    badge: "Wissenschaftliche Ehrlichkeit",
    title: "Wissenschaftliche Ehrlichkeit",
    subtitle: "Jede Ambition steht neben ihrer methodischen Grenze.",
    intro:
      "VASCU-LINK verfolgt eine ambitionierte, aber abgestufte Linie. Die Plattform unterscheidet ausdrücklich zwischen Belegtem, in Validierung Befindlichem und Präklinischem.",
    labelNot: "Beansprucht nicht",
    labelInstead: "Sagt stattdessen",
    cards: [
      {
        icon: ICONS[0],
        notClaim: "Die gesamte Angiographie zu ersetzen.",
        insteadSays:
          "Stellt bestimmte angiographische Funktionen bei gezielten Indikationen wieder her.",
      },
      {
        icon: ICONS[1],
        notClaim: "Humane Revaskularisation während der Dissertation.",
        insteadSays: "L1 klinisch, L2 Simulation, L3 präklinisch.",
      },
      {
        icon: ICONS[2],
        notClaim: "Ein zertifiziertes Medizinprodukt zu sein.",
        insteadSays:
          "Forschungsprototyp, ausgerichtet auf MDR / DSGVO / IEC 62304.",
      },
      {
        icon: ICONS[3],
        notClaim: "Doppler überall zu übertreffen.",
        insteadSays: "Nützlich, wo Doppler oder ABI nicht ausreichen.",
      },
      {
        icon: ICONS[4],
        notClaim: "Industriell bereit zu sein.",
        insteadSays: "Gestufter Doktoratsnachweis, kein fertiges Produkt.",
      },
      {
        icon: ICONS[5],
        notClaim: "Sich auf veröffentlichte klinische Daten zu stützen.",
        insteadSays:
          "Basierend auf dokumentierten ADRs und einem deklarierten prospektiven Protokoll.",
      },
    ],
    transparencyLink: "Zur Seite Transparenz & Governance",
    footer:
      "Jede übertrieben wirkende Aussage kann gemeldet werden — wir korrigieren öffentlich, mit datierter Änderung.",
  },
};

export function AntiOverpromiseSection({ compact = false }: { compact?: boolean }) {
  const { language } = useTranslation();
  const c = CONTENT[language] ?? CONTENT.en;

  return (
    <section
      id="anti-overpromise"
      aria-labelledby="anti-overpromise-title"
      className={`${compact ? "py-12" : "py-20"} bg-muted/20 scroll-mt-20`}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header — softer hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 mb-5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-primary uppercase">
              {c.badge}
            </span>
          </div>
          <h2
            id="anti-overpromise-title"
            className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 leading-tight text-balance"
          >
            {c.title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            {c.subtitle}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground/80 max-w-2xl mx-auto mt-4 leading-relaxed">
            {c.intro}
          </p>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {c.cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="group relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 sm:p-6 hover:border-primary/30 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="shrink-0 rounded-lg border border-border/60 bg-background/50 p-2">
                    <Icon className="h-4 w-4 text-primary/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                      {c.labelNot}
                    </p>
                    <p className="text-sm leading-snug text-foreground/90">
                      {card.notClaim}
                    </p>
                  </div>
                </div>

                <div className="pl-[3.25rem] border-l border-dashed border-primary/20 ml-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80 mb-1">
                    {c.labelInstead}
                  </p>
                  <p className="text-sm leading-snug text-foreground">
                    {card.insteadSays}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Discreet transparency link + footer */}
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <Link
            to="/transparence"
            className="inline-flex items-center gap-1.5 text-sm text-primary/90 hover:text-primary underline-offset-4 hover:underline transition-colors"
          >
            {c.transparencyLink}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <p className="text-xs text-muted-foreground/80 max-w-2xl italic">
            {c.footer}
          </p>
        </div>
      </div>
    </section>
  );
}
