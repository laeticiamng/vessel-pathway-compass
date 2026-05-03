import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import { ComplianceLimitsFAQ } from "@/components/landing/ComplianceLimitsFAQ";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { AuditLimitationsPdfButton } from "@/components/audit/AuditLimitationsPdfButton";
import { ContentVersionBadge } from "@/components/audit/ContentVersionBadge";
import { ChangelogExportButton } from "@/components/audit/ChangelogExportButton";

/* ============================================================================
 * /audit-limitations — single source of truth for what VASCU-LINK does and
 * does NOT claim, with a transparent traceability description.
 * ========================================================================== */

type Content = {
  seoTitle: string;
  seoDescription: string;
  back: string;
  title: string;
  intro: string;
  doesTitle: string;
  does: string[];
  doesNotTitle: string;
  doesNot: string[];
  traceTitle: string;
  trace: string[];
  traceFooter: string;
};

const CONTENT: Record<Language, Content> = {
  en: {
    seoTitle: "Audit & Limitations — VASCU-LINK",
    seoDescription:
      "What VASCU-LINK does, what it does NOT claim (no HIPAA, no FDA, no CE-mark), and how traceability is enforced across the platform.",
    back: "Back to home",
    title: "Audit & Limitations",
    intro:
      "VASCU-LINK is a research prototype in academic validation at CHUV / Lausanne. This page lists exactly what the platform does, what it deliberately does not claim, and how traceability is enforced — so any reviewer, IRB or partner institution can verify the posture in one place.",
    doesTitle: "What the platform does",
    does: [
      "Reconstructs targeted angiography-like functions from non-ionizing imaging (AquaMR Flow).",
      "Supports L1 (clinical decision board), L2 (simulation) and L3 (preclinical) workflows separately.",
      "Computes CI-AKI and other documented risk scores with the inputs, formula version and clinician on record.",
      "Maintains audit logs for every read, write, export, score computation and L1 decision.",
      "Exports a compliance pack (DPIA-lite, processing register, IEC 62304 technical file scaffold) per institution on request.",
      "Hosts data with row-level security, encryption in transit and at rest, and pseudonymized patient identifiers.",
    ],
    doesNotTitle: "What the platform does NOT claim",
    doesNot: [
      "NOT a CE-marked medical device under MDR (EU 2017/745) — no notified body has certified the software.",
      "NO HIPAA compliance and NO FDA clearance — the platform is not marketed in the US healthcare system.",
      "NOT a substitute for digital subtraction angiography — AquaMR Flow targets specific functions, not 1:1 replacement.",
      "NOT a clinical decision-maker — every output is decision support inside an approved research protocol.",
      "NO human revascularisation is performed via the platform during the doctoral phase (L3 covers preclinical work only).",
      "NO commercial offer in USD — indicative post-launch tariffs are denominated in CHF or EUR.",
    ],
    traceTitle: "How traceability is enforced",
    trace: [
      "Every sensitive action is timestamped, tied to an authenticated user and stored in a backend application log.",
      "Critical Edge Functions require a valid JWT and verify roles server-side (verify_jwt = true).",
      "Each documented decision keeps the patient pseudonymous identifier, input parameters, model/formula version and validating clinician.",
      "Data exports generate a dedicated audit entry (who, what, when, format, scope) and are listed in /governance/exports.",
      "Patient soft-delete is enforced for 30 days with a manual cascade cleanup job before permanent removal.",
      "Incident response: detection via monitoring → triage within 24h → notification to affected institutions within GDPR deadlines (72h).",
    ],
    traceFooter:
      "Any claim that looks exaggerated can be reported via /contact — we will correct it publicly with a dated change log.",
  },
  fr: {
    seoTitle: "Audit & Limites — VASCU-LINK",
    seoDescription:
      "Ce que fait VASCU-LINK, ce qu'il ne revendique PAS (pas de HIPAA, pas de FDA, pas de marquage CE), et comment la traçabilité est assurée sur la plateforme.",
    back: "Retour à l'accueil",
    title: "Audit & Limites",
    intro:
      "VASCU-LINK est un prototype de recherche en validation académique au CHUV / Lausanne. Cette page liste précisément ce que la plateforme fait, ce qu'elle ne revendique volontairement pas, et comment la traçabilité est assurée — afin que tout relecteur, comité d'éthique ou institution partenaire puisse vérifier la posture en un seul endroit.",
    doesTitle: "Ce que la plateforme fait",
    does: [
      "Reconstruit certaines fonctions angiographiques ciblées à partir d'imagerie non ionisante (AquaMR Flow).",
      "Sépare explicitement les workflows L1 (board de décision clinique), L2 (simulation) et L3 (préclinique).",
      "Calcule les scores CI-AKI et autres scores documentés avec entrées, version de la formule et clinicien tracés.",
      "Maintient des journaux d'audit pour toute lecture, écriture, export, calcul de score et décision L1.",
      "Génère un pack de conformité (DPIA simplifiée, registre de traitement, ébauche IEC 62304) par institution sur demande.",
      "Héberge les données avec RLS, chiffrement en transit et au repos, et identifiants patients pseudonymisés.",
    ],
    doesNotTitle: "Ce que la plateforme ne revendique PAS",
    doesNot: [
      "PAS un dispositif médical marqué CE selon le MDR (UE 2017/745) — aucun organisme notifié n'a certifié le logiciel.",
      "PAS de conformité HIPAA ni de clearance FDA — la plateforme n'est pas commercialisée dans le système de santé américain.",
      "PAS un substitut à l'angiographie de soustraction numérique — AquaMR Flow vise des fonctions ciblées, pas un remplacement 1:1.",
      "PAS un décideur clinique — chaque sortie est une aide à la décision dans un protocole de recherche approuvé.",
      "AUCUNE revascularisation humaine via la plateforme pendant la phase doctorale (L3 = préclinique uniquement).",
      "PAS d'offre commerciale en USD — les tarifs indicatifs post-lancement sont libellés en CHF ou EUR.",
    ],
    traceTitle: "Comment la traçabilité est assurée",
    trace: [
      "Toute action sensible est horodatée, liée à un utilisateur authentifié et stockée dans un journal applicatif côté serveur.",
      "Les Edge Functions critiques exigent un JWT valide et vérifient les rôles côté serveur (verify_jwt = true).",
      "Chaque décision documentée conserve l'identifiant patient pseudonymisé, les paramètres d'entrée, la version du modèle/formule et le clinicien validant.",
      "Les exports de données génèrent une entrée d'audit dédiée (qui, quoi, quand, format, périmètre), listée dans /governance/exports.",
      "Le soft-delete patient est appliqué pendant 30 jours avec un job de cascade manuel avant suppression définitive.",
      "Réponse à incident : détection par monitoring → triage sous 24h → notification aux institutions impactées dans les délais RGPD (72h).",
    ],
    traceFooter:
      "Toute affirmation jugée exagérée peut être signalée via /contact — nous corrigerons publiquement avec date de modification.",
  },
  de: {
    seoTitle: "Audit & Grenzen — VASCU-LINK",
    seoDescription:
      "Was VASCU-LINK tut, was es NICHT beansprucht (kein HIPAA, kein FDA, kein CE-Zeichen) und wie Nachvollziehbarkeit auf der Plattform gewährleistet wird.",
    back: "Zurück zur Startseite",
    title: "Audit & Grenzen",
    intro:
      "VASCU-LINK ist ein Forschungsprototyp in akademischer Validierung am CHUV / Lausanne. Diese Seite listet genau auf, was die Plattform tut, was sie bewusst nicht beansprucht und wie Nachvollziehbarkeit gewährleistet wird — damit jede prüfende Stelle, Ethikkommission oder Partnerinstitution die Position an einem Ort verifizieren kann.",
    doesTitle: "Was die Plattform tut",
    does: [
      "Rekonstruiert bestimmte angiographische Funktionen aus nicht-ionisierender Bildgebung (AquaMR Flow).",
      "Trennt L1- (klinisches Entscheidungsboard), L2- (Simulation) und L3-Workflows (präklinisch) explizit.",
      "Berechnet CI-AKI- und andere dokumentierte Scores mit nachvollziehbaren Eingaben, Formelversion und Kliniker.",
      "Führt Audit-Logs für jeden Lese-, Schreib-, Export-, Score- und L1-Entscheidungsvorgang.",
      "Generiert pro Institution auf Anfrage ein Compliance-Paket (vereinfachte DPIA, Verarbeitungsregister, IEC-62304-Entwurf).",
      "Hostet Daten mit RLS, Verschlüsselung in Übertragung und Ruhezustand sowie pseudonymisierten Patienten-IDs.",
    ],
    doesNotTitle: "Was die Plattform NICHT beansprucht",
    doesNot: [
      "KEIN CE-zertifiziertes Medizinprodukt nach MDR (EU 2017/745) — keine benannte Stelle hat die Software zertifiziert.",
      "KEINE HIPAA-Konformität und KEINE FDA-Zulassung — die Plattform wird nicht im US-Gesundheitssystem vermarktet.",
      "KEIN Ersatz für digitale Subtraktionsangiographie — AquaMR Flow zielt auf bestimmte Funktionen, nicht auf 1:1-Ersatz.",
      "KEIN klinischer Entscheider — jede Ausgabe ist Entscheidungsunterstützung innerhalb eines genehmigten Forschungsprotokolls.",
      "KEINE humane Revaskularisation über die Plattform während der Doktoratsphase (L3 = nur präklinisch).",
      "KEIN kommerzielles Angebot in USD — indikative Tarife nach dem Launch werden in CHF oder EUR ausgewiesen.",
    ],
    traceTitle: "Wie Nachvollziehbarkeit gewährleistet wird",
    trace: [
      "Jede sensible Aktion ist mit Zeitstempel versehen, an einen authentifizierten Benutzer gebunden und in einem Server-Anwendungslog gespeichert.",
      "Kritische Edge Functions erfordern ein gültiges JWT und prüfen Rollen serverseitig (verify_jwt = true).",
      "Jede dokumentierte Entscheidung enthält die pseudonymisierte Patienten-ID, Eingabeparameter, Modell-/Formelversion und validierenden Kliniker.",
      "Datenexporte erzeugen einen eigenen Audit-Eintrag (wer, was, wann, Format, Umfang) und erscheinen unter /governance/exports.",
      "Patient-Soft-Delete gilt 30 Tage mit manuellem Kaskaden-Cleanup vor endgültiger Löschung.",
      "Incident-Response: Erkennung via Monitoring → Triage innerhalb von 24h → Benachrichtigung betroffener Institutionen innerhalb der DSGVO-Fristen (72h).",
    ],
    traceFooter:
      "Jede übertrieben wirkende Aussage kann über /contact gemeldet werden — wir korrigieren öffentlich, mit datiertem Änderungsverlauf.",
  },
};

export default function AuditLimitations() {
  const { language } = useTranslation();
  const c = CONTENT[language] ?? CONTENT.en;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={c.seoTitle} description={c.seoDescription} path="/audit-limitations" />

      <nav className="border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <AquaMRLogo />
            <span className="font-semibold">VASCU-LINK</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            {c.back}
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">
              VASCU-LINK
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{c.title}</h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {c.intro}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <AuditLimitationsPdfButton content={c} />
            <ChangelogExportButton contentId="audit-limitations" />
          </div>
          <div className="mt-6 max-w-2xl mx-auto text-left">
            <ContentVersionBadge contentId="audit-limitations" />
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section
            aria-labelledby="audit-does-title"
            className="rounded-2xl border border-success/30 bg-success/5 p-6"
          >
            <h2 id="audit-does-title" className="flex items-center gap-2 text-lg font-semibold mb-4">
              <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
              {c.doesTitle}
            </h2>
            <ul className="space-y-3 text-sm leading-relaxed">
              {c.does.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="audit-doesnot-title"
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"
          >
            <h2 id="audit-doesnot-title" className="flex items-center gap-2 text-lg font-semibold mb-4">
              <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
              {c.doesNotTitle}
            </h2>
            <ul className="space-y-3 text-sm leading-relaxed">
              {c.doesNot.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section
          aria-labelledby="audit-trace-title"
          className="mt-8 rounded-2xl border border-border bg-card/60 p-6"
        >
          <h2 id="audit-trace-title" className="flex items-center gap-2 text-lg font-semibold mb-4">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            {c.traceTitle}
          </h2>
          <ol className="space-y-3 text-sm leading-relaxed list-decimal list-inside text-muted-foreground">
            {c.trace.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
          <p className="mt-6 text-xs text-muted-foreground/80 italic">{c.traceFooter}</p>
        </section>

        <div className="mt-12">
          <ComplianceLimitsFAQ compact />
        </div>
      </main>

      <RegulatoryDisclaimer />
    </div>
  );
}
