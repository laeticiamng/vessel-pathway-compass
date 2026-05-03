import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Save, Undo2, Plus, Trash2, FileDown, History } from "lucide-react";
import { toast } from "sonner";
import {
  getEffectiveVersion,
  getCanonicalVersion,
  saveDraft,
  revertToCanonical,
  readAuditLog,
  type AuditLogEntry,
} from "@/lib/contentVersionsStore";
import type { ContentChangelogEntry, ContentVersion } from "@/lib/contentVersions";
import { VersionDiffView } from "@/components/audit/VersionDiffView";

const MANAGED_IDS = ["audit-limitations", "faq"] as const;

function emptyEntry(): ContentChangelogEntry {
  return { version: "0.0.0", date: new Date().toISOString().slice(0, 10), summary: "" };
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export default function ContentVersionsAdmin() {
  const { user } = useAuth();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
    enabled: !!user,
  });

  const isAdmin = roles?.includes("super_admin") || roles?.includes("admin");

  const [activeId, setActiveId] = useState<(typeof MANAGED_IDS)[number]>("audit-limitations");
  const [draft, setDraft] = useState<ContentVersion | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [diffPair, setDiffPair] = useState<{ left: string; right: string }>({
    left: "",
    right: "",
  });

  // Load current effective version into the editor whenever the active tab changes.
  useEffect(() => {
    const eff = getEffectiveVersion(activeId);
    if (eff) setDraft(clone(eff));
    setAuditLog(readAuditLog().filter((a) => a.contentId === activeId));
  }, [activeId]);

  const canonical = useMemo(() => getCanonicalVersion(activeId), [activeId]);

  const allVersions: ContentChangelogEntry[] = useMemo(
    () => (draft ? draft.changelog : []),
    [draft],
  );

  if (!user) return <Navigate to="/auth" replace />;
  if (rolesLoading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/app" replace />;
  if (!draft) return null;

  const update = (next: Partial<ContentVersion>) => {
    setDraft((d) => (d ? { ...d, ...next } : d));
  };

  const updateChangelog = (idx: number, patch: Partial<ContentChangelogEntry>) => {
    setDraft((d) => {
      if (!d) return d;
      const log = d.changelog.map((c, i) => (i === idx ? { ...c, ...patch } : c));
      return { ...d, changelog: log };
    });
  };

  const addChangelog = () => {
    setDraft((d) => (d ? { ...d, changelog: [emptyEntry(), ...d.changelog] } : d));
  };

  const removeChangelog = (idx: number) => {
    setDraft((d) => (d ? { ...d, changelog: d.changelog.filter((_, i) => i !== idx) } : d));
  };

  const handleSave = () => {
    if (!draft) return;
    if (!/^\d+\.\d+\.\d+$/.test(draft.version)) {
      toast.error("Version must be semantic (MAJOR.MINOR.PATCH).");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.updatedAt)) {
      toast.error("Updated date must be ISO YYYY-MM-DD.");
      return;
    }
    saveDraft({ contentId: activeId, actor: user.email ?? user.id, next: draft });
    setAuditLog(readAuditLog().filter((a) => a.contentId === activeId));
    toast.success("Draft saved locally.");
  };

  const handleRevert = () => {
    revertToCanonical(activeId, user.email ?? user.id);
    const eff = getEffectiveVersion(activeId);
    if (eff) setDraft(clone(eff));
    setAuditLog(readAuditLog().filter((a) => a.contentId === activeId));
    toast.success("Reverted to canonical (code) version.");
  };

  const exportAuditJson = () => {
    const blob = new Blob([JSON.stringify(auditLog, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeId}-modifications-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const leftEntry = diffPair.left
    ? draft.changelog.find((c) => c.version === diffPair.left)
    : undefined;
  const rightEntry = diffPair.right
    ? draft.changelog.find((c) => c.version === diffPair.right)
    : undefined;

  // Build synthetic versions for the diff view from two changelog snapshots:
  // diff is meaningful only at the "registry-state" level, so we render one
  // ContentVersion centered on each picked changelog entry.
  const leftVersion: ContentVersion | undefined = leftEntry
    ? { id: draft.id, version: leftEntry.version, updatedAt: leftEntry.date, changelog: [leftEntry] }
    : undefined;
  const rightVersion: ContentVersion | undefined = rightEntry
    ? { id: draft.id, version: rightEntry.version, updatedAt: rightEntry.date, changelog: [rightEntry] }
    : undefined;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEOHead
        title="Content versions admin — VASCU-LINK"
        description="Manage versions, dates and changelogs of the Audit & Limitations and FAQ pages with full traceability."
        path="/app/admin/content-versions"
      />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Content versions admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Editorial overlay for /audit-limitations and /faq. Drafts stay local until a developer
            commits them to <code>src/lib/contentVersions.ts</code>.
          </p>
        </div>
      </header>

      <Tabs value={activeId} onValueChange={(v) => setActiveId(v as (typeof MANAGED_IDS)[number])}>
        <TabsList>
          {MANAGED_IDS.map((id) => (
            <TabsTrigger key={id} value={id}>
              {id}
            </TabsTrigger>
          ))}
        </TabsList>

        {MANAGED_IDS.map((id) => (
          <TabsContent key={id} value={id} className="space-y-6">
            {id !== activeId ? null : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{id}</span>
                      {canonical && draft.version === canonical.version &&
                        draft.updatedAt === canonical.updatedAt ? (
                        <Badge variant="secondary">In sync with code</Badge>
                      ) : (
                        <Badge variant="default">Local draft</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Bump rules — PATCH: typo, MINOR: new section / regulatory rephrasing,
                      MAJOR: structural rewrite.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor={`v-${id}`}>Version</Label>
                        <Input
                          id={`v-${id}`}
                          value={draft.version}
                          onChange={(e) => update({ version: e.target.value })}
                          placeholder="1.2.0"
                          data-testid="admin-version-input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`d-${id}`}>Updated date (ISO)</Label>
                        <Input
                          id={`d-${id}`}
                          value={draft.updatedAt}
                          onChange={(e) => update({ updatedAt: e.target.value })}
                          placeholder="2026-05-03"
                          data-testid="admin-date-input"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Changelog entries</Label>
                      <Button size="sm" variant="outline" onClick={addChangelog}>
                        <Plus className="h-4 w-4 mr-1" /> Add entry
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {draft.changelog.map((entry, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-border p-3 space-y-2 bg-muted/20"
                        >
                          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
                            <Input
                              value={entry.version}
                              onChange={(e) => updateChangelog(i, { version: e.target.value })}
                              placeholder="1.0.0"
                            />
                            <Input
                              value={entry.date}
                              onChange={(e) => updateChangelog(i, { date: e.target.value })}
                              placeholder="2026-04-15"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeChangelog(i)}
                              aria-label="Remove entry"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <Textarea
                            value={entry.summary}
                            onChange={(e) => updateChangelog(i, { summary: e.target.value })}
                            rows={2}
                            placeholder="Short summary of the change"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <Button onClick={handleSave} data-testid="admin-save-draft">
                        <Save className="h-4 w-4 mr-1" /> Save draft
                      </Button>
                      <Button variant="outline" onClick={handleRevert}>
                        <Undo2 className="h-4 w-4 mr-1" /> Revert to canonical
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Diff between two versions</CardTitle>
                    <CardDescription>
                      Pick two changelog entries to see what changed between them.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>From</Label>
                        <Select
                          value={diffPair.left}
                          onValueChange={(v) => setDiffPair((p) => ({ ...p, left: v }))}
                        >
                          <SelectTrigger data-testid="diff-from"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {allVersions.map((c) => (
                              <SelectItem key={c.version} value={c.version}>
                                v{c.version} · {c.date}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>To</Label>
                        <Select
                          value={diffPair.right}
                          onValueChange={(v) => setDiffPair((p) => ({ ...p, right: v }))}
                        >
                          <SelectTrigger data-testid="diff-to"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {allVersions.map((c) => (
                              <SelectItem key={c.version} value={c.version}>
                                v{c.version} · {c.date}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {leftVersion && rightVersion ? (
                      <VersionDiffView left={leftVersion} right={rightVersion} />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Pick two versions to display the diff.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="h-5 w-5" /> Modification audit log
                    </CardTitle>
                    <CardDescription>
                      Local trail of who changed what, when. Export for archival.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={exportAuditJson}>
                        <FileDown className="h-4 w-4 mr-1" /> Export JSON
                      </Button>
                    </div>
                    {auditLog.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No modifications recorded yet.</p>
                    ) : (
                      <ul className="space-y-2 text-xs">
                        {auditLog.map((entry) => (
                          <li
                            key={entry.id}
                            className="rounded border border-border p-2 flex items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="font-mono text-foreground">
                                {entry.at} — {entry.actor}
                              </div>
                              <div className="text-muted-foreground">
                                {entry.action} → v{entry.after.version} ({entry.after.updatedAt})
                              </div>
                            </div>
                            <Badge variant={entry.action === "revert" ? "outline" : "secondary"}>
                              {entry.action}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
