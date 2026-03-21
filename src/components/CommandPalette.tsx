import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/context";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Brain,
  HeartPulse,
  FlaskConical,
  BookOpen,
  LayoutDashboard,
  LineChart,
  Activity,
  FileText,
  BarChart3,
  Calculator,
  Image,
  Settings,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commandDefs = [
  { key: "command.dashboard", icon: LayoutDashboard, path: "/app" },
  { key: "command.procedurePlanner", icon: Brain, path: "/app/procedure-planner" },
  { key: "command.fusionViewer", icon: Image, path: "/app/fusion-viewer" },
  { key: "command.patients", icon: HeartPulse, path: "/app/patients" },
  { key: "command.digitalTwin", icon: Activity, path: "/app/digital-twin" },
  { key: "command.ciAkiEngine", icon: Calculator, path: "/app/ci-aki-engine" },
  { key: "command.simulation", icon: FlaskConical, path: "/app/simulation" },
  { key: "command.registry", icon: LineChart, path: "/app/registry" },
  { key: "command.research", icon: FileText, path: "/app/research" },
  { key: "command.education", icon: BookOpen, path: "/app/education" },
  { key: "command.analytics", icon: BarChart3, path: "/app/analytics" },
  { key: "command.settings", icon: Settings, path: "/app/settings" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t("command.placeholder")} />
      <CommandList>
        <CommandEmpty>{t("command.noResults")}</CommandEmpty>
        <CommandGroup heading={t("command.navigation")}>
          {commandDefs.map((cmd) => (
            <CommandItem
              key={cmd.path}
              onSelect={() => {
                navigate(cmd.path);
                onOpenChange(false);
              }}
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              {t(cmd.key)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
