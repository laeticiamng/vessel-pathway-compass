// Single barrel export for the premium "cockpit" design system components.
// Use these everywhere new UI is built (Dashboard, modules, academic pages).
export { PremiumCard } from "./PremiumCard";
export type { PremiumCardTone } from "./PremiumCard";
export { GlassPanel } from "./GlassPanel";
export { NeonIcon } from "./NeonIcon";
export { RiskBadge } from "./RiskBadge";
export type { RiskLevel } from "./RiskBadge";
export { MetricCard } from "./MetricCard";
export { ModuleCard } from "./ModuleCard";
export { ClinicalChartCard } from "./ClinicalChartCard";
// Re-exports of existing premium primitives kept for compatibility:
export { NeonGradientText } from "@/components/ui/neon-gradient-text";
export { ThemeToggle } from "@/components/ui/theme-toggle";
