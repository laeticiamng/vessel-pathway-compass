import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Plus, Search, Filter } from "lucide-react";

const mockPatients = [
  { id: "P-001", category: "PAD", status: "Active", lastVisit: "2026-02-28", abi: "0.65/0.82", risk: "High" },
  { id: "P-002", category: "Aortic", status: "Follow-up", lastVisit: "2026-02-20", abi: "N/A", risk: "Critical" },
  { id: "P-003", category: "Venous", status: "Active", lastVisit: "2026-03-01", abi: "1.05/1.10", risk: "Low" },
  { id: "P-004", category: "Carotid", status: "Post-op", lastVisit: "2026-02-15", abi: "0.90/0.88", risk: "Moderate" },
  { id: "P-005", category: "DVT/PE", status: "Active", lastVisit: "2026-03-02", abi: "N/A", risk: "High" },
];

const riskColor: Record<string, string> = {
  Low: "bg-success/10 text-success",
  Moderate: "bg-warning/10 text-warning",
  High: "bg-destructive/10 text-destructive",
  Critical: "bg-destructive text-destructive-foreground",
};

export default function Patients() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Cases</h1>
          <p className="text-muted-foreground mt-1">De-identified patient case management</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search cases by ID, category..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Case ID</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">ABI</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Risk</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {mockPatients.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm font-medium">{p.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{p.category}</Badge>
                    </td>
                    <td className="p-4 text-sm">{p.status}</td>
                    <td className="p-4 font-mono text-sm">{p.abi}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${riskColor[p.risk]}`}>
                        {p.risk}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{p.lastVisit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
