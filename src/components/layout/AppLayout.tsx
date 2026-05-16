import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { Button } from "@/components/ui/button";
import { Search, Moon, Sun, Globe } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { HighContrastToggle } from "@/components/HighContrastToggle";
import { LowResourceModeToggle } from "@/components/LowResourceModeToggle";
import { LowResourceModeBanner } from "@/components/LowResourceModeBanner";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { useTranslation, Language } from "@/i18n/context";
import { setI18nReporterRole } from "@/i18n/missReporter";
import { useUserRoles, type AppRole } from "@/hooks/useUserRoles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import { ResearchPreviewBanner } from "@/components/ResearchPreviewBanner";
import { useGlassScroll } from "@/hooks/useGlassScroll";
import { Sculptural, SculpturalBreadcrumbs, type BreadcrumbCrumb } from "@/components/sculpture";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

const ROLE_PRIORITY: AppRole[] = [
  "super_admin", "admin", "hospital_admin", "research_lead",
  "expert_reviewer", "physician", "trainee", "user",
];

export function AppLayout() {
  const [commandOpen, setCommandOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const { roles } = useUserRoles();
  const headerScrolled = useGlassScroll(8);
  const location = useLocation();
  const breadcrumbs = useMemo<BreadcrumbCrumb[]>(() => {
    const segs = location.pathname.split("/").filter(Boolean);
    if (segs.length === 0) return [];
    let acc = "";
    return segs.map((seg, i) => {
      acc += `/${seg}`;
      const label = decodeURIComponent(seg)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase());
      return i === segs.length - 1 ? { label } : { label, to: acc };
    });
  }, [location.pathname]);

  useEffect(() => {
    const top = ROLE_PRIORITY.find((r) => roles.includes(r)) ?? null;
    setI18nReporterRole(top);
  }, [roles]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" data-app-layout style={{ ['--header-h' as any]: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <a
            href="#main-content"
            data-skip-link
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("landing.footer.skipToContent")}
          </a>
          <header
            className={cn(
              "h-14 flex items-center justify-between border-b px-3 sm:px-4 sticky top-0 z-30",
              "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              headerScrolled
                ? "glass-strong border-border/60 shadow-[0_4px_16px_hsl(var(--foreground)/0.05)]"
                : "bg-background/60 backdrop-blur-md border-transparent",
            )}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            data-sculptural-header
            data-scrolled={headerScrolled}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sculptural strength={2}>
                <SidebarTrigger />
              </Sculptural>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 text-muted-foreground h-9 w-64"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="text-sm">{t("topBar.searchPlaceholder")}</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setCommandOpen(true)}
                aria-label={t("topBar.searchPlaceholder")}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium h-9 px-2 sm:px-3">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{language.toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((l) => (
                    <DropdownMenuItem
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={language === l.code ? "bg-accent" : ""}
                    >
                      <span className="mr-2">{l.flag}</span>
                      {l.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={t("topBar.toggleTheme")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              </Button>
              <HighContrastToggle />
              <LowResourceModeToggle />
              <NotificationBell />
            </div>
          </header>
          <LowResourceModeBanner />
          {/* Research preview disclaimer — rendered full-width here so it sits flush under the sticky header on every R&D page (no padding card, no overlap on scroll) */}
          {(location.pathname.startsWith("/app/research") || location.pathname.startsWith("/app/collab")) && (
            <ResearchPreviewBanner />
          )}
          {breadcrumbs.length > 0 && (
            <div className="px-3 sm:px-4 py-2 border-b border-border/40 bg-background/40 backdrop-blur-sm">
              <SculpturalBreadcrumbs crumbs={breadcrumbs} />
            </div>
          )}
          <main id="main-content" tabIndex={-1} className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto neon-bg focus:outline-none">
            <Outlet />
          </main>
          <RegulatoryDisclaimer />
        </div>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
