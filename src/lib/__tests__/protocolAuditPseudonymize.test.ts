import { describe, it, expect } from "vitest";
import {
  pseudonymizeContext,
  maskValue,
  SENSITIVE_NETWORK_FIELDS,
} from "@/lib/protocolAuditPseudonymize";

const RAW_CONTEXT = {
  request_id: "r-abc-123",
  reason: "role_forbidden",
  role: "physician",
  ip: "203.0.113.42",
  xff: "203.0.113.42, 10.0.0.1",
  cf_connecting_ip: "203.0.113.42",
  x_real_ip: "10.0.0.1",
  ua: "Mozilla/5.0 (X11; Linux) Chrome/120",
  server_ts: "2026-05-06T22:00:00.000Z",
};

describe("pseudonymizeContext — research_lead view (canSeeRaw=false)", () => {
  it("masks every sensitive network field", () => {
    const out = pseudonymizeContext(RAW_CONTEXT, false);
    for (const k of SENSITIVE_NETWORK_FIELDS) {
      expect(out[k], `field ${k}`).toMatch(/^‹masked:[a-z0-9]{1,6}›$/);
      expect(out[k]).not.toBe((RAW_CONTEXT as Record<string, unknown>)[k]);
    }
  });

  it("never leaks raw IP / UA substrings", () => {
    const serialized = JSON.stringify(pseudonymizeContext(RAW_CONTEXT, false));
    expect(serialized).not.toContain("203.0.113.42");
    expect(serialized).not.toContain("10.0.0.1");
    expect(serialized).not.toContain("Mozilla");
    expect(serialized).not.toContain("Chrome");
  });

  it("preserves non-sensitive fields verbatim (auditability)", () => {
    const out = pseudonymizeContext(RAW_CONTEXT, false);
    expect(out.request_id).toBe("r-abc-123");
    expect(out.reason).toBe("role_forbidden");
    expect(out.role).toBe("physician");
    expect(out.server_ts).toBe("2026-05-06T22:00:00.000Z");
  });

  it("emits a stable mask for the same input (correlation across events)", () => {
    const a = pseudonymizeContext(RAW_CONTEXT, false);
    const b = pseudonymizeContext({ ...RAW_CONTEXT }, false);
    expect(a.ip).toBe(b.ip);
    expect(a.xff).toBe(b.xff);
    expect(a.ua).toBe(b.ua);
  });

  it("emits a different mask for a different input (no collisions for trivial cases)", () => {
    const m1 = maskValue("203.0.113.42");
    const m2 = maskValue("203.0.113.43");
    expect(m1).not.toBe(m2);
  });

  it("returns empty string for empty / null sensitive values, never raw markers", () => {
    const ctx = { ip: "", xff: null, request_id: "r-x" } as Record<string, unknown>;
    const out = pseudonymizeContext(ctx, false);
    expect(out.ip).toBe("");
    expect(out.xff).toBe(null);
    expect(out.request_id).toBe("r-x");
  });
});

describe("pseudonymizeContext — admin / super_admin view (canSeeRaw=true)", () => {
  it("returns IP / UA / forwarded headers untouched", () => {
    const out = pseudonymizeContext(RAW_CONTEXT, true);
    for (const k of SENSITIVE_NETWORK_FIELDS) {
      expect(out[k]).toBe((RAW_CONTEXT as Record<string, unknown>)[k]);
    }
  });

  it("does not mutate the input object", () => {
    const original = { ...RAW_CONTEXT };
    pseudonymizeContext(RAW_CONTEXT, true);
    expect(RAW_CONTEXT).toEqual(original);
  });

  it("handles a null context gracefully", () => {
    expect(pseudonymizeContext(null, true)).toEqual({});
    expect(pseudonymizeContext(null, false)).toEqual({});
  });
});
