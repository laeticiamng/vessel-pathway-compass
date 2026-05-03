import { useState } from "react";
import { History, ChevronDown } from "lucide-react";
import { getContentVersion } from "@/lib/contentVersions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation, type Language } from "@/i18n/context";

interface Props {
  contentId: string;
  className?: string;
}

const LABELS: Record<Language, { version: string; updated: string; history: string }> = {
  en: { version: "Content version", updated: "Last updated", history: "View change history" },
  fr: { version: "Version du contenu", updated: "Dernière mise à jour", history: "Voir l'historique des modifications" },
  de: { version: "Inhaltsversion", updated: "Zuletzt aktualisiert", history: "Änderungsverlauf anzeigen" },
};

export function ContentVersionBadge({ contentId, className = "" }: Props) {
  const { language } = useTranslation();
  const labels = LABELS[language] ?? LABELS.en;
  const meta = getContentVersion(contentId);
  const [open, setOpen] = useState(false);
  if (!meta) return null;

  return (
    <div
      className={`rounded-xl border border-border/60 bg-muted/30 p-4 text-sm ${className}`}
      data-testid={`content-version-${contentId}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <History className="h-4 w-4" aria-hidden="true" />
        <span>
          <span className="font-medium text-foreground">{labels.version}</span>{" "}
          <code className="rounded bg-background px-1.5 py-0.5 text-xs">v{meta.version}</code>
          <span className="mx-2">·</span>
          <span>{labels.updated}: {meta.updatedAt}</span>
        </span>
      </div>
      <Collapsible open={open} onOpenChange={setOpen} className="mt-2">
        <CollapsibleTrigger className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          {labels.history}
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <ol className="space-y-1.5 text-xs text-muted-foreground border-l border-border/60 pl-3">
            {meta.changelog.map((c) => (
              <li key={c.version}>
                <span className="font-mono text-foreground">v{c.version}</span>
                <span className="mx-1.5 text-muted-foreground/70">· {c.date}</span>
                <span>{c.summary}</span>
              </li>
            ))}
          </ol>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ContentVersionBadge;
