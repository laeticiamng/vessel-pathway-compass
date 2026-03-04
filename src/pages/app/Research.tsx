import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Users, Database, Download, BarChart3 } from "lucide-react";

const studies = [
  { title: "PAD Outcomes Multicenter Study", status: "Recruiting", members: 4, eligible: 234, pi: "Dr. A" },
  { title: "Venous Ablation Long-term Follow-up", status: "Active", members: 3, eligible: 156, pi: "Dr. B" },
  { title: "Carotid Stenting vs CEA Registry", status: "Draft", members: 1, eligible: 0, pi: "Dr. C" },
];

export default function Research() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Research Hub
          </h1>
          <p className="text-muted-foreground mt-1">Study builder, analytics, and de-identified data exports</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Study
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Studies</p>
            <p className="text-3xl font-bold mt-1">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Eligible Patients</p>
            <p className="text-3xl font-bold mt-1">390</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Data Exports</p>
            <p className="text-3xl font-bold mt-1">7</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {studies.map((s) => (
          <Card key={s.title} className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{s.title}</h3>
                    <Badge variant={s.status === "Active" ? "default" : s.status === "Recruiting" ? "secondary" : "outline"}>
                      {s.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {s.members} members</span>
                    <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {s.eligible} eligible</span>
                    <span>PI: {s.pi}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-3.5 w-3.5 mr-1" />
                    Analytics
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
