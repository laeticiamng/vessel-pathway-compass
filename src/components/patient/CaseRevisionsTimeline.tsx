import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, GitCommit, Plus, Edit3, ArrowRightLeft, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface CaseRevision {
  id: string;
  revision_number: number;
  changed_by: string;
  change_type: string;
  changed_fields: Record<string, { from?: unknown; to?: unknown }>;
  created_at: string;
}

const ICONS: Record<string, typeof GitCommit> = {
  created: Plus,
  updated: Edit3,
  status_changed: ArrowRightLeft,
  category_changed: Tag,
  deleted: GitCommit,
};

const LABELS: Record<string, string> = {
  created: "Création",
  updated: "Modification",
  status_changed: "Statut changé",
  category_changed: "Catégorie changée",
  deleted: "Suppression",
};

const VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  created: "default",
  updated: "secondary",
  status_changed: "outline",
  category_changed: "outline",
  deleted: "destructive",
};

export function CaseRevisionsTimeline({ caseId }: { caseId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["case-revisions", caseId],
    queryFn: async (): Promise<CaseRevision[]> => {
      const { data, error } = await supabase
        .from("case_revisions" as never)
        .select("id,revision_number,changed_by,change_type,changed_fields,created_at")
        .eq("case_id", caseId)
        .order("revision_number", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as CaseRevision[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCommit className="h-4 w-4" />
          Historique versionné (event sourcing)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune révision enregistrée.</p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-6">
            {data.map((rev) => {
              const Icon = ICONS[rev.change_type] ?? GitCommit;
              const fields = Object.keys(rev.changed_fields ?? {});
              return (
                <li key={rev.id} className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-border">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={VARIANTS[rev.change_type] ?? "outline"}>
                      v{rev.revision_number} · {LABELS[rev.change_type] ?? rev.change_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  {fields.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {fields.map((f) => {
                        const change = rev.changed_fields[f];
                        return (
                          <li key={f} className="font-mono">
                            <span className="font-semibold text-foreground">{f}</span>:{" "}
                            <span className="line-through opacity-60">{String(change?.from ?? "∅")}</span>{" "}
                            → <span>{String(change?.to ?? "∅")}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
