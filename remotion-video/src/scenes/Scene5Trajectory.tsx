import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";

const STEPS = [
  { k: "L1", t: "Single-arm prospective diagnostic study", s: "PAD cohort — frailty & CKD subgroups" },
  { k: "L2", t: "Simulation-based feasibility", s: "Decision cockpit & clinician workflow" },
  { k: "L3", t: "Preclinical guidance", s: "Toward non-ionizing intervention" },
];

export const Scene5Trajectory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oTitle = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [30, 110], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep, fontFamily: FONT, color: COLORS.ink, padding: 120, justifyContent: "center" }}>
      <div style={{ fontSize: 22, letterSpacing: 6, color: COLORS.cyan, opacity: oTitle, textTransform: "uppercase" }}>Doctoral trajectory</div>
      <div style={{ fontSize: 80, fontWeight: 700, marginTop: 16, opacity: oTitle, maxWidth: 1500, lineHeight: 1.05 }}>
        From diagnostic concordance to preclinical guidance.
      </div>
      <div style={{ position: "relative", marginTop: 100 }}>
        <div style={{ position: "absolute", top: 36, left: 36, right: 36, height: 2, background: COLORS.rule }} />
        <div style={{ position: "absolute", top: 36, left: 36, height: 2, background: COLORS.cyan, width: `calc(${lineW * 100}% - 72px)` }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 48 }}>
          {STEPS.map((st, i) => {
            const s = spring({ frame: frame - 40 - i * 18, fps, config: { damping: 14 } });
            return (
              <div key={st.k} style={{ opacity: s, transform: `translateY(${(1 - s) * 24}px)` }}>
                <div style={{ width: 72, height: 72, borderRadius: 36, background: COLORS.bgDeep, border: `3px solid ${COLORS.cyan}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 30, fontWeight: 800, color: COLORS.cyan }}>{st.k}</div>
                <div style={{ fontSize: 28, fontWeight: 600, marginTop: 24, lineHeight: 1.2 }}>{st.t}</div>
                <div style={{ fontSize: 19, color: COLORS.inkDim, marginTop: 8 }}>{st.s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
