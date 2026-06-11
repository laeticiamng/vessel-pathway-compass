import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole =
  | "super_admin"
  | "admin"
  | "hospital_admin"
  | "research_lead"
  | "expert_reviewer"
  | "physician"
  | "trainee"
  | "user";

/**
 * Returns the effective set of roles for the current user.
 *
 * - Reads exclusively from `user_roles` (canonical, used by has_role()).
 * - Anonymous users get an empty array (no roles).
 */
export function useUserRoles() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AppRole[]> => {
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      const fromTable = (roleRows ?? []).map((r) => r.role as AppRole);
      return Array.from(new Set(fromTable));
    },
  });


  const roles = query.data ?? [];
  const hasRole = (r: AppRole | AppRole[]) => {
    const targets = Array.isArray(r) ? r : [r];
    return targets.some((x) => roles.includes(x));
  };

  return {
    roles,
    hasRole,
    isAdmin: hasRole(["admin", "super_admin"]),
    isResearchLead: hasRole("research_lead"),
    isPhysician: hasRole("physician"),
    isTrainee: hasRole("trainee"),
    isLoading: query.isLoading,
    isAuthenticated: !!user,
  };
}
