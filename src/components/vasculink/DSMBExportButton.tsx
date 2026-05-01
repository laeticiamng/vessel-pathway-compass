import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { buildDsmbDoc } from "@/lib/vasculink/pdf-builders";
import { useTranslation } from "@/i18n/context";

export function DSMBExportButton({ className }: { className?: string }) {
  const { t } = useTranslation();
  const handleExport = async () => {
    try {
      const doc = buildDsmbDoc();
      doc.save(`DSMB-Charter-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(t("vasculink.dsmb.exportSuccess"));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("vasculink.audit.exportFailed"));
    }
  };
  return (
    <Button onClick={handleExport} variant="outline" size="sm" className={className}>
      <FileDown className="h-4 w-4 mr-1" /> {t("vasculink.dsmb.exportButton")}
    </Button>
  );
}
