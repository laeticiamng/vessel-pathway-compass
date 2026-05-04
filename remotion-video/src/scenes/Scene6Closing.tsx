import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";

export const Scene6Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sBig = spring({ frame, fps, config: { damping: 18, stiffness: 70 } });
  const oSub = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const oDis = interpolate(frame, [60, 95], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep, fontFamily: FONT, color: COLORS.ink, padding: 120, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 26, letterSpacing: 8, color: COLORS.cyan, textTransform: "uppercase", opacity: oSub }}>VASCU-LINK</div>
      <div style={{ fontSize: 130, fontWeight: 800, lineHeight: 1, letterSpacing: -5, marginTop: 24,
        opacity: sBig, transform: `scale(${0.9 + sBig * 0.1})`, maxWidth: 1600 }}>
        A non-ionizing<br/>vascular workflow.
      </div>
      <div style={{ fontSize: 32, color: COLORS.inkDim, marginTop: 40, opacity: oSub, maxWidth: 1300, lineHeight: 1.4 }}>
        Built with clinicians at CHUV / UNIL — Lausanne.
      </div>
      <div style={{ position: "absolute", bottom: 80, fontSize: 18, color: COLORS.inkDim, opacity: oDis, maxWidth: 1500, lineHeight: 1.5, textAlign: "center" }}>
        Research software in academic validation. Architecture designed to target MDR / GDPR / IEC 62304 / ISO 14971 — not certified at this stage.<br/>
        Not for clinical use outside approved research protocols.
      </div>
    </AbsoluteFill>
  );
};
