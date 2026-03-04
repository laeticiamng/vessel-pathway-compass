import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Brain,
  Activity,
  LineChart,
  BookOpen,
  FlaskConical,
  Globe,
  HeartPulse,
  Users,
  TrendingUp,
  FileText,
  ArrowRight,
} from "lucide-react";

const quickActions = [
  { label: "New Patient Case", icon: HeartPulse, path: "/app/patients" },
  { label: "AI Assistant", icon: Brain, path: "/app/ai-assistant" },
  { label: "Start Simulation", icon: FlaskConical, path: "/app/simulation" },
  { label: "Ask an Expert", icon: Globe, path: "/app/network" },
];

const stats = [
  { label: "Active Cases", value: "24", icon: HeartPulse, trend: "+3 this week" },
  { label: "Registry Entries", value: "156", icon: LineChart, trend: "+12 this month" },
  { label: "CME Credits", value: "18.5", icon: BookOpen, trend: "2 tracks active" },
  { label: "Network Score", value: "82", icon: Users, trend: "Top 15%" },
];

const recentActivity = [
  { action: "AI report generated", detail: "PAD case #147 — SOAP note", time: "2h ago", icon: Brain },
  { action: "Simulation completed", detail: "Acute limb ischemia — Score: 87%", time: "5h ago", icon: FlaskConical },
  { action: "Registry entry added", detail: "Carotid endarterectomy outcome", time: "1d ago", icon: LineChart },
  { action: "Expert response received", detail: "Complex aortic case discussion", time: "2d ago", icon: Globe },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's your clinical overview.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            asChild
            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary/50"
          >
            <Link to={action.path}>
              <action.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "AI Assistant", desc: "Generate clinical notes with AI", icon: Brain, path: "/app/ai-assistant" },
          { title: "Digital Twin", desc: "Patient timelines & vascular maps", icon: Activity, path: "/app/digital-twin" },
          { title: "Registry", desc: "Outcomes & benchmarking", icon: LineChart, path: "/app/registry" },
          { title: "Education", desc: "Competency tracks & CME", icon: BookOpen, path: "/app/education" },
          { title: "Simulation", desc: "Interactive clinical cases", icon: FlaskConical, path: "/app/simulation" },
          { title: "Research", desc: "Studies & analytics", icon: FileText, path: "/app/research" },
        ].map((mod) => (
          <Link key={mod.title} to={mod.path}>
            <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <mod.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{mod.title}</CardTitle>
                  <CardDescription className="text-xs">{mod.desc}</CardDescription>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
