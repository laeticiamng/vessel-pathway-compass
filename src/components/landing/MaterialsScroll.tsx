import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useTranslation } from "@/i18n/context";
import { EASE } from "@/lib/sculpture/tokens";
import { cn } from "@/lib/utils";

/**
 * MaterialsScroll — sculptural "parchment" reveal of VASCU-LINK's materials.
 *
 * Pinned scroll narrative: as the user scrolls through this section, the
 * inner strata (AI pipeline · audit · MDR compliance · DSMB) unfurl one by
 * one like a parchment, with depth-based parallax. No external content
 * dependency — strings are local + bilingual to avoid expanding the i18n
 * strict-check surface during the design overhaul.
 */

type Stratum = {
  id: string;
  label: { en: string; fr: string; de: string };
  title: { en: string; fr: string; de: string };
  body: { en: string; fr: string; de: string };
};

const STRATA: Stratum[] = [
  {
    id: "imaging",
    label: { en: "Layer 01", fr: "Couche 01", de: "Schicht 01" },
    title: {
      en: "Non-ionising imaging",
      fr: "Imagerie non ionisante",
      de: "Nicht-ionisierende Bildgebung",
    },
    body: {
      en: "AquaMR Flow reconstructs angiographic function with zero radiation, zero contrast, zero helium.",
      fr: "AquaMR Flow reconstruit la fonction angiographique sans radiation, sans contraste, sans hélium.",
      de: "AquaMR Flow rekonstruiert die angiografische Funktion ohne Strahlung, Kontrastmittel oder Helium.",
    },
  },
  {
    id: "ai",
    label: { en: "Layer 02", fr: "Couche 02", de: "Schicht 02" },
    title: {
      en: "Auditable AI engine",
      fr: "Moteur IA auditable",
      de: "Auditierbare KI-Engine",
    },
    body: {
      en: "Every inference is signed, versioned and replayable — no black box, no silent updates.",
      fr: "Chaque inférence est signée, versionnée et rejouable — aucune boîte noire, aucune mise à jour silencieuse.",
      de: "Jede Inferenz ist signiert, versioniert und reproduzierbar — keine Black-Box, keine stillen Updates.",
    },
  },
  {
    id: "compliance",
    label: { en: "Layer 03", fr: "Couche 03", de: "Schicht 03" },
    title: {
      en: "MDR & GDPR by design",
      fr: "MDR & RGPD by design",
      de: "MDR & DSGVO by design",
    },
    body: {
      en: "Technical file, IEC 62304 lifecycle, DPIA — built into the platform, not bolted on.",
      fr: "Dossier technique, cycle IEC 62304, DPIA — intégrés au cœur de la plateforme, pas ajoutés après coup.",
      de: "Technische Dokumentation, IEC-62304-Lebenszyklus, DSFA — direkt in die Plattform integriert.",
    },
  },
  {
    id: "dsmb",
    label: { en: "Layer 04", fr: "Couche 04", de: "Schicht 04" },
    title: {
      en: "Independent DSMB oversight",
      fr: "Supervision DSMB indépendante",
      de: "Unabhängige DSMB-Aufsicht",
    },
    body: {
      en: "Pre-registered triggers, MICE m=20 imputation, stop-rules. The science is allowed to say no.",
      fr: "Déclencheurs pré-enregistrés, imputation MICE m=20, règles d'arrêt. La science a le droit de dire non.",
      de: "Vorregistrierte Trigger, MICE-m=20-Imputation, Abbruchregeln. Die Wissenschaft darf Nein sagen.",
    },
  },
];

interface StratumLayerProps {
  stratum: Stratum;
  index: number;
  total: number;
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduce: boolean;
  language: "en" | "fr" | "de";
}

function StratumLayer({ stratum, index, total, scrollProgress, reduce, language }: StratumLayerProps) {
  // Stagger the reveal range for each stratum across the section's scroll.
  const start = (index / total) * 0.7;
  const end = start + 0.25;

  const opacity = useTransform(scrollProgress, [start, end], reduce ? [1, 1] : [0, 1]);
  const y = useTransform(scrollProgress, [start, end], reduce ? ["0%", "0%"] : ["8%", "0%"]);
  const clip = useTransform(
    scrollProgress,
    [start, end],
    reduce ? ["inset(0 0% 0 0)", "inset(0 0% 0 0)"] : ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  );

  return (
    <motion.article
      style={{ opacity, y }}
      className={cn(
        "relative grid grid-cols-12 gap-6 items-baseline py-6 border-t border-border/50",
        index === 0 && "border-t-0",
      )}
      data-stratum={stratum.id}
    >
      <div className="col-span-12 md:col-span-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
        {stratum.label[language]}
      </div>
      <div className="col-span-12 md:col-span-10">
        <motion.h3
          style={{ clipPath: clip }}
          className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground mb-2"
        >
          {stratum.title[language]}
        </motion.h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {stratum.body[language]}
        </p>
      </div>
    </motion.article>
  );
}

export function MaterialsScroll() {
  const { language } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const lang = (["en", "fr", "de"].includes(language) ? language : "en") as "en" | "fr" | "de";

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const headingOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const railProgress = useTransform(scrollYProgress, [0.05, 0.85], ["0%", "100%"]);

  const headings = {
    eyebrow: {
      en: "Materials",
      fr: "Matériaux",
      de: "Materialien",
    },
    title: {
      en: "Engineered like a sculpture, not assembled like a stack.",
      fr: "Conçu comme une sculpture, pas assemblé comme une stack.",
      de: "Konstruiert wie eine Skulptur, nicht zusammengesetzt wie ein Stack.",
    },
    sub: {
      en: "Four strata, one object. Scroll to see what VASCU-LINK is made of.",
      fr: "Quatre strates, un seul objet. Faites défiler pour voir de quoi est fait VASCU-LINK.",
      de: "Vier Schichten, ein Objekt. Scrollen Sie, um zu sehen, woraus VASCU-LINK besteht.",
    },
  };

  return (
    <section
      ref={sectionRef}
      id="materials"
      aria-labelledby="materials-title"
      className="relative py-24 md:py-32 bg-background"
      data-section="materials-scroll"
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          style={{ opacity: headingOpacity }}
          transition={{ duration: 0.5, ease: EASE.signature as unknown as number[] }}
          className="mb-16 max-w-2xl"
        >
          <p className="text-xs font-mono uppercase tracking-[0.28em] text-primary mb-4">
            {headings.eyebrow[lang]}
          </p>
          <h2
            id="materials-title"
            className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-[1.05] mb-4"
          >
            {headings.title[lang]}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">{headings.sub[lang]}</p>
        </motion.div>

        <div className="relative grid grid-cols-12 gap-0">
          {/* Vertical progress rail */}
          <div className="hidden md:block col-span-1 sticky top-32 self-start h-[60vh]">
            <div className="relative h-full w-px bg-border mx-auto">
              <motion.div
                style={{ height: railProgress }}
                className="absolute left-0 top-0 w-px bg-primary"
                aria-hidden
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-11">
            {STRATA.map((s, i) => (
              <StratumLayer
                key={s.id}
                stratum={s}
                index={i}
                total={STRATA.length}
                scrollProgress={scrollYProgress}
                reduce={reduce}
                language={lang}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
