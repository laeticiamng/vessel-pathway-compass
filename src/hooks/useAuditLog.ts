import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type GovernanceCategory =
  | "security"
  | "compliance"
  | "clinical"
  | "research"
  | "administration"
  | "data_lifecycle";

export type GovernanceSeverity = "info" | "warn" | "error" | "critical";

export interface AuditLogPayload {
  category: GovernanceCategory;
  action: string;
  severity?: GovernanceSeverity;
  targetUserId?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  institutionId?: string;
  context?: Record<string, unknown>;
}

/**
 * Hook centralisé d'audit transverse (ADR-001).
 * Toute mutation sensible doit passer par ce hook.
 *
 * @example
 *   const { log } = useAuditLog();
 *   await log({ category: "clinical", action: "case.created", targetEntityType: "case", targetEntityId: caseId });
 */
export function useAuditLog() {
  const log = useCallback(async (payload: AuditLogPayload): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc("log_governance_event" as never, {
        _category: payload.category,
        _action: payload.action,
        _severity: payload.severity ?? "info",
        _target_user: payload.targetUserId ?? null,
        _target_entity_type: payload.targetEntityType ?? null,
        _target_entity_id: payload.targetEntityId ?? null,
        _institution_id: payload.institutionId ?? null,
        _context: (payload.context ?? {}) as never,
      } as never);

      if (error) {
        console.warn("[useAuditLog] failed", error);
        return null;
      }
      return data as unknown as string;
    } catch (err) {
      console.warn("[useAuditLog] exception", err);
      return null;
    }
  }, []);

  return { log };
}
