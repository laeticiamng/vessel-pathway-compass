import { useState } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  BookOpen,
  Calculator,
  ChevronDown,
  ClipboardList,
  FlaskConical,
  FileText,
  Globe,
  HeartPulse,
  Image,
  LayoutDashboard,
  LineChart,
  Settings,
  ShieldCheck,
  Stethoscope,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("common.signOut"));
    navigate("/");
  };

  const isActive = (path: string) =>
    path === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(path);

  // Primary clinical workflow items
  const primaryItems = [
    { title: t("sidebar.dashboard"), url: "/app", icon: LayoutDashboard },
    { title: t("sidebar.procedurePlanner"), url: "/app/procedure-planner", icon: Brain },
    { title: t("sidebar.fusionViewer"), url: "/app/fusion-viewer", icon: Image },
    ...(session ? [{ title: t("sidebar.patients"), url: "/app/patients", icon: HeartPulse }] : []),
    { title: t("sidebar.digitalTwin"), url: "/app/digital-twin", icon: Activity },
    { title: t("sidebar.ciAkiEngine"), url: "/app/ci-aki-engine", icon: Calculator },
    { title: t("sidebar.simulationLab"), url: "/app/simulation", icon: FlaskConical },
  ];

  // Screening items
  const screeningItems = [
    { title: t("sidebar.vascscreen"), url: "/app/vascscreen", icon: Stethoscope },
  ];

  // Platform items — collapsible
  const platformItems = [
    { title: t("sidebar.registry"), url: "/app/registry", icon: LineChart },
    { title: t("sidebar.researchHub"), url: "/app/research", icon: FileText },
    { title: t("sidebar.education"), url: "/app/education", icon: BookOpen },
    { title: t("sidebar.analytics"), url: "/app/analytics", icon: BarChart3 },
    ...(session ? [
      { title: t("sidebar.network") || "Network", url: "/app/network", icon: Globe },
      { title: t("sidebar.logbook") || "Logbook", url: "/app/logbook", icon: ClipboardList },
    ] : []),
  ];

  const adminItems = [
    ...(session ? [
      { title: t("sidebar.admin") || "Admin", url: "/app/admin", icon: ShieldCheck },
      { title: "Gouvernance", url: "/app/governance", icon: ShieldCheck },
      { title: t("sidebar.settings"), url: "/app/settings", icon: Settings },
    ] : []),
  ];

  // Auto-open platform section if user is on one of those pages
  const isOnPlatform = platformItems.some((item) => isActive(item.url));
  const [platformOpen, setPlatformOpen] = useState(isOnPlatform);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <NavLink to={session ? "/app" : "/"} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <HeartPulse className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              AquaMR Flow
            </span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary clinical workflow */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.clinical")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
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

        {/* Screening */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.screening")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {screeningItems.map((item) => (
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

        {/* Platform tools — collapsible */}
        {!collapsed ? (
          <Collapsible open={platformOpen} onOpenChange={setPlatformOpen}>
            <SidebarGroup>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                {t("sidebar.platform")}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${platformOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {platformItems.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {platformItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administration */}
        {adminItems.length > 0 && (
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
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {session ? (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>{t("common.signOut")}</span>}
          </button>
        ) : (
          <NavLink
            to="/auth"
            className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <LogOut className="h-4 w-4 rotate-180" />
            {!collapsed && <span>{t("landing.nav.signIn")}</span>}
          </NavLink>
        )}
        {!collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            {t("common.version")}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
