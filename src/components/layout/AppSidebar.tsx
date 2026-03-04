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
import { useTranslation } from "@/i18n/context";
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

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) =>
    path === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(path);

  const coreItems = [
    { title: t("sidebar.dashboard"), url: "/app", icon: LayoutDashboard },
    { title: t("sidebar.aiAssistant"), url: "/app/ai-assistant", icon: Brain },
    { title: t("sidebar.patients"), url: "/app/patients", icon: HeartPulse },
    { title: t("sidebar.digitalTwin"), url: "/app/digital-twin", icon: Activity },
    { title: t("sidebar.registry"), url: "/app/registry", icon: LineChart },
    { title: t("sidebar.education"), url: "/app/education", icon: BookOpen },
    { title: t("sidebar.simulationLab"), url: "/app/simulation", icon: FlaskConical },
    { title: t("sidebar.expertNetwork"), url: "/app/network", icon: Globe },
    { title: t("sidebar.researchHub"), url: "/app/research", icon: FileText },
  ];

  const betaItems = [
    { title: t("sidebar.federatedLearning"), url: "/app/beta/federated", icon: Cpu },
    { title: t("sidebar.aiSafety"), url: "/app/beta/ai-safety", icon: Eye },
    { title: t("sidebar.imagingPipeline"), url: "/app/beta/imaging", icon: Image },
    { title: t("sidebar.wearables"), url: "/app/beta/wearables", icon: Watch },
    { title: t("sidebar.arTraining"), url: "/app/beta/ar-training", icon: Glasses },
  ];

  const adminItems = [
    { title: t("sidebar.compliance"), url: "/app/compliance", icon: Shield },
    { title: t("sidebar.team"), url: "/app/team", icon: Users },
    { title: t("sidebar.settings"), url: "/app/settings", icon: Settings },
  ];

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
          <SidebarGroupLabel>{t("sidebar.clinical")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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
          <SidebarGroupLabel>{t("sidebar.betaPreview")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {betaItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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
          <SidebarGroupLabel>{t("sidebar.administration")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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
            {t("common.version")}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
