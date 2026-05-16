import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

import { toast } from "sonner";
import {
  showGuardDenialToast,
  guardToastId,
  auditLogUrlForRequestId,
  __resetGuardToastDedup,
} from "@/lib/protocolGuardToast";

const errorMock = toast.error as unknown as ReturnType<typeof vi.fn>;
const dismissMock = toast.dismiss as unknown as ReturnType<typeof vi.fn>;

describe("showGuardDenialToast — dedup contract", () => {
  beforeEach(() => {
    __resetGuardToastDedup();
    errorMock.mockReset();
    dismissMock.mockReset();
  });

  afterEach(() => {
    __resetGuardToastDedup();
  });

  it("uses a stable id keyed on action+status", () => {
    expect(guardToastId("protocol.view", 403)).toBe("guard:protocol.view:403");
  });

  it("reuses the SAME id when the same action+status retries (replace-in-place)", () => {
    showGuardDenialToast({ action: "protocol.view", status: 403, requestId: "r1" });
    showGuardDenialToast({ action: "protocol.view", status: 403, requestId: "r2" });
    showGuardDenialToast({ action: "protocol.view", status: 403, requestId: "r3" });

    expect(errorMock).toHaveBeenCalledTimes(3);
    const ids = errorMock.mock.calls.map((c) => (c[1] as { id: string }).id);
    expect(new Set(ids).size).toBe(1);
    expect(ids[0]).toBe("guard:protocol.view:403");
    // No cross-status dismiss should fire — single status, same id.
    expect(dismissMock).not.toHaveBeenCalled();
  });

  it("dismisses the previous toast when status CHANGES for the same action", () => {
    showGuardDenialToast({ action: "protocol.view", status: 403, requestId: "r1" });
    showGuardDenialToast({ action: "protocol.view", status: 429, requestId: "r2" });

    expect(errorMock).toHaveBeenCalledTimes(2);
    // Old 403 toast for the SAME action must be dismissed before the
    // new 429 toast is rendered — no stacking.
    expect(dismissMock).toHaveBeenCalledTimes(1);
    expect(dismissMock).toHaveBeenCalledWith("guard:protocol.view:403");
  });

  it("does NOT dismiss anything when DIFFERENT actions deny in parallel", () => {
    showGuardDenialToast({
      action: "protocol.view",
      status: 403,
      requestId: "rA",
    });
    showGuardDenialToast({
      action: "protocol.export.audit_log.csv",
      status: 429,
      requestId: "rB",
    });

    expect(errorMock).toHaveBeenCalledTimes(2);
    const ids = errorMock.mock.calls.map((c) => (c[1] as { id: string }).id);
    expect(ids).toEqual([
      "guard:protocol.view:403",
      "guard:protocol.export.audit_log.csv:429",
    ]);
    // Independent actions → independent slots → no dismiss.
    expect(dismissMock).not.toHaveBeenCalled();
  });

  it("clears the per-action slot on close so future verdicts don't reference a stale id", () => {
    showGuardDenialToast({ action: "protocol.view", status: 403, requestId: "r1" });

    // Simulate sonner auto-closing the toast.
    const opts = errorMock.mock.calls[0][1] as { onAutoClose?: () => void };
    opts.onAutoClose?.();

    // A NEW status for the same action should now NOT try to dismiss the
    // freed-up slot (would be a no-op anyway, but the slot must be empty).
    showGuardDenialToast({ action: "protocol.view", status: 429, requestId: "r2" });

    expect(dismissMock).not.toHaveBeenCalled();
  });
});
