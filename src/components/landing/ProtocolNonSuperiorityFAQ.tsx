import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

/**
 * Protocol FAQ — non-superiority rationale.
 *
 * Short, focused FAQ (4 items) explaining the diagnostic concordance vs
 * superiority framing, the Doppler-first rule, and the safety fallback.
 * Trilingual (EN/FR/DE), self-contained — no i18n schema dependency.
 */

type QA = { q: string; a: string };

type Content = {
  badge: string;
  title: string;
  subtitle: string;
  items: QA[];
};

const CONTENT: Record<Language, Content> = {
  en: {
    badge: "Protocol FAQ",
    title: "Concordance vs superiority — short rationale",
    subtitle:
      "Four questions to clarify why VASCU-LINK / AquaMR Flow is not framed as a superiority study.",
    items: [
      {
        q: "Is VASCU-LINK trying to be better than hospital MRI or CT angiography?",
        a: "No. The L1 study does not aim to outperform 1.5–3T hospital MRI, CT angiography or catheter angiography. The hypothesis is diagnostic concordance with a pragmatic non-inferiority rationale on selected pre-revascularization decisions in fragile PAD patients.",
      },
      {
        q: "Why not a superiority trial?",
        a: "Superiority would require demonstrating that AquaMR provides better clinical outcomes than the existing standard of care. That is neither the scientific nor the clinical question. The relevant question is whether the AquaMR mapping is sufficient to support certain pre-revascularization decisions when standard imaging is hard to obtain or contraindicated.",
      },
      {
        q: "Where does Duplex ultrasound fit in?",
        a: "Duplex remains the first-line hemodynamic examination. AquaMR is never positioned as a replacement for Duplex. It is positioned as a potential intermediate anatomical mapping layer between Duplex and heavy hospital-based imaging, only when additional cartography may influence the pre-revascularization strategy.",
      },
      {
        q: "What is the safety fallback if AquaMR is insufficient?",
        a: "If the AquaMR image quality is judged insufficient for the clinical decision, or if the situation is urgent, standard hospital imaging and conventional angiography remain mandatory. AquaMR is never a justification to delay or skip required standard care.",
      },
    ],
  },
  fr: {
    badge: "FAQ Protocole",
    title: "Concordance vs supériorité — rationnel synthétique",
    subtitle:
      "Quatre questions pour clarifier pourquoi VASCU-LINK / AquaMR Flow n'est pas une étude de supériorité.",
    items: [
      {
        q: "VASCU-LINK cherche-t-il à faire mieux que l'IRM hospitalière ou l'angio-CT ?",
        a: "Non. L'étude L1 ne vise pas à dépasser l'IRM hospitalière 1,5–3 T, l'angio-CT ou l'angiographie cathéter. L'hypothèse est une concordance diagnostique avec logique de non-infériorité pragmatique, sur certaines décisions pré-revascularisation chez des patients AOMI fragiles.",
      },
      {
        q: "Pourquoi pas une étude de supériorité ?",
        a: "Une étude de supériorité exigerait de démontrer qu'AquaMR offre de meilleurs résultats cliniques que le standard de soins existant. Ce n'est ni la question scientifique ni la question clinique. La vraie question est de savoir si la cartographie AquaMR est suffisante pour soutenir certaines décisions pré-revascularisation lorsque l'imagerie standard est difficile à obtenir ou contre-indiquée.",
      },
      {
        q: "Quelle est la place du Doppler ?",
        a: "Le Doppler reste l'examen hémodynamique de première ligne. AquaMR n'est jamais positionné comme un remplacement du Doppler. Il est positionné comme une couche intermédiaire potentielle entre le Doppler et l'imagerie hospitalière lourde, uniquement lorsque la cartographie additionnelle peut modifier la stratégie pré-revascularisation.",
      },
      {
        q: "Quel est le repli de sécurité si AquaMR est insuffisant ?",
        a: "Si la qualité d'image AquaMR est jugée insuffisante pour la décision clinique, ou si la situation est urgente, l'imagerie hospitalière standard et l'angiographie conventionnelle restent obligatoires. AquaMR n'est jamais une justification pour retarder ou omettre les soins standards requis.",
      },
    ],
  },
  de: {
    badge: "Protokoll-FAQ",
    title: "Konkordanz vs. Überlegenheit — kurze Begründung",
    subtitle:
      "Vier Fragen, um zu klären, warum VASCU-LINK / AquaMR Flow keine Überlegenheitsstudie ist.",
    items: [
      {
        q: "Will VASCU-LINK besser sein als Klinik-MRT oder CT-Angiographie?",
        a: "Nein. Die L1-Studie strebt nicht an, 1,5–3 T-Klinik-MRT, CT-Angiographie oder Katheter-Angiographie zu übertreffen. Die Hypothese ist eine diagnostische Konkordanz mit pragmatischer Nicht-Unterlegenheits-Logik bei ausgewählten prä-revaskularisierenden Entscheidungen bei fragilen pAVK-Patienten.",
      },
      {
        q: "Warum keine Überlegenheitsstudie?",
        a: "Eine Überlegenheitsstudie würde verlangen zu zeigen, dass AquaMR bessere klinische Ergebnisse liefert als der bestehende Standard. Das ist weder die wissenschaftliche noch die klinische Frage. Die relevante Frage ist, ob die AquaMR-Kartierung ausreicht, um bestimmte prä-revaskularisierende Entscheidungen zu stützen, wenn Standardbildgebung schwer zugänglich oder kontraindiziert ist.",
      },
      {
        q: "Welche Rolle hat der Duplex-Ultraschall?",
        a: "Der Duplex bleibt die hämodynamische Erstlinienuntersuchung. AquaMR wird niemals als Ersatz für Duplex positioniert. Es positioniert sich als mögliche anatomische Zwischenebene zwischen Duplex und schwerer Klinikbildgebung, nur wenn zusätzliche Kartierung die prä-revaskularisierende Strategie beeinflussen kann.",
      },
      {
        q: "Was ist die Sicherheits-Rückfallebene, wenn AquaMR unzureichend ist?",
        a: "Wenn die AquaMR-Bildqualität für die klinische Entscheidung als unzureichend beurteilt wird oder die Situation dringlich ist, bleiben die klinische Standardbildgebung und die konventionelle Angiographie obligatorisch. AquaMR ist niemals eine Rechtfertigung, erforderliche Standardversorgung zu verzögern oder zu überspringen.",
      },
    ],
  },
};

export function ProtocolNonSuperiorityFAQ() {
  const { language } = useTranslation();
  const c = CONTENT[language] ?? CONTENT.en;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      aria-labelledby="protocol-nonsup-faq-title"
      className="mb-14 rounded-2xl border bg-card p-5 sm:p-7 scroll-mt-20"
      id="protocol-non-superiority-faq"
    >
      <header className="mb-5 flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <HelpCircle className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">
            {c.badge}
          </p>
          <h2 id="protocol-nonsup-faq-title" className="text-xl sm:text-2xl font-bold leading-tight">
            {c.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{c.subtitle}</p>
        </div>
      </header>

      <ul className="space-y-2" role="list">
        {c.items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <li key={i} className="rounded-xl border bg-background/40">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`nonsup-faq-panel-${i}`}
                className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-muted/30 rounded-xl transition-colors"
              >
                <span className="flex items-start gap-3 min-w-0">
                  <span className="font-mono text-xs font-semibold text-primary mt-0.5 shrink-0">
                    Q{i + 1}
                  </span>
                  <span className="text-sm font-medium leading-snug">{item.q}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div
                  id={`nonsup-faq-panel-${i}`}
                  role="region"
                  className="px-4 pb-4 pt-0 -mt-1 text-sm text-foreground/85 leading-relaxed"
                >
                  {item.a}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
