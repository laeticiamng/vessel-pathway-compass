import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, FlaskConical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_STEPS, type DemoStepId } from "@/demo/aomiFragileCase";
import { cn } from "@/lib/utils";

interface DemoStepShellProps {
  stepId: DemoStepId;
  visual: ReactNode;
  narrative: ReactNode;
  headline?: string;
  /** Base URL for step navigation. Default: /demo/aomi-fragile */
  basePath?: string;
  /** Optional banner label override (defaults to Mme R.). */
  caseLabel?: string;
  /** Optional "back to library" link (e.g. /demo/clinical-cases). */
  libraryHref?: string;
  /** Optional next-case link shown on the final step to chain demos. */
  nextCaseHref?: string;
  /** Optional next-case label (for the "Cas suivant : …" button). */
  nextCaseLabel?: string;
}

export function DemoStepShell({
  stepId,
  visual,
  narrative,
  headline,
  basePath = "/demo/aomi-fragile",
  caseLabel = "Mme R., 82 ans — AOMI fragile, contraste contre-indiqué",
  libraryHref,
  nextCaseHref,
  nextCaseLabel,
}: DemoStepShellProps) {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const intro = search.get("intro");

  const currentIndex = DEMO_STEPS.findIndex((s) => s.id === stepId);
  const total = DEMO_STEPS.length;
  const prev = currentIndex > 0 ? DEMO_STEPS[currentIndex - 1] : null;
  const next = currentIndex < total - 1 ? DEMO_STEPS[currentIndex + 1] : null;

  const buildHref = (id: DemoStepId) => {
    const params = new URLSearchParams(search);
    params.set("step", id);
    return `${basePath}?${params.toString()}`;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" && next) navigate(buildHref(next.id));
      if (e.key === "ArrowLeft" && prev) navigate(buildHref(prev.id));
      if (e.key === "Escape") navigate(libraryHref ?? "/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div
        role="alert"
        aria-label="Demo mode — fictional data"
        className="sticky top-0 z-40 w-full border-b border-amber-500/50 bg-amber-500/15 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <FlaskConical className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span className="font-semibold text-amber-900 dark:text-amber-200">
              DEMO — Données fictives, à but pédagogique
            </span>
            <span className="hidden sm:inline text-amber-800/80 dark:text-amber-200/70 truncate">
              · {caseLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {libraryHref && (
              <Link
                to={libraryHref}
                className="hidden sm:inline-flex items-center gap-1 rounded-md border border-amber-500/40 px-2 py-1 text-[11px] font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
              >
                <ArrowLeft className="h-3 w-3" />
                Tous les cas
              </Link>
            )}
            <Link
              to="/research-evidence"
              className="hidden sm:inline-flex items-center rounded-md border border-amber-500/40 px-2 py-1 text-[11px] font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
            >
              Research evidence
            </Link>
            <Link
              to="/"
              aria-label="Quitter la démo"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            Étape {currentIndex + 1} / {total}
          </span>
          <div className="flex-1 flex items-center gap-1">
            {DEMO_STEPS.map((s, i) => (
              <Link
                key={s.id}
                to={buildHref(s.id)}
                aria-label={`Aller à l'étape ${i + 1} — ${s.titleKey}`}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i < currentIndex && "bg-primary/70",
                  i === currentIndex && "bg-primary",
                  i > currentIndex && "bg-muted hover:bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
          {intro && (
            <span className="hidden md:inline text-[10px] uppercase tracking-wider text-muted-foreground">
              Intro · {intro}
            </span>
          )}
        </div>
      </div>

      {/* Main split layout */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 grid gap-6 md:grid-cols-[1fr_360px]">
        <section
          aria-label="Visualisation de l'étape"
          className="rounded-lg border border-border/60 bg-card overflow-hidden min-h-[420px]"
        >
          {visual}
        </section>

        <aside aria-label="Pourquoi cette étape" className="flex flex-col gap-4">
          <div className="rounded-lg border border-border/60 bg-card p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary/80 font-semibold">
              Étape {currentIndex + 1} · {DEMO_STEPS[currentIndex].titleKey}
            </p>
            {headline && (
              <h1 className="mt-2 text-xl font-semibold tracking-tight">{headline}</h1>
            )}
            <div className="mt-3 text-sm text-foreground/90 leading-relaxed space-y-2">
              {narrative}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!prev}
              onClick={() => prev && navigate(buildHref(prev.id))}
              aria-label="Étape précédente"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            {next ? (
              <Button
                size="sm"
                onClick={() => navigate(buildHref(next.id))}
                aria-label="Étape suivante"
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : nextCaseHref ? (
              <Button
                size="sm"
                onClick={() => navigate(nextCaseHref)}
                aria-label={nextCaseLabel ? `Cas suivant : ${nextCaseLabel}` : "Cas suivant"}
              >
                Cas suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate("/")} aria-label="Terminer la démo">
                Terminer
              </Button>
            )}
          </div>

          {nextCaseHref && !next && nextCaseLabel && (
            <p className="text-[11px] text-muted-foreground text-center -mt-1">
              Prochain : <span className="text-foreground font-medium">{nextCaseLabel}</span>
            </p>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Astuce : utilisez ← / → au clavier pour naviguer.
          </p>
        </aside>
      </main>
    </div>
  );
}
