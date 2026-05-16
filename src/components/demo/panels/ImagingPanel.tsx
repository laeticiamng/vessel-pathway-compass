import { Ban, Clock, Radio, ShieldCheck } from "lucide-react";
import { AOMI_FRAGILE_CASE, type DemoCase } from "@/demo/aomiFragileCase";

export function ImagingPanel({ case: c = AOMI_FRAGILE_CASE }: { case?: DemoCase } = {}) {
  const seconds = c.imaging.sequenceSeconds;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  const noIonising = c.imaging.modality === "AquaMR" || c.imaging.modality === "MRA";

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-[260px] bg-gradient-to-b from-slate-950 to-slate-800 overflow-hidden">
        <svg viewBox="0 0 400 260" className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(148,200,255,0.5)" />
              <stop offset="100%" stopColor="rgba(148,200,255,0)" />
            </radialGradient>
          </defs>
          <rect width="400" height="260" fill="url(#glow)" />
          <path
            d="M200 20 L200 100 L160 130 L160 180 L150 220 L145 250"
            stroke="rgba(220,240,255,0.85)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M200 100 L240 130 L240 180 L245 220 L248 250"
            stroke="rgba(220,240,255,0.85)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="158" cy="158" r="14" fill="none" stroke="#f97316" strokeWidth="2" />
          <circle cx="158" cy="158" r="22" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.5" />
          <text x="178" y="162" fill="#fdba74" fontSize="11" fontFamily="ui-monospace">
            {c.twin.stenosisPct}% stenosis · {c.twin.affectedSegments[0] ?? ""}
          </text>
          <line x1="0" y1="158" x2="400" y2="158" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="158" y1="0" x2="158" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </svg>

        <div className="absolute top-3 left-3 text-[10px] font-mono text-sky-200/80 space-y-0.5">
          <div>PT: {c.patient.initials} · {c.patient.sex} · {c.patient.age}y</div>
          <div>SEQ: {c.imaging.modality} · TR 4.2 / TE 1.9</div>
          <div>FOV: pelvis → pied</div>
        </div>
        <div className="absolute top-3 right-3 text-[10px] font-mono text-sky-200/80 text-right">
          <div>SLICE 124 / 240</div>
          <div>WL 320 · WW 1200</div>
        </div>
        {noIonising && (
          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-emerald-300/90">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> No iodine · No radiation
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/60 grid grid-cols-3 gap-3 bg-card">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Radio className="h-3 w-3" /> Modalité
          </div>
          <div className="mt-1 text-sm font-semibold">{c.imaging.modality}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Durée séquence
          </div>
          <div className="mt-1 text-sm font-semibold tabular-nums">
            {minutes}:{remainder.toString().padStart(2, "0")}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Ban className="h-3 w-3 text-destructive" />
            {c.imaging.contraindicatedAlternatives.length > 0 ? "Contre-indiqué" : "Alternatives"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {c.imaging.contraindicatedAlternatives.length > 0
              ? c.imaging.contraindicatedAlternatives.join(" · ")
              : "Aucune contre-indication"}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
        <strong className="text-foreground">Findings : </strong>{c.imaging.findings}
      </div>
    </div>
  );
}
