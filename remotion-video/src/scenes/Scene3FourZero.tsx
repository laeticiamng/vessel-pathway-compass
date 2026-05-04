import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";

const ZEROS = [
  { v: "0", unit: "mSv", label: "Ionizing radiation" },
  { v: "0", unit: "Gd / I", label: "Iodinated or gadolinium contrast" },
  { v: "0", unit: "He", label: "Helium cryogen (low-field MR)" },
  { v: "<15k€", unit: "BoM", label: "Target hardware cost — frugal device" },
];

export const Scene3FourZero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oTitle = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep, fontFamily: FONT, color: COLORS.ink, padding: 120, justifyContent: "center" }}>
      <div style={{ fontSize: 22, letterSpacing: 6, color: COLORS.cyan, opacity: oTitle, textTransform: "uppercase" }}>The 4-zero approach</div>
      <div style={{ fontSize: 92, fontWeight: 800, marginTop: 16, lineHeight: 1, opacity: oTitle, letterSpacing: -3 }}>
        A vascular workflow that <span style={{ color: COLORS.cyan }}>removes</span> what harms.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 32, marginTop: 90 }}>
        {ZEROS.map((z, i) => {
          const s = spring({ frame: frame - 25 - i * 10, fps, config: { damping: 14, stiffness: 110 } });
          return (
            <div key={z.label} style={{
              border: `1px solid ${COLORS.rule}`, borderRadius: 24, padding: 36,
              background: "rgba(34,211,238,0.04)",
              opacity: s, transform: `translateY(${(1 - s) * 40}px) scale(${0.95 + s * 0.05})`,
            }}>
              <div style={{ fontSize: 100, fontWeight: 800, color: COLORS.cyan, letterSpacing: -4, lineHeight: 1 }}>{z.v}</div>
              <div style={{ fontSize: 24, fontWeight: 600, marginTop: 6 }}>{z.unit}</div>
              <div style={{ fontSize: 18, color: COLORS.inkDim, marginTop: 12, lineHeight: 1.4 }}>{z.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
