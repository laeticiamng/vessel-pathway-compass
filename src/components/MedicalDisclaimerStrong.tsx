import { useState } from "react";
import { ShieldAlert, AlertTriangle, BookOpen, Stethoscope } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { useDisclaimerAcceptance } from "@/hooks/useDisclaimerAcceptance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Variant = "banner" | "modal" | "inline";

interface MedicalDisclaimerStrongProps {
  variant?: Variant;
  /** When true, renders the modal whenever status is `pending` (CDS gate). */
  gate?: boolean;
  className?: string;
}

/**
 * v8.3 strong medical disclaimer — used on all CDS surfaces.
 *
 * - `variant="banner"` renders a permanent compact banner.
 * - `variant="inline"` renders the full bullet list (use on /visual-chain).
 * - `variant="modal"` (with `gate`) blocks first-session interaction until
 *   the user explicitly accepts.
 *
 * Acceptance is persisted via `useDisclaimerAcceptance`
 * (`vlink_disclaimer_accepted_v83`).
 */
export function MedicalDisclaimerStrong({
  variant = "banner",
  gate = false,
  className,
}: MedicalDisclaimerStrongProps) {
  const { t } = useTranslation();
  const { status, accept, decline } = useDisclaimerAcceptance();
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);

  const points = [
    t("medicalDisclaimerStrong.points.notDevice"),
    t("medicalDisclaimerStrong.points.notReplacement"),
    t("medicalDisclaimerStrong.points.notImaging"),
    t("medicalDisclaimerStrong.points.notGesture"),
    t("medicalDisclaimerStrong.points.decisionSupport"),
    t("medicalDisclaimerStrong.points.researchOnly"),
    t("medicalDisclaimerStrong.points.consultLocal"),
  ];

  const fullDisclaimer = (
    <div className="space-y-4 text-sm">
      <p className="font-medium text-foreground">
        {t("medicalDisclaimerStrong.intro")}
      </p>
      <ul className="space-y-1.5 pl-2">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span aria-hidden className="text-destructive">•</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <Alert variant="default" className="border-primary/30">
        <BookOpen className="h-4 w-4" aria-hidden />
        <AlertTitle className="text-xs uppercase tracking-wide">
          {t("medicalDisclaimerStrong.architecture").split(".")[0]}.
        </AlertTitle>
        <AlertDescription className="text-xs">
          {t("medicalDisclaimerStrong.architecture")}
        </AlertDescription>
      </Alert>
      <Alert variant="default" className="border-accent/40 bg-accent/5">
        <Stethoscope className="h-4 w-4" aria-hidden />
        <AlertTitle className="text-xs uppercase tracking-wide">
          {t("medicalDisclaimerStrong.title")}
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed">
          {t("medicalDisclaimerStrong.gestureNote")}
        </AlertDescription>
      </Alert>
      <p className="text-xs italic text-muted-foreground">
        {t("medicalDisclaimerStrong.qualification")}
      </p>
    </div>
  );

  // ---------------- Modal gate ----------------
  if (variant === "modal" || gate) {
    const showGate = gate && status === "pending";
    return (
      <>
        <Dialog open={showGate || open} onOpenChange={(v) => !gate && setOpen(v)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden />
                {t("medicalDisclaimerStrong.title")}
              </DialogTitle>
              <DialogDescription>
                {t("medicalDisclaimerStrong.bannerTitle")}
              </DialogDescription>
            </DialogHeader>
            {fullDisclaimer}
            {gate && (
              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="disclaimer-accept"
                  checked={checked}
                  onCheckedChange={(v) => setChecked(v === true)}
                />
                <label
                  htmlFor="disclaimer-accept"
                  className="text-sm leading-none cursor-pointer"
                >
                  {t("medicalDisclaimerStrong.acceptCheckbox")}
                </label>
              </div>
            )}
            <DialogFooter>
              {gate ? (
                <>
                  <Button variant="ghost" onClick={decline}>
                    {t("medicalDisclaimerStrong.declineButton")}
                  </Button>
                  <Button disabled={!checked} onClick={accept}>
                    {t("medicalDisclaimerStrong.acceptButton")}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setOpen(false)}>
                  {t("common.close")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {gate && status === "declined" && (
          <Alert variant="destructive" className={cn("my-4", className)}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t("medicalDisclaimerStrong.title")}</AlertTitle>
            <AlertDescription>
              {t("medicalDisclaimerStrong.declinedNotice")}
            </AlertDescription>
          </Alert>
        )}
      </>
    );
  }

  // ---------------- Inline (full list) ----------------
  if (variant === "inline") {
    return (
      <aside
        role="note"
        aria-label={t("medicalDisclaimerStrong.title")}
        className={cn(
          "rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:p-6",
          className,
        )}
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-destructive mb-3">
          <ShieldAlert className="h-4 w-4" aria-hidden />
          {t("medicalDisclaimerStrong.title")}
        </h2>
        {fullDisclaimer}
      </aside>
    );
  }

  // ---------------- Banner (compact) ----------------
  return (
    <>
      <div
        role="note"
        aria-label={t("medicalDisclaimerStrong.title")}
        className={cn(
          "flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-xs",
          className,
        )}
        data-medical-disclaimer-banner
      >
        <ShieldAlert
          className="h-3.5 w-3.5 text-destructive flex-shrink-0"
          aria-hidden
        />
        <span className="font-medium text-foreground">
          {t("medicalDisclaimerStrong.bannerTitle")}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto text-xs underline underline-offset-2 text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1"
        >
          {t("medicalDisclaimerStrong.bannerLink")}
        </button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden />
              {t("medicalDisclaimerStrong.title")}
            </DialogTitle>
          </DialogHeader>
          {fullDisclaimer}
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MedicalDisclaimerStrong;
