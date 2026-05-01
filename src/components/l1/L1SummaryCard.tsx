import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, PenLine, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SignoffStatus } from "@/lib/l1/types";

interface Props {
  summary: string;
  signoffStatus: SignoffStatus;
  signedAt: string | null;
  onChangeSummary: (next: string) => void;
  onSignoff: () => void;
  disabled?: boolean;
  isSigning?: boolean;
}

const STATUS_LABEL: Record<SignoffStatus, string> = {
  draft: "Draft",
  pending_signoff: "Pending sign-off",
  signed: "Signed",
  cosigned: "Cosigned",
  rejected: "Rejected",
};

export function L1SummaryCard({
  summary,
  signoffStatus,
  signedAt,
  onChangeSummary,
  onSignoff,
  disabled,
  isSigning,
}: Props) {
  const isSigned = signoffStatus === "signed" || signoffStatus === "cosigned";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          L1 clinician summary & sign-off
        </CardTitle>
        <CardDescription>
          L1 ne traite pas — L1 rend le patient lisible, classable et orientable.
          No human revascularization is performed during the doctoral protocol.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="l1-summary">Clinician summary</Label>
          <Textarea
            id="l1-summary"
            rows={5}
            placeholder="Synthesis: fragility, cartography quality, decision impact, next step…"
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
              Signed at {new Date(signedAt).toLocaleString()}
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
          {isSigned ? "Signed" : "Sign L1 assessment"}
        </Button>
      </CardContent>
    </Card>
  );
}
