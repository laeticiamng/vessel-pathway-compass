import { motion } from "framer-motion";
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
  const stats = (t("home.completeness.stats") as unknown as { value: string; label: string }[]) || [];

  return (
    <section id="platform-complete" className="py-20 bg-background scroll-mt-20 border-y border-border/40">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-4">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">
              {t("home.completeness.badge")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("home.completeness.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("home.completeness.subtitle")}
          </p>
        </motion.div>

        {/* Key stats banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12"
        >
          {stats.map((s, i) => {
            const Icon = statIcons[i] ?? CheckCircle2;
            return (
              <div
                key={i}
                className="rounded-xl border bg-card/80 backdrop-blur-sm p-4 text-center flex flex-col items-center gap-2"
              >
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <div className="text-xl md:text-2xl font-bold leading-none">{s.value}</div>
                <div className="text-xs text-muted-foreground leading-tight">{s.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Modules grid with availability badges */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {moduleDefs.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.key}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
              >
                <Link
                  to={mod.path}
                  className="group relative flex flex-col items-start rounded-xl border bg-card p-4 card-hover h-full"
                >
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                    {t("home.completeness.available")}
                  </span>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold leading-tight pr-12">
                    {t(`landing.modules.${mod.key}.title`)}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="mt-8 text-center text-xs text-muted-foreground italic max-w-2xl mx-auto">
          {t("home.completeness.disclaimer")}
        </p>
      </div>
    </section>
  );
}
