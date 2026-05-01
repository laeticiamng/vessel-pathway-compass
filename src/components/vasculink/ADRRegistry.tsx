import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCode2, ExternalLink, CheckCircle2, AlertCircle, Loader2, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { ADRS, type ADRStatus } from "@/lib/vasculink/adr-data";

const statusVariant: Record<ADRStatus, "default" | "secondary" | "outline"> = {
  Accepted: "default", Proposed: "secondary", Superseded: "outline",
};

type CheckState = "idle" | "loading" | "ok" | "fail";

/**
 * HEAD-check an external evidence URL. Cross-origin servers often block
 * HEAD or hide the actual status because of CORS/no-cors → we treat any
 * resolved fetch (even opaque) as reachable, and any throw as failure.
 */
async function checkUrl(url: string): Promise<CheckState> {
  try {
    const res = await fetch(url, { method: "HEAD", mode: "no-cors" });
    // Opaque response (status 0) still means the server answered the request.
    if (res.type === "opaque" || (res.status >= 200 && res.status < 400)) return "ok";
    return "fail";
  } catch {
    return "fail";
  }
}

function EvidenceUrlBadge({ url }: { url: string }) {
  const [state, setState] = useState<CheckState>("idle");
  useEffect(() => {
    let alive = true;
    setState("loading");
    checkUrl(url).then((s) => { if (alive) setState(s); });
    return () => { alive = false; };
  }, [url]);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
      data-testid="evidence-url"
      data-status={state}
    >
      <Globe className="h-3 w-3" />
      {new URL(url).hostname}
      {state === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
      {state === "ok" && <CheckCircle2 className="h-3 w-3 text-success" aria-label="Evidence reachable" />}
      {state === "fail" && <AlertCircle className="h-3 w-3 text-destructive" aria-label="Evidence unreachable" />}
    </a>
  );
}

export function ADRRegistry({ className }: { className?: string }) {
  const { t, language } = useTranslation();
  const dateFmt = new Intl.DateTimeFormat(
    language === "fr" ? "fr-FR" : language === "de" ? "de-DE" : "en-GB",
    { year: "numeric", month: "short", day: "2-digit" }
  );

  return (
    <Card className={className} data-testid="adr-registry">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-primary" />
          {t("vascscreen.adr.title")}
        </CardTitle>
        <CardDescription>{t("vascscreen.adr.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {ADRS.map((a) => {
            const title = t(`vascscreen.adr.items.${a.id}.title`);
            const rationale = t(`vascscreen.adr.items.${a.id}.rationale`);
            return (
              <li key={a.id} className="rounded-lg border p-3 bg-muted/30" data-testid={`adr-${a.id}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-primary">{a.id}</span>
                    <span className="text-sm font-semibold">{title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {t(`vascscreen.adr.domain.${a.domain}`)}
                    </Badge>
                    <Badge variant={statusVariant[a.status]} className="text-[10px]">
                      {t(`vascscreen.adr.status.${a.status}`)}
                    </Badge>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{rationale}</p>
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {t("vascscreen.adr.colTimestamp")}: {dateFmt.format(new Date(a.decidedAt))}
                  </span>
                  <div className="flex items-center gap-3">
                    {a.evidenceUrl && <EvidenceUrlBadge url={a.evidenceUrl} />}
                    {a.evidence ? (
                      <Button asChild variant="ghost" size="sm" className="h-6 text-[10px]">
                        <Link to={a.evidence.route}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {t("vascscreen.adr.openEvidence")} · {a.evidence.label}
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">
                        {t("vascscreen.adr.noEvidence")}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
