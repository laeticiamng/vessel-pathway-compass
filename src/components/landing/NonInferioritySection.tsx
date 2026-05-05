import { motion } from "framer-motion";
import { Microscope, Target, ShieldAlert, FlaskConical } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

/**
 * Methodological clarification section.
 *
 * Makes explicit that VASCU-LINK / AquaMR Flow does NOT claim superiority
 * over conventional hospital MRI/CTA/catheter angiography. Frames L1 as a
 * diagnostic concordance study with a pragmatic non-inferiority rationale.
 *
 * Trilingual (EN/FR/DE), academic tone, no marketing vocabulary.
 */

type Card = { icon: React.ComponentType<{ className?: string }>; title: string; body: string };

type Content = {
  badge: string;
  title: string;
  subtitle: string;
  intro: string[];
  cards: Card[];
  rules: { title: string; items: string[] };
  pill: string;
};

const CONTENT: Record<Language, Content> = {
  en: {
    badge: "Methodological framing",
    title: "Not superiority, but pragmatic non-inferiority",
    subtitle:
      "Diagnostic concordance · pragmatic non-inferiority · selected PAD patients",
    intro: [
      "VASCU-LINK / AquaMR Flow is not designed to demonstrate superiority over conventional 1.5–3T hospital MRI, CT angiography, or catheter angiography.",
      "The core L1 hypothesis is methodological and clinical: can a low-field, non-ionizing, contrast-free AquaMR workflow achieve sufficient diagnostic concordance with standard vascular imaging to support selected pre-revascularization decisions in fragile PAD patients?",
      "The intended study design is therefore not a superiority trial. It is a diagnostic concordance study with a pragmatic non-inferiority rationale.",
      "AquaMR does not replace duplex ultrasound. Duplex remains the first-line hemodynamic examination. AquaMR is positioned as a potential intermediate mapping layer between duplex and heavy hospital-based imaging, only when additional anatomical cartography may influence pre-revascularization strategy.",
    ],
    cards: [
      {
        icon: Microscope,
        title: "Not superior imaging",
        body: "AquaMR does not aim to outperform hospital MRA/CTA in raw image quality.",
      },
      {
        icon: Target,
        title: "Sufficient clinical mapping",
        body: "The L1 question is whether the image is sufficient for selected pre-revascularization decisions.",
      },
      {
        icon: ShieldAlert,
        title: "Safety fallback",
        body: "If image quality is insufficient, standard imaging and conventional angiography remain mandatory.",
      },
    ],
    rules: {
      title: "When AquaMR should NOT be added",
      items: [
        "Duplex ultrasound already answers the clinical question.",
        "AquaMR image quality is insufficient for the decision.",
        "Urgent intervention is required — proceed with standard imaging.",
      ],
    },
    pill: "L1 = diagnostic feasibility, not clinical replacement",
  },
  fr: {
    badge: "Cadrage méthodologique",
    title: "Pas une supériorité, mais une non-infériorité pragmatique",
    subtitle:
      "Concordance diagnostique · non-infériorité pragmatique · patients AOMI sélectionnés",
    intro: [
      "VASCU-LINK / AquaMR Flow ne vise pas à démontrer une supériorité par rapport à l'IRM hospitalière conventionnelle 1,5–3 T, à l'angio-CT ou à l'angiographie cathéter.",
      "L'hypothèse centrale de L1 est méthodologique et clinique : une chaîne AquaMR bas champ, non ionisante et sans contraste peut-elle atteindre une concordance diagnostique suffisante avec l'imagerie vasculaire standard pour soutenir certaines décisions pré-revascularisation chez des patients AOMI fragiles ?",
      "Le design principal ne doit donc pas être compris comme une étude de supériorité, mais comme une étude de concordance diagnostique avec logique de non-infériorité pragmatique.",
      "AquaMR ne remplace pas le Doppler. Le Doppler reste l'examen hémodynamique de première ligne. AquaMR se positionne comme une couche intermédiaire potentielle entre le Doppler et l'imagerie hospitalière lourde, uniquement lorsque la cartographie anatomique complémentaire peut modifier la stratégie pré-revascularisation.",
    ],
    cards: [
      {
        icon: Microscope,
        title: "Pas une imagerie supérieure",
        body: "AquaMR ne vise pas à surpasser l'ARM/angio-CT hospitalière en qualité d'image brute.",
      },
      {
        icon: Target,
        title: "Cartographie cliniquement suffisante",
        body: "La question L1 est de savoir si l'image est suffisante pour certaines décisions pré-revascularisation.",
      },
      {
        icon: ShieldAlert,
        title: "Repli de sécurité",
        body: "Si la qualité d'image est insuffisante, l'imagerie standard et l'angiographie conventionnelle restent obligatoires.",
      },
    ],
    rules: {
      title: "Quand NE PAS ajouter AquaMR",
      items: [
        "Le Doppler répond déjà à la question clinique.",
        "La qualité d'image AquaMR est insuffisante pour la décision.",
        "Une intervention urgente est nécessaire — recourir à l'imagerie standard.",
      ],
    },
    pill: "L1 = faisabilité diagnostique, pas remplacement clinique",
  },
  de: {
    badge: "Methodische Einordnung",
    title: "Keine Überlegenheit, sondern pragmatische Nicht-Unterlegenheit",
    subtitle:
      "Diagnostische Konkordanz · pragmatische Nicht-Unterlegenheit · ausgewählte pAVK-Patienten",
    intro: [
      "VASCU-LINK / AquaMR Flow soll keine Überlegenheit gegenüber konventioneller 1,5–3 T-Klinik-MRT, CT-Angiographie oder Katheter-Angiographie nachweisen.",
      "Die zentrale L1-Hypothese ist methodisch und klinisch: Kann ein Niederfeld-, nicht-ionisierender, kontrastmittelfreier AquaMR-Workflow eine ausreichende diagnostische Konkordanz mit der vaskulären Standardbildgebung erreichen, um ausgewählte prä-revaskularisierende Entscheidungen bei fragilen pAVK-Patienten zu unterstützen?",
      "Das vorgesehene Studiendesign ist daher keine Überlegenheitsstudie. Es handelt sich um eine diagnostische Konkordanzstudie mit pragmatischer Nicht-Unterlegenheits-Logik.",
      "AquaMR ersetzt nicht den Duplex-Ultraschall. Der Duplex bleibt die hämodynamische Erstlinienuntersuchung. AquaMR positioniert sich als mögliche Zwischenebene zwischen Duplex und schwerer Klinikbildgebung, nur wenn zusätzliche anatomische Kartierung die prä-revaskularisierende Strategie beeinflussen kann.",
    ],
    cards: [
      {
        icon: Microscope,
        title: "Keine überlegene Bildgebung",
        body: "AquaMR strebt nicht an, Klinik-MRA/CTA in der reinen Bildqualität zu übertreffen.",
      },
      {
        icon: Target,
        title: "Ausreichende klinische Kartierung",
        body: "Die L1-Frage ist, ob das Bild für ausgewählte prä-revaskularisierende Entscheidungen ausreicht.",
      },
      {
        icon: ShieldAlert,
        title: "Sicherheits-Rückfallebene",
        body: "Bei unzureichender Bildqualität bleiben Standardbildgebung und konventionelle Angiographie obligatorisch.",
      },
    ],
    rules: {
      title: "Wann AquaMR NICHT hinzugefügt werden sollte",
      items: [
        "Duplex-Ultraschall beantwortet die klinische Frage bereits.",
        "AquaMR-Bildqualität ist für die Entscheidung unzureichend.",
        "Eine dringende Intervention ist erforderlich — Standardbildgebung verwenden.",
      ],
    },
    pill: "L1 = diagnostische Machbarkeit, kein klinischer Ersatz",
  },
};

export function NonInferioritySection({ compact = false }: { compact?: boolean }) {
  const { language } = useTranslation();
  const c = CONTENT[language] ?? CONTENT.en;

  return (
    <section
      id="non-inferiority"
      aria-labelledby="non-inferiority-title"
      className={`${compact ? "py-12" : "py-20"} bg-background scroll-mt-20`}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 mb-5">
            <FlaskConical className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-primary uppercase">
              {c.badge}
            </span>
          </div>
          <h2
            id="non-inferiority-title"
            className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 leading-tight text-balance"
          >
            {c.title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            {c.subtitle}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3 mb-10">
          {c.intro.map((p, i) => (
            <p
              key={i}
              className="text-sm sm:text-[0.95rem] leading-relaxed text-foreground/85"
            >
              {p}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {c.cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 hover:border-primary/30 transition-colors"
              >
                <div className="rounded-lg border border-border/60 bg-background/50 p-2 w-fit mb-3">
                  <Icon className="h-4 w-4 text-primary/80" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 text-foreground">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto rounded-xl border border-dashed border-border/70 bg-muted/30 p-5 mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {c.rules.title}
          </p>
          <ul className="space-y-2">
            {c.rules.items.map((item, i) => (
              <li
                key={i}
                className="text-sm leading-relaxed text-foreground/85 flex gap-2"
              >
                <span className="text-primary/70 shrink-0">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            {c.pill}
          </span>
        </div>
      </div>
    </section>
  );
}
