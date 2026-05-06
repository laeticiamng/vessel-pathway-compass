/**
 * Pseudonymizes sensitive network metadata (IP / UA / forwarded headers)
 * for roles that have audit-read access but are NOT full admins.
 *
 * Auditability is preserved: a stable hash-prefix is emitted so the same
 * source can still be correlated across events without revealing PII.
 *
 *  - admin / super_admin → see raw values
 *  - research_lead       → see "‹masked:xxxxxx›"
 */
export const SENSITIVE_NETWORK_FIELDS = [
  "ip",
  "xff",
  "cf_connecting_ip",
  "x_real_ip",
  "ua",
] as const;

export function maskValue(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (!s) return "";
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return `‹masked:${(h >>> 0).toString(36).slice(0, 6)}›`;
}

export function pseudonymizeContext(
  ctx: Record<string, unknown> | null,
  canSeeRaw: boolean,
): Record<string, unknown> {
  const c = { ...(ctx ?? {}) };
  if (canSeeRaw) return c;
  for (const k of SENSITIVE_NETWORK_FIELDS) {
    if (k in c && c[k] != null && c[k] !== "") c[k] = maskValue(c[k]);
  }
  return c;
}
