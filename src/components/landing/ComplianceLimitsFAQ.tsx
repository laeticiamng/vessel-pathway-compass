import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ScrollText, ArrowUpRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation, type Language } from "@/i18n/context";

/* ============================================================================
 * Compliance-ready FAQ — limits without regulatory promises.
 *
 * Companion to the Scientific Honesty section. Questions are framed around
 * what VASCU-LINK does NOT promise (MDR, HIPAA, FDA, CE, fitness for clinical
 * use) and points to the academic validation roadmap.
 *
 * Self-contained EN/FR/DE content (matches AntiOverpromiseSection pattern)
 * to keep the dictionaries lean.
 * ========================================================================== */

type Item = { q: string; a: string };
type Content = {
  badge: string;
  title: string;
  subtitle: string;
  items: Item[];
  ctaLabel: string;
  ctaHref: string;
};

const CONTENT: Record<Language, Content> = {
  en: {
    badge: "Compliance — limits & honesty",
    title: "What we do NOT claim",
    subtitle:
      "VASCU-LINK is a research prototype in academic validation. The points below are intentionally negative: each one calls out a regulatory or clinical claim we deliberately do not make.",
    items: [
      {
        q: "Are you MDR / CE-marked?",
        a: "No. The platform is NOT a CE-marked medical device under MDR (EU 2017/745). The architecture is designed to target IEC 62304 and ISO 14971 quality processes, but no notified body has audited or certified the software at this stage.",
      },
      {
        q: "Are you HIPAA-compliant or FDA-cleared?",
        a: "No. We do not claim HIPAA compliance or FDA clearance. The platform is operated under European data-protection law (GDPR) and Swiss law (nFADP). It is not marketed in the US healthcare system and is not used for clinical decision-making outside approved research protocols.",
      },
      {
        q: "Can outputs be used to make a clinical decision?",
        a: "No. Every output (CI-AKI score, L1 decision board, simulation, digital twin, AI summary) is decision support inside an approved research protocol. Final clinical responsibility stays with the qualified clinician using their own judgement and the local standard of care.",
      },
      {
        q: "Are the AquaMR Flow images angiography-equivalent?",
        a: "No. The reconstruction targets specific angiography-like functions on selected indications, evaluated against standard-of-care imaging. It is not a 1:1 substitute for digital subtraction angiography and is currently studied in a prospective protocol.",
      },
      {
        q: "Does the L3 (preclinical) module describe a human procedure?",
        a: "No. L3 covers preclinical / animal-model work and benchtop revascularisation rehearsals. No human revascularisation is performed via the platform during the doctoral phase.",
      },
      {
        q: "Where is the data hosted?",
        a: "Today, on Lovable Cloud (Supabase) infrastructure. A migration to a clinical HDS (EU/CH) hosting environment is planned before any institutional production use. Each pilot receives a simplified DPIA and the list of subprocessors.",
      },
    ],
    ctaLabel: "See the academic validation roadmap",
    ctaHref: "/trajectory",
  },
  fr: {
    badge: "Compliance — limites & honnêteté",
    title: "Ce que nous ne revendiquons PAS",
    subtitle:
      "VASCU-LINK est un prototype de recherche en validation académique. Les points ci-dessous sont volontairement négatifs : chacun désigne une revendication réglementaire ou clinique que nous refusons explicitement de faire.",
    items: [
      {
        q: "Êtes-vous MDR / marqué CE ?",
        a: "Non. La plateforme n'est PAS un dispositif médical marqué CE selon le MDR (UE 2017/745). L'architecture est conçue pour viser les processus IEC 62304 et ISO 14971, mais aucun organisme notifié n'a audité ou certifié le logiciel à ce stade.",
      },
      {
        q: "Êtes-vous conformes HIPAA ou validés FDA ?",
        a: "Non. Nous ne revendiquons ni conformité HIPAA ni clearance FDA. La plateforme est exploitée selon le droit européen de la protection des données (RGPD) et le droit suisse (nLPD). Elle n'est pas commercialisée dans le système de santé américain et n'est pas utilisée pour la décision clinique en dehors de protocoles de recherche approuvés.",
      },
      {
        q: "Les sorties peuvent-elles fonder une décision clinique ?",
        a: "Non. Chaque sortie (score CI-AKI, board L1, simulation, jumeau numérique, synthèse IA) est une aide à la décision dans un protocole de recherche approuvé. La responsabilité clinique finale reste au clinicien qualifié, avec son jugement et le standard de soins local.",
      },
      {
        q: "Les images AquaMR Flow équivalent-elles à une angiographie ?",
        a: "Non. La reconstruction vise certaines fonctions angiographiques sur indications ciblées, évaluées vs l'imagerie standard de soins. Ce n'est pas un substitut 1:1 à l'angiographie de soustraction numérique ; cela est actuellement étudié dans un protocole prospectif.",
      },
      {
        q: "Le module L3 (préclinique) décrit-il une procédure humaine ?",
        a: "Non. L3 couvre le travail préclinique / modèle animal et les répétitions de revascularisation sur banc d'essai. Aucune revascularisation humaine n'est réalisée via la plateforme pendant la phase doctorale.",
      },
      {
        q: "Où sont hébergées les données ?",
        a: "Aujourd'hui, sur l'infrastructure Lovable Cloud (Supabase). Une migration vers un hébergement clinique HDS (UE/CH) est prévue avant tout usage institutionnel en production. Chaque pilote reçoit une DPIA simplifiée et la liste des sous-traitants.",
      },
    ],
    ctaLabel: "Voir la trajectoire de validation académique",
    ctaHref: "/trajectory",
  },
  de: {
    badge: "Compliance — Grenzen & Ehrlichkeit",
    title: "Was wir NICHT beanspruchen",
    subtitle:
      "VASCU-LINK ist ein Forschungsprototyp in akademischer Validierung. Die folgenden Punkte sind bewusst negativ: jeder benennt einen regulatorischen oder klinischen Anspruch, den wir ausdrücklich nicht erheben.",
    items: [
      {
        q: "Sind Sie MDR / CE-zertifiziert?",
        a: "Nein. Die Plattform ist KEIN CE-zertifiziertes Medizinprodukt nach MDR (EU 2017/745). Die Architektur ist auf IEC 62304 und ISO 14971 ausgelegt, aber keine benannte Stelle hat die Software derzeit auditiert oder zertifiziert.",
      },
      {
        q: "Sind Sie HIPAA-konform oder FDA-zugelassen?",
        a: "Nein. Wir beanspruchen weder HIPAA-Konformität noch FDA-Zulassung. Die Plattform wird nach europäischem Datenschutzrecht (DSGVO) und Schweizer Recht (nDSG) betrieben. Sie wird nicht im US-Gesundheitssystem vermarktet und nicht für klinische Entscheidungen außerhalb genehmigter Forschungsprotokolle verwendet.",
      },
      {
        q: "Können die Ergebnisse eine klinische Entscheidung begründen?",
        a: "Nein. Jede Ausgabe (CI-AKI-Score, L1-Board, Simulation, digitaler Zwilling, KI-Zusammenfassung) ist eine Entscheidungsunterstützung innerhalb eines genehmigten Forschungsprotokolls. Die endgültige klinische Verantwortung liegt beim qualifizierten Kliniker mit seinem Urteil und dem lokalen Versorgungsstandard.",
      },
      {
        q: "Sind die AquaMR-Flow-Bilder einer Angiographie gleichwertig?",
        a: "Nein. Die Rekonstruktion zielt auf bestimmte angiographische Funktionen bei gezielten Indikationen ab, bewertet gegenüber Standard-Bildgebung. Es ist kein 1:1-Ersatz für digitale Subtraktionsangiographie und wird derzeit in einem prospektiven Protokoll untersucht.",
      },
      {
        q: "Beschreibt das L3-Modul (präklinisch) ein Verfahren am Menschen?",
        a: "Nein. L3 umfasst präklinische / Tiermodell-Arbeiten und Revaskularisationsproben am Prüfstand. Während der Doktoratsphase wird über die Plattform keine humane Revaskularisation durchgeführt.",
      },
      {
        q: "Wo werden die Daten gehostet?",
        a: "Heute auf Lovable Cloud (Supabase). Eine Migration in eine klinische HDS-Hosting-Umgebung (EU/CH) ist vor jeder institutionellen Produktionsnutzung geplant. Jedes Pilotprojekt erhält eine vereinfachte DPIA und die Liste der Unterauftragnehmer.",
      },
    ],
    ctaLabel: "Akademische Validierungs-Roadmap ansehen",
    ctaHref: "/trajectory",
  },
};

export function ComplianceLimitsFAQ({ compact = false }: { compact?: boolean }) {
  const { language } = useTranslation();
  const c = CONTENT[language] ?? CONTENT.en;

  return (
    <section
      id="compliance-limits-faq"
      aria-labelledby="compliance-limits-faq-title"
      className={`${compact ? "py-12" : "py-20"} bg-muted/20 scroll-mt-20`}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 mb-4">
            <ScrollText className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-primary uppercase">
              {c.badge}
            </span>
          </div>
          <h2
            id="compliance-limits-faq-title"
            className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 leading-tight text-balance"
          >
            {c.title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {c.subtitle}
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {c.items.map((item, i) => (
            <AccordionItem key={i} value={`compliance-limit-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left text-base hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 text-center">
          <Link
            to={c.ctaHref}
            className="inline-flex items-center gap-1.5 text-sm text-primary/90 hover:text-primary underline-offset-4 hover:underline transition-colors"
          >
            {c.ctaLabel}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ComplianceLimitsFAQ;
