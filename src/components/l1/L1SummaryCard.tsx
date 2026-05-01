import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, PenLine, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SignoffStatus } from "@/lib/l1/types";
import { useTranslation } from "@/i18n/context";

interface Props {
  summary: string;
  signoffStatus: SignoffStatus;
  signedAt: string | null;
  onChangeSummary: (next: string) => void;
  onSignoff: () => void;
  disabled?: boolean;
  isSigning?: boolean;
}

export function L1SummaryCard({
  summary,
  signoffStatus,
  signedAt,
  onChangeSummary,
  onSignoff,
  disabled,
  isSigning,
}: Props) {
  const { t } = useTranslation();
  const isSigned = signoffStatus === "signed" || signoffStatus === "cosigned";

  const STATUS_LABEL: Record<SignoffStatus, string> = {
    draft: t("l1.summary.statusDraft"),
    pending_signoff: t("l1.summary.statusPending"),
    signed: t("l1.summary.statusSigned"),
    cosigned: t("l1.summary.statusCosigned"),
    rejected: t("l1.summary.statusRejected"),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {t("l1.summary.title")}
        </CardTitle>
        <CardDescription>{t("l1.summary.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="l1-summary">{t("l1.summary.label")}</Label>
          <Textarea
            id="l1-summary"
            rows={5}
            placeholder={t("l1.summary.placeholder")}
            value={summary}
            onChange={(e) => onChangeSummary(e.target.value)}
            disabled={disabled || isSigned}
            maxLength={4000}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isSigned ? "default" : "secondary"} className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            {STATUS_LABEL[signoffStatus]}
          </Badge>
          {signedAt && (
            <span className="text-xs text-muted-foreground">
              {t("l1.summary.signedAt")} {new Date(signedAt).toLocaleString()}
            </span>
          )}
        </div>

        <Button
          onClick={onSignoff}
          disabled={disabled || isSigning || isSigned || summary.trim().length < 20}
          size="sm"
        >
          {isSigning ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PenLine className="h-4 w-4 mr-2" />
          )}
          {isSigned ? t("l1.summary.signed") : t("l1.summary.sign")}
        </Button>
      </CardContent>
    </Card>
  );
}
