import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDisclaimerAcceptance } from "@/hooks/useDisclaimerAcceptance";
import { useLowResourceMode } from "@/hooks/useLowResourceMode";

const KEY = "vlink_disclaimer_accepted_v83";
const LR_KEY = "vlink_low_resource_mode";

describe("useDisclaimerAcceptance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts pending when storage is empty", () => {
    const { result } = renderHook(() => useDisclaimerAcceptance());
    expect(result.current.status).toBe("pending");
    expect(result.current.isPending).toBe(true);
  });

  it("persists acceptance and reflects accepted state", () => {
    const { result } = renderHook(() => useDisclaimerAcceptance());
    act(() => result.current.accept());
    expect(localStorage.getItem(KEY)).toBe("accepted");
    expect(result.current.isAccepted).toBe(true);
  });

  it("persists decline and reflects declined state", () => {
    const { result } = renderHook(() => useDisclaimerAcceptance());
    act(() => result.current.decline());
    expect(localStorage.getItem(KEY)).toBe("declined");
    expect(result.current.isDeclined).toBe(true);
  });

  it("reset clears storage and returns to pending", () => {
    localStorage.setItem(KEY, "accepted");
    const { result } = renderHook(() => useDisclaimerAcceptance());
    act(() => result.current.reset());
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(result.current.isPending).toBe(true);
  });
});

describe("useLowResourceMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to off when storage is empty", () => {
    const { result } = renderHook(() => useLowResourceMode());
    expect(result.current.enabled).toBe(false);
  });

  it("setMode true persists 'on'", () => {
    const { result } = renderHook(() => useLowResourceMode());
    act(() => result.current.setMode(true));
    expect(localStorage.getItem(LR_KEY)).toBe("on");
    expect(result.current.enabled).toBe(true);
  });

  it("toggle flips persisted state", () => {
    const { result } = renderHook(() => useLowResourceMode());
    act(() => result.current.toggle());
    expect(result.current.enabled).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.enabled).toBe(false);
  });
});
