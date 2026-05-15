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
import { ChevronLeft, ChevronRight, Shield, FileDown, FileText, Loader2 } from "lucide-react";
import { GovernanceEventDetail, type GovernanceEvent } from "@/components/governance/GovernanceEventDetail";
import { ExportJobsPanel } from "@/components/governance/ExportJobsPanel";
import { toast } from "sonner";

const PAGE_SIZE = 25;
const SYNC_THRESHOLD = 1000;

type Institution = { id: string; name: string };
type CategoryFilter = "all" | "visual_chain" | "rsvp";
type LayerFilter = "any" | "L1" | "L2" | "L3" | "Post-PhD";

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
  const [recommended, setRecommended] = useState<LayerFilter>("any");
  const [current, setCurrent] = useState<LayerFilter>("any");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<GovernanceEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setPage(0); }, [category, institution, from, to, recommended, current]);

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

  const baseQuery = () => {
    let q = supabase
      .from("governance_events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }); // deterministic tiebreaker
    if (category === "all") q = q.in("event_category", ["visual_chain", "rsvp"]);
    else q = q.eq("event_category", category);
    if (institution !== "all") q = q.eq("institution_id", institution);
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) {
      const d = new Date(to); d.setHours(23, 59, 59, 999);
      q = q.lte("created_at", d.toISOString());
    }
    if (recommended !== "any") {
      q = q.or(
        `context->>recommended_layer.eq.${recommended},context->>recommended_level.eq.${recommended}`,
      );
    }
    if (current !== "any") {
      q = q.or(
        `context->>current_layer.eq.${current},context->>requested_level.eq.${current}`,
      );
    }
    return q;
  };

  const queryKey = useMemo(
    () => ["governance-events", category, institution, from, to, recommended, current, page],
    [category, institution, from, to, recommended, current, page],
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

  const buildFilters = () => ({
    category,
    institution_id: institution === "all" ? null : institution,
    from: from ? new Date(from).toISOString() : null,
    to: to ? (() => { const d = new Date(to); d.setHours(23,59,59,999); return d.toISOString(); })() : null,
    recommended: recommended === "any" ? null : recommended,
    current: current === "any" ? null : current,
  });

  const runExport = async (format: "csv" | "pdf") => {
    setExporting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) {
        toast.error("Session expired");
        return;
      }
      const total = data?.count ?? 0;
      const useAsync = total > SYNC_THRESHOLD;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/governance-events-export`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          format,
          mode: useAsync ? "async" : "sync",
          filters: buildFilters(),
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        toast.error("Export failed", { description: txt.slice(0, 200) });
        return;
      }
      if (useAsync) {
        await res.json();
        toast.success("Export queued", {
          description: "You can keep working — it will appear below when ready.",
        });
      } else {
        const blob = await res.blob();
        const total = res.headers.get("X-Total-Rows") ?? "?";
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `governance-events-${Date.now()}.${format}`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success(`Exported ${total} events to ${format.toUpperCase()}`);
      }
    } finally {
      setExporting(false);
    }
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
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
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
                <Label>Recommended</Label>
                <Select value={recommended} onValueChange={(v) => setRecommended(v as LayerFilter)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="L1">L1</SelectItem>
                    <SelectItem value="L2">L2</SelectItem>
                    <SelectItem value="L3">L3</SelectItem>
                    <SelectItem value="Post-PhD">Post-PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Current/Requested</Label>
                <Select value={current} onValueChange={(v) => setCurrent(v as LayerFilter)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="L1">L1</SelectItem>
                    <SelectItem value="L2">L2</SelectItem>
                    <SelectItem value="L3">L3</SelectItem>
                    <SelectItem value="Post-PhD">Post-PhD</SelectItem>
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
                {(data?.count ?? 0) > SYNC_THRESHOLD && (
                  <> · <span className="text-foreground">large export will run in background</span></>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={(data?.count ?? 0) === 0 || exporting} onClick={() => runExport("csv")}>
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                  <span className="ml-2">Export all matching (CSV)</span>
                </Button>
                <Button variant="outline" size="sm" disabled={(data?.count ?? 0) === 0 || exporting} onClick={() => runExport("pdf")}>
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  <span className="ml-2">Export all matching (PDF)</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ExportJobsPanel />

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
