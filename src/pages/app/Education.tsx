import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, CheckCircle2, Clock, ArrowRight } from "lucide-react";

const tracks = [
  { name: "Vascular Ultrasound", progress: 65, modules: 12, completed: 8, badge: "🔊" },
  { name: "PAD / Limb Preservation", progress: 30, modules: 15, completed: 4, badge: "🦵" },
  { name: "Aorta", progress: 0, modules: 10, completed: 0, badge: "❤️" },
  { name: "Venous Disease", progress: 45, modules: 11, completed: 5, badge: "🩸" },
  { name: "Thrombosis", progress: 10, modules: 9, completed: 1, badge: "⚡" },
];

export default function Education() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Education Hub
          </h1>
          <p className="text-muted-foreground mt-1">Competency tracks, certification, and CME credits</p>
        </div>
        <Badge variant="secondary" className="text-sm">18.5 CME Credits</Badge>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">18</p>
              <p className="text-sm text-muted-foreground">Modules Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Tracks In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Competency Tracks</h2>
        {tracks.map((track) => (
          <Card key={track.name} className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{track.badge}</span>
                  <div>
                    <h3 className="font-semibold">{track.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {track.completed}/{track.modules} modules · Micro-lessons, quizzes, logbook, OSCE
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {track.progress > 0 ? "Continue" : "Start"}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={track.progress} className="flex-1" />
                <span className="text-sm font-medium w-12 text-right">{track.progress}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Digital Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Digital Badges
          </CardTitle>
          <CardDescription>Internal credentials with verifiable metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-success/5">
              <div className="h-14 w-14 rounded-full bg-success/20 flex items-center justify-center text-2xl">🔊</div>
              <div>
                <p className="font-semibold">Vascular Ultrasound — Level 1</p>
                <p className="text-xs text-muted-foreground">Completed: Jan 2026 · Validated by Dr. Expert</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">Verified</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50 opacity-60">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-2xl">🦵</div>
              <div>
                <p className="font-semibold">PAD / Limb Preservation — In Progress</p>
                <p className="text-xs text-muted-foreground">30% complete · 11 modules remaining</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
