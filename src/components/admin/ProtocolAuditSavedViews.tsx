import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Save, Trash2, Share2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * Filters payload persisted in `protocol_audit_saved_views.filters`.
 * Kept generic so future audit filters can be added without a migration.
 */
export interface SavedViewFilters {
  selectedActions: string[];
  rangeKey: string;
  actorFilter: string;
  requestIdFilter: string;
  pageSize: number;
}

export interface SavedView {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  filters: SavedViewFilters;
  is_shared: boolean;
  created_at: string;
}

interface Props {
  /** Current filter set on the audit console (used when saving). */
  currentFilters: SavedViewFilters;
  /** Apply the saved filter set to the audit console state. */
  onApply: (v: SavedView) => void;
}

/**
 * Saved Protocol Audit Views.
 *
 * - Each authorized auditor can save filter sets they reuse often.
 * - Marking a view as "shared" makes it visible to all admins,
 *   super-admins and research-leads (RLS enforces the read scope).
 * - Exports always reflect the active view because applying a saved
 *   view writes the same state used by the audit table & exporter.
 */
export function ProtocolAuditSavedViews({ currentFilters, onApply }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["protocol-audit-saved-views"],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<SavedView[]> => {
      const { data, error } = await supabase
        .from("protocol_audit_saved_views" as never)
        .select("id, owner_id, name, description, filters, is_shared, created_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as SavedView[]) ?? [];
    },
  });

  const handleSave = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("protocol_audit_saved_views" as never)
        .insert({
          owner_id: user.id,
          name: name.trim(),
          filters: currentFilters as unknown as Record<string, unknown>,
          is_shared: shared,
        });
      if (error) throw error;
      toast.success(`Saved view "${name.trim()}" created`);
      setOpen(false); setName(""); setShared(false);
      qc.invalidateQueries({ queryKey: ["protocol-audit-saved-views"] });
    } catch (e) {
      toast.error(`Save failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("protocol_audit_saved_views" as never)
      .delete().eq("id", id);
    if (error) toast.error(`Delete failed: ${error.message}`);
    else {
      toast.success("Saved view deleted");
      qc.invalidateQueries({ queryKey: ["protocol-audit-saved-views"] });
    }
  };

  const views = data ?? [];

  return (
    <section
      data-testid="saved-views-panel"
      className="rounded-2xl border bg-card p-3"
    >
      <header className="flex items-center gap-2 mb-2">
        <Bookmark className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Saved views</h2>
        <Button
          size="sm" variant="outline"
          className="ml-auto h-7 text-[11px]"
          onClick={() => setOpen(true)}
          data-testid="saved-views-save"
        >
          <Save className="h-3 w-3 mr-1" /> Save current
        </Button>
      </header>

      {isLoading && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading…
        </div>
      )}

      {!isLoading && views.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No saved views yet. Save the current filter set to reuse or share it.
        </p>
      )}

      {views.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {views.map((v) => {
            const isOwn = v.owner_id === user?.id;
            return (
              <li key={v.id} className="flex items-center gap-1 rounded-full border bg-background px-2 py-1">
                <button
                  onClick={() => onApply(v)}
                  data-testid={`saved-view-apply-${v.id}`}
                  className="text-xs hover:underline flex items-center gap-1.5"
                  title="Apply filters & exports will reflect this view"
                >
                  <Bookmark className="h-3 w-3 text-primary" />
                  {v.name}
                  {v.is_shared && <Share2 className="h-3 w-3 text-muted-foreground" />}
                </button>
                {isOwn && (
                  <button
                    onClick={() => handleDelete(v.id)}
                    aria-label={`Delete saved view ${v.name}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save current view</DialogTitle>
            <DialogDescription>
              Persists the active actions, time range, actor, request-id and
              page size. Exports run while this view is active will reflect it
              exactly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="View name (e.g. Burst denials last 7d)"
              maxLength={120}
            />
            <label className="flex items-center gap-2 text-xs">
              <Checkbox
                checked={shared}
                onCheckedChange={(c) => setShared(!!c)}
                data-testid="saved-view-shared"
              />
              Share with other auditors (admin / research_lead)
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || saving} data-testid="saved-view-confirm">
              {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              Save view
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
