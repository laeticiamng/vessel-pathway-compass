import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radiation, Droplets, Wind, Wallet } from "lucide-react";

interface Pillar {
  icon: typeof Radiation;
  pillar: string;
  target: string;
  benchmark: string;
  externality: string;
}

const PILLARS: Pillar[] = [
  {
    icon: Radiation,
    pillar: "Zero ionizing radiation",
    target: "0 mSv per exam",
    benchmark: "vs angio-CT 5–15 mSv",
    externality: "Cumulative ionizing exposure on long-term follow-up",
  },
  {
    icon: Droplets,
    pillar: "Zero injected contrast",
    target: "0 g Gd · 0 mL iodine",
    benchmark: "vs MRA Gd ≈ 3.24 kg/site/year",
    externality: "CI-AKI in CKD patients · contrast environmental release",
  },
  {
    icon: Wind,
    pillar: "Zero helium",
    target: "Halbach NdFeB recycled (WEEE)",
    benchmark: "vs standard MRI cryogenic He",
    externality: "He depletion · rare-earth dependency · carbon footprint",
  },
  {
    icon: Wallet,
    pillar: "Radically reduced cost",
    target: "BoM target < €15k (estimate, no formal vendor quote yet)",
    benchmark: "vs 1.5–3 T MRI: €1.5–5 M (70–225×)",
    externality: "Access barrier in private practice & LMIC settings",
  },
];

interface Props {
  className?: string;
  variant?: "full" | "compact";
}

export function FourZeroPillars({ className, variant = "full" }: Props) {
  return (
    <Card className={className} data-testid="four-zero-pillars">
      <CardHeader>
        <CardTitle className="text-base">VASCU-LINK 4-zero signature</CardTitle>
        <CardDescription>
          Four chiffrés pillars defining the AquaMR cockpit. To our knowledge, no routine
          clinical modality combines the four.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={
            variant === "compact"
              ? "grid grid-cols-2 gap-3"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
          }
        >
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.pillar}
                data-testid={`pillar-${p.pillar.replace(/\s+/g, "-").toLowerCase()}`}
                className="rounded-xl border p-4 space-y-2 bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold leading-tight">{p.pillar}</p>
                </div>
                <Badge variant="default" className="text-[10px]">{p.target}</Badge>
                {variant === "full" && (
                  <>
                    <p className="text-[11px] text-muted-foreground italic">{p.benchmark}</p>
                    <p className="text-[11px] text-muted-foreground">{p.externality}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
