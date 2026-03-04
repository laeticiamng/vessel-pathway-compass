import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Glasses, CheckSquare, Monitor } from "lucide-react";

export default function ARTraining() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Glasses className="h-8 w-8 text-primary" />
          Immersive Training (AR)
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Beta Preview</Badge>
      </div>
      <p className="text-muted-foreground">AR checklist mode and station-based ultrasound training concepts.</p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5" /> AR Checklist Mode</CardTitle>
          <CardDescription>Step-by-step procedural checklist overlay concept</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { step: 1, text: "Patient identification & consent", status: "complete" },
              { step: 2, text: "Equipment preparation & probe selection", status: "complete" },
              { step: 3, text: "Anatomical landmark identification", status: "current" },
              { step: 4, text: "Systematic vessel scanning protocol", status: "pending" },
              { step: 5, text: "Measurement acquisition & documentation", status: "pending" },
              { step: 6, text: "Report generation & sign-off", status: "pending" },
            ].map((s) => (
              <div key={s.step} className={`flex items-center gap-3 p-3 rounded-lg border ${
                s.status === "current" ? "border-primary bg-primary/5" :
                s.status === "complete" ? "bg-success/5 border-success/30" : ""
              }`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  s.status === "complete" ? "bg-success text-success-foreground" :
                  s.status === "current" ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {s.step}
                </div>
                <span className="text-sm">{s.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5" /> Station-Based Training</CardTitle>
          <CardDescription>Ultrasound acquisition training stations — mock concept UI</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">Station-based ultrasound training environment — coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
