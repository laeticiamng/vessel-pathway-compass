import { FlaskConical, Microscope } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Stage = "research-preview" | "preclinical";

const COPY: Record<Language, Record<Stage, { label: string; tooltip: string }>> = {
  en: {
    "research-preview": {
      label: "Research preview",
      tooltip:
        "Phantom / simulated only. No human application. Academic validation in progress. Architecture designed to target MDR / IEC 62304 / ISO 14971 — not certified at this stage.",
    },
    preclinical: {
      label: "Preclinical only",
      tooltip:
        "Animal / cadaver models only. No human application. Architecture designed to target MDR / IEC 62304 / ISO 14971 — not certified at this stage.",
    },
  },
  fr: {
    "research-preview": {
      label: "Aperçu recherche",
      tooltip:
        "Fantôme / simulation uniquement. Aucune application humaine. Validation académique en cours. Architecture conçue pour viser MDR / IEC 62304 / ISO 14971 — non certifiée à ce stade.",
    },
    preclinical: {
      label: "Préclinique uniquement",
      tooltip:
        "Modèles animal / cadavre uniquement. Aucune application humaine. Architecture conçue pour viser MDR / IEC 62304 / ISO 14971 — non certifiée à ce stade.",
    },
  },
  de: {
    "research-preview": {
      label: "Forschungs-Preview",
      tooltip:
        "Nur Phantom / Simulation. Keine Anwendung am Menschen. Akademische Validierung läuft. Architektur ausgelegt auf MDR / IEC 62304 / ISO 14971 — derzeit nicht zertifiziert.",
    },
    preclinical: {
      label: "Nur präklinisch",
      tooltip:
        "Nur Tier- / Kadavermodelle. Keine Anwendung am Menschen. Architektur ausgelegt auf MDR / IEC 62304 / ISO 14971 — derzeit nicht zertifiziert.",
    },
  },
};

interface Props {
  stage: Stage;
  className?: string;
}

export function ResearchPreviewBadge({ stage, className = "" }: Props) {
  const { language } = useTranslation();
  const copy = (COPY[language] ?? COPY.en)[stage];
  const Icon = stage === "preclinical" ? Microscope : FlaskConical;
  const tone =
    stage === "preclinical"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-warning/40 bg-warning/10 text-warning";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="status"
            aria-label={copy.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone} ${className}`}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            {copy.label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
          {copy.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ResearchPreviewBadge;
