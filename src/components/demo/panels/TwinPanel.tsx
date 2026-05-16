import { AOMI_FRAGILE_CASE as CASE } from "@/demo/aomiFragileCase";

const AFFECTED = new Set(CASE.twin.affectedSegments);

interface Seg {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Schematic 18-segment overview (anatomically suggestive, not anatomically exact — DEMO).
const SEGMENTS: Seg[] = [
  { id: "AORTA", label: "Aorte", x: 175, y: 20, w: 50, h: 60 },
  { id: "IL_COM_R", label: "Iliaque commune D", x: 130, y: 80, w: 40, h: 30 },
  { id: "IL_COM_L", label: "Iliaque commune G", x: 230, y: 80, w: 40, h: 30 },
  { id: "IL_EXT_R", label: "Iliaque externe D", x: 120, y: 115, w: 35, h: 35 },
  { id: "IL_EXT_L", label: "Iliaque externe G", x: 245, y: 115, w: 35, h: 35 },
  { id: "FEM_COM_R", label: "Fémorale commune D", x: 115, y: 155, w: 35, h: 30 },
  { id: "FEM_COM_L", label: "Fémorale commune G", x: 250, y: 155, w: 35, h: 30 },
  { id: "FEM_SUP_R", label: "Fémorale sup D", x: 115, y: 190, w: 30, h: 50 },
  { id: "FEM_SUP_L", label: "Fémorale sup G", x: 255, y: 190, w: 30, h: 50 },
  { id: "POP_R", label: "Poplitée D", x: 118, y: 245, w: 25, h: 30 },
  { id: "POP_L", label: "Poplitée G", x: 257, y: 245, w: 25, h: 30 },
  { id: "TIB_ANT_R", label: "Tib. ant. D", x: 95, y: 280, w: 22, h: 50 },
  { id: "TIB_POST_R", label: "Tib. post. D", x: 122, y: 280, w: 22, h: 50 },
  { id: "PER_R", label: "Péronière D", x: 149, y: 280, w: 22, h: 50 },
  { id: "TIB_ANT_L", label: "Tib. ant. L", x: 235, y: 280, w: 22, h: 50 },
  { id: "TIB_POST_L", label: "Tib. post. L", x: 262, y: 280, w: 22, h: 50 },
  { id: "PER_L", label: "Péronière L", x: 289, y: 280, w: 22, h: 50 },
  { id: "PEDAL_L", label: "Pédieuse L", x: 262, y: 335, w: 22, h: 18 },
];

function segFill(id: string) {
  if (!AFFECTED.has(id)) return "hsl(var(--muted))";
  if (CASE.twin.stenosisPct >= 70) return "hsl(var(--destructive))";
  return "hsl(35 95% 55%)";
}

export function TwinPanel() {
  return (
    <div className="p-6 grid md:grid-cols-[1fr_220px] gap-6 h-full">
      <div className="rounded-lg bg-gradient-to-b from-background to-muted/40 border border-border/60 flex items-center justify-center">
        <svg viewBox="0 0 400 380" className="w-full max-w-[360px] h-auto">
          {SEGMENTS.map((s) => (
            <g key={s.id}>
              <rect
                x={s.x}
                y={s.y}
                width={s.w}
                height={s.h}
                rx="6"
                fill={segFill(s.id)}
                stroke={AFFECTED.has(s.id) ? "hsl(var(--destructive))" : "hsl(var(--border))"}
                strokeWidth={AFFECTED.has(s.id) ? 2 : 1}
                opacity={AFFECTED.has(s.id) ? 0.95 : 0.6}
              />
              {AFFECTED.has(s.id) && (
                <text
                  x={s.x + s.w / 2}
                  y={s.y + s.h / 2 + 3}
                  textAnchor="middle"
                  fontSize="8"
                  fill="hsl(var(--destructive-foreground))"
                  fontFamily="ui-monospace"
                >
                  {CASE.twin.stenosisPct}%
                </text>
              )}
            </g>
          ))}
          <text x="200" y="372" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
            Digital Twin · 18 segments · Vue schématique
          </text>
        </svg>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lésion dominante</p>
          <p className="mt-1 text-sm font-semibold">{CASE.twin.dominantLesion}</p>
          <p className="text-xs text-destructive font-semibold tabular-nums">
            Sténose {CASE.twin.stenosisPct}%
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Segments touchés</p>
          <ul className="mt-1 text-xs space-y-1">
            {CASE.twin.affectedSegments.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span className="font-mono">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded border border-border/60 p-3 text-[11px] text-muted-foreground">
          Distalité conservée bilatéralement (tibiales perméables). Revascularisation
          endovasculaire faisable.
        </div>
      </div>
    </div>
  );
}
