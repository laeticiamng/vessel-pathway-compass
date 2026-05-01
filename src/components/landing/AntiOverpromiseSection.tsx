import { motion } from "framer-motion";
import { CircleSlash, ArrowRight } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

/* ============================================================================
 * Anti-overpromise block
 *
 * Side-by-side table contrasting "Does NOT claim to do X" vs "Actually says Y".
 * Designed as a defensive, doctorally-defensible disclaimer surface.
 *
 * Used on:
 *   - Landing page (right above the existing LimitsSection)
 *   - Transparency & Governance page (reinforces the limits block)
 * ========================================================================== */

type Row = { notClaim: string; insteadSays: string };

type Content = {
  badge: string;
  title: string;
  subtitle: string;
  headerNotClaim: string;
  headerInsteadSays: string;
  rows: Row[];
  footer: string;
};

const CONTENT: Record<Language, Content> = {
  fr: {
    badge: "Honnêteté scientifique",
    title: "Ce que VASCU-LINK ne prétend pas faire",
    subtitle:
      "Pour toute affirmation forte, nous publions également la limite correspondante. C'est la règle du projet.",
    headerNotClaim: "Ne prétend pas",
    headerInsteadSays: "Dit plutôt",
    rows: [
      {
        notClaim: "Remplacer toute l'angiographie",
        insteadSays:
          "Reconstruire progressivement certaines fonctions angiographiques, sur des indications ciblées.",
      },
      {
        notClaim: "Réaliser une revascularisation humaine pendant la thèse",
        insteadSays:
          "Tester L1 cliniquement (concordance diagnostique) ; L2 en simulation et L3 strictement en préclinique.",
      },
      {
        notClaim: "Être un dispositif médical certifié",
        insteadSays:
          "Être un prototype de recherche conçu vers MDR / RGPD / IEC 62304, sans marquage CE ni autorisation FDA.",
      },
      {
        notClaim: "Être supérieur au Doppler partout",
        insteadSays:
          "Apporter une cartographie segmentaire quand le Doppler ou l'ABI ne suffisent pas (calcifications, IRC, fragilité).",
      },
      {
        notClaim: "Être prêt industriellement",
        insteadSays:
          "Être une preuve doctorale graduée, instrumentant le protocole L1 publié.",
      },
      {
        notClaim: "S'appuyer sur des données cliniques publiées",
        insteadSays:
          "S'appuyer sur des ADR documentées et un protocole prospectif déclaré, sans cohorte rétrospective vendable.",
      },
    ],
    footer:
      "Toute affirmation jugée exagérée peut être signalée — nous corrigerons publiquement avec date de modification.",
  },
  en: {
    badge: "Scientific honesty",
    title: "What VASCU-LINK does not claim to do",
    subtitle:
      "For every strong claim, we also publish the matching limit. That is the project rule.",
    headerNotClaim: "Does not claim",
    headerInsteadSays: "Actually says",
    rows: [
      {
        notClaim: "Replace all angiography",
        insteadSays:
          "Progressively rebuild some angiography functions, on targeted indications.",
      },
      {
        notClaim: "Perform human revascularisation during the thesis",
        insteadSays:
          "Test L1 clinically (diagnostic concordance); L2 in simulation and L3 strictly in preclinical.",
      },
      {
        notClaim: "Be a certified medical device",
        insteadSays:
          "Be a research prototype designed toward MDR / GDPR / IEC 62304, with no CE mark or FDA clearance.",
      },
      {
        notClaim: "Outperform Doppler everywhere",
        insteadSays:
          "Add segmental mapping where Doppler or ABI fall short (calcifications, CKD, frailty).",
      },
      {
        notClaim: "Be industrially ready",
        insteadSays:
          "Be a graded doctoral proof, instrumenting the published L1 protocol.",
      },
      {
        notClaim: "Rely on published clinical data",
        insteadSays:
          "Rely on documented ADRs and a declared prospective protocol — no sellable retrospective cohort.",
      },
    ],
    footer:
      "Any claim that looks exaggerated can be reported — we will correct it publicly, with a dated change.",
  },
  de: {
    badge: "Wissenschaftliche Ehrlichkeit",
    title: "Was VASCU-LINK nicht beansprucht",
    subtitle:
      "Zu jeder starken Aussage veröffentlichen wir auch die entsprechende Grenze. Das ist die Projektregel.",
    headerNotClaim: "Beansprucht nicht",
    headerInsteadSays: "Sagt stattdessen",
    rows: [
      {
        notClaim: "Die gesamte Angiographie zu ersetzen",
        insteadSays:
          "Bestimmte angiographische Funktionen schrittweise wiederherzustellen, bei gezielten Indikationen.",
      },
      {
        notClaim: "Eine humane Revaskularisation während der Dissertation durchzuführen",
        insteadSays:
          "L1 klinisch zu testen (diagnostische Konkordanz); L2 in Simulation und L3 ausschliesslich präklinisch.",
      },
      {
        notClaim: "Ein zertifiziertes Medizinprodukt zu sein",
        insteadSays:
          "Ein Forschungsprototyp zu sein, ausgerichtet auf MDR / DSGVO / IEC 62304, ohne CE-Kennzeichnung oder FDA-Zulassung.",
      },
      {
        notClaim: "Doppler überall zu übertreffen",
        insteadSays:
          "Eine segmentale Kartierung beizusteuern, wo Doppler oder ABI nicht ausreichen (Kalzifikationen, CKD, Gebrechlichkeit).",
      },
      {
        notClaim: "Industriell bereit zu sein",
        insteadSays:
          "Ein gestufter Doktoratsnachweis zu sein, der das veröffentlichte L1-Protokoll instrumentiert.",
      },
      {
        notClaim: "Sich auf veröffentlichte klinische Daten zu stützen",
        insteadSays:
          "Sich auf dokumentierte ADRs und ein deklariertes prospektives Protokoll zu stützen — keine verkaufsfähige retrospektive Kohorte.",
      },
    ],
    footer:
      "Jede übertrieben wirkende Aussage kann gemeldet werden — wir korrigieren öffentlich, mit datierter Änderung.",
  },
};

export function AntiOverpromiseSection({ compact = false }: { compact?: boolean }) {
  const { language } = useTranslation();
  const c = CONTENT[language] ?? CONTENT.en;

  return (
    <section
      id="anti-overpromise"
      aria-labelledby="anti-overpromise-title"
      className={`${compact ? "py-12" : "py-20"} bg-muted/30 scroll-mt-20`}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 mb-4">
            <CircleSlash className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-warning uppercase">
              {c.badge}
            </span>
          </div>
          <h2
            id="anti-overpromise-title"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-tight text-balance"
          >
            {c.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{c.subtitle}</p>
        </motion.div>

        {/* Mobile: stacked rows. Desktop: 2-column table layout. */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          {/* Header row — desktop only */}
          <div
            className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center bg-muted/40 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            role="row"
          >
            <div className="px-5 py-3">{c.headerNotClaim}</div>
            <div className="px-2 py-3" aria-hidden="true" />
            <div className="px-5 py-3">{c.headerInsteadSays}</div>
          </div>

          <ul className="divide-y" role="list">
            {c.rows.map((row, i) => (
              <li
                key={i}
                className="md:grid md:grid-cols-[1fr_auto_1fr] md:items-center"
              >
                <div className="px-5 pt-4 pb-1 md:py-4 flex items-start gap-2.5 md:items-center">
                  <span
                    className="md:hidden text-[10px] font-semibold uppercase tracking-wide text-warning shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    ✗ {c.headerNotClaim}
                  </span>
                  <span className="hidden md:inline text-warning shrink-0" aria-hidden="true">
                    ✗
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">
                    {row.notClaim}
                  </span>
                </div>
                <div
                  className="hidden md:flex px-2 text-muted-foreground"
                  aria-hidden="true"
                >
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="px-5 pt-1 pb-4 md:py-4 flex items-start gap-2.5 md:items-center bg-success/5 md:bg-transparent border-l-2 md:border-l-0 border-success/40 ml-5 md:ml-0">
                  <span
                    className="md:hidden text-[10px] font-semibold uppercase tracking-wide text-success shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    ✓ {c.headerInsteadSays}
                  </span>
                  <span className="hidden md:inline text-success shrink-0" aria-hidden="true">
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">
                    {row.insteadSays}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6 max-w-2xl mx-auto italic">
          {c.footer}
        </p>
      </div>
    </section>
  );
}
