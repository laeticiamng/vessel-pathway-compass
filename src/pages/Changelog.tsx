import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Tag, Calendar } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/context";
import { APP_VERSION, APP_VERSION_DATE } from "@/lib/appVersion";
import changelogData from "@/generated/changelog.json";

type Section = { title: string; items: string[] };
type Release = {
  version: string;
  codename: string;
  date: string;
  summary: string;
  sections: Section[];
};
type ChangelogJSON = {
  generatedAt: string;
  locales: Partial<Record<"en" | "fr" | "de", Release[]>>;
};

const data = changelogData as ChangelogJSON;

export default function Changelog() {
  const { t, language } = useTranslation();
  const [q, setQ] = useState("");

  const releases: Release[] = data.locales[language] ?? data.locales.en ?? [];
  const sectionLabel = (title: string): string => {
    // Normalize: strip diacritics so "Sécurité" / "Schutzmaßnahmen" → ascii slug.
    const slug = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ß/g, "ss")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    const key = `pages.changelog.sections.${slug}`;
    const tr = t(key);
    return tr === key ? title : tr;
  };

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
    if (!needle) return releases;
    return releases.filter((r) => {
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
  }, [q, releases]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${t("pages.changelog.title")} — VASCU-LINK / AquaMR Flow`}
        description={t("pages.changelog.metaDesc")}
      />

      <div className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("pages.changelog.back")}
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("pages.changelog.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("pages.changelog.subtitle")}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <Tag className="h-3 w-3" aria-hidden="true" />
              {t("pages.changelog.current")}: v{APP_VERSION}
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
            placeholder={t("pages.changelog.searchPlaceholder")}
            className="pl-9"
            aria-label={t("pages.changelog.searchPlaceholder")}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("pages.changelog.empty")}
          </p>
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
                      <span className="font-mono text-primary">
                        v{r.version}
                      </span>{" "}
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
                          {sectionLabel(s.title)}
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
