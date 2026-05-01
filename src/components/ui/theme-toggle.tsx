import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/context";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  size?: "icon" | "sm" | "default";
}

/**
 * Reusable light/dark toggle.
 * Uses next-themes (already mounted at the app root with attribute="class"
 * and storageKey="aquamr-flow-theme"), so preferences persist in localStorage
 * and prefers-color-scheme is honored on first load via defaultTheme="system".
 */
export function ThemeToggle({ className, size = "icon" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (mounted ? resolvedTheme ?? theme : "dark") as string;
  const isDark = current === "dark";

  return (
    <Button
      variant="ghost"
      size={size}
      className={className ?? "h-9 w-9 relative"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("topBar.toggleTheme") as string}
      title={t("topBar.toggleTheme") as string}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
