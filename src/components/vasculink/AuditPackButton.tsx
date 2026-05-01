import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { buildAuditPackDoc } from "@/lib/vasculink/pdf-builders";

export function AuditPackButton() {
  const handleExport = async () => {
    try {
      const doc = buildAuditPackDoc();
      doc.save(`VASCU-LINK-Audit-Pack-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Audit-ready compliance pack exported");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };
  return (
    <Button onClick={handleExport} variant="default" size="sm">
      <ShieldCheck className="h-4 w-4 mr-1" /> Audit-ready compliance pack (PDF)
    </Button>
  );
}
