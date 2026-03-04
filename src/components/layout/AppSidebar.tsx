import {
  Activity,
  Brain,
  BookOpen,
  FlaskConical,
  Globe,
  HeartPulse,
  LayoutDashboard,
  LineChart,
  Shield,
  Settings,
  Users,
  Cpu,
  Eye,
  Image,
  Watch,
  Glasses,
  FileText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const coreItems = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "AI Assistant", url: "/app/ai-assistant", icon: Brain },
  { title: "Patients", url: "/app/patients", icon: HeartPulse },
  { title: "Digital Twin", url: "/app/digital-twin", icon: Activity },
  { title: "Registry", url: "/app/registry", icon: LineChart },
  { title: "Education", url: "/app/education", icon: BookOpen },
  { title: "Simulation Lab", url: "/app/simulation", icon: FlaskConical },
  { title: "Expert Network", url: "/app/network", icon: Globe },
  { title: "Research Hub", url: "/app/research", icon: FileText },
];

const betaItems = [
  { title: "Federated Learning", url: "/app/beta/federated", icon: Cpu },
  { title: "AI Safety", url: "/app/beta/ai-safety", icon: Eye },
  { title: "Imaging Pipeline", url: "/app/beta/imaging", icon: Image },
  { title: "Wearables", url: "/app/beta/wearables", icon: Watch },
  { title: "AR Training", url: "/app/beta/ar-training", icon: Glasses },
];

const adminItems = [
  { title: "Compliance", url: "/app/compliance", icon: Shield },
  { title: "Team", url: "/app/team", icon: Users },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <NavLink to="/app" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <HeartPulse className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              Vascular Atlas
            </span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Clinical</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/app"}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            Beta Preview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {betaItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            v1.0 MVP · Compliance-Ready
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
