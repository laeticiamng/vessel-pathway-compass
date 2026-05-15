import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Shield, FileDown, FileText } from "lucide-react";
import { downloadCsv, downloadPdf, type AuditExportRow } from "@/lib/auditExport";
import { GovernanceEventDetail, type GovernanceEvent } from "@/components/governance/GovernanceEventDetail";
import { toast } from "sonner";

const PAGE_SIZE = 25;

type Institution = { id: string; name: string };
type CategoryFilter = "all" | "visual_chain" | "rsvp";

export default function VisualChainEventsAdmin() {
  const { user } = useAuth();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role as string);
    },
    enabled: !!user,
  });

  const isAdmin =
    roles?.includes("admin") ||
    roles?.includes("super_admin") ||
    roles?.includes("hospital_admin");

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [institution, setInstitution] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<GovernanceEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setPage(0); }, [category, institution, from, to]);

  const { data: institutions } = useQuery({
    queryKey: ["institutions-for-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions").select("id, name").order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Institution[];
    },
    enabled: !!isAdmin,
  });

  const applyFilters = (q: ReturnType<typeof supabase.from<"governance_events">> extends infer _ ? any : never) => q;
  const baseQuery = () => {
    let q = supabase
      .from("governance_events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (category === "all") q = q.in("event_category", ["visual_chain", "rsvp"]);
    else q = q.eq("event_category", category);
    if (institution !== "all") q = q.eq("institution_id", institution);
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) {
      const d = new Date(to); d.setHours(23, 59, 59, 999);
      q = q.lte("created_at", d.toISOString());
    }
    return q;
  };

  const queryKey = useMemo(
    () => ["governance-events", category, institution, from, to, page],
    [category, institution, from, to, page],
  );

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const fromIdx = page * PAGE_SIZE;
      const toIdx = fromIdx + PAGE_SIZE - 1;
      const { data: rows, count, error } = await baseQuery().range(fromIdx, toIdx);
      if (error) throw error;
      return { rows: (rows ?? []) as GovernanceEvent[], count: count ?? 0 };
    },
    enabled: !!isAdmin,
  });

  if (!user) return <Navigate to="/auth" replace />;
  if (rolesLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full mt-6" />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/app" replace />;

  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;
  const rows = data?.rows ?? [];

  const toExportRows = (events: GovernanceEvent[]): AuditExportRow[] =>
    events.map((e) => ({
      created_at: new Date(e.created_at).toISOString(),
      recommended:
        (e.context as Record<string, string> | null)?.recommended_layer ??
        (e.context as Record<string, string> | null)?.recommended_level ?? "",
      current:
        (e.context as Record<string, string> | null)?.current_layer ??
        (e.context as Record<string, string> | null)?.requested_level ?? "",
      rationale: `${e.event_category}/${e.event_action} · ${e.severity}`,
      extra: {
        actor: e.actor_id ?? "",
        institution: e.institution_id ?? "",
        target: e.target_entity_id ?? "",
      },
    }));

  const csvHeaders = {
    timestamp: "Timestamp", recommended: "Recommended",
    current: "Current/Requested", rationale: "Action",
  };

  const fetchAllMatching = async () => {
    const { data: all, error } = await baseQuery().range(0, 9999);
    if (error) {
      toast.error("Export failed", { description: error.message });
      return null;
    }
    return (all ?? []) as GovernanceEvent[];
  };

  const exportCsv = async () => {
    const all = await fetchAllMatching();
    if (!all) return;
    downloadCsv(`governance-events-${Date.now()}.csv`, toExportRows(all), csvHeaders);
    toast.success(`Exported ${all.length} events to CSV`);
  };
  const exportPdf = async () => {
    const all = await fetchAllMatching();
    if (!all) return;
    downloadPdf(
      `governance-events-${Date.now()}.pdf`,
      "Governance events — Visual Chain & RSVP",
      toExportRows(all),
      csvHeaders,
    );
    toast.success(`Exported ${all.length} events to PDF`);
  };

  return (
    <>
      <SEOHead
        title="Visual Chain & RSVP events — Admin"
        description="Governance events for the visual chain and RSVP engines."
        path="/app/admin/visual-chain-events"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Visual Chain &amp; RSVP — Governance events
          </h1>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All (visual_chain + rsvp)</SelectItem>
                    <SelectItem value="visual_chain">visual_chain</SelectItem>
                    <SelectItem value="rsvp">rsvp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Institution</Label>
                <Select value={institution} onValueChange={setInstitution}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All institutions</SelectItem>
                    {(institutions ?? []).map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="from">From</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm text-muted-foreground">
                {data?.count ?? 0} event{(data?.count ?? 0) > 1 ? "s" : ""} matching ·
                page {page + 1}{totalPages ? ` / ${totalPages}` : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={(data?.count ?? 0) === 0} onClick={exportCsv}>
                  <FileDown className="h-4 w-4" /><span className="ml-2">Export all matching (CSV)</span>
                </Button>
                <Button variant="outline" size="sm" disabled={(data?.count ?? 0) === 0} onClick={exportPdf}>
                  <FileText className="h-4 w-4" /><span className="ml-2">Export all matching (PDF)</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events for the selected filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-border">
                    <tr>
                      <th className="py-2 pr-4 font-medium">When</th>
                      <th className="py-2 pr-4 font-medium">Category</th>
                      <th className="py-2 pr-4 font-medium">Action</th>
                      <th className="py-2 pr-4 font-medium">Severity</th>
                      <th className="py-2 pr-4 font-medium">Entity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-border/50 align-top cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => { setSelected(e); setDrawerOpen(true); }}
                      >
                        <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">
                          {new Date(e.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 pr-4"><Badge variant="outline">{e.event_category}</Badge></td>
                        <td className="py-2 pr-4 font-mono text-xs">{e.event_action}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={
                            e.severity === "critical" || e.severity === "error" ? "destructive"
                              : e.severity === "warn" ? "default" : "secondary"
                          }>{e.severity}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-xs">
                          {e.target_entity_type ?? "—"}
                          {e.target_entity_id && (
                            <div className="font-mono text-muted-foreground">
                              {e.target_entity_id.slice(0, 8)}…
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  <ChevronLeft className="h-4 w-4" /><span className="ml-1">Previous</span>
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}>
                  <span className="mr-1">Next</span><ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <GovernanceEventDetail event={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
