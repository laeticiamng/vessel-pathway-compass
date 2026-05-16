import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), dismiss: vi.fn() },
}));

import { toast } from "sonner";
import {
  showGuardDenialToast,
  configureGuardToast,
  getGuardToastConfig,
  __resetGuardToastConfig,
  __resetGuardToastDedup,
} from "@/lib/protocolGuardToast";

const errorMock = toast.error as unknown as ReturnType<typeof vi.fn>;

describe("protocol guard toast configuration", () => {
  beforeEach(() => {
    __resetGuardToastConfig();
    __resetGuardToastDedup();
    errorMock.mockReset();
  });

  afterEach(() => {
    __resetGuardToastConfig();
    __resetGuardToastDedup();
  });

  it("exposes sensible defaults (enabled, 12s, details shown)", () => {
    const cfg = getGuardToastConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.duration).toBe(12_000);
    expect(cfg.showErrorDetails).toBe(true);
  });

  it("merges partial overrides without dropping untouched fields", () => {
    configureGuardToast({ duration: 4_000 });
    const cfg = getGuardToastConfig();
    expect(cfg.duration).toBe(4_000);
    expect(cfg.enabled).toBe(true);
    expect(cfg.showErrorDetails).toBe(true);
  });

  it("returns a defensive copy from getGuardToastConfig", () => {
    const cfg = getGuardToastConfig();
    cfg.enabled = false;
    expect(getGuardToastConfig().enabled).toBe(true);
  });

  // -------------------------------------------------------------------
  // Behavior wiring — the helper must consult the LIVE config on every
  // call (not snapshot it at module load).
  // -------------------------------------------------------------------

  it("suppresses the toast entirely when enabled=false", () => {
    configureGuardToast({ enabled: false });
    showGuardDenialToast({
      action: "protocol.view",
      status: 403,
      requestId: "r1",
      error: "Forbidden",
    });
    expect(errorMock).not.toHaveBeenCalled();
  });

  it("honors a custom duration on each call", () => {
    configureGuardToast({ duration: 2_500 });
    showGuardDenialToast({
      action: "protocol.view",
      status: 403,
      requestId: "r1",
    });
    const opts = errorMock.mock.calls[0][1] as { duration: number };
    expect(opts.duration).toBe(2_500);
  });

  it("hides the server error line when showErrorDetails=false", () => {
    configureGuardToast({ showErrorDetails: false });
    showGuardDenialToast({
      action: "protocol.view",
      status: 403,
      requestId: "r1",
      error: "Forbidden: secret table",
    });
    const opts = errorMock.mock.calls[0][1] as { description: string };
    expect(opts.description).toContain("Action: protocol.view");
    expect(opts.description).toContain("Request-Id: r1");
    expect(opts.description).not.toContain("secret table");
  });

  it("still shows the server error line by default", () => {
    showGuardDenialToast({
      action: "protocol.view",
      status: 403,
      requestId: "r1",
      error: "Forbidden: secret table",
    });
    const opts = errorMock.mock.calls[0][1] as { description: string };
    expect(opts.description).toContain("Forbidden: secret table");
  });

  it("__resetGuardToastConfig restores defaults", () => {
    configureGuardToast({ enabled: false, duration: 1, showErrorDetails: false });
    __resetGuardToastConfig();
    const cfg = getGuardToastConfig();
    expect(cfg).toEqual({
      enabled: true,
      duration: 12_000,
      showErrorDetails: true,
    });
  });
});
