import { Link } from "react-router-dom";
import { useTranslation, type Language } from "@/i18n/context";

const COPY: Record<Language, { reporting: string; safety: string; openScience: string; aria: string }> = {
  en: {
    reporting: "Reporting: SPIRIT-AI · STARD-AI · TRIPOD+AI · AGREE · PROBAST",
    safety: "Safety: ACR MR · IEC 60601-2-33",
    openScience: "FAIR Open Science",
    aria: "Compliance and reporting standards",
  },
  fr: {
    reporting: "Reporting : SPIRIT-AI · STARD-AI · TRIPOD+AI · AGREE · PROBAST",
    safety: "Sécurité : ACR MR · IEC 60601-2-33",
    openScience: "Science ouverte FAIR",
    aria: "Standards de conformité et reporting",
  },
  de: {
    reporting: "Reporting: SPIRIT-AI · STARD-AI · TRIPOD+AI · AGREE · PROBAST",
    safety: "Sicherheit: ACR MR · IEC 60601-2-33",
    openScience: "FAIR Open Science",
    aria: "Compliance- und Reporting-Standards",
  },
};

interface Props {
  className?: string;
}

export function ComplianceBanner({ className = "" }: Props) {
  const { language } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  return (
    <Link
      to="/methodology"
      aria-label={copy.aria}
      className={`block w-full bg-[hsl(var(--accent))]/40 hover:bg-[hsl(var(--accent))]/60 transition-colors border-b border-border/50 ${className}`}
    >
      <div className="container mx-auto px-4 py-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-foreground/80">
        <span className="font-medium">{copy.reporting}</span>
        <span className="text-muted-foreground/60" aria-hidden>|</span>
        <span>{copy.safety}</span>
        <span className="text-muted-foreground/60" aria-hidden>|</span>
        <span>{copy.openScience}</span>
      </div>
    </Link>
  );
}

export default ComplianceBanner;
