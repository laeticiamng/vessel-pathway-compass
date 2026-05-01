import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCode2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/context";

type ADRStatus = "Accepted" | "Proposed" | "Superseded";
type ADRDomain =
  | "Hardware" | "Imaging" | "Clinical" | "Data" | "Security" | "Infra"
  | "UX" | "Scientific" | "Safety" | "Governance" | "Economic";

interface ADR {
  id: string;
  status: ADRStatus;
  domain: ADRDomain;
  /** Decision date (ISO) */
  decidedAt: string;
  /** In-app evidence: route + optional tab/anchor */
  evidence?: { route: string; label: string };
}

const ADRS: ADR[] = [
  { id: "ADR-001", status: "Accepted",  domain: "Hardware",   decidedAt: "2025-09-01", evidence: { route: "/app/governance/iec62304?tab=adr",            label: "Technical file" } },
  { id: "ADR-002", status: "Accepted",  domain: "Imaging",    decidedAt: "2025-09-01", evidence: { route: "/app/ci-aki-engine",                          label: "CI-AKI engine" } },
  { id: "ADR-003", status: "Accepted",  domain: "Clinical",   decidedAt: "2025-10-15", evidence: { route: "/app/l1",                                     label: "L1 Decision Board" } },
  { id: "ADR-004", status: "Accepted",  domain: "Clinical",   decidedAt: "2025-09-12", evidence: { route: "/app/l1",                                     label: "PROMs panel (EN)" } },
  { id: "ADR-005", status: "Accepted",  domain: "Data",       decidedAt: "2025-08-20", evidence: { route: "/app/patients?tab=trash",                     label: "Patient trash (30d)" } },
  { id: "ADR-006", status: "Accepted",  domain: "Security",   decidedAt: "2025-10-02", evidence: { route: "/app/governance",                             label: "Governance audit" } },
  { id: "ADR-007", status: "Accepted",  domain: "Security",   decidedAt: "2025-08-10", evidence: { route: "/app/governance/iec62304",                    label: "Edge Fn policy" } },
  { id: "ADR-008", status: "Accepted",  domain: "Infra",      decidedAt: "2025-07-05" },
  { id: "ADR-009", status: "Accepted",  domain: "UX",         decidedAt: "2025-10-20", evidence: { route: "/app/settings",                               label: "Language switcher" } },
  { id: "ADR-010", status: "Accepted",  domain: "Scientific", decidedAt: "2025-09-01", evidence: { route: "/app/research",                               label: "Scientific Safety Box" } },
  { id: "ADR-011", status: "Accepted",  domain: "Clinical",   decidedAt: "2025-09-15", evidence: { route: "/app/vascscreen",                             label: "VascScreen / Doppler" } },
  { id: "ADR-012", status: "Accepted",  domain: "Safety",     decidedAt: "2025-10-01", evidence: { route: "/app/fusion-viewer",                         label: "Fusion Viewer fallback" } },
  { id: "ADR-013", status: "Accepted",  domain: "Governance", decidedAt: "2025-11-10", evidence: { route: "/app/research?tab=dsmb",                     label: "DSMB Charter tab" } },
  { id: "ADR-014", status: "Proposed",  domain: "Economic",   decidedAt: "2025-11-20", evidence: { route: "/app/governance/iec62304?tab=milestones",     label: "Milestone J1" } },
  { id: "ADR-015", status: "Accepted",  domain: "Scientific", decidedAt: "2025-11-15", evidence: { route: "/app/research?tab=power",                    label: "Power calculation" } },
];

const statusVariant: Record<ADRStatus, "default" | "secondary" | "outline"> = {
  Accepted: "default",
  Proposed: "secondary",
  Superseded: "outline",
};

export function ADRRegistry({ className }: { className?: string }) {
  const { t, lang } = useTranslation();
  const dateFmt = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : "en-GB",
    { year: "numeric", month: "short", day: "2-digit" });

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
            const domainLabel = t(`vascscreen.adr.domain.${a.domain}`);
            const statusLabel = t(`vascscreen.adr.status.${a.status}`);
            return (
              <li key={a.id} className="rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-primary">{a.id}</span>
                    <span className="text-sm font-semibold">{title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{domainLabel}</Badge>
                    <Badge variant={statusVariant[a.status]} className="text-[10px]">{statusLabel}</Badge>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{rationale}</p>
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {t("vascscreen.adr.colTimestamp")}: {dateFmt.format(new Date(a.decidedAt))}
                  </span>
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
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
