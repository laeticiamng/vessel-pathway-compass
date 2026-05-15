import { Target, Users, GitCompare, BarChart3, ShieldAlert, FileCheck } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

/* ============================================================================
 * Protocol Identity Card
 *
 * Quick "5-second read" summary of the L1 protocol — placed at the top of
 * the Protocol page so a thesis jury / scientific reviewer immediately sees the
 * 6 doctorally-defensible elements: primary endpoint, population,
 * comparators, secondary outcomes, safety fallback, regulatory status.
 * ========================================================================== */

type Cell = { label: string; value: string };

type Content = {
  badge: string;
  title: string;
  cells: {
    primary: Cell;
    population: Cell;
    comparators: Cell;
    secondary: Cell;
    safety: Cell;
    status: Cell;
  };
};

const CONTENT: Record<Language, Content> = {
  fr: {
    badge: "Protocole en un coup d'œil",
    title: "Identité du protocole L1",
    cells: {
      primary: {
        label: "Objectif primaire",
        value:
          "Concordance segmentaire AquaMR vs imagerie de référence (CTA / MRA / DSA) sur classification de la sténose en 4 classes — κ pondéré quadratiquement ≥ 0,65 (IC 95 % borne inf. ≥ 0,50).",
      },
      population: {
        label: "Population cible",
        value:
          "AOMI fragile — IRC, diabète, âge avancé, polymorbidités. n inclus 320 pour n analysable 250.",
      },
      comparators: {
        label: "Comparateurs",
        value:
          "Doppler artériel, ABI / TBI, angio-CT (référence), ARM injectée si nécessaire.",
      },
      secondary: {
        label: "Critères secondaires",
        value:
          "Impact décisionnel pré-revascularisation, PROMs (VascuQoL-6, CIVIQ-14), CI-AKI à J7 / J30.",
      },
      safety: {
        label: "Sécurité — bascule",
        value:
          "Si qualité AquaMR insuffisante → bascule documentée vers angio-CT, ARM injectée ou angiographie cathéter.",
      },
      status: {
        label: "Statut",
        value:
          "Étude prospective déclarée. Prototype de recherche — non dispositif médical certifié.",
      },
    },
  },
  en: {
    badge: "Protocol at a glance",
    title: "L1 protocol identity",
    cells: {
      primary: {
        label: "Primary endpoint",
        value:
          "Segmental concordance AquaMR vs reference imaging (CTA / MRA / DSA) on 4-class stenosis grading — quadratically weighted κ ≥ 0.65 (95% CI lower bound ≥ 0.50).",
      },
      population: {
        label: "Target population",
        value:
          "Frail PAD patients — CKD, diabetes, advanced age, polymorbidities. 320 enrolled for 250 analysable.",
      },
      comparators: {
        label: "Comparators",
        value:
          "Arterial Doppler, ABI / TBI, CT angiography (reference), contrast MRA if needed.",
      },
      secondary: {
        label: "Secondary outcomes",
        value:
          "Pre-revascularisation decision impact, PROMs (VascuQoL-6, CIVIQ-14), CI-AKI at D7 / D30.",
      },
      safety: {
        label: "Safety fallback",
        value:
          "If AquaMR quality is insufficient → documented fallback to CT angio, contrast MRA or catheter angiography.",
      },
      status: {
        label: "Status",
        value:
          "Declared prospective study. Research prototype — not a certified medical device.",
      },
    },
  },
  de: {
    badge: "Protokoll auf einen Blick",
    title: "Identität des L1-Protokolls",
    cells: {
      primary: {
        label: "Primärer Endpunkt",
        value:
          "Segmentale Konkordanz AquaMR vs Referenzbildgebung (CTA / MRA / DSA) auf 4-Klassen-Stenose-Klassifikation — quadratisch gewichtetes κ ≥ 0,65 (untere 95 %-KI-Grenze ≥ 0,50).",
      },
      population: {
        label: "Zielpopulation",
        value:
          "Gebrechliche pAVK-Patientinnen und -Patienten — CKD, Diabetes, fortgeschrittenes Alter, Polymorbidität. 320 Eingeschlossene für 250 Auswertbare.",
      },
      comparators: {
        label: "Vergleichsverfahren",
        value:
          "Arterieller Doppler, ABI / TBI, CT-Angiographie (Referenz), kontrastmittelverstärkte MRA bei Bedarf.",
      },
      secondary: {
        label: "Sekundäre Endpunkte",
        value:
          "Auswirkung auf die Revaskularisationsentscheidung, PROMs (VascuQoL-6, CIVIQ-14), CI-AKI an Tag 7 / Tag 30.",
      },
      safety: {
        label: "Sicherheits-Fallback",
        value:
          "Bei unzureichender AquaMR-Qualität → dokumentierter Fallback auf CT-Angio, kontrastmittelverstärkte MRA oder Katheter-Angiographie.",
      },
      status: {
        label: "Status",
        value:
          "Angemeldete prospektive Studie. Forschungsprototyp — kein zertifiziertes Medizinprodukt.",
      },
    },
  },
};

const CELL_ICONS = {
  primary: Target,
  population: Users,
  comparators: GitCompare,
  secondary: BarChart3,
  safety: ShieldAlert,
  status: FileCheck,
} as const;

const CELL_ACCENT: Record<keyof Content["cells"], string> = {
  primary: "border-primary/40 bg-primary/5 text-primary",
  population: "border-border bg-card text-muted-foreground",
  comparators: "border-border bg-card text-muted-foreground",
  secondary: "border-border bg-card text-muted-foreground",
  safety: "border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400",
  status: "border-dashed border-border bg-muted/30 text-muted-foreground",
};

export function ProtocolIdentityCard() {
  const { language } = useTranslation();
  const c = CONTENT[language] ?? CONTENT.en;

  const order = ["primary", "population", "comparators", "secondary", "safety", "status"] as const;

  return (
    <section
      aria-labelledby="protocol-identity-title"
      className="mb-14 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-5 sm:p-7"
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">
          {c.badge}
        </span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <h2 id="protocol-identity-title" className="sr-only">
        {c.title}
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {order.map((key) => {
          const cell = c.cells[key];
          const Icon = CELL_ICONS[key];
          return (
            <article
              key={key}
              className={`rounded-xl border p-4 ${CELL_ACCENT[key]}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  {cell.label}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{cell.value}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
