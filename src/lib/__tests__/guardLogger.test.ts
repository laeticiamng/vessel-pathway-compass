import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  guardLog,
  configureGuardRemoteSink,
  createWebhookGuardSink,
  __internal,
} from "@/lib/guardLogger";

describe("guardLogger remote sink", () => {
  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    configureGuardRemoteSink(null);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("forwards events to the registered sink with sanitized payload", () => {
    const sink = vi.fn();
    configureGuardRemoteSink({ sink });

    guardLog.info({
      action: "protocol.view",
      status: 403,
      requestId: "req-1",
      message: "Forbidden",
      context: { role: "viewer", retryAfter: 30 },
    });

    expect(sink).toHaveBeenCalledTimes(1);
    const payload = sink.mock.calls[0][0];
    expect(payload).toMatchObject({
      level: "info",
      action: "protocol.view",
      status: 403,
      requestId: "req-1",
      message: "Forbidden",
      context: { role: "viewer", retryAfter: 30 },
    });
    expect(typeof payload.ts).toBe("string");
  });

  it("strips PII-blocklisted keys and non-scalar values", () => {
    const out = __internal.sanitizeContext({
      role: "admin",
      email: "leak@example.com", // blocklisted
      patient_id: "p-123",       // blocklisted
      token: "secret",           // blocklisted
      nested: { foo: "bar" },    // non-scalar
      list: [1, 2, 3],           // non-scalar
      ok: true,
      count: 4,
    });
    expect(out).toEqual({ role: "admin", ok: true, count: 4 });
  });

  it("respects the levels whitelist", () => {
    const sink = vi.fn();
    configureGuardRemoteSink({ sink, levels: ["warn"] });

    guardLog.info({ action: "a", status: 401, requestId: "r" });
    guardLog.debug({ action: "a", status: 200, requestId: "r" });
    expect(sink).not.toHaveBeenCalled();

    guardLog.warn({ action: "a", status: 500, requestId: "r" });
    expect(sink).toHaveBeenCalledTimes(1);
  });

  it("applies sampling to debug/info but never drops warn events", () => {
    const sink = vi.fn();
    configureGuardRemoteSink({ sink, sample: 0 });

    // sample=0 → info/debug suppressed
    guardLog.info({ action: "a", status: 403, requestId: "r" });
    guardLog.debug({ action: "a", status: 200, requestId: "r" });
    expect(sink).not.toHaveBeenCalled();

    // warn ALWAYS forwarded
    guardLog.warn({ action: "a", status: 500, requestId: "r" });
    expect(sink).toHaveBeenCalledTimes(1);
  });

  it("swallows sink failures so they never propagate", () => {
    const sink = vi.fn(() => {
      throw new Error("sink down");
    });
    configureGuardRemoteSink({ sink });

    expect(() =>
      guardLog.warn({ action: "a", status: 500, requestId: "r" }),
    ).not.toThrow();
  });

  it("swallows async sink rejections", async () => {
    const sink = vi.fn(() => Promise.reject(new Error("nope")));
    configureGuardRemoteSink({ sink });

    expect(() =>
      guardLog.warn({ action: "a", status: 500, requestId: "r" }),
    ).not.toThrow();
    // flush microtasks — the rejection handler must run without crashing
    await Promise.resolve();
    await Promise.resolve();
  });

  it("webhook sink POSTs the JSON payload with keepalive", () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response("{}")));
    vi.stubGlobal("fetch", fetchMock);

    const sink = createWebhookGuardSink("https://example.com/ingest", {
      headers: { "x-api-key": "k" },
    });
    configureGuardRemoteSink({ sink });

    guardLog.warn({
      action: "protocol.view",
      status: 500,
      requestId: "req-9",
      message: "boom",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.com/ingest");
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["x-api-key"]).toBe("k");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      level: "warn",
      action: "protocol.view",
      status: 500,
      requestId: "req-9",
      message: "boom",
    });
  });

  it("can be disabled by passing null", () => {
    const sink = vi.fn();
    configureGuardRemoteSink({ sink });
    configureGuardRemoteSink(null);

    guardLog.warn({ action: "a", status: 500, requestId: "r" });
    expect(sink).not.toHaveBeenCalled();
  });
});
