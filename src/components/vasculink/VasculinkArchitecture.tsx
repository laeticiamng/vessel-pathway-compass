import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Stethoscope, Compass, FlaskConical, Microscope } from "lucide-react";

/**
 * Reproduction React du schéma SVG VASCU-LINK v7 — architecture en
 * trois cercles concentriques + cockpit Vessel Pathway Compass.
 * Source : VASCU-LINK_schema_architecture.svg (uploaded by candidate).
 */
export function VasculinkArchitecture({ className }: { className?: string }) {
  return (
    <Card className={className} data-testid="vasculink-architecture">
      <CardHeader>
        <CardTitle className="text-base">VASCU-LINK — From diagnosis to gesture</CardTitle>
        <CardDescription>
          Three concentric circles · 4-zero angiographic function · proximity vascular medicine.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Banner cockpit */}
        <div className="rounded-xl bg-primary text-primary-foreground p-4 text-center">
          <p className="text-sm font-semibold">
            4-zero vascular cockpit · 0 mSv · 0 Gd / 0 iodine · 0 helium · BoM target &lt; €15k · recycled / bio-sourced materials
          </p>
        </div>

        {/* L1 — Diagnose */}
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-primary">L1 — DIAGNOSE</h3>
            <Badge variant="default" className="text-[10px]">Mandatory PhD core</Badge>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Circle 1 · Planned prospective validation cohort (n ≈ 250 analysable, partner site to be confirmed)
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { t: "Low-field AquaMR MRA", s: "Halbach NdFeB recycled + AI" },
              { t: "Structured Doppler", s: "+ ABI/TBI/connected oximetry" },
              { t: "C4-i stratification v11.1", s: "Clinico-physiological discordance" },
              { t: "Vascular PROMs (EN)", s: "WIQ · VascuQol-6 · 6-MWT" },
            ].map((x) => (
              <div key={x.t} className="rounded-lg bg-background border p-3">
                <p className="text-xs font-semibold text-primary">{x.t}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{x.s}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center font-medium">
            Makes the patient legible, classifiable and routable to:{" "}
            <span className="text-muted-foreground">
              optimized medical therapy · surveillance · standard imaging · endovascular · surgical
            </span>
          </p>
          <p className="text-[11px] text-center text-muted-foreground italic">
            If image quality insufficient: documented fallback to standard imaging (angio-CT / contrast MRA).
          </p>
        </div>

        <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-primary" /></div>

        {/* Decision cockpit */}
        <div className="rounded-xl bg-primary/90 text-primary-foreground p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Compass className="h-5 w-5" />
            <h3 className="font-bold">DECISION — Vessel Pathway Compass cockpit</h3>
          </div>
          <p className="text-xs">Patient-specific vascular twin · multimodal fusion · AquaMR Registry</p>
          <p className="text-[11px] italic opacity-90">
            15 documented ADR · architecture designed to target MDR / GDPR / IEC 62304 conformity (not certified at this stage)
          </p>
          <p className="text-[11px] italic opacity-90">
            Migration planned to clinical HDS hosting (EU/CH) · independent DSMB & Data Access Committee
          </p>
        </div>

        <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-primary" /></div>

        {/* L2 — Guide */}
        <div className="rounded-xl border-2 border-warning/40 bg-warning/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-warning" />
            <h3 className="font-bold text-warning">L2 — GUIDE</h3>
            <Badge variant="secondary" className="text-[10px]">Conditional PhD extension</Badge>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Circle 2 · Phantom / simulated demonstration · acceptability & usability measured (M42)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {["Real-time echo-MR fusion", "MR-safe instrument tracking", "Guided puncture — phantom/simulated"].map((x) => (
              <div key={x} className="rounded-lg bg-background border p-3 text-xs font-medium text-center">{x}</div>
            ))}
          </div>
        </div>

        <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-primary" /></div>

        {/* L3 — Vision */}
        <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-destructive" />
            <h3 className="font-bold text-destructive">L3 — POST-PHD VISION (preclinical)</h3>
            <Badge variant="outline" className="text-[10px]">Long-term horizon</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Circle 3 — Strictly preclinical interventional PoC (animal model / cadaver). No human application within the thesis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
