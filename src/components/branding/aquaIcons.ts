/**
 * Centralized mapping of AquaMR Flow signature illustrations.
 * Use these instead of Lucide icons for KPI cards, module tiles,
 * and any branded surface across the platform.
 */
import procedurePlannerIcon from "@/assets/icons/procedure-planner.png";
import digitalTwinIcon from "@/assets/icons/digital-twin.png";
import registryIcon from "@/assets/icons/registry.png";
import educationIcon from "@/assets/icons/education.png";
import activeCasesIcon from "@/assets/icons/active-cases.png";
import aiReportsIcon from "@/assets/icons/ai-reports.png";
import outcomesIcon from "@/assets/icons/outcomes.png";
import modulesIcon from "@/assets/icons/modules.png";
import aquamrLogo from "@/assets/icons/aquamr-logo.png";

export const aquaIcons = {
  procedurePlanner: procedurePlannerIcon,
  digitalTwin: digitalTwinIcon,
  registry: registryIcon,
  education: educationIcon,
  activeCases: activeCasesIcon,
  aiReports: aiReportsIcon,
  outcomes: outcomesIcon,
  modules: modulesIcon,
  logo: aquamrLogo,
} as const;

export type AquaIconKey = keyof typeof aquaIcons;
