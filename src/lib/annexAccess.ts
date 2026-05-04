import type { AppRole } from "@/hooks/useUserRoles";

/**
 * Access matrix for the Compliance Annexes blocks.
 *
 * Tiers:
 *   - "public"        — visible to anyone (incl. logged-out visitors).
 *   - "authenticated" — any signed-in user.
 *   - "clinical"      — physician, trainee, expert_reviewer, hospital_admin.
 *   - "research"      — research_lead, admin, super_admin.
 *   - "governance"    — admin, super_admin only.
 */
export type AccessTier =
  | "public"
  | "authenticated"
  | "clinical"
  | "research"
  | "governance";

export interface AnnexBlockAccess {
  /** i18n key suffix (e.g. "references", "limits") */
  id: string;
  tier: AccessTier;
}

/** Annex block → required tier. Wider audience for normative info,
 * stricter access for security/vigilance internals. */
export const ANNEX_ACCESS: AnnexBlockAccess[] = [
  { id: "references", tier: "public" },
  { id: "limits", tier: "public" },
  { id: "privacy", tier: "authenticated" },
  { id: "security", tier: "research" },
  { id: "adr", tier: "clinical" },
  { id: "traceability", tier: "governance" },
];

const CLINICAL_ROLES: AppRole[] = [
  "physician",
  "trainee",
  "expert_reviewer",
  "hospital_admin",
];
const RESEARCH_ROLES: AppRole[] = ["research_lead", "admin", "super_admin"];
const GOVERNANCE_ROLES: AppRole[] = ["admin", "super_admin"];

export function canAccessTier(
  tier: AccessTier,
  ctx: { isAuthenticated: boolean; roles: AppRole[] },
): boolean {
  if (tier === "public") return true;
  if (!ctx.isAuthenticated) return false;
  if (tier === "authenticated") return true;
  if (tier === "clinical") {
    return (
      ctx.roles.some((r) => CLINICAL_ROLES.includes(r)) ||
      ctx.roles.some((r) => RESEARCH_ROLES.includes(r))
    );
  }
  if (tier === "research") {
    return ctx.roles.some((r) => RESEARCH_ROLES.includes(r));
  }
  if (tier === "governance") {
    return ctx.roles.some((r) => GOVERNANCE_ROLES.includes(r));
  }
  return false;
}
