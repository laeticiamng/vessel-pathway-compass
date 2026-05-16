import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------
// Mocks MUST be declared before importing the module under test so that
// the hook picks up the mocked toast helper (vi.mock is hoisted).
// ---------------------------------------------------------------------
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

vi.mock("@/lib/protocolGuardToast", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/protocolGuardToast")
  >("@/lib/protocolGuardToast");
  return {
    ...actual,
    // Spy on the public toast entry point — preserve `isExpectedDenial`
    // so the hook's gating logic still routes correctly.
    showGuardDenialToast: vi.fn(),
  };
});

import { callProtocolAccessGuard } from "@/hooks/useProtocolGuard";
import { supabase } from "@/integrations/supabase/client";
import { showGuardDenialToast } from "@/lib/protocolGuardToast";

const getSession = supabase.auth.getSession as unknown as ReturnType<
  typeof vi.fn
>;
const toastSpy = showGuardDenialToast as unknown as ReturnType<typeof vi.fn>;

function mockSession(token: string | null) {
  getSession.mockResolvedValue({
    data: { session: token ? { access_token: token } : null },
  });
}

function mockFetchResponse(init: {
  ok: boolean;
  status: number;
  body?: unknown;
  requestIdHeader?: string;
}) {
  const headers = new Headers();
  if (init.requestIdHeader) headers.set("x-request-id", init.requestIdHeader);
  return {
    ok: init.ok,
    status: init.status,
    headers,
    json: async () => init.body ?? null,
  } as unknown as Response;
}

describe("protocol guard → toast integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------
  // Denied verdicts → exactly one toast (when notifyOnDenied:true)
  // -------------------------------------------------------------------

  it("fires exactly ONE toast on a 401 denial when notifyOnDenied=true", async () => {
    mockSession(null); // 401 short-circuit path
    const result = await callProtocolAccessGuard(
      "protocol.export.audit_log.csv",
      { notifyOnDenied: true },
    );

    expect(result.status).toBe(401);
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        action: "protocol.export.audit_log.csv",
        requestId: result.requestId,
      }),
    );
  });

  it("fires exactly ONE toast on a 403 verdict when notifyOnDenied=true", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({
        ok: false,
        status: 403,
        body: { error: "Forbidden", request_id: "srv-403" },
        requestIdHeader: "srv-403",
      }),
    );

    await callProtocolAccessGuard("protocol.view", { notifyOnDenied: true });

    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        action: "protocol.view",
        requestId: "srv-403",
        error: "Forbidden",
      }),
    );
  });

  it("fires exactly ONE toast on a 429 throttled verdict when notifyOnDenied=true", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({
        ok: false,
        status: 429,
        body: { error: "Too many requests", request_id: "srv-429" },
        requestIdHeader: "srv-429",
      }),
    );

    await callProtocolAccessGuard("protocol.export.compliance.json", {
      notifyOnDenied: true,
    });

    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 429, requestId: "srv-429" }),
    );
  });

  // -------------------------------------------------------------------
  // Silent gates (view guard / disabled notifications) → NEVER a toast
  // -------------------------------------------------------------------

  it("never toasts when notifyOnDenied is omitted (silent view-guard path)", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({
        ok: false,
        status: 403,
        body: { error: "Forbidden" },
      }),
    );

    await callProtocolAccessGuard("protocol.view");
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("never toasts when notifyOnDenied=false even on 401/403/429", async () => {
    mockSession("tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;

    for (const status of [401, 403, 429]) {
      fetchMock.mockResolvedValueOnce(
        mockFetchResponse({ ok: false, status, body: { error: "denied" } }),
      );
      await callProtocolAccessGuard("protocol.view", {
        notifyOnDenied: false,
      });
    }

    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("never toasts on a no-session 401 when notifications are disabled", async () => {
    mockSession(null);
    await callProtocolAccessGuard("protocol.view"); // notifyOnDenied unset
    expect(toastSpy).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // Granted / unexpected statuses → no toast even with notifyOnDenied
  // -------------------------------------------------------------------

  it("does NOT toast on a 200 granted verdict", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({
        ok: true,
        status: 200,
        body: { ok: true, role: "admin" },
      }),
    );

    await callProtocolAccessGuard("protocol.view", { notifyOnDenied: true });
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("does NOT toast on a 500/network failure (not an EXPECTED denial)", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({ ok: false, status: 500, body: { error: "boom" } }),
    );

    await callProtocolAccessGuard("protocol.view", { notifyOnDenied: true });
    // 500s are surfaced via the inline error block, not the toast pipeline
    // (toast helper is reserved for EXPECTED guard verdicts: 401/403/429).
    expect(toastSpy).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // No duplicate toasts across rapid back-to-back denials
  // -------------------------------------------------------------------

  it("toasts once per call (rapid back-to-back 403s emit exactly N toasts)", async () => {
    mockSession("tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(
      mockFetchResponse({ ok: false, status: 403, body: { error: "no" } }),
    );

    await Promise.all([
      callProtocolAccessGuard("protocol.view", { notifyOnDenied: true }),
      callProtocolAccessGuard("protocol.view", { notifyOnDenied: true }),
      callProtocolAccessGuard("protocol.view", { notifyOnDenied: true }),
    ]);

    // Each call emits one toast — sonner's stable `id` (handled inside
    // `showGuardDenialToast`) is what dedupes them at render time. The
    // helper itself MUST still be invoked once per call.
    expect(toastSpy).toHaveBeenCalledTimes(3);
  });
});
