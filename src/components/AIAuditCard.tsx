import { Brain, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

const COPY: Record<Language, {
  title: string;
  subtitle: string;
  architecture: { label: string; value: string };
  performance: { label: string; value: string };
  hallucination: { label: string; value: string };
  policy: string;
  framework: string;
}> = {
  en: {
    title: "AI reconstruction — audit panel",
    subtitle: "TRIPOD+AI 2024 alignment for the low-field denoising / super-resolution chain.",
    architecture: { label: "Architecture", value: "Denoising + super-resolution + EMI suppression (open description, code on Zenodo — DOI placeholder)" },
    performance: { label: "Performance", value: "PSNR / SSIM / perceptual metrics on independent validation set (placeholder values until WP2 freeze)" },
    hallucination: { label: "Hallucination audit", value: "3% random sample re-read without AI · 0 hallucination cases reported to date (placeholder)" },
    policy: "If AI reconstruction modifies diagnosis vs the non-AI baseline, the case is automatically flagged for DSMB review.",
    framework: "Audit framework",
  },
  fr: {
    title: "Reconstruction IA — panneau d'audit",
    subtitle: "Alignement TRIPOD+AI 2024 pour la chaîne débruitage / super-résolution bas champ.",
    architecture: { label: "Architecture", value: "Débruitage + super-résolution + suppression EMI (description ouverte, code sur Zenodo — DOI placeholder)" },
    performance: { label: "Performance", value: "PSNR / SSIM / perceptuel sur jeu de validation indépendant (valeurs placeholder jusqu'au gel WP2)" },
    hallucination: { label: "Audit hallucination", value: "3 % d'échantillon aléatoire relu sans IA · 0 cas d'hallucination rapporté à ce jour (placeholder)" },
    policy: "Si la reconstruction IA modifie le diagnostic vs la baseline sans IA, le cas est automatiquement signalé au DSMB.",
    framework: "Cadre d'audit",
  },
  de: {
    title: "KI-Rekonstruktion — Audit-Panel",
    subtitle: "TRIPOD+AI-2024-konform für die Low-Field-Denoising-/Super-Resolution-Kette.",
    architecture: { label: "Architektur", value: "Denoising + Super-Resolution + EMI-Suppression (offene Beschreibung, Code auf Zenodo — DOI-Platzhalter)" },
    performance: { label: "Leistung", value: "PSNR / SSIM / perzeptuell auf unabhängigem Validierungsset (Platzhalter bis WP2-Freeze)" },
    hallucination: { label: "Halluzinations-Audit", value: "3 % zufällige Stichprobe ohne KI nachgelesen · 0 Halluzinationsfälle bisher (Platzhalter)" },
    policy: "Wenn die KI-Rekonstruktion die Diagnose gegenüber der Nicht-KI-Baseline verändert, wird der Fall automatisch zur DSMB-Prüfung markiert.",
    framework: "Audit-Rahmen",
  },
};

interface Props {
  className?: string;
}

export function AIAuditCard({ className = "" }: Props) {
  const { language } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  return (
    <section
      aria-labelledby="ai-audit-card-title"
      className={`rounded-2xl border bg-card p-5 md:p-6 ${className}`}
    >
      <header className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Brain className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-primary mb-0.5">
            {copy.framework}
          </p>
          <h3 id="ai-audit-card-title" className="text-base md:text-lg font-semibold">
            {copy.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{copy.subtitle}</p>
        </div>
      </header>
      <dl className="space-y-3 text-sm">
        {[copy.architecture, copy.performance, copy.hallucination].map((item, i) => (
          <div key={i} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
            <div>
              <dt className="font-medium">{item.label}</dt>
              <dd className="text-muted-foreground">{item.value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <p className="mt-4 pt-3 border-t text-xs text-foreground/80 flex gap-2">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden />
        <span>{copy.policy}</span>
      </p>
    </section>
  );
}

export default AIAuditCard;
