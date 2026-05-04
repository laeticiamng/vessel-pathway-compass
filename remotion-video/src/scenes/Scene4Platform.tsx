import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";

const MODULES = [
  { t: "AquaMR", d: "Low-field MR mapping" },
  { t: "Doppler fusion", d: "Multimodal vascular imaging" },
  { t: "C4-i score", d: "Concordance & discordance" },
  { t: "PROMs", d: "Patient-reported outcomes" },
  { t: "Decision cockpit", d: "Pre-revascularization" },
  { t: "Registry", d: "Outcomes & traceability" },
];

export const Scene4Platform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oTitle = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: FONT, color: COLORS.ink, padding: 120, justifyContent: "center" }}>
      <div style={{ fontSize: 22, letterSpacing: 6, color: COLORS.teal, opacity: oTitle, textTransform: "uppercase" }}>AquaMR Flow Platform</div>
      <div style={{ fontSize: 84, fontWeight: 700, marginTop: 16, opacity: oTitle, lineHeight: 1.05, maxWidth: 1500 }}>
        One clinical cockpit, six integrated modules.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 80 }}>
        {MODULES.map((m, i) => {
          const s = spring({ frame: frame - 30 - i * 6, fps, config: { damping: 16 } });
          return (
            <div key={m.t} style={{
              borderLeft: `3px solid ${COLORS.teal}`, padding: "20px 28px",
              background: "rgba(20,184,166,0.05)",
              opacity: s, transform: `translateX(${(1 - s) * -30}px)`,
            }}>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>{m.t}</div>
              <div style={{ fontSize: 20, color: COLORS.inkDim, marginTop: 4 }}>{m.d}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
