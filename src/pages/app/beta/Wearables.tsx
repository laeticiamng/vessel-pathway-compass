import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Watch, Footprints, Camera, FileText, Shield } from "lucide-react";

export default function Wearables() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Watch className="h-8 w-8 text-primary" />
          Wearables & Home Monitoring
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Beta Preview</Badge>
      </div>
      <p className="text-muted-foreground">Patient app concept for walking tests, symptom diary, wound photos, and compression adherence.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: Footprints, title: "Walking Test Tracking", desc: "6-minute walk test, claudication distance" },
          { icon: FileText, title: "Symptom Diary", desc: "Daily symptom logging and trends" },
          { icon: Camera, title: "Wound Photo Diary", desc: "Sequential wound documentation" },
          { icon: Watch, title: "Compression Adherence", desc: "Compression therapy compliance logging" },
        ].map((f) => (
          <Card key={f.title}>
            <CardContent className="pt-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Patient Consent & Data Sharing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Share walking test data with physician", "Share wound photos with care team", "Allow data for research purposes"].map((item) => (
            <div key={item} className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">{item}</span>
              <Switch />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
