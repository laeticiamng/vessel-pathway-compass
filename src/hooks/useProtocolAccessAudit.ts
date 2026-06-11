import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { getContentVersion } from "@/lib/contentVersions";

/**
 * Logs role-aware access to the public research protocol page and to
 * the institutional Q&A section.
 *
 * - Anonymous visitors are NOT logged (privacy: no PII to attach).
 * - Authenticated users emit one `protocol.viewed` governance_event per
 *   page mount (deduplicated via a session-scoped ref so client-side
 *   re-renders do not flood the log).
 * - Each Q&A item opened emits a `protocol.qa.viewed` event with the
 *   question index and the user role pulled from the profiles table.
 *
 * Caller must invoke `logQA(index)` from the Q&A section.
 */
export function useProtocolAccessAudit() {
  const { user } = useAuth();
  const { log } = useAuditLog();
  const loggedView = useRef(false);

  // Read user role from user_roles + (best-effort) specialty/institution from profiles.
  const { data: profile } = useQuery({
    queryKey: ["profile-role", user?.id],
    queryFn: async () => {
      const [{ data: prof }, { data: roleRows }] = await Promise.all([
        supabase
          .from("profiles")
          .select("specialty, institution")
          .eq("user_id", user!.id)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user!.id),
      ]);
      const role = (roleRows ?? [])[0]?.role ?? null;
      return {
        role,
        specialty: prof?.specialty ?? null,
        institution: prof?.institution ?? null,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const protocolVersion = getContentVersion("protocol");

  // Page view — fire once per mount.
  useEffect(() => {
    if (!user || loggedView.current) return;
    loggedView.current = true;

    void log({
      category: "research",
      action: "protocol.viewed",
      severity: "info",
      targetEntityType: "protocol",
      targetEntityId: undefined,
      context: {
        role: profile?.role ?? "unknown",
        specialty: profile?.specialty ?? null,
        institution: profile?.institution ?? null,
        protocol_version: protocolVersion?.version ?? null,
      },
    });
  }, [user, profile, log, protocolVersion]);

  const logQA = (index: number, question?: string) => {
    if (!user) return;
    void log({
      category: "research",
      action: "protocol.qa.viewed",
      severity: "info",
      targetEntityType: "protocol_qa",
      context: {
        role: profile?.role ?? "unknown",
        question_index: index,
        question_excerpt: question?.slice(0, 120) ?? null,
        protocol_version: protocolVersion?.version ?? null,
      },
    });
  };

  return { logQA, role: profile?.role ?? null, isAuthenticated: !!user };
}

