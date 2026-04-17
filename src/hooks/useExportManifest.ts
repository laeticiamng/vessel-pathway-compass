import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sha256Hex } from "@/lib/sha256";
import { toast } from "sonner";

interface RegisterArgs {
  entityType: string;
  format: "pdf" | "csv" | "json";
  rowCount: number;
  payload: string; // serialized bytes/string used to compute SHA-256
  purpose: string;
  context?: Record<string, unknown>;
}

interface RegisterResult {
  manifestId: string;
  sha256: string;
  alertHighVolume: boolean;
}

/**
 * Hook to register an export manifest (P7 — ADR-014 chain-of-custody).
 * Returns the SHA-256 hash so callers can embed it in the artifact footer.
 */
export function useExportManifest() {
  const register = useCallback(
    async (args: RegisterArgs): Promise<RegisterResult | null> => {
      try {
        const sha = await sha256Hex(args.payload);
        const { data, error } = await supabase.rpc("register_export_manifest" as never, {
          _entity_type: args.entityType,
          _export_format: args.format,
          _row_count: args.rowCount,
          _sha256: sha,
          _purpose: args.purpose,
          _context: (args.context ?? {}) as never,
        } as never);
        if (error) throw error;
        const result = data as unknown as { manifest_id: string; alert_high_volume: boolean };
        if (result.alert_high_volume) {
          toast.warning("Volume d'export élevé détecté (>5/heure) — un événement de gouvernance a été déclenché.");
        }
        return {
          manifestId: result.manifest_id,
          sha256: sha,
          alertHighVolume: result.alert_high_volume,
        };
      } catch (e) {
        console.warn("[useExportManifest] failed", e);
        return null;
      }
    },
    []
  );

  return { register };
}
