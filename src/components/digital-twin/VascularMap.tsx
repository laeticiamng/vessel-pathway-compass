import { useState } from "react";

// Vascular segments with SVG path data for a human body outline
// Each segment has: id, label, side (left/right/center), vessel type, and SVG coordinates
export interface VascularSegment {
  id: string;
  label: string;
  vessel: string;
  side: "left" | "right" | "center";
  // SVG rect or path area for click target
  x: number;
  y: number;
  width: number;
  height: number;
  // Measurement sites this maps to
  measurementSites: string[];
}

export const VASCULAR_SEGMENTS: VascularSegment[] = [
  // Head / Neck
  { id: "carotid-r", label: "Right Carotid", vessel: "carotid", side: "right", x: 138, y: 42, width: 18, height: 40, measurementSites: ["right carotid", "carotid right", "r carotid"] },
  { id: "carotid-l", label: "Left Carotid", vessel: "carotid", side: "left", x: 164, y: 42, width: 18, height: 40, measurementSites: ["left carotid", "carotid left", "l carotid"] },

  // Thoracic / Abdominal Aorta
  { id: "aorta-thoracic", label: "Thoracic Aorta", vessel: "aorta", side: "center", x: 152, y: 90, width: 16, height: 50, measurementSites: ["thoracic aorta", "aorta thoracic"] },
  { id: "aorta-abdominal", label: "Abdominal Aorta", vessel: "aorta", side: "center", x: 152, y: 145, width: 16, height: 50, measurementSites: ["abdominal aorta", "aorta abdominal", "aaa"] },

  // Iliac
  { id: "iliac-r", label: "Right Iliac", vessel: "iliac", side: "right", x: 135, y: 200, width: 20, height: 35, measurementSites: ["right iliac", "iliac right", "r iliac"] },
  { id: "iliac-l", label: "Left Iliac", vessel: "iliac", side: "left", x: 165, y: 200, width: 20, height: 35, measurementSites: ["left iliac", "iliac left", "l iliac"] },

  // Femoral (CFA + SFA)
  { id: "femoral-r", label: "Right Femoral", vessel: "femoral", side: "right", x: 130, y: 240, width: 22, height: 60, measurementSites: ["right femoral", "femoral right", "r femoral", "right sfa", "sfa right", "right cfa"] },
  { id: "femoral-l", label: "Left Femoral", vessel: "femoral", side: "left", x: 168, y: 240, width: 22, height: 60, measurementSites: ["left femoral", "femoral left", "l femoral", "left sfa", "sfa left", "left cfa"] },

  // Popliteal
  { id: "popliteal-r", label: "Right Popliteal", vessel: "popliteal", side: "right", x: 132, y: 305, width: 18, height: 30, measurementSites: ["right popliteal", "popliteal right", "r popliteal"] },
  { id: "popliteal-l", label: "Left Popliteal", vessel: "popliteal", side: "left", x: 170, y: 305, width: 18, height: 30, measurementSites: ["left popliteal", "popliteal left", "l popliteal"] },

  // Tibial / Pedal
  { id: "tibial-r", label: "Right Tibial", vessel: "tibial", side: "right", x: 130, y: 340, width: 20, height: 55, measurementSites: ["right tibial", "tibial right", "r tibial", "right pta", "right ata", "right peroneal"] },
  { id: "tibial-l", label: "Left Tibial", vessel: "tibial", side: "left", x: 170, y: 340, width: 20, height: 55, measurementSites: ["left tibial", "tibial left", "l tibial", "left pta", "left ata", "left peroneal"] },

  // Subclavian / Upper extremity
  { id: "subclavian-r", label: "Right Subclavian", vessel: "subclavian", side: "right", x: 110, y: 85, width: 30, height: 15, measurementSites: ["right subclavian", "subclavian right"] },
  { id: "subclavian-l", label: "Left Subclavian", vessel: "subclavian", side: "left", x: 180, y: 85, width: 30, height: 15, measurementSites: ["left subclavian", "subclavian left"] },

  // Renal
  { id: "renal-r", label: "Right Renal", vessel: "renal", side: "right", x: 132, y: 160, width: 20, height: 15, measurementSites: ["right renal", "renal right"] },
  { id: "renal-l", label: "Left Renal", vessel: "renal", side: "left", x: 168, y: 160, width: 20, height: 15, measurementSites: ["left renal", "renal left"] },
];

// Vessel colors
export const VESSEL_COLORS: Record<string, { normal: string; hover: string; active: string }> = {
  carotid: { normal: "hsl(0 75% 55%)", hover: "hsl(0 80% 65%)", active: "hsl(0 85% 50%)" },
  aorta: { normal: "hsl(0 80% 50%)", hover: "hsl(0 85% 60%)", active: "hsl(0 90% 45%)" },
  iliac: { normal: "hsl(15 70% 55%)", hover: "hsl(15 75% 65%)", active: "hsl(15 80% 50%)" },
  femoral: { normal: "hsl(200 70% 50%)", hover: "hsl(200 75% 60%)", active: "hsl(200 80% 45%)" },
  popliteal: { normal: "hsl(200 65% 55%)", hover: "hsl(200 70% 65%)", active: "hsl(200 75% 50%)" },
  tibial: { normal: "hsl(210 60% 55%)", hover: "hsl(210 65% 65%)", active: "hsl(210 70% 50%)" },
  subclavian: { normal: "hsl(340 60% 55%)", hover: "hsl(340 65% 65%)", active: "hsl(340 70% 50%)" },
  renal: { normal: "hsl(30 70% 50%)", hover: "hsl(30 75% 60%)", active: "hsl(30 80% 45%)" },
};

interface VascularMapProps {
  selectedSegment: string | null;
  onSegmentClick: (segmentId: string) => void;
  segmentStatus?: Record<string, "normal" | "warning" | "critical">;
}

export default function VascularMap({ selectedSegment, onSegmentClick, segmentStatus = {} }: VascularMapProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const statusColor = (segmentId: string, vessel: string) => {
    const status = segmentStatus[segmentId];
    if (status === "critical") return "hsl(0 84% 60%)";
    if (status === "warning") return "hsl(38 92% 50%)";
    const colors = VESSEL_COLORS[vessel] ?? VESSEL_COLORS.femoral;
    if (selectedSegment === segmentId) return colors.active;
    if (hoveredSegment === segmentId) return colors.hover;
    return colors.normal;
  };

  return (
    <svg viewBox="0 0 320 440" className="w-full max-w-[320px] mx-auto" style={{ height: "auto" }}>
      {/* Body silhouette */}
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Head */}
      <ellipse cx="160" cy="28" rx="22" ry="26" fill="url(#bodyGrad)" stroke="hsl(var(--border))" strokeWidth="1" />
      {/* Neck */}
      <rect x="150" y="54" width="20" height="18" rx="4" fill="url(#bodyGrad)" stroke="hsl(var(--border))" strokeWidth="0.5" />
      {/* Torso */}
      <path d="M110,72 Q108,72 106,85 L100,130 Q98,160 100,200 L105,235 Q140,245 160,245 Q180,245 215,235 L220,200 Q222,160 220,130 L214,85 Q212,72 210,72 Z"
        fill="url(#bodyGrad)" stroke="hsl(var(--border))" strokeWidth="1" />
      {/* Arms */}
      <path d="M106,85 Q90,95 78,130 Q72,150 70,175 Q68,185 72,188 Q76,190 80,185 Q85,170 90,150 Q95,135 100,120"
        fill="url(#bodyGrad)" stroke="hsl(var(--border))" strokeWidth="1" />
      <path d="M214,85 Q230,95 242,130 Q248,150 250,175 Q252,185 248,188 Q244,190 240,185 Q235,170 230,150 Q225,135 220,120"
        fill="url(#bodyGrad)" stroke="hsl(var(--border))" strokeWidth="1" />
      {/* Pelvis */}
      <path d="M105,235 Q100,255 110,265 Q130,275 160,275 Q190,275 210,265 Q220,255 215,235 Z"
        fill="url(#bodyGrad)" stroke="hsl(var(--border))" strokeWidth="1" />
      {/* Legs */}
      <path d="M125,270 Q120,310 122,340 Q124,370 125,400 Q126,420 130,430 Q140,435 145,430 Q147,420 145,400 Q144,370 143,340 Q142,310 145,275"
        fill="url(#bodyGrad)" stroke="hsl(var(--border))" strokeWidth="1" />
      <path d="M195,270 Q200,310 198,340 Q196,370 195,400 Q194,420 190,430 Q180,435 175,430 Q173,420 175,400 Q176,370 177,340 Q178,310 175,275"
        fill="url(#bodyGrad)" stroke="hsl(var(--border))" strokeWidth="1" />

      {/* Vascular lines (arteries) */}
      {/* Aorta centerline */}
      <line x1="160" y1="65" x2="160" y2="210" stroke="hsl(0 70% 45% / 0.3)" strokeWidth="3" strokeLinecap="round" />
      {/* Iliac bifurcation */}
      <line x1="160" y1="210" x2="142" y2="240" stroke="hsl(0 70% 45% / 0.3)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="160" y1="210" x2="178" y2="240" stroke="hsl(0 70% 45% / 0.3)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Femoral */}
      <line x1="142" y1="240" x2="140" y2="310" stroke="hsl(200 60% 50% / 0.3)" strokeWidth="2" strokeLinecap="round" />
      <line x1="178" y1="240" x2="180" y2="310" stroke="hsl(200 60% 50% / 0.3)" strokeWidth="2" strokeLinecap="round" />
      {/* Tibial */}
      <line x1="140" y1="310" x2="138" y2="400" stroke="hsl(210 55% 55% / 0.3)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="180" y1="310" x2="182" y2="400" stroke="hsl(210 55% 55% / 0.3)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Carotids */}
      <line x1="155" y1="65" x2="148" y2="42" stroke="hsl(0 70% 45% / 0.3)" strokeWidth="2" strokeLinecap="round" />
      <line x1="165" y1="65" x2="172" y2="42" stroke="hsl(0 70% 45% / 0.3)" strokeWidth="2" strokeLinecap="round" />
      {/* Subclavians */}
      <line x1="150" y1="88" x2="110" y2="92" stroke="hsl(340 55% 50% / 0.3)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="170" y1="88" x2="210" y2="92" stroke="hsl(340 55% 50% / 0.3)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Renals */}
      <line x1="155" y1="167" x2="135" y2="167" stroke="hsl(30 65% 50% / 0.3)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="165" y1="167" x2="185" y2="167" stroke="hsl(30 65% 50% / 0.3)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Clickable segments */}
      {VASCULAR_SEGMENTS.map((seg) => {
        const color = statusColor(seg.id, seg.vessel);
        const isActive = selectedSegment === seg.id;
        const isHovered = hoveredSegment === seg.id;
        return (
          <g key={seg.id}>
            <rect
              x={seg.x}
              y={seg.y}
              width={seg.width}
              height={seg.height}
              rx={4}
              fill={color}
              fillOpacity={isActive ? 0.5 : isHovered ? 0.4 : 0.25}
              stroke={color}
              strokeWidth={isActive ? 2 : isHovered ? 1.5 : 0.5}
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              filter={isActive ? "url(#glow)" : undefined}
              onMouseEnter={() => setHoveredSegment(seg.id)}
              onMouseLeave={() => setHoveredSegment(null)}
              onClick={() => onSegmentClick(seg.id)}
            />
            {/* Small dot indicator */}
            {segmentStatus[seg.id] && (
              <circle
                cx={seg.x + seg.width - 4}
                cy={seg.y + 4}
                r={3}
                fill={segmentStatus[seg.id] === "critical" ? "hsl(0 84% 60%)" : "hsl(38 92% 50%)"}
                stroke="hsl(var(--background))"
                strokeWidth={1}
              />
            )}
          </g>
        );
      })}

      {/* Tooltip for hovered segment */}
      {hoveredSegment && (() => {
        const seg = VASCULAR_SEGMENTS.find((s) => s.id === hoveredSegment)!;
        const tx = seg.x + seg.width / 2;
        const ty = seg.y - 8;
        return (
          <g>
            <rect x={tx - 45} y={ty - 16} width={90} height={18} rx={4} fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth={0.5} />
            <text x={tx} y={ty - 4} textAnchor="middle" fill="hsl(var(--popover-foreground))" fontSize="9" fontWeight="500">
              {seg.label}
            </text>
          </g>
        );
      })()}

      {/* Labels */}
      <text x="160" y="435" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8" opacity="0.6">
        Click a segment to view measurements
      </text>
    </svg>
  );
}
