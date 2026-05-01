import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  Sparkles,
  Activity,
  Database,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
} from "lucide-react";

type StepKey = "intake" | "assistant" | "twin" | "registry";

interface DemoStep {
  key: StepKey;
  icon: typeof ClipboardList;
  module: string;
}

const STEPS: DemoStep[] = [
  { key: "intake", icon: ClipboardList, module: "Patient Intake" },
  { key: "assistant", icon: Sparkles, module: "AI Assistant" },
  { key: "twin", icon: Activity, module: "Digital Twin" },
  { key: "registry", icon: Database, module: "Registry" },
];

const AUTOPLAY_MS = 4500;

export function InteractiveDemoSection() {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const total = STEPS.length;

  const goNext = useCallback(() => setStep((s) => (s + 1) % total), [total]);
  const goPrev = useCallback(() => setStep((s) => (s - 1 + total) % total), [total]);
  const reset = useCallback(() => {
    setStep(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setStep((s) => {
        if (s + 1 >= total) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, AUTOPLAY_MS);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [playing, total]);

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / total) * 100;

  return (
    <section
      id="interactive-demo"
      aria-labelledby="interactive-demo-title"
      className="relative py-12 sm:py-16 md:py-24 bg-gradient-to-b from-muted/30 via-background to-muted/20 scroll-mt-20 border-y border-border/40"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <Badge variant="outline" className="mb-3 gap-1.5 border-primary/40 bg-primary/5 text-primary">
            <Play className="h-3 w-3" aria-hidden="true" />
            {t("home.demo.badge")}
          </Badge>
          <h2
            id="interactive-demo-title"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-tight text-balance"
          >
            {t("home.demo.title")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("home.demo.subtitle")}
          </p>
        </div>

        {/* Stepper */}
        <ol
          className="grid grid-cols-4 gap-1.5 sm:gap-3 mb-4 sm:mb-6"
          aria-label={t("home.demo.title") as string}
        >
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={active ? "step" : undefined}
                  aria-label={`${t(`home.demo.steps.${s.key}.title`)}`}
                  className={`
                    w-full min-h-[56px] sm:min-h-[64px]
                    flex flex-col items-center justify-center gap-1
                    rounded-lg border px-1.5 py-2 text-center
                    transition-colors duration-200
                    touch-manipulation [-webkit-tap-highlight-color:transparent]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                    ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : done
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    }
                  `}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] sm:text-xs font-mono opacity-70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {done ? (
                      <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                    ) : (
                      <StepIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold leading-tight line-clamp-1">
                    {t(`home.demo.steps.${s.key}.shortTitle`)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <Progress value={progress} className="h-1 mb-6 sm:mb-8" aria-label={`${step + 1} / ${total}`} />

        {/* Screen */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <div className="flex items-center justify-between bg-muted/40 border-b px-3 sm:px-4 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 shrink-0">
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {current.module}
                </div>
                <div className="text-xs sm:text-sm font-semibold truncate">
                  {t(`home.demo.steps.${current.key}.title`)}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
              {step + 1}/{total}
            </Badge>
          </div>

          <div className="relative min-h-[320px] sm:min-h-[360px] md:min-h-[400px] p-4 sm:p-6 md:p-8 bg-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {current.key === "intake" && <IntakeScreen />}
                {current.key === "assistant" && <AssistantScreen />}
                {current.key === "twin" && <TwinScreen />}
                {current.key === "registry" && <RegistryScreen />}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>

        {/* Controls */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={step === 0}
              className="min-h-[44px] flex-1 sm:flex-none touch-manipulation"
              aria-label={t("home.demo.controls.previous") as string}
            >
              <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              {t("home.demo.controls.previous")}
            </Button>
            <Button
              variant={playing ? "secondary" : "default"}
              size="sm"
              onClick={() => setPlaying((p) => !p)}
              className="min-h-[44px] flex-1 sm:flex-none touch-manipulation"
              aria-label={playing ? (t("home.demo.controls.pause") as string) : (t("home.demo.controls.play") as string)}
            >
              {playing ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {playing ? t("home.demo.controls.pause") : t("home.demo.controls.play")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={step === total - 1}
              className="min-h-[44px] flex-1 sm:flex-none touch-manipulation"
              aria-label={t("home.demo.controls.next") as string}
            >
              {t("home.demo.controls.next")}
              <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="min-h-[44px] touch-manipulation"
              aria-label={t("home.demo.controls.reset") as string}
            >
              <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
              {t("home.demo.controls.reset")}
            </Button>
            <Button asChild size="sm" variant="outline" className="min-h-[44px] touch-manipulation">
              <Link to="/auth">
                {t("home.demo.controls.tryReal")}
                <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] sm:text-xs text-muted-foreground italic max-w-2xl mx-auto">
          {t("home.demo.disclaimer")}
        </p>
      </div>
    </section>
  );
}

/* ---------------- Screens ---------------- */

function IntakeScreen() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={t("home.demo.intake.age") as string} value="68" />
        <Field label={t("home.demo.intake.sex") as string} value={t("home.demo.intake.female") as string} />
        <Field label={t("home.demo.intake.bmi") as string} value="28.4" />
        <Field label={t("home.demo.intake.egfr") as string} value="42 mL/min/1.73m²" warn />
      </div>
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("home.demo.intake.symptoms")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["claudication", "varicose", "ulcer", "edema"] as const).map((s) => (
            <Badge key={s} variant="secondary" className="text-[11px]">
              {t(`home.demo.intake.tags.${s}`)}
            </Badge>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-foreground/80 leading-relaxed">
          {t("home.demo.intake.flag")}
        </p>
      </div>
    </div>
  );
}

function AssistantScreen() {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Stethoscope className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-xs sm:text-sm max-w-[85%]">
          {t("home.demo.assistant.userMsg")}
        </div>
      </div>
      <div className="flex items-start gap-2.5 justify-end">
        <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2.5 text-xs sm:text-sm max-w-[85%] space-y-2">
          <p>{t("home.demo.assistant.aiMsg")}</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] sm:text-xs opacity-90">
            <li>{t("home.demo.assistant.point1")}</li>
            <li>{t("home.demo.assistant.point2")}</li>
            <li>{t("home.demo.assistant.point3")}</li>
          </ul>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          {t("home.demo.assistant.transparency")}
        </p>
      </div>
    </div>
  );
}

function TwinScreen() {
  const { t } = useTranslation();
  const segments = [
    { id: "iliac-l", risk: "high", label: "Iliac L" },
    { id: "femoral-l", risk: "moderate", label: "Femoral L" },
    { id: "popliteal-l", risk: "low", label: "Popliteal L" },
    { id: "iliac-r", risk: "low", label: "Iliac R" },
    { id: "femoral-r", risk: "moderate", label: "Femoral R" },
    { id: "popliteal-r", risk: "low", label: "Popliteal R" },
  ];
  const colorOf = (r: string) =>
    r === "high"
      ? "bg-destructive/20 border-destructive text-destructive"
      : r === "moderate"
      ? "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-400"
      : "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="flex justify-center">
        <div className="relative w-32 sm:w-40 aspect-[1/2] rounded-full bg-gradient-to-b from-muted/40 to-muted/10 border flex flex-col items-center justify-around py-3">
          <HeartPulse className="h-6 w-6 text-primary" aria-hidden="true" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${segments[i].risk === "high" ? "bg-destructive animate-pulse" : segments[i].risk === "moderate" ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span className={`h-2.5 w-2.5 rounded-full ${segments[i + 3].risk === "high" ? "bg-destructive animate-pulse" : segments[i + 3].risk === "moderate" ? "bg-amber-500" : "bg-emerald-500"}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          {t("home.demo.twin.segments")}
        </div>
        {segments.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-xs ${colorOf(s.risk)}`}
          >
            <span className="font-medium">{s.label}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {t(`home.demo.twin.risk.${s.risk}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegistryScreen() {
  const { t } = useTranslation();
  const rows = [
    { id: "P-2046", date: "2026-04-22", proc: "Endovascular", outcome: "success" },
    { id: "P-2047", date: "2026-04-24", proc: "Sclerotherapy", outcome: "success" },
    { id: "P-2048", date: "2026-04-29", proc: "Bypass", outcome: "monitoring" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label={t("home.demo.registry.cases") as string} value="248" />
        <Stat label={t("home.demo.registry.success") as string} value="94%" highlight />
        <Stat label={t("home.demo.registry.followup") as string} value="12mo" />
      </div>
      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-4 bg-muted/40 px-3 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{t("home.demo.registry.col.id")}</span>
          <span>{t("home.demo.registry.col.date")}</span>
          <span className="hidden sm:inline">{t("home.demo.registry.col.procedure")}</span>
          <span>{t("home.demo.registry.col.outcome")}</span>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-4 px-3 py-2 text-[11px] sm:text-xs border-t items-center">
            <span className="font-mono">{r.id}</span>
            <span className="text-muted-foreground">{r.date}</span>
            <span className="hidden sm:inline">{r.proc}</span>
            <Badge
              variant="outline"
              className={`w-fit text-[10px] ${r.outcome === "success" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400" : "border-amber-500/40 text-amber-700 dark:text-amber-400"}`}
            >
              {t(`home.demo.registry.outcome.${r.outcome}`)}
            </Badge>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground italic">
        {t("home.demo.registry.note")}
      </p>
    </div>
  );
}

/* Helpers */
function Field({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`rounded-md border p-2.5 ${warn ? "border-amber-500/40 bg-amber-500/5" : "bg-muted/20"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
        {label}
      </div>
      <div className={`text-sm font-semibold ${warn ? "text-amber-700 dark:text-amber-400" : ""}`}>{value}</div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-2.5 sm:p-3 text-center">
      <div className={`text-lg sm:text-2xl font-bold leading-none ${highlight ? "text-primary" : ""}`}>{value}</div>
      <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">{label}</div>
    </div>
  );
}
