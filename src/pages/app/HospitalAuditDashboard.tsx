import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Download,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Stethoscope,
  FileSignature,
  Activity as ActivityIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useExportManifest } from "@/hooks/useExportManifest";
import { toast } from "sonner";

/* ============================================================================
 * Hospital Audit Dashboard
 *
 * Audience: hospital_admin (and admin / super_admin).
 * Scope:    institutions the user belongs to (defense in depth via RLS too).
 *
 * Streams unified into a single timeline:
 *   - cases       → case_revisions (creation / update / status / category)
 *   - exports     → export_manifests (CSV / PDF / JSON, SHA-256)
 *   - validations → clinical_signoffs + expert_responses
 *
 * Each entry exposes timestamp, actor, traceability ID, and JSON context.
 * The whole filtered view can be exported as a SHA-256-signed CSV log.
 * ========================================================================== */

type Stream = "all" | "cases" | "exports" | "validations";

type AuditRow = {
  id: string;
  ts: string;
  stream: Exclude<Stream, "all">;
  action: string;
  actor_id: string | null;
  entity_type: string;
  entity_id: string | null;
  severity: "info" | "warn" | "critical";
  context: Record<string, unknown>;
};

const sevVariant = (s: AuditRow["severity"]) =>
  s === "critical" ? "destructive" : s === "warn" ? "secondary" : "outline";

const streamMeta: Record<
  Exclude<Stream, "all">,
  { label: string; icon: typeof FileText; tone: string }
> = {
  cases: { label: "Cas", icon: Stethoscope, tone: "text-primary" },
  exports: { label: "Exports", icon: FileText, tone: "text-warning" },
  validations: {
    label: "Validations expert",
    icon: FileSignature,
    tone: "text-success",
  },
};

export default function HospitalAuditDashboard() {
  const { user } = useAuth();
  const { log } = useAuditLog();
  const { register } = useExportManifest();
  const [stream, setStream] = useState<Stream>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // ---- Authorization (hospital_admin / admin / super_admin) -----------------
  const { data: authz, isLoading: authzLoading } = useQuery({
    queryKey: ["hospital-audit-authz", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [rolesRes, membershipsRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user!.id),
        supabase
          .from("memberships")
          .select("institution_id")
          .eq("user_id", user!.id),
      ]);
      const roles = (rolesRes.data ?? []).map((r) => r.role as string);
      const institutionIds = (membershipsRes.data ?? [])
        .map((m) => m.institution_id as string)
        .filter(Boolean);
      const isHospitalAdmin = roles.includes("hospital_admin");
      const isAdmin =
        roles.includes("admin") || roles.includes("super_admin");
      return {
        authorized: isHospitalAdmin || isAdmin,
        scope: isAdmin ? "global" : ("institution" as "global" | "institution"),
        institutionIds,
      };
    },
  });

  // ---- Aggregated audit feed -----------------------------------------------
  const {
    data: rows,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "hospital-audit-feed",
      authz?.scope,
      authz?.institutionIds?.join(","),
      stream,
      from,
      to,
    ],
    enabled: !!authz?.authorized,
    queryFn: async (): Promise<AuditRow[]> => {
      const fromIso = from ? new Date(from).toISOString() : null;
      const toIso = to ? new Date(to).toISOString() : null;
      const all: AuditRow[] = [];

      const insIds = authz?.institutionIds ?? [];
      const institutionScoped = authz?.scope === "institution";

      // --- 1) Cases stream (case_revisions, joined to cases for institution) -
      if (stream === "all" || stream === "cases") {
        // Pre-fetch case ids in scope (defense in depth on top of RLS)
        let caseQ = supabase.from("cases").select("id, institution_id").limit(2000);
        if (institutionScoped && insIds.length) {
          caseQ = caseQ.in("institution_id", insIds);
        }
        const { data: cases } = await caseQ;
        const caseIds = (cases ?? []).map((c) => c.id);

        if (caseIds.length) {
          let q = supabase
            .from("case_revisions")
            .select(
              "id, case_id, revision_number, change_type, changed_fields, changed_by, created_at",
            )
            .in("case_id", caseIds)
            .order("created_at", { ascending: false })
            .limit(500);
          if (fromIso) q = q.gte("created_at", fromIso);
          if (toIso) q = q.lte("created_at", toIso);
          const { data, error } = await q;
          if (error) throw error;
          for (const r of data ?? []) {
            all.push({
              id: `case-${r.id}`,
              ts: r.created_at as string,
              stream: "cases",
              action: `case.${r.change_type}`,
              actor_id: (r.changed_by as string) ?? null,
              entity_type: "case",
              entity_id: r.case_id as string,
              severity: "info",
              context: {
                revision: r.revision_number,
                changed_fields: r.changed_fields,
              },
            });
          }
        }
      }

      // --- 2) Exports stream -------------------------------------------------
      if (stream === "all" || stream === "exports") {
        let q = supabase
          .from("export_manifests")
          .select(
            "id, user_id, entity_type, export_format, row_count, sha256, purpose, context, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(500);
        if (fromIso) q = q.gte("created_at", fromIso);
        if (toIso) q = q.lte("created_at", toIso);
        const { data, error } = await q;
        if (error) throw error;
        for (const e of data ?? []) {
          all.push({
            id: `exp-${e.id}`,
            ts: e.created_at as string,
            stream: "exports",
            action: `export.${e.export_format}.${e.entity_type}`,
            actor_id: (e.user_id as string) ?? null,
            entity_type: "export_manifest",
            entity_id: e.id as string,
            severity: "info",
            context: {
              row_count: e.row_count,
              sha256: e.sha256,
              purpose: e.purpose,
              ...(e.context as Record<string, unknown> | null),
            },
          });
        }
      }

      // --- 3) Validations stream (signoffs + expert responses) --------------
      if (stream === "all" || stream === "validations") {
        let sq = supabase
          .from("clinical_signoffs")
          .select(
            "id, entity_type, entity_id, signed_by, cosigned_by, status, signed_at, cosigned_at, updated_at, created_at",
          )
          .order("updated_at", { ascending: false })
          .limit(500);
        if (fromIso) sq = sq.gte("updated_at", fromIso);
        if (toIso) sq = sq.lte("updated_at", toIso);
        const { data: signoffs, error: sErr } = await sq;
        if (sErr) throw sErr;
        for (const s of signoffs ?? []) {
          all.push({
            id: `sig-${s.id}`,
            ts: (s.updated_at ?? s.created_at) as string,
            stream: "validations",
            action: `signoff.${s.status}`,
            actor_id:
              (s.cosigned_by as string) ?? (s.signed_by as string) ?? null,
            entity_type: s.entity_type as string,
            entity_id: s.entity_id as string,
            severity: s.status === "rejected" ? "warn" : "info",
            context: {
              signed_at: s.signed_at,
              cosigned_at: s.cosigned_at,
            },
          });
        }

        let rq = supabase
          .from("expert_responses")
          .select("id, request_id, expert_id, created_at")
          .order("created_at", { ascending: false })
          .limit(500);
        if (fromIso) rq = rq.gte("created_at", fromIso);
        if (toIso) rq = rq.lte("created_at", toIso);
        const { data: resps, error: rErr } = await rq;
        if (rErr) throw rErr;
        for (const r of resps ?? []) {
          all.push({
            id: `rsp-${r.id}`,
            ts: r.created_at as string,
            stream: "validations",
            action: "expert.response.created",
            actor_id: (r.expert_id as string) ?? null,
            entity_type: "expert_request",
            entity_id: r.request_id as string,
            severity: "info",
            context: {},
          });
        }
      }

      // Sort merged feed by timestamp desc and cap
      return all
        .sort((a, b) => b.ts.localeCompare(a.ts))
        .slice(0, 1000);
    },
  });

  // ---- KPIs -----------------------------------------------------------------
  const kpis = useMemo(() => {
    const r = rows ?? [];
    return {
      total: r.length,
      cases: r.filter((x) => x.stream === "cases").length,
      exports: r.filter((x) => x.stream === "exports").length,
      validations: r.filter((x) => x.stream === "validations").length,
    };
  }, [rows]);

  // ---- CSV builder + signed export -----------------------------------------
  const csv = useMemo(() => {
    if (!rows?.length) return "";
    const header = [
      "timestamp",
      "stream",
      "action",
      "actor_id",
      "entity_type",
      "entity_id",
      "severity",
      "context_json",
    ];
    const lines = rows.map((r) =>
      [
        r.ts,
        r.stream,
        r.action,
        r.actor_id ?? "",
        r.entity_type,
        r.entity_id ?? "",
        r.severity,
        JSON.stringify(r.context ?? {}).replace(/"/g, '""'),
      ]
        .map((c) => `"${c}"`)
        .join(","),
    );
    return [header.join(","), ...lines].join("\n");
  }, [rows]);

  const handleExport = async () => {
    if (!csv) {
      toast.info("Aucune ligne à exporter");
      return;
    }
    const manifest = await register({
      entityType: "hospital_audit_log",
      format: "csv",
      rowCount: rows?.length ?? 0,
      payload: csv,
      purpose: `Audit hôpital — flux: ${stream} (${rows?.length ?? 0} lignes)`,
      context: { stream, from, to },
    });

    const signed = manifest?.sha256
      ? `${csv}\n# SHA-256: ${manifest.sha256}\n# Manifest: ${manifest.manifestId}\n# Generated: ${new Date().toISOString()}\n`
      : csv;

    const blob = new Blob([signed], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hospital-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    await log({
      category: "compliance",
      action: "hospital_audit.export.csv",
      severity: "info",
      context: {
        count: rows?.length ?? 0,
        stream,
        from,
        to,
        sha256: manifest?.sha256,
      },
    });
    toast.success(
      `${rows?.length ?? 0} événements exportés (SHA-256 signé)`,
    );
  };

  // ---- Guards ---------------------------------------------------------------
  if (authzLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authz?.authorized) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-2">
          <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
          <p className="font-medium">
            Accès réservé aux hospital admins (et DPO).
          </p>
          <p className="text-sm text-muted-foreground">
            Demandez à votre administrateur de vous attribuer le rôle
            <code className="mx-1 px-1 rounded bg-muted">hospital_admin</code>.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ---- UI -------------------------------------------------------------------
  const filteredRows =
    stream === "all" ? rows ?? [] : (rows ?? []).filter((r) => r.stream === stream);

  return (
    <>
      <SEOHead
        title="Audit hôpital"
        description="Journal d'audit unifié — cas, exports, validations expert"
        path="/app/admin/hospital-audit"
        noindex
      />
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            Tableau de bord d'audit hôpital
          </h1>
          <p className="text-muted-foreground mt-1">
            Historique horodaté des cas, exports et validations expert. Export
            CSV signé SHA-256 pour traçabilité externe.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant={authz.scope === "global" ? "default" : "outline"}>
              Portée :{" "}
              {authz.scope === "global"
                ? "globale (DPO)"
                : `${authz.institutionIds.length} institution(s)`}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {kpis.total} événements
            </Badge>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            label="Total"
            value={kpis.total}
            icon={ActivityIcon}
            tone="text-foreground"
          />
          <KpiCard
            label="Cas"
            value={kpis.cases}
            icon={Stethoscope}
            tone="text-primary"
          />
          <KpiCard
            label="Exports"
            value={kpis.exports}
            icon={FileText}
            tone="text-warning"
          />
          <KpiCard
            label="Validations"
            value={kpis.validations}
            icon={FileSignature}
            tone="text-success"
          />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filtres</CardTitle>
            <CardDescription>
              Plafond : 500 lignes par flux, 1000 lignes au total.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label>Flux</Label>
              <Select
                value={stream}
                onValueChange={(v) => setStream(v as Stream)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les flux</SelectItem>
                  <SelectItem value="cases">Cas</SelectItem>
                  <SelectItem value="exports">Exports</SelectItem>
                  <SelectItem value="validations">
                    Validations expert
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Du</Label>
              <Input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Au</Label>
              <Input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex-1"
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Actualiser
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={!filteredRows.length}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV ({filteredRows.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Timeline</CardTitle>
            <CardDescription>
              Triée du plus récent au plus ancien.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Tabs value={stream} onValueChange={(v) => setStream(v as Stream)}>
                <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-flex">
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="cases">Cas</TabsTrigger>
                  <TabsTrigger value="exports">Exports</TabsTrigger>
                  <TabsTrigger value="validations">Validations</TabsTrigger>
                </TabsList>
                <TabsContent value={stream} className="mt-4">
                  <ScrollArea className="h-[55vh] pr-3">
                    <ul className="space-y-2">
                      {filteredRows.map((r) => {
                        const meta = streamMeta[r.stream];
                        const Icon = meta.icon;
                        return (
                          <li
                            key={r.id}
                            className="rounded-md border border-border/60 bg-card/40 p-3 text-sm space-y-1.5 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <Icon className={`h-4 w-4 ${meta.tone}`} />
                              <Badge variant="outline" className="text-[10px]">
                                {meta.label}
                              </Badge>
                              <Badge variant={sevVariant(r.severity)}>
                                {r.severity}
                              </Badge>
                              <span className="font-mono text-xs">
                                {r.action}
                              </span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {format(
                                  new Date(r.ts),
                                  "dd/MM/yyyy HH:mm:ss",
                                )}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              acteur : {r.actor_id?.slice(0, 8) ?? "—"} ·{" "}
                              {r.entity_type}/
                              {r.entity_id?.slice(0, 8) ?? "—"}
                            </div>
                            {Object.keys(r.context).length > 0 && (
                              <pre className="text-[11px] bg-muted/40 rounded p-2 overflow-x-auto">
                                {JSON.stringify(r.context, null, 2)}
                              </pre>
                            )}
                          </li>
                        );
                      })}
                      {!filteredRows.length && (
                        <p className="text-sm text-muted-foreground text-center py-12">
                          Aucun événement sur cette période.
                        </p>
                      )}
                    </ul>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
