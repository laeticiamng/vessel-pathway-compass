import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Tag, Calendar } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/context";
import { APP_VERSION, APP_VERSION_DATE } from "@/lib/appVersion";

type Section = { title: string; items: string[] };
type Release = {
  version: string;
  date: string;
  codename: string;
  summary: string;
  sections: Section[];
};

const RELEASES: Release[] = [
  {
    version: "2.2.0",
    date: "2026-05-05",
    codename: "Methodological framing & non-overpromise guardrails",
    summary:
      "Reinforces academic clarity for the CHUV submission: VASCU-LINK / AquaMR Flow is positioned as a diagnostic concordance study with a pragmatic non-inferiority rationale, not as a superiority claim against hospital MRI / CTA / catheter angiography.",
    sections: [
      {
        title: "Methodology framing",
        items: [
          "Diagnostic concordance with a pragmatic non-inferiority rationale — no superiority claim against hospital MRI / CTA / catheter angiography.",
          "Doppler-first rule kept explicit: Duplex ultrasound remains first-line.",
          "Mandatory safety fallback to standard-of-care imaging when AquaMR cartography is non-interpretable.",
          "L1 scope restricted to See & Decide (pre-revascularization mapping).",
        ],
      },
      {
        title: "Added",
        items: [
          "NonInferioritySection on Landing and Protocol (EN/FR/DE).",
          "AboveHeroFramingLine — research-prototype banner above the home hero.",
          "ProtocolNonSuperiorityFAQ — 4 Q&A on /protocol.",
          "Home intro video (30s Remotion teaser) via HomeIntroVideoSection.",
          "AI Audit Card — versioned evidence panel + clinician confirmation history + PDF export.",
          "PROBAST Badge on Digital Twin (EN/FR/DE) + visual regression.",
          "T12 public pages with validated ResearchProject JSON-LD.",
        ],
      },
      {
        title: "Guardrails",
        items: [
          "npm run check:overpromise — flags marketing-like superiority/replacement phrases.",
          "npm run check:release — verifies CHANGELOG, README and appVersion.ts agree on version + date.",
          "npm run check:prepublish chains overpromise + i18n + version-consistency.",
          "Role-gated evidence confirmation (clinician/reviewer) with audit-log coverage.",
        ],
      },
      {
        title: "Changed",
        items: [
          "Public pricing removed — institutional/research access only.",
          "Regulatory disclaimer mounted globally.",
        ],
      },
      {
        title: "Security",
        items: [
          "Restricted EXECUTE on the SECURITY DEFINER trigger function; unauthenticated invocation blocked (Supabase linter clear).",
        ],
      },
    ],
  },
  {
    version: "2.0.0",
    date: "2026-03-20",
    codename: "AquaMR Flow Rebrand",
    summary:
      "Complete platform rebrand from Vascular Atlas to AquaMR Flow — a non-ionizing, contrast-sparing vascular workflow platform.",
    sections: [
      {
        title: "Added",
        items: [
          "Procedure Planner (IVUS-first, OCT-saline, non-contrast MRA).",
          "Fusion Viewer (MRI / IVUS / OCT / Ultrasound) with DICOM-ready architecture.",
          "CI-AKI Prevention Engine (eGFR-based stratification).",
          "Premium dark-first medtech design system.",
          "Research Prototype badges on all clinical modules.",
        ],
      },
      {
        title: "Changed",
        items: [
          "Navigation restructured: flat clinical workflow + collapsible platform section.",
          "All branding / SEO / i18n updated for AquaMR Flow.",
        ],
      },
    ],
  },
];

const I18N = {
  en: {
    title: "Changelog",
    subtitle: "Public release timeline for VASCU-LINK / AquaMR Flow.",
    current: "Current version",
    search: "Search by version, date, feature…",
    none: "No release matches your search.",
    back: "Back to home",
    metaDesc:
      "Public changelog for VASCU-LINK / AquaMR Flow — methodology framing, guardrails and security per release.",
  },
  fr: {
    title: "Journal des évolutions",
    subtitle: "Historique public des versions de VASCU-LINK / AquaMR Flow.",
    current: "Version actuelle",
    search: "Rechercher par version, date, fonctionnalité…",
    none: "Aucune version ne correspond à votre recherche.",
    back: "Retour à l'accueil",
    metaDesc:
      "Journal public des évolutions de VASCU-LINK / AquaMR Flow — cadrage méthodologique, garde-fous et sécurité par version.",
  },
  de: {
    title: "Änderungsverlauf",
    subtitle: "Öffentliche Versionshistorie von VASCU-LINK / AquaMR Flow.",
    current: "Aktuelle Version",
    search: "Suche nach Version, Datum, Funktion…",
    none: "Keine Version entspricht Ihrer Suche.",
    back: "Zurück zur Startseite",
    metaDesc:
      "Öffentlicher Änderungsverlauf von VASCU-LINK / AquaMR Flow — methodischer Rahmen, Schutzmaßnahmen und Sicherheit pro Version.",
  },
} as const;

export default function Changelog() {
  const { language } = useTranslation();
  const t = I18N[language] ?? I18N.en;
  const [q, setQ] = useState("");

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [language],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return RELEASES;
    return RELEASES.filter((r) => {
      const hay = [
        r.version,
        r.date,
        r.codename,
        r.summary,
        ...r.sections.flatMap((s) => [s.title, ...s.items]),
      ]
        .join(" \n ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${t.title} — VASCU-LINK / AquaMR Flow`}
        description={t.metaDesc}
        canonical="/changelog"
      />

      <div className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t.back}
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{t.subtitle}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <Tag className="h-3 w-3" aria-hidden="true" />
              {t.current}: v{APP_VERSION}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {dateFmt.format(new Date(APP_VERSION_DATE))}
            </Badge>
          </div>
        </header>

        <div className="relative mb-8">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search}
            className="pl-9"
            aria-label={t.search}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.none}</p>
        ) : (
          <ol className="space-y-8 border-l-2 border-border pl-6">
            {filtered.map((r) => (
              <li key={r.version} className="relative">
                <span
                  className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background"
                  aria-hidden="true"
                />
                <article className="rounded-2xl border bg-card p-5 sm:p-6">
                  <div className="flex flex-wrap items-baseline gap-3 mb-1">
                    <h2 className="text-xl font-semibold">
                      <span className="font-mono text-primary">v{r.version}</span>{" "}
                      — {r.codename}
                    </h2>
                    <time
                      dateTime={r.date}
                      className="text-xs text-muted-foreground"
                    >
                      {dateFmt.format(new Date(r.date))}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {r.summary}
                  </p>

                  <div className="space-y-4">
                    {r.sections.map((s) => (
                      <section key={s.title}>
                        <h3 className="text-sm font-semibold mb-1.5">
                          {s.title}
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
                          {s.items.map((it, i) => (
                            <li key={i}>{it}</li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
