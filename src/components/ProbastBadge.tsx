import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation, type Language } from "@/i18n/context";

const COPY: Record<Language, {
  badge: string;
  title: string;
  desc: string;
  metrics: string[];
  plan: string;
}> = {
  en: {
    badge: "C4-i v11.1 · PROBAST audited (HIGH RISK declared) · Recalibration in progress",
    title: "C4-i Score — PROBAST audit",
    desc: "Composite frailty score under transparent risk-of-bias auditing per PROBAST.",
    metrics: [
      "OR 2.90 [1.42 – 5.90]",
      "AUROC 0.640",
      "Events Per Variable (EPV) 4.5",
      "PROBAST overall: HIGH RISK (declared)",
    ],
    plan: "External validation planned in WP3 (independent cohort, recalibration, decision-curve analysis).",
  },
  fr: {
    badge: "C4-i v11.1 · audité PROBAST (RISQUE ÉLEVÉ déclaré) · recalibration en cours",
    title: "Score C4-i — audit PROBAST",
    desc: "Score composite de fragilité audité de manière transparente selon PROBAST.",
    metrics: [
      "OR 2,90 [1,42 – 5,90]",
      "AUROC 0,640",
      "Événements par variable (EPV) 4,5",
      "PROBAST global : RISQUE ÉLEVÉ (déclaré)",
    ],
    plan: "Validation externe prévue dans le WP3 (cohorte indépendante, recalibration, analyse decision-curve).",
  },
  de: {
    badge: "C4-i v11.1 · PROBAST-geprüft (HOHES RISIKO deklariert) · Rekalibrierung läuft",
    title: "C4-i Score — PROBAST-Audit",
    desc: "Zusammengesetzter Fragilitätsscore mit transparenter Bias-Bewertung gemäß PROBAST.",
    metrics: [
      "OR 2,90 [1,42 – 5,90]",
      "AUROC 0,640",
      "Events Per Variable (EPV) 4,5",
      "PROBAST gesamt: HOHES RISIKO (deklariert)",
    ],
    plan: "Externe Validierung in WP3 geplant (unabhängige Kohorte, Rekalibrierung, Decision-Curve-Analyse).",
  },
};

interface Props {
  className?: string;
}

export function ProbastBadge({ className = "" }: Props) {
  const { language } = useTranslation();
  const copy = COPY[language] ?? COPY.en;
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-semibold hover:bg-warning/20 transition ${className}`}
          aria-label={copy.title}
        >
          <ShieldAlert className="h-3 w-3" aria-hidden />
          {copy.badge}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.desc}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm">
          {copy.metrics.map((m, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-warning" aria-hidden>•</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground border-t pt-3 mt-2">{copy.plan}</p>
      </DialogContent>
    </Dialog>
  );
}

export default ProbastBadge;
