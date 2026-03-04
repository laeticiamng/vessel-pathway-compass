import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Brain, Download, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";

const auditLogs = [
  { action: "AI Report Generated", user: "Dr. Smith", time: "2026-03-04 14:32", type: "AI Output", status: "Signed" },
  { action: "Patient Data Exported", user: "Dr. Jones", time: "2026-03-04 11:15", type: "Export", status: "Approved" },
  { action: "Case Updated", user: "Dr. Smith", time: "2026-03-03 16:45", type: "Clinical", status: "Logged" },
  { action: "AI Report Generated", user: "Dr. Brown", time: "2026-03-03 09:20", type: "AI Output", status: "Pending" },
  { action: "Consent Updated", user: "System", time: "2026-03-02 12:00", type: "Consent", status: "Logged" },
];

export default function Compliance() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Compliance & Safety Center
        </h1>
        <p className="text-muted-foreground mt-1">Audit logs, consent management, and AI safety monitoring</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Audit Events", value: "1,247", icon: FileText },
          { label: "AI Outputs Logged", value: "89", icon: Brain },
          { label: "Pending Sign-offs", value: "3", icon: AlertTriangle },
          { label: "Consent Records", value: "156", icon: CheckCircle2 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="ai-safety">AI Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Complete record of clinical changes, AI outputs, and data exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-3 font-medium">{log.action}</td>
                        <td className="p-3">{log.user}</td>
                        <td className="p-3"><Badge variant="outline" className="text-xs">{log.type}</Badge></td>
                        <td className="p-3">
                          <Badge variant={log.status === "Pending" ? "destructive" : "secondary"} className="text-xs">
                            {log.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent Management</CardTitle>
              <CardDescription>Patient de-identification workflow and data usage consent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Registry Participation", "Research Data Usage", "Federated Learning Opt-in"].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                  <Badge variant="secondary">Configurable</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-safety" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Safety Dashboard</CardTitle>
              <CardDescription>Model versioning, confidence tracking, and human override monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Model Version</p>
                  <p className="text-lg font-bold mt-1">gemini-3-flash</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Sign-off Rate</p>
                  <p className="text-lg font-bold mt-1">96.6%</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Issues Reported</p>
                  <p className="text-lg font-bold mt-1">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
