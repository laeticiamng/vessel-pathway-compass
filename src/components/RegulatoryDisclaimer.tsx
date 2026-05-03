import { ShieldAlert } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

const COPY: Record<Language, { line1: string; line2: string; line3: string }> = {
  en: {
    line1: "VASCU-LINK / AquaMR Flow — Research software in academic validation.",
    line2: "Architecture designed to target MDR / RGPD / IEC 62304 / ISO 14971 — not certified at this stage.",
    line3: "Not for clinical use outside approved research protocols.",
  },
  fr: {
    line1: "VASCU-LINK / AquaMR Flow — Logiciel de recherche en cours de validation académique.",
    line2: "Architecture conçue pour viser MDR / RGPD / IEC 62304 / ISO 14971 — non certifiée à ce stade.",
    line3: "Pas d'usage clinique en dehors des protocoles de recherche approuvés.",
  },
  de: {
    line1: "VASCU-LINK / AquaMR Flow — Forschungssoftware in akademischer Validierung.",
    line2: "Architektur ausgelegt auf MDR / DSGVO / IEC 62304 / ISO 14971 — derzeit nicht zertifiziert.",
    line3: "Keine klinische Anwendung außerhalb genehmigter Forschungsprotokolle.",
  },
};

interface Props {
  variant?: "footer" | "compact";
  className?: string;
}

export function RegulatoryDisclaimer({ variant = "footer", className = "" }: Props) {
  const { language } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  if (variant === "compact") {
    return (
      <p className={`text-[11px] leading-relaxed text-muted-foreground/80 ${className}`}>
        <ShieldAlert className="inline h-3 w-3 mr-1 -mt-0.5" aria-hidden="true" />
        {copy.line1} {copy.line2}
      </p>
    );
  }

  return (
    <aside
      role="note"
      aria-label="Regulatory disclaimer"
      className={`border-t border-border/60 bg-muted/30 py-3 px-4 text-center ${className}`}
    >
      <p className="text-[11px] leading-relaxed text-muted-foreground max-w-4xl mx-auto">
        <span className="font-medium text-foreground/80">{copy.line1}</span>{" "}
        {copy.line2}{" "}
        <span className="italic">{copy.line3}</span>
      </p>
    </aside>
  );
}

export default RegulatoryDisclaimer;
