import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";

export const Scene1Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sLogo = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const oSub = interpolate(frame, [25, 55], [0, 1], { extrapolateRight: "clamp" });
  const oTag = interpolate(frame, [55, 85], [0, 1], { extrapolateRight: "clamp" });
  const oRule = interpolate(frame, [70, 110], [0, 1], { extrapolateRight: "clamp" });
  const wRule = interpolate(frame, [70, 130], [0, 540]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep, fontFamily: FONT, color: COLORS.ink, padding: 140, justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 80, left: 140, fontSize: 18, letterSpacing: 6, color: COLORS.cyan, opacity: oSub, textTransform: "uppercase" }}>
        Doctoral research programme · CHUV / UNIL · Lausanne
      </div>
      <div style={{ fontSize: 200, fontWeight: 800, letterSpacing: -6, lineHeight: 1, transform: `translateY(${(1 - sLogo) * 40}px)`, opacity: sLogo }}>
        VASCU-LINK
      </div>
      <div style={{ marginTop: 28, fontSize: 36, fontWeight: 400, color: COLORS.inkDim, opacity: oSub }}>
        AquaMR Flow Platform
      </div>
      <div style={{ marginTop: 60, height: 2, width: wRule, background: `linear-gradient(90deg, ${COLORS.cyan}, transparent)`, opacity: oRule }} />
      <div style={{ marginTop: 28, fontSize: 32, maxWidth: 1100, lineHeight: 1.3, opacity: oTag }}>
        Reconstructing angiographic function in <strong style={{ color: COLORS.cyan }}>4-zero</strong>:
        0 mSv · 0 contrast · 0 helium.
      </div>
    </AbsoluteFill>
  );
};
