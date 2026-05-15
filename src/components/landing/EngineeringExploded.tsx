import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslation } from "@/i18n/context";
import { SPRING } from "@/lib/sculpture/tokens";
import { cn } from "@/lib/utils";

/**
 * EngineeringExploded — exploded-view of VASCU-LINK's clinical engine.
 * Hover (or focus) a piece to isolate it; the others recede.
 *
 * The visual is intentionally schematic — no fake rendering, no lab marketing.
 * It's a sculptural diagram you can interrogate.
 */

type Piece = {
  id: string;
  label: { en: string; fr: string; de: string };
  caption: { en: string; fr: string; de: string };
  /** Position on the 12×8 grid, expressed as percentages for fluid layout. */
  x: number;
  y: number;
};

const PIECES: Piece[] = [
  {
    id: "ciaki",
    label: { en: "CI-AKI risk", fr: "Risque CI-AKI", de: "CI-AKI-Risiko" },
    caption: {
      en: "Pre-procedure risk score — Mehran-derived, locally validated.",
      fr: "Score de risque pré-procédure — dérivé Mehran, validé localement.",
      de: "Risikoscore vor dem Eingriff — Mehran-basiert, lokal validiert.",
    },
    x: 18, y: 22,
  },
  {
    id: "l1",
    label: { en: "L1 decision", fr: "Décision L1", de: "L1-Entscheidung" },
    caption: {
      en: "Concordance against historical care — pragmatic non-inferiority.",
      fr: "Concordance vs. soin historique — non-infériorité pragmatique.",
      de: "Übereinstimmung mit historischer Versorgung — pragmatische Nichtunterlegenheit.",
    },
    x: 50, y: 14,
  },
  {
    id: "twin",
    label: { en: "Digital twin", fr: "Jumeau numérique", de: "Digitaler Zwilling" },
    caption: {
      en: "18-segment vascular map — segment-level dynamic risk.",
      fr: "Carte vasculaire à 18 segments — risque dynamique par segment.",
      de: "18-Segment-Gefäßkarte — dynamisches Risiko pro Segment.",
    },
    x: 82, y: 28,
  },
  {
    id: "audit",
    label: { en: "Audit trail", fr: "Piste d'audit", de: "Audit-Trail" },
    caption: {
      en: "Every inference signed, exportable, replayable.",
      fr: "Chaque inférence signée, exportable, rejouable.",
      de: "Jede Inferenz signiert, exportierbar, reproduzierbar.",
    },
    x: 28, y: 64,
  },
  {
    id: "mdr",
    label: { en: "MDR pack", fr: "Pack MDR", de: "MDR-Paket" },
    caption: {
      en: "Technical file, DPIA, IEC 62304 lifecycle on demand.",
      fr: "Dossier technique, DPIA, cycle IEC 62304 à la demande.",
      de: "Technische Dokumentation, DSFA, IEC-62304-Lebenszyklus auf Abruf.",
    },
    x: 72, y: 70,
  },
];

export function EngineeringExploded() {
  const { language } = useTranslation();
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion() ?? false;
  const lang = (["en", "fr", "de"].includes(language) ? language : "en") as "en" | "fr" | "de";

  const headings = {
    eyebrow: { en: "Engineering", fr: "Ingénierie", de: "Konstruktion" },
    title: {
      en: "Five pieces. One engine.",
      fr: "Cinq pièces. Un seul moteur.",
      de: "Fünf Teile. Ein Motor.",
    },
    sub: {
      en: "Hover a piece to isolate it. Each part is independently auditable.",
      fr: "Survolez une pièce pour l'isoler. Chaque partie est auditée indépendamment.",
      de: "Bewegen Sie den Cursor über ein Teil, um es zu isolieren. Jeder Teil ist unabhängig prüfbar.",
    },
  };

  const activePiece = PIECES.find((p) => p.id === active) ?? null;

  return (
    <section
      id="engineering"
      aria-labelledby="engineering-title"
      className="relative py-24 md:py-32 bg-muted/20 border-t border-border/40"
      data-section="engineering-exploded"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.28em] text-primary mb-4">
            {headings.eyebrow[lang]}
          </p>
          <h2
            id="engineering-title"
            className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-[1.05] mb-4"
          >
            {headings.title[lang]}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">{headings.sub[lang]}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Exploded canvas */}
          <div
            className="relative aspect-[4/3] rounded-2xl border border-border/60 bg-card overflow-hidden"
            onMouseLeave={() => setActive(null)}
            role="group"
            aria-label={headings.title[lang]}
          >
            {/* Soft radial backdrop */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 50% at 50% 50%, hsl(var(--primary) / 0.10), transparent 70%)",
              }}
            />
            {/* Connecting lines (SVG) */}
            <svg
              aria-hidden
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {PIECES.map((p, i) => {
                const next = PIECES[(i + 1) % PIECES.length];
                const dim = active && active !== p.id && active !== next.id ? 0.08 : 0.25;
                return (
                  <line
                    key={`${p.id}-${next.id}`}
                    x1={p.x}
                    y1={p.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.18"
                    strokeOpacity={dim}
                    strokeDasharray="0.8 1.2"
                  />
                );
              })}
            </svg>

            {PIECES.map((p) => {
              const isActive = active === p.id;
              const isDimmed = active !== null && !isActive;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onMouseEnter={() => setActive(p.id)}
                  onFocus={() => setActive(p.id)}
                  onBlur={() => setActive(null)}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 group",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full",
                  )}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  animate={
                    reduce
                      ? { opacity: 1, scale: 1 }
                      : { opacity: isDimmed ? 0.35 : 1, scale: isActive ? 1.08 : 1 }
                  }
                  transition={SPRING.soft}
                  aria-label={p.label[lang]}
                  aria-pressed={isActive}
                >
                  <span className="relative flex items-center justify-center">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute h-12 w-12 rounded-full bg-primary/20 transition-opacity",
                        isActive ? "opacity-100" : "opacity-50 group-hover:opacity-100",
                      )}
                    />
                    <span className="relative h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
                  </span>
                  <span
                    className={cn(
                      "mt-3 block text-xs font-mono uppercase tracking-wider whitespace-nowrap text-foreground/80",
                      "absolute left-1/2 top-full -translate-x-1/2",
                    )}
                  >
                    {p.label[lang]}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 min-h-[200px] sticky top-24">
            <AnimatePresence mode="wait">
              {activePiece ? (
                <motion.div
                  key={activePiece.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary mb-3">
                    {activePiece.label[lang]}
                  </p>
                  <p className="text-base text-foreground leading-relaxed">
                    {activePiece.caption[lang]}
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="empty"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground italic"
                >
                  {lang === "fr"
                    ? "Survolez ou tabulez sur une pièce."
                    : lang === "de"
                      ? "Bewegen Sie den Cursor über ein Teil oder navigieren Sie mit Tab."
                      : "Hover or tab through a piece."}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
