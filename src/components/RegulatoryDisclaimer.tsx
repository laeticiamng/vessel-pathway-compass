import { ShieldAlert } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { cn } from "@/lib/utils";

type Variant = "footer" | "compact";

/**
 * Pre-MDR research-software notice. Mounted globally so every public route and
 * every /app/* shell renders it in the document footer; also surfaced inline
 * on auth/onboarding so users see it before signing up. The wording mirrors
 * the doctoral dossier's "research prototype, architecture targeting
 * MDR/GDPR/IEC 62304/ISO 14971 — not certified at this stage" stance.
 */
export function RegulatoryDisclaimer({
  variant = "footer",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const { t } = useTranslation();
  const ariaLabel = t("regulatoryDisclaimer.ariaLabel") as string;

  if (variant === "compact") {
    return (
      <p
        role="note"
        aria-label={ariaLabel}
        className={cn(
          "text-[11px] leading-snug text-muted-foreground/80 text-center max-w-md mx-auto",
          className,
        )}
      >
        <span className="font-semibold text-foreground/85">
          {t("regulatoryDisclaimer.line1")}
        </span>{" "}
        {t("regulatoryDisclaimer.line2")}{" "}
        <span className="italic">{t("regulatoryDisclaimer.line3")}</span>
      </p>
    );
  }

  return (
    <aside
      role="note"
      aria-label={ariaLabel}
      className={cn("border-t bg-muted/30 py-4", className)}
    >
      <div className="container mx-auto flex items-start gap-3 px-4 sm:px-6 max-w-4xl text-xs leading-relaxed text-muted-foreground/90">
        <ShieldAlert
          className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="font-semibold text-foreground/90">
            {t("regulatoryDisclaimer.line1")}
          </p>
          <p>{t("regulatoryDisclaimer.line2")}</p>
          <p className="italic">{t("regulatoryDisclaimer.line3")}</p>
        </div>
      </div>
    </aside>
  );
}
