import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical, ShieldAlert } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { CLINICAL_CASES } from "@/demo/clinicalCases";
import type { DemoCase } from "@/demo/aomiFragileCase";
import { cn } from "@/lib/utils";

function levelTone(level: DemoCase["decision"]["committeeLevel"]) {
  switch (level) {
    case "L1":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40";
    case "L2":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40";
    case "L3":
      return "bg-destructive/10 text-destructive border-destructive/40";
  }
}

function topRiskChips(rf: DemoCase["riskFactors"]): string[] {
  if (!rf) return [];
  const chips: string[] = [];
  if (rf.diabetes) chips.push("Diabète");
  if (rf.smoking === "active") chips.push("Tabac actif");
  else if (rf.smoking === "former") chips.push("Tabac sevré");
  if (rf.ckd) chips.push("IRC");
  if (rf.priorMI) chips.push("ATCD IDM");
  if (rf.hypertension) chips.push("HTA");
  if (rf.dyslipidemia) chips.push("Dyslipidémie");
  return chips.slice(0, 3);
}

export default function ClinicalCases() {
  return (
    <>
      <SEOHead
        title="Bibliothèque de cas cliniques · VASCU-LINK"
        description="6 cas fictifs contrastés (L1 fragile, L2 standard / urgent, L3 multi-étagé, CLTI, FMD) pour comprendre comment VASCU-LINK arbitre triage, imagerie, digital twin, décision et suivi longitudinal."
      />
      <main className="min-h-screen bg-background">
        {/* Header banner */}
        <header className="border-b border-amber-500/40 bg-amber-500/10">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-start gap-2 text-xs sm:text-sm">
            <FlaskConical className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-amber-900 dark:text-amber-200">
              <strong>Cas fictifs — usage pédagogique uniquement.</strong> Données simulées,
              aucune information patient réelle. Free Open Beta · Not a medical device · No CE / FDA clearance.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-4 py-10">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-semibold">
              Clinical Case Library
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
              {CLINICAL_CASES.length} cas cliniques, 3 niveaux d'arbitrage
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Chaque cas suit le même parcours en 7 étapes — triage, imagerie, digital twin,
              arbitrage L1/L2/L3, plan opératoire, PROMs et suivi longitudinal M1 → M12 — pour
              montrer comment VASCU-LINK structure la décision selon la complexité. À la fin de
              chaque démo, vous pouvez enchaîner directement sur le cas suivant.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CLINICAL_CASES.map((c) => {
              const chips = topRiskChips(c.riskFactors);
              return (
                <Link
                  key={c.id}
                  to={`/demo/clinical-cases/${c.id}`}
                  className="group rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md flex flex-col"
                  aria-label={`Ouvrir le cas ${c.label}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                        {c.patient.initials} · {c.patient.sex} · {c.patient.age} ans
                      </p>
                      <h2 className="mt-1 text-base font-semibold leading-tight">
                        {c.label.split("—")[0].trim()}
                      </h2>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        levelTone(c.decision.committeeLevel),
                      )}
                    >
                      {c.decision.committeeLevel}
                    </span>
                  </div>

                  {c.shortPitch && (
                    <p className="mt-3 text-sm text-foreground/80 leading-relaxed flex-1">
                      {c.shortPitch}
                    </p>
                  )}

                  {chips.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Imagerie · <span className="text-foreground font-semibold">{c.imaging.modality}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      Ouvrir
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 rounded-lg border border-border/60 bg-muted/30 p-4 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">À propos de ces cas</p>
              <p className="mt-1">
                Les profils, IPS, Doppler, imagerie et trajectoires de suivi sont synthétiques. Les
                jalons M3, M6 et M12 du registre VASCU-LINK sont prospectifs (collecte en cours dans
                le cadre de l'étude L1). Voir{" "}
                <Link to="/research-evidence" className="underline hover:text-foreground">
                  Research evidence
                </Link>{" "}
                pour le statut TRL, les hypothèses et les références.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Retour à l'accueil
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
