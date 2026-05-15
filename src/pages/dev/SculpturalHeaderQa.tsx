import { useState } from "react";
import { MotionConfig } from "framer-motion";
import { Sculptural, SculpturalLink } from "@/components/sculpture";
import { SculpturalBreadcrumbs } from "@/components/sculpture/SculpturalBreadcrumbs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sculptural Header QA — visual + accessibility audit page.
 * Mounted at /dev/sculptural-header (dev-only).
 */
export default function SculpturalHeaderQa() {
  const [open, setOpen] = useState(false);
  const [forceReduce, setForceReduce] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground p-8 space-y-12" id="main-content">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Sculptural Header — Accessibility QA</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Audit page. Tab through everything: every interactive element must
          show a visible ring on <code>--ring</code>. Toggle the OS
          reduced-motion setting (or use the in-page switch below) and re-test:
          underlines and magnetic effects must not animate.
        </p>

        <div
          className="mt-4 flex items-center gap-3 rounded-md border bg-card p-3 w-fit"
          data-reduce-toggle-region
        >
          <Switch
            id="force-reduce"
            checked={forceReduce}
            onCheckedChange={setForceReduce}
            aria-describedby="force-reduce-desc"
            data-testid="force-reduce-switch"
          />
          <label htmlFor="force-reduce" className="text-sm font-medium cursor-pointer">
            Force reduced-motion
          </label>
          <span id="force-reduce-desc" className="sr-only">
            Disables all transitions, animations and magnetic transforms in the demo region below.
          </span>
        </div>
      </header>

      <MotionConfig reducedMotion={forceReduce ? "always" : "user"}>
        <div
          className={cn(forceReduce && "force-reduced-motion")}
          data-force-reduced-motion={forceReduce ? "true" : "false"}
          data-qa-demo-region
        >
          {/* ─────────────────────────────────────────────────────────── */}
          <section aria-labelledby="links-h" className="space-y-4">
            <h2 id="links-h" className="text-lg font-semibold">SculpturalLink — states</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-lg border bg-card">
              <Cell label="Rest (muted)">
                <SculpturalLink to="/why">Why VASCU-LINK</SculpturalLink>
              </Cell>
              <Cell label="Rest (primary)">
                <SculpturalLink to="/protocol" tone="primary">Protocol</SculpturalLink>
              </Cell>
              <Cell label="Active route">
                <SculpturalLink to="/dev/sculptural-header">Current page</SculpturalLink>
              </Cell>
              <Cell label="Hover (move pointer)">
                <SculpturalLink to="/about">Hover me</SculpturalLink>
              </Cell>
              <Cell label="Focus-visible (Tab)">
                <SculpturalLink to="/contact">Focus me</SculpturalLink>
              </Cell>
              <Cell label="Anchor link (#hash)">
                <SculpturalLink href="#main-content">Skip target</SculpturalLink>
              </Cell>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────── */}
          <section aria-labelledby="logo-h" className="space-y-4 mt-12">
            <h2 id="logo-h" className="text-lg font-semibold">Magnetic logo — Sculptural wrapper</h2>
            <div className="p-6 rounded-lg border bg-card">
              <Sculptural strength={3}>
                <a
                  href="/"
                  data-qa-magnetic-target
                  className="inline-flex items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="h-8 w-8 rounded-md bg-primary" aria-hidden />
                  <span className="font-semibold">VASCU-LINK</span>
                </a>
              </Sculptural>
              <p className="text-xs text-muted-foreground mt-3">
                Hover to feel the magnetic pull. Under reduced-motion the wrapper
                collapses to a static container (no transform).
              </p>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────── */}
          <section aria-labelledby="breadcrumbs-h" className="space-y-4 mt-12">
            <h2 id="breadcrumbs-h" className="text-lg font-semibold">Breadcrumbs</h2>
            <div className="p-6 rounded-lg border bg-card space-y-3">
              <SculpturalBreadcrumbs
                crumbs={[
                  { label: "Dev", to: "/dev/sculptural-header" },
                  { label: "Sculptural header QA" },
                ]}
              />
              <SculpturalBreadcrumbs
                crumbs={[
                  { label: "Protocol", to: "/protocol" },
                  { label: "Methodology", to: "/methodology" },
                  { label: "SAP" },
                ]}
              />
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────── */}
          <section aria-labelledby="mobile-h" className="space-y-4 mt-12">
            <h2 id="mobile-h" className="text-lg font-semibold">Mobile menu — keyboard contract</h2>
            <div className="p-6 rounded-lg border bg-card space-y-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" aria-label="Open demo mobile menu">
                    <Menu className="h-4 w-4 mr-2" /> Open mobile menu
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72" data-sculptural-mobile-menu>
                  <nav aria-label="Demo mobile navigation">
                    <ul className="flex flex-col gap-5 mt-8 list-none p-0">
                      <li>
                        <SculpturalLink to="/protocol" tone="primary" size="lg" onClick={() => setOpen(false)}>
                          Protocol
                        </SculpturalLink>
                      </li>
                      <li>
                        <SculpturalLink to="/why" size="lg" onClick={() => setOpen(false)}>
                          Why
                        </SculpturalLink>
                      </li>
                      <li>
                        <SculpturalLink to="/about" size="lg" onClick={() => setOpen(false)}>
                          About
                        </SculpturalLink>
                      </li>
                      <li>
                        <SculpturalLink to="/contact" size="lg" onClick={() => setOpen(false)}>
                          Contact
                        </SculpturalLink>
                      </li>
                    </ul>
                  </nav>
                </SheetContent>
              </Sheet>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                <li>Tab cycles within the sheet (Radix focus trap).</li>
                <li><kbd>Esc</kbd> closes and returns focus to the trigger.</li>
                <li>Click outside also closes; trigger regains focus.</li>
              </ul>
            </div>
          </section>
        </div>
      </MotionConfig>
    </main>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="p-3 rounded-md bg-background border min-h-[52px] flex items-center">
        {children}
      </div>
    </div>
  );
}
