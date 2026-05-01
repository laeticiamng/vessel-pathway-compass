import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { buildAuditPackDoc } from "@/lib/vasculink/pdf-builders";
import { useTranslation } from "@/i18n/context";

export function AuditPackButton() {
  const { t } = useTranslation();
  const handleExport = async () => {
    try {
      const doc = buildAuditPackDoc();
      doc.save(`VASCU-LINK-Audit-Pack-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(t("vasculink.audit.packSuccess"));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("vasculink.audit.exportFailed"));
    }
  };
  return (
    <Button onClick={handleExport} variant="default" size="sm">
      <ShieldCheck className="h-4 w-4 mr-1" /> {t("vasculink.audit.packButton")}
    </Button>
  );
}
