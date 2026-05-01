import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { buildDsmbDoc } from "@/lib/vasculink/pdf-builders";

export function DSMBExportButton({ className }: { className?: string }) {
  const handleExport = async () => {
    try {
      const doc = buildDsmbDoc();
      doc.save(`DSMB-Charter-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("DSMB Charter exported");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };
  return (
    <Button onClick={handleExport} variant="outline" size="sm" className={className}>
      <FileDown className="h-4 w-4 mr-1" /> Export DSMB Charter (PDF)
    </Button>
  );
}
