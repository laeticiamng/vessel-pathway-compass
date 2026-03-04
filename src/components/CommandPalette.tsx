import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
  Globe,
  BookOpen,
  LayoutDashboard,
  LineChart,
  Activity,
  FileText,
  Shield,
  Settings,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commands = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/app" },
  { label: "AI Clinical Assistant", icon: Brain, path: "/app/ai-assistant" },
  { label: "Patient Cases", icon: HeartPulse, path: "/app/patients" },
  { label: "Digital Twin", icon: Activity, path: "/app/digital-twin" },
  { label: "Outcomes Registry", icon: LineChart, path: "/app/registry" },
  { label: "Education Hub", icon: BookOpen, path: "/app/education" },
  { label: "Simulation Lab", icon: FlaskConical, path: "/app/simulation" },
  { label: "Expert Network", icon: Globe, path: "/app/network" },
  { label: "Research Hub", icon: FileText, path: "/app/research" },
  { label: "Compliance Center", icon: Shield, path: "/app/compliance" },
  { label: "Settings", icon: Settings, path: "/app/settings" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

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
      <CommandInput placeholder="Search modules, patients, or actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.map((cmd) => (
            <CommandItem
              key={cmd.path}
              onSelect={() => {
                navigate(cmd.path);
                onOpenChange(false);
              }}
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              {cmd.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
