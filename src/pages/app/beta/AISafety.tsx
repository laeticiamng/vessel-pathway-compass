import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, AlertTriangle, CheckCircle2, FileText, TrendingUp } from "lucide-react";

export default function AISafety() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Eye className="h-8 w-8 text-primary" />
          AI Safety Layer
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Beta Preview</Badge>
      </div>
      <p className="text-muted-foreground">Medical-grade MLOps — model versioning, drift detection, and human override tracking.</p>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Model Version", value: "v2.1", icon: TrendingUp },
          { label: "Outputs Logged", value: "89", icon: FileText },
          { label: "Issues Reported", value: "2", icon: AlertTriangle },
          { label: "Sign-off Rate", value: "96.6%", icon: CheckCircle2 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drift Detection</CardTitle>
          <CardDescription>Monitor model performance and data distribution shifts</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">Drift detection dashboard — coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
