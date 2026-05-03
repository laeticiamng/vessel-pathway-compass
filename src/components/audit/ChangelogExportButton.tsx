import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation, type Language } from "@/i18n/context";
import { getContentVersion } from "@/lib/contentVersions";
import { toast } from "sonner";

interface Props {
  contentId: string;
}

const LABELS: Record<Language, { cta: string; json: string; csv: string; empty: string }> = {
  en: {
    cta: "Export changelog",
    json: "Download JSON",
    csv: "Download CSV",
    empty: "No changelog available",
  },
  fr: {
    cta: "Exporter l'historique",
    json: "Télécharger JSON",
    csv: "Télécharger CSV",
    empty: "Aucun historique disponible",
  },
  de: {
    cta: "Verlauf exportieren",
    json: "JSON herunterladen",
    csv: "CSV herunterladen",
    empty: "Kein Verlauf verfügbar",
  },
};

function triggerDownload(filename: string, mime: string, body: string) {
  const blob = new Blob([body], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(v: string): string {
  if (/[",\n;]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function ChangelogExportButton({ contentId }: Props) {
  const { language } = useTranslation();
  const labels = LABELS[language] ?? LABELS.en;
  const [open, setOpen] = useState(false);

  const meta = getContentVersion(contentId);

  const exportJson = () => {
    if (!meta) return toast.error(labels.empty);
    const stamp = new Date().toISOString().slice(0, 10);
    const payload = {
      contentId: meta.id,
      currentVersion: meta.version,
      updatedAt: meta.updatedAt,
      exportedAt: new Date().toISOString(),
      changelog: meta.changelog,
    };
    triggerDownload(
      `${meta.id}-changelog-v${meta.version}-${stamp}.json`,
      "application/json",
      JSON.stringify(payload, null, 2),
    );
  };

  const exportCsv = () => {
    if (!meta) return toast.error(labels.empty);
    const stamp = new Date().toISOString().slice(0, 10);
    const rows = [
      ["content_id", "version", "date", "summary"],
      ...meta.changelog.map((c) => [meta.id, c.version, c.date, c.summary]),
    ];
    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    triggerDownload(
      `${meta.id}-changelog-v${meta.version}-${stamp}.csv`,
      "text/csv",
      csv,
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-testid={`changelog-export-${contentId}`}
        >
          <Download className="h-4 w-4 mr-1" aria-hidden="true" />
          {labels.cta}
          <ChevronDown className="h-3 w-3 ml-1" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportJson} data-testid={`changelog-export-json-${contentId}`}>
          {labels.json}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCsv} data-testid={`changelog-export-csv-${contentId}`}>
          {labels.csv}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ChangelogExportButton;
