import { Button } from "@/components/ui/button";
import { FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  ADRS, DSMB_MEMBERS, DSMB_TRIGGERS, LCA_STAGES, QALY_PARAMS, POWER_DEFAULTS,
} from "@/lib/vasculink/adr-data";
import { useTranslation } from "@/i18n/context";

/** Build a single CSV string with multiple tagged sections. */
export function buildAuditCsv(now: Date = new Date()): string {
  const ts = now.toISOString();
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const row = (cols: unknown[]) => cols.map(escape).join(",");
  const lines: string[] = [];
  lines.push(`# VASCU-LINK audit pack export,generated=${ts}`);

  lines.push("", "## ADR");
  lines.push(row(["section", "id", "status", "domain", "decided_at", "evidence_route", "evidence_label", "evidence_url"]));
  for (const a of ADRS) {
    lines.push(row(["adr", a.id, a.status, a.domain, a.decidedAt,
      a.evidence?.route ?? "", a.evidence?.label ?? "", a.evidenceUrl ?? ""]));
  }

  lines.push("", "## Power calculation");
  lines.push(row(["section", "parameter", "value"]));
  for (const [k, v] of Object.entries(POWER_DEFAULTS)) lines.push(row(["power", k, v]));

  lines.push("", "## DSMB members");
  lines.push(row(["section", "role", "affiliation"]));
  for (const m of DSMB_MEMBERS) lines.push(row(["dsmb_member", m.role, m.affiliation]));

  lines.push("", "## DSMB triggers");
  lines.push(row(["section", "trigger"]));
  for (const t of DSMB_TRIGGERS) lines.push(row(["dsmb_trigger", t]));

  lines.push("", "## LCA stages");
  lines.push(row(["section", "stage", "scope"]));
  for (const s of LCA_STAGES) lines.push(row(["lca_stage", s.stage, s.scope]));

  lines.push("", "## QALY parameters");
  lines.push(row(["section", "parameter", "value"]));
  for (const q of QALY_PARAMS) lines.push(row(["qaly_param", q.p, q.v]));

  return lines.join("\n");
}

export function buildAuditJson(now: Date = new Date()): string {
  return JSON.stringify({
    generated_at: now.toISOString(),
    schema_version: "1.0.0",
    adr: ADRS,
    power: POWER_DEFAULTS,
    dsmb: { members: DSMB_MEMBERS, triggers: DSMB_TRIGGERS },
    lca: LCA_STAGES,
    qaly: QALY_PARAMS,
  }, null, 2);
}

function download(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function AuditDataExportButtons({ className }: { className?: string }) {
  const { t } = useTranslation();
  const date = new Date().toISOString().slice(0, 10);
  return (
    <div className={`flex gap-2 ${className ?? ""}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          try {
            download(`audit-pack-${date}.csv`, "text/csv", buildAuditCsv());
            toast.success(t("vasculink.audit.csvSuccess"));
          } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : t("vasculink.audit.exportFailed"));
          }
        }}
      >
        <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          try {
            download(`audit-pack-${date}.json`, "application/json", buildAuditJson());
            toast.success(t("vasculink.audit.jsonSuccess"));
          } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : t("vasculink.audit.exportFailed"));
          }
        }}
      >
        <FileJson className="h-4 w-4 mr-1" /> JSON
      </Button>
    </div>
  );
}
