import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Toast / config mocks — keep render path inert so this file isolates
// analytics behavior.
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), dismiss: vi.fn() },
}));

const rpcMock: ReturnType<typeof vi.fn> = vi.fn((..._args: unknown[]) => ({
  then: (cb: (r: { error: unknown }) => void) => cb({ error: null }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: rpcMock },
}));

import {
  showGuardDenialToast,
  __resetGuardToastDedup,
  __resetGuardToastConfig,
} from "@/lib/protocolGuardToast";
import { recordGuardToastEvent } from "@/lib/protocolGuardAnalytics";

describe("protocolGuardAnalytics", () => {
  beforeEach(() => {
    rpcMock.mockClear();
    __resetGuardToastDedup();
    __resetGuardToastConfig();
  });

  afterEach(() => {
    __resetGuardToastDedup();
    __resetGuardToastConfig();
  });

  // -------------------------------------------------------------------
  // recordGuardToastEvent — direct contract
  // -------------------------------------------------------------------

  it("posts to log_governance_event with the expected payload", () => {
    recordGuardToastEvent("guard_toast.impression", {
      action: "protocol.view",
      status: 403,
      requestId: "srv-req-1",
    });

    expect(rpcMock).toHaveBeenCalledTimes(1);
    const [fnName, args] = rpcMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(fnName).toBe("log_governance_event");
    expect(args._category).toBe("ui");
    expect(args._action).toBe("guard_toast.impression");
    expect(args._severity).toBe("info");
    const ctx = args._context as Record<string, unknown>;
    expect(ctx.guard_action).toBe("protocol.view");
    expect(ctx.status).toBe(403);
    expect(ctx.request_id).toBe("srv-req-1");
    expect(ctx.is_expected_denial).toBe(true);
  });

  it("flags non-denial statuses as is_expected_denial=false", () => {
    recordGuardToastEvent("guard_toast.impression", {
      action: "protocol.view",
      status: 500,
    });
    const ctx = (rpcMock.mock.calls[0][1] as Record<string, unknown>)
      ._context as Record<string, unknown>;
    expect(ctx.is_expected_denial).toBe(false);
    expect(ctx.request_id).toBeNull();
  });

  it("never throws when the supabase client throws synchronously", () => {
    rpcMock.mockImplementationOnce(() => {
      throw new Error("client offline");
    });
    expect(() =>
      recordGuardToastEvent("guard_toast.impression", {
        action: "a",
        status: 403,
      }),
    ).not.toThrow();
  });

  it("swallows RPC-level errors without re-throwing", () => {
    rpcMock.mockImplementationOnce(() => ({
      then: (cb: (r: { error: { message: string } }) => void) =>
        cb({ error: { message: "denied" } }),
    }));
    expect(() =>
      recordGuardToastEvent("guard_toast.impression", {
        action: "a",
        status: 403,
        requestId: "r",
      }),
    ).not.toThrow();
  });

  // -------------------------------------------------------------------
  // Toast helper integration — impression + click events
  // -------------------------------------------------------------------

  it("emits an impression event each time showGuardDenialToast is called", async () => {
    const { toast } = await import("sonner");
    const errorMock = toast.error as unknown as ReturnType<typeof vi.fn>;
    errorMock.mockClear();

    showGuardDenialToast({
      action: "protocol.view",
      status: 403,
      requestId: "imp-1",
    });

    const impressionCalls = rpcMock.mock.calls.filter(
      (c) => (c[1] as { _action: string })._action === "guard_toast.impression",
    );
    expect(impressionCalls).toHaveLength(1);
    const ctx = (impressionCalls[0][1] as Record<string, unknown>)._context as Record<string, unknown>;
    expect(ctx.request_id).toBe("imp-1");
    expect(ctx.status).toBe(403);
  });

  it("emits guard_toast.copy_request_id when the Copy action is clicked", async () => {
    const { toast } = await import("sonner");
    const errorMock = toast.error as unknown as ReturnType<typeof vi.fn>;
    errorMock.mockClear();

    showGuardDenialToast({
      action: "protocol.view",
      status: 403,
      requestId: "copy-1",
    });

    const opts = errorMock.mock.calls[0][1] as {
      action: { onClick: () => void };
    };
    rpcMock.mockClear();
    opts.action.onClick();

    expect(rpcMock).toHaveBeenCalledTimes(1);
    const args = rpcMock.mock.calls[0][1] as Record<string, unknown>;
    expect(args._action).toBe("guard_toast.copy_request_id");
    const ctx = args._context as Record<string, unknown>;
    expect(ctx.request_id).toBe("copy-1");
  });

  it("emits guard_toast.view_audit_clicked when the audit-log link is used", async () => {
    const { toast } = await import("sonner");
    const errorMock = toast.error as unknown as ReturnType<typeof vi.fn>;
    errorMock.mockClear();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    showGuardDenialToast({
      action: "protocol.view",
      status: 429,
      requestId: "view-1",
    });

    const opts = errorMock.mock.calls[0][1] as {
      cancel: { onClick: () => void };
    };
    rpcMock.mockClear();
    opts.cancel.onClick();

    expect(rpcMock).toHaveBeenCalledTimes(1);
    const args = rpcMock.mock.calls[0][1] as Record<string, unknown>;
    expect(args._action).toBe("guard_toast.view_audit_clicked");
    const ctx = args._context as Record<string, unknown>;
    expect(ctx.status).toBe(429);
    expect(ctx.request_id).toBe("view-1");

    openSpy.mockRestore();
  });
});
