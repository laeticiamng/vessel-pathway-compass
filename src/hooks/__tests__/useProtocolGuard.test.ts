import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the supabase client BEFORE importing the hook module.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { callProtocolAccessGuard } from "@/hooks/useProtocolGuard";
import { supabase } from "@/integrations/supabase/client";

const getSessionMock = supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>;

function mockSession(token: string | null) {
  getSessionMock.mockResolvedValue({
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

describe("callProtocolAccessGuard", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

  beforeEach(() => {
    // NOTE: do NOT use vi.restoreAllMocks() here — it would restore the
    // console spies installed at describe() scope and silently break the
    // level-mapping assertions below.
    vi.clearAllMocks();
    errorSpy.mockClear();
    warnSpy.mockClear();
    infoSpy.mockClear();
    debugSpy.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Pull every `[protocol-guard]` payload routed to a given spy and
   * return the `requestId` field of each entry. Lets us assert that the
   * same correlation id flows through every log emitted during a call.
   */
  function requestIdsFrom(spy: ReturnType<typeof vi.spyOn>): Array<string | undefined> {
    return spy.mock.calls
      .filter((args) => args[0] === "[protocol-guard]")
      .map((args) => (args[2] as { requestId?: string } | undefined)?.requestId);
  }


  it("returns 401 when there is no session (no fetch issued)", async () => {
    mockSession(null);
    const result = await callProtocolAccessGuard("protocol.view");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toBe("Not authenticated");
    expect(result.requestId).toBeDefined();
    expect(fetch).not.toHaveBeenCalled();
    // No fatal console.error — UI must not flag this as a crash.
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("returns a structured 403 verdict WITHOUT throwing or console.error", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({
        ok: false,
        status: 403,
        body: { error: "Forbidden", request_id: "srv-req-123" },
        requestIdHeader: "srv-req-123",
      }),
    );

    const result = await callProtocolAccessGuard("protocol.view");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toBe("Forbidden");
    expect(result.requestId).toBe("srv-req-123");
    // CRITICAL: a 403 is an EXPECTED server verdict, not a fatal error.
    // It must never trigger console.error (which Lovable's dev overlay
    // catches and turns into a "blank screen" panic).
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("returns 500 with error message when fetch rejects (network failure)", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("network down"),
    );

    const result = await callProtocolAccessGuard("protocol.view");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error).toContain("network down");
    expect(result.requestId).toBeDefined();
  });

  it("returns 500 when the server replies 500", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({
        ok: false,
        status: 500,
        body: { error: "Internal" },
      }),
    );

    const result = await callProtocolAccessGuard("protocol.view");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error).toBe("Internal");
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("returns ok=true with role on 200 success", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({
        ok: true,
        status: 200,
        body: { ok: true, role: "admin", request_id: "ok-1" },
      }),
    );

    const result = await callProtocolAccessGuard("protocol.view");
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.role).toBe("admin");
    expect(result.requestId).toBe("ok-1");
  });

  it("falls back to HTTP <status> when server provides no error body", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({ ok: false, status: 403, body: null }),
    );

    const result = await callProtocolAccessGuard("protocol.view");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toBe("HTTP 403");
  });

  // ---------------------------------------------------------------------
  // Logger level mapping + request-id propagation
  //
  // The guardLogger contract states:
  //   - 2xx       → console.debug
  //   - 401 / 403 → console.info   (expected denials — never fatal)
  //   - 5xx / 0   → console.warn   (unexpected; still never console.error)
  // Every emitted line MUST carry the SAME request-id so operators can
  // correlate the client log with the server-side governance_events row.
  // ---------------------------------------------------------------------

  it("logs 401 (no session) at info level and never at error/warn", async () => {
    mockSession(null);
    const result = await callProtocolAccessGuard("protocol.view");

    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    const ids = requestIdsFrom(infoSpy);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(1);
    expect(ids[0]).toBe(result.requestId);
  });

  it("logs 403 verdicts at info level and propagates the server request-id", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({
        ok: false,
        status: 403,
        body: { error: "Forbidden", request_id: "srv-req-403" },
        requestIdHeader: "srv-req-403",
      }),
    );

    const result = await callProtocolAccessGuard("protocol.view");

    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    const ids = requestIdsFrom(infoSpy);
    expect(ids).toContain("srv-req-403");
    // Single call → single id across every emitted line.
    expect(new Set(ids).size).toBe(1);
    expect(result.requestId).toBe("srv-req-403");
  });

  it("logs 5xx verdicts at warn level (not error) with a stable request-id", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFetchResponse({
        ok: false,
        status: 500,
        body: { error: "Internal", request_id: "srv-req-500" },
        requestIdHeader: "srv-req-500",
      }),
    );

    const result = await callProtocolAccessGuard("protocol.view");

    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    const ids = requestIdsFrom(warnSpy);
    expect(ids).toContain("srv-req-500");
    expect(new Set(ids).size).toBe(1);
    expect(result.requestId).toBe("srv-req-500");
  });

  it("logs network/transport failures at warn level with the client request-id", async () => {
    mockSession("tok");
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("network down"),
    );

    const result = await callProtocolAccessGuard("protocol.view");

    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    const ids = requestIdsFrom(warnSpy);
    expect(ids.length).toBeGreaterThan(0);
    // No server response → the client-issued id is the only correlation
    // handle. It MUST be reused across every log line for that call.
    expect(new Set(ids).size).toBe(1);
    expect(ids[0]).toBe(result.requestId);
  });
});

