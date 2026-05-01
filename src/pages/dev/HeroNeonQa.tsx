import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useSearchParams, Navigate } from "react-router-dom";
import { NeonGradientText } from "@/components/ui/neon-gradient-text";
import { HeroNeonMetricsPanel } from "@/components/dev/HeroNeonMetricsPanel";
import { useHighContrast } from "@/hooks/useHighContrast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

/**
 * Dedicated QA route for the hero-neon component.
 *
 * Lets QA / design toggle the four orthogonal axes (theme, contrast,
 * reduced-motion, lazy) without leaving the page, and previews the result
 * at three viewport widths simultaneously.
 *
 * Production guard: route returns 404 in PROD unless `?force=1`.
 */
export default function HeroNeonQa() {
  const [params] = useSearchParams();
  const isProd = import.meta.env.PROD;
  const force = params.get("force") === "1";

  const { theme, setTheme } = useTheme();
  const { highContrast, toggleHighContrast } = useHighContrast();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lazy, setLazy] = useState(true);
  const [focusable, setFocusable] = useState(false);
  const [intensitySlider, setIntensitySlider] = useState([1]);
  const intensity = (["soft", "medium", "strong"] as const)[intensitySlider[0]] ?? "medium";

  // Inject a runtime stylesheet that simulates `prefers-reduced-motion`.
  useEffect(() => {
    if (!reducedMotion) return;
    const style = document.createElement("style");
    style.id = "hero-neon-qa-reduced-motion";
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
      [data-hero-neon] {
        filter: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
    document.querySelectorAll("[data-hero-neon]").forEach((el) => {
      el.setAttribute("data-hero-neon-scrolling", "true");
    });
    return () => {
      style.remove();
      document.querySelectorAll("[data-hero-neon]").forEach((el) => {
        el.setAttribute("data-hero-neon-scrolling", "false");
      });
    };
  }, [reducedMotion]);

  const previews = useMemo(
    () => [
      { label: "Mobile (375)", width: 375 },
      { label: "Tablet (768)", width: 768 },
      { label: "Desktop (1440)", width: 1440 },
    ],
    [],
  );

  if (isProd && !force) return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 lg:p-10">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">Hero-neon QA</h1>
        <p className="text-muted-foreground">
          Manual control surface for the hero-neon visual contract. Toggle the
          axes below and watch the previews react in real time.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="p-4 space-y-5 h-fit lg:sticky lg:top-6">
          <ControlGroup label="Theme">
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={theme === t ? "default" : "outline"}
                  onClick={() => setTheme(t)}
                  className="flex-1 capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </ControlGroup>

          <Toggle
            id="hc"
            label="High contrast"
            checked={highContrast}
            onChange={() => toggleHighContrast()}
          />
          <Toggle
            id="rm"
            label="Reduced motion (simulated)"
            checked={reducedMotion}
            onChange={setReducedMotion}
          />
          <Toggle id="lazy" label="Lazy load" checked={lazy} onChange={setLazy} />
          <Toggle
            id="focusable"
            label="Focusable (Tab to focus)"
            checked={focusable}
            onChange={setFocusable}
          />

          <ControlGroup label={`Intensity: ${intensity}`}>
            <Slider
              min={0}
              max={2}
              step={1}
              value={intensitySlider}
              onValueChange={setIntensitySlider}
            />
          </ControlGroup>

          <HeroNeonMetricsPanel inline />
        </Card>

        <div className="space-y-6">
          {previews.map((p) => (
            <Card key={p.width} className="p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">{p.label}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {p.width}px
                </span>
              </div>
              <div
                className="mx-auto border border-border/40 rounded-lg overflow-hidden"
                style={{ width: Math.min(p.width, 1200), maxWidth: "100%" }}
              >
                <div className="p-8 bg-background">
                  <h2 className="text-3xl md:text-4xl font-bold leading-[1.1] text-foreground">
                    Moins de contraste.
                    <br />
                    Moins de radiation.
                    <br />
                    {/* re-key to remount and re-trigger metrics on toggle */}
                    <NeonGradientText
                      key={`${lazy}-${focusable}-${intensity}-${reducedMotion}`}
                      intensity={intensity}
                      lazy={lazy}
                      focusable={focusable}
                      className="inline-block"
                    >
                      Plus de contrôle sur vos procédures vasculaires.
                    </NeonGradientText>
                  </h2>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm cursor-pointer">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}
