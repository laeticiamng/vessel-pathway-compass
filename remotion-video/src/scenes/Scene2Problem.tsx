import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";

const STATS = [
  { value: "237M", label: "patients with PAD worldwide" },
  { value: "30%", label: "of frail patients excluded by iodinated contrast" },
  { value: "1 He", label: "non-renewable cryogen for conventional MRI" },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oTitle = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: FONT, color: COLORS.ink, padding: 140, justifyContent: "center" }}>
      <div style={{ fontSize: 22, letterSpacing: 5, color: COLORS.amber, opacity: oTitle, textTransform: "uppercase" }}>The clinical gap</div>
      <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.05, marginTop: 24, maxWidth: 1500, opacity: oTitle }}>
        Vascular imaging still depends on <span style={{ color: COLORS.amber }}>radiation</span>, <span style={{ color: COLORS.amber }}>iodine</span>, and <span style={{ color: COLORS.amber }}>helium</span>.
      </div>
      <div style={{ display: "flex", gap: 60, marginTop: 90 }}>
        {STATS.map((s, i) => {
          const sIn = spring({ frame: frame - 30 - i * 12, fps, config: { damping: 15 } });
          return (
            <div key={s.label} style={{ flex: 1, opacity: sIn, transform: `translateY(${(1 - sIn) * 30}px)` }}>
              <div style={{ fontSize: 110, fontWeight: 800, color: COLORS.cyan, letterSpacing: -4 }}>{s.value}</div>
              <div style={{ fontSize: 24, color: COLORS.inkDim, marginTop: 8, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
