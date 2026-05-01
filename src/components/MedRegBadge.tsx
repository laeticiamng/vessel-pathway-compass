import { ShieldCheck, ExternalLink } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface MedRegBadgeProps {
  /** "compact" = single-line for footers; "full" = labelled card for About / Legal contexts */
  variant?: "compact" | "full";
  className?: string;
}

/**
 * Displays the founder's Swiss MedReg registration as proof of qualifications.
 * GLN: 7601009569944 — Dr Laëticia Moto-Ngane, MD (CH)
 * Verifiable on https://www.healthregister.ch
 */
export function MedRegBadge({ variant = "compact", className = "" }: MedRegBadgeProps) {
  const { t } = useTranslation();
  const verifyUrl = "https://www.healthregister.ch/search/?q=7601009569944";

  if (variant === "compact") {
    return (
      <a
        href={verifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ${className}`}
        aria-label={t("landing.about.medreg.label") as string}
      >
        <ShieldCheck className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
        <span>{t("landing.about.medreg.short")}</span>
        <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
      </a>
    );
  }

  return (
    <div className={`rounded-lg border bg-card/50 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
        <div className="space-y-1.5 text-sm">
          <p className="font-semibold text-foreground">{t("landing.about.medreg.label")}</p>
          <p className="text-foreground">{t("landing.about.medreg.identity")}</p>
          <p className="text-muted-foreground font-mono text-xs">{t("landing.about.medreg.gln")}</p>
          <p className="text-muted-foreground text-xs">{t("landing.about.medreg.registry")}</p>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
          >
            {t("landing.about.medreg.verifyLink")}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
