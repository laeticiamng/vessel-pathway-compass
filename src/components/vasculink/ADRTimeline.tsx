import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { CalendarClock, Filter, ExternalLink, X } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import {
  ADRS, ADR_DOMAINS, ADR_STATUSES, type ADRDomain, type ADRStatus,
} from "@/lib/vasculink/adr-data";

const statusVariant: Record<ADRStatus, "default" | "secondary" | "outline"> = {
  Accepted: "default", Proposed: "secondary", Superseded: "outline",
};

export function ADRTimeline({ className }: { className?: string }) {
  const { t, language } = useTranslation();
  const [domain, setDomain] = useState<ADRDomain | "all">("all");
  const [status, setStatus] = useState<ADRStatus | "all">("all");

  const dateFmt = new Intl.DateTimeFormat(
    language === "fr" ? "fr-FR" : language === "de" ? "de-DE" : "en-GB",
    { year: "numeric", month: "short", day: "2-digit" }
  );

  const sorted = useMemo(() => {
    return ADRS
      .filter((a) => (domain === "all" || a.domain === domain) && (status === "all" || a.status === status))
      .slice()
      .sort((a, b) => a.decidedAt.localeCompare(b.decidedAt));
  }, [domain, status]);

  const reset = () => { setDomain("all"); setStatus("all"); };

  return (
    <Card className={className} data-testid="adr-timeline">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          ADR compliance timeline
        </CardTitle>
        <CardDescription>
          Chronological view of architectural decisions. Filter by domain or status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={domain} onValueChange={(v) => setDomain(v as ADRDomain | "all")}>
            <SelectTrigger className="h-8 w-[160px]" aria-label="Domain filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {ADR_DOMAINS.map((d) => (
                <SelectItem key={d} value={d}>{t(`vascscreen.adr.domain.${d}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as ADRStatus | "all")}>
            <SelectTrigger className="h-8 w-[160px]" aria-label="Status filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ADR_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{t(`vascscreen.adr.status.${s}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(domain !== "all" || status !== "all") && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-8">
              <X className="h-3 w-3 mr-1" /> Reset
            </Button>
          )}
          <span className="ml-auto text-xs text-muted-foreground" data-testid="timeline-count">
            {sorted.length} / {ADRS.length}
          </span>
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No ADR matches the current filters.
          </p>
        ) : (
          <ol className="relative border-l border-primary/20 pl-6 space-y-4">
            {sorted.map((a) => {
              const title = t(`vascscreen.adr.items.${a.id}.title`);
              return (
                <li key={a.id} className="relative" data-testid={`timeline-item-${a.id}`}>
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="rounded-lg border p-3 bg-muted/30">
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
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {dateFmt.format(new Date(a.decidedAt))}
                      </span>
                      {a.evidence && (
                        <Button asChild variant="ghost" size="sm" className="h-6 text-[10px]">
                          <Link to={a.evidence.route}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {a.evidence.label}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
