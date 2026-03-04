import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cpu, Shield, Activity, CheckCircle2 } from "lucide-react";

export default function FederatedLearning() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Cpu className="h-8 w-8 text-primary" />
          Federated Learning
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Beta Preview</Badge>
      </div>
      <p className="text-muted-foreground">Privacy-preserving collaborative AI training — model updates shared, data stays local.</p>

      <Card>
        <CardHeader>
          <CardTitle>Institution Opt-in</CardTitle>
          <CardDescription>Enable your institution to participate in federated learning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Participate in Federated Learning</p>
              <p className="text-sm text-muted-foreground">Training happens locally, only model updates are shared</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Ethics Approval</p>
              <p className="text-sm text-muted-foreground">Upload ethics committee approval documentation</p>
            </div>
            <Button variant="outline" size="sm">Upload</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Federated Node Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border text-center">
              <Activity className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Node Status</p>
              <p className="font-bold mt-1">Inactive</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <Cpu className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Training Rounds</p>
              <p className="font-bold mt-1">0</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Model Version</p>
              <p className="font-bold mt-1">—</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
