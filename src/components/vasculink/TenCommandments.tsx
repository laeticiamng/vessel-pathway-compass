import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

/**
 * Mapping of the 10 gestures to Mazzolai/Lanzi/Rodriguez-Palomares
 * "10 Commandments for PAD" (Eur Heart J 2025) and ESC 2024 PAD Guidelines.
 * Used to anchor education / academy modules.
 */
const COMMANDMENTS: { n: number; gesture: string; mapping: string }[] = [
  { n: 1, gesture: "Identify symptomatic PAD early", mapping: "Structured Doppler + ABI/TBI in L1" },
  { n: 2, gesture: "Confirm diagnosis with hemodynamics first", mapping: "Doppler-first principle (no replacement)" },
  { n: 3, gesture: "Stratify cardiovascular risk", mapping: "C4-i v11.1 clinico-physiological discordance" },
  { n: 4, gesture: "Optimize medical therapy", mapping: "L1 decision: medical_optimized" },
  { n: 5, gesture: "Promote supervised exercise", mapping: "PROMs follow-up: WIQ · 6-MWT" },
  { n: 6, gesture: "Address modifiable risk factors", mapping: "Risk factors editor + dynamic assessment" },
  { n: 7, gesture: "Use shared decision-making", mapping: "Decision delta before/after AquaMR + sign-off" },
  { n: 8, gesture: "Reserve revascularization for selected cases", mapping: "L1 endovasc / surgical discussion category" },
  { n: 9, gesture: "Plan structured follow-up", mapping: "VascuQol-6 + case timeline + revisions" },
  { n: 10, gesture: "Engage multidisciplinary team", mapping: "Forum + expert review + co-signoff" },
];

export function TenCommandments({ className }: { className?: string }) {
  return (
    <Card className={className} data-testid="ten-commandments">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-primary" />
          10 Commandments for PAD — ESC alignment
        </CardTitle>
        <CardDescription>
          Mapping of the 10 platform gestures to Mazzolai / Lanzi / Rodriguez-Palomares
          (Eur Heart J 2025) and ESC 2024 PAD Guidelines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {COMMANDMENTS.map((c) => (
            <li key={c.n} className="flex items-start gap-3 rounded-lg border p-3">
              <span className="font-mono text-xs font-bold text-primary min-w-[1.5rem]">{c.n}.</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{c.gesture}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">→ {c.mapping}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
