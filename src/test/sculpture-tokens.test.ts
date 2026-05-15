import { describe, it, expect } from "vitest";
import { EASE, DURATION, SPRING, DEPTH, MAGNETIC, PARALLAX } from "@/lib/sculpture/tokens";

describe("sculpture/tokens", () => {
  it("exposes all signature easings as 4-tuples", () => {
    for (const k of Object.keys(EASE) as (keyof typeof EASE)[]) {
      expect(EASE[k]).toHaveLength(4);
      EASE[k].forEach((n) => expect(typeof n).toBe("number"));
    }
  });

  it("durations are short enough for an Awwwards rhythm (<= 1.2s)", () => {
    Object.values(DURATION).forEach((d) => {
      expect(d).toBeGreaterThan(0);
      expect(d).toBeLessThanOrEqual(1.2);
    });
  });

  it("spring presets define stiffness/damping", () => {
    Object.values(SPRING).forEach((s) => {
      expect(s.type).toBe("spring");
      expect(s.stiffness).toBeGreaterThan(0);
      expect(s.damping).toBeGreaterThan(0);
    });
  });

  it("depth shadows reference HSL tokens (no hard-coded colors)", () => {
    Object.values(DEPTH).forEach((shadow) => {
      expect(shadow).toMatch(/hsl\(var\(--/);
      expect(shadow).not.toMatch(/#[0-9a-f]{3,8}/i);
      expect(shadow).not.toMatch(/rgb\(/);
    });
  });

  it("magnetic and parallax presets are bounded", () => {
    Object.values(MAGNETIC).forEach((v) => {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(20);
    });
    Object.values(PARALLAX).forEach((v) => {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  });
});
