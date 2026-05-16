import { useState } from "react";
import { ResearchPreviewBanner } from "@/components/ResearchPreviewBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, Trash2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

type Block = { id: string; type: "RF" | "Gx" | "Gy" | "Gz" | "ADC"; duration: number };

const COLORS: Record<Block["type"], string> = {
  RF: "bg-rose-500",
  Gx: "bg-sky-500",
  Gy: "bg-emerald-500",
  Gz: "bg-amber-500",
  ADC: "bg-violet-500",
};

export default function SequenceBuilder() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "RF", duration: 2 },
    { id: "2", type: "Gz", duration: 4 },
    { id: "3", type: "ADC", duration: 6 },
  ]);

  const add = (type: Block["type"]) =>
    setBlocks((b) => [...b, { id: crypto.randomUUID(), type, duration: 2 }]);
  const remove = (id: string) => setBlocks((b) => b.filter((x) => x.id !== id));

  const totalTime = blocks.reduce((s, b) => s + b.duration, 0);

  return (
    <>
      <SEOHead title="Sequence Builder — VASCU-LINK" description="Visual MRI sequence timeline builder." />
      <ResearchPreviewBanner />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Layers className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Sequence Builder</h1>
            <Badge variant="outline">Simplified timeline</Badge>
          </div>
          <p className="text-muted-foreground">Compose pulse-sequence event blocks. Visual prototype.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Total: {totalTime} ms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["RF", "Gx", "Gy", "Gz", "ADC"] as const).map((t) => (
                <Button key={t} size="sm" variant="outline" onClick={() => add(t)}>
                  <Plus className="mr-1 h-3 w-3" />{t}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              {(["RF", "Gx", "Gy", "Gz", "ADC"] as const).map((channel) => (
                <div key={channel} className="flex items-center gap-2">
                  <span className="w-10 text-xs font-mono text-muted-foreground">{channel}</span>
                  <div className="relative flex h-8 flex-1 items-stretch overflow-hidden rounded border bg-muted/30">
                    {blocks.map((b) => (
                      <div
                        key={b.id}
                        className={b.type === channel ? `${COLORS[b.type]} opacity-90` : "bg-transparent"}
                        style={{ width: `${(b.duration / Math.max(totalTime, 1)) * 100}%` }}
                        title={`${b.type} · ${b.duration}ms`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {blocks.map((b, i) => (
                <div key={b.id} className="flex items-center gap-2 text-sm">
                  <span className={`h-3 w-3 rounded ${COLORS[b.type]}`} />
                  <span className="w-8 text-muted-foreground">#{i + 1}</span>
                  <span className="flex-1">{b.type} · {b.duration} ms</span>
                  <Button size="sm" variant="ghost" onClick={() => remove(b.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
