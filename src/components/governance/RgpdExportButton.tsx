import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";

/**
 * Bouton self-service d'export RGPD (art. 15 + 20).
 * Appelle l'edge function export-user-data, télécharge un JSON consolidé.
 */
export function RgpdExportButton() {
  const { user } = useAuth();
  const { log } = useAuditLog();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-user-data", {
        body: {},
      });
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aquamr-export-${user.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      await log({
        category: "compliance",
        action: "rgpd.export.downloaded",
        severity: "info",
        targetUserId: user.id,
      });
      toast.success("Export téléchargé. Conservez-le en lieu sûr.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading || !user} size="sm">
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Télécharger mes données (JSON)
    </Button>
  );
}
