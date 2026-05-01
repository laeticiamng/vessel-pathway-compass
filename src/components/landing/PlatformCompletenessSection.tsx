import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import {
  Brain,
  HeartPulse,
  Calculator,
  Activity,
  FlaskConical,
  LineChart,
  BookOpen,
  FileText,
  Stethoscope,
  Link2,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Leaf,
  Lock,
} from "lucide-react";

const moduleDefs = [
  { key: "procedurePlanner", icon: Brain, path: "/app/procedure-planner" },
  { key: "fusionViewer", icon: HeartPulse, path: "/app/fusion-viewer" },
  { key: "ciAkiEngine", icon: Calculator, path: "/app/ci-aki-engine" },
  { key: "twin", icon: Activity, path: "/app/digital-twin" },
  { key: "simulation", icon: FlaskConical, path: "/app/simulation" },
  { key: "registry", icon: LineChart, path: "/app/registry" },
  { key: "education", icon: BookOpen, path: "/app/education" },
  { key: "research", icon: FileText, path: "/app/research" },
  { key: "analytics", icon: Stethoscope, path: "/app/analytics" },
  { key: "fhir", icon: Link2, path: "/app/patients" },
] as const;

const statIcons = [CheckCircle2, Globe, ShieldCheck, Lock, Leaf];

export function PlatformCompletenessSection() {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();
  const stats =
    (t("home.completeness.stats") as unknown as { value: string; label: string }[]) || [];

  // Lightweight render-time measurement (dev only, logged once)
  const measuredRef = useRef(false);
  useEffect(() => {
    if (measuredRef.current) return;
    measuredRef.current = true;
    if (typeof performance === "undefined" || !("mark" in performance)) return;
    try {
      performance.mark("platform-completeness:mounted");
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      const start = nav?.startTime ?? 0;
      const elapsed = Math.round(performance.now() - start);
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.info(`[perf] PlatformCompletenessSection mounted in ${elapsed}ms`);
      }
    } catch {
      // noop
    }
  }, []);

  // Reduced-motion friendly variants
  const fadeUp = prefersReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
      };

  return (
    <section
      id="platform-complete"
      aria-labelledby="platform-complete-title"
      className="py-12 sm:py-16 md:py-20 bg-background scroll-mt-20 border-y border-border/40"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-3 sm:mb-4">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-primary uppercase">
              {t("home.completeness.badge")}
            </span>
          </div>
          <h2
            id="platform-complete-title"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-tight text-balance"
          >
            {t("home.completeness.title")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("home.completeness.subtitle")}
          </p>
        </motion.div>

        {/* Key stats banner — horizontal scroll on small mobile, grid from sm */}
        <motion.ul
          aria-label={t("home.completeness.title") as string}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          className="
            mb-10 sm:mb-12
            -mx-4 sm:mx-0
            flex sm:grid
            sm:grid-cols-3 md:grid-cols-5
            gap-3
            overflow-x-auto sm:overflow-visible
            snap-x snap-mandatory sm:snap-none
            px-4 sm:px-0
            pb-2 sm:pb-0
            [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {stats.map((s, i) => {
            const Icon = statIcons[i] ?? CheckCircle2;
            return (
              <li
                key={i}
                className="
                  shrink-0 sm:shrink
                  basis-[44%] sm:basis-auto
                  snap-start
                  rounded-xl border bg-card/80 backdrop-blur-sm
                  p-3 sm:p-4
                  min-h-[88px]
                  text-center flex flex-col items-center justify-center gap-1.5
                "
              >
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <div className="text-lg sm:text-xl md:text-2xl font-bold leading-none">
                  {s.value}
                </div>
                <div className="text-[11px] sm:text-xs text-muted-foreground leading-tight">
                  {s.label}
                </div>
              </li>
            );
          })}
        </motion.ul>

        {/* Modules grid with availability badges */}
        <motion.ul
          aria-label="Modules"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: prefersReduced ? 0 : 0.03 } },
          }}
        >
          {moduleDefs.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.li
                key={mod.key}
                variants={
                  prefersReduced
                    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
                    : {
                        hidden: { opacity: 0, y: 8 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
                      }
                }
              >
                <Link
                  to={mod.path}
                  aria-label={t(`landing.modules.${mod.key}.title`) as string}
                  className="
                    group relative flex flex-col items-start
                    rounded-xl border bg-card
                    p-3 sm:p-4 h-full min-h-[112px] sm:min-h-[120px]
                    transition-colors duration-200
                    hover:border-primary/40 hover:bg-card/80
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                    active:scale-[0.98] touch-manipulation
                    [-webkit-tap-highlight-color:transparent]
                  "
                >
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-primary">
                    <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                    <span className="hidden xs:inline sm:inline">
                      {t("home.completeness.available")}
                    </span>
                  </span>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-[13px] sm:text-sm font-semibold leading-tight pr-2 sm:pr-12">
                    {t(`landing.modules.${mod.key}.title`)}
                  </h3>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>

        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3">
          <Link
            to="/modules"
            className="
              inline-flex items-center gap-1.5
              min-h-[44px] px-4
              text-sm font-semibold text-primary
              rounded-md hover:bg-primary/5 hover:underline
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
              touch-manipulation [-webkit-tap-highlight-color:transparent]
            "
          >
            {t("home.completeness.detailsCta")}
            <span aria-hidden="true">→</span>
          </Link>
          <p className="text-center text-xs text-muted-foreground italic max-w-2xl mx-auto px-2">
            {t("home.completeness.disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
}
