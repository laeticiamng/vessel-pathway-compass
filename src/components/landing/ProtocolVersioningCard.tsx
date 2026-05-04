import { History, FileCheck, Clock } from "lucide-react";
import { getContentVersion } from "@/lib/contentVersions";
import { useTranslation } from "@/i18n/context";

/**
 * Public versioning card for the research protocol.
 *
 * Displays current version, declared status (research / not certified)
 * and reverse-chronological history of editorial updates.
 */
export function ProtocolVersioningCard() {
  const { t, language } = useTranslation();
  const version = getContentVersion("protocol");

  if (!version) return null;

  const dateFmt = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section
      aria-labelledby="protocol-versioning-title"
      className="mb-10 rounded-2xl border bg-card p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2.5">
          <History className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 id="protocol-versioning-title" className="text-base sm:text-lg font-semibold">
            {t("pages.protocol.versioning.title")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-mono font-semibold text-primary">
            v{version.version}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <FileCheck className="h-3 w-3" aria-hidden="true" />
            {t("pages.protocol.versioning.statusResearch")}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-5 inline-flex items-center gap-1.5">
        <Clock className="h-3 w-3" aria-hidden="true" />
        <span>
          {t("pages.protocol.versioning.lastUpdated")}{" "}
          <time dateTime={version.updatedAt} className="font-medium text-foreground">
            {dateFmt.format(new Date(version.updatedAt))}
          </time>
        </span>
      </p>

      <ol className="space-y-3 border-l-2 border-border pl-4">
        {version.changelog.map((entry) => (
          <li key={entry.version} className="relative">
            <span
              className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background"
              aria-hidden="true"
            />
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-primary">v{entry.version}</span>
              <time dateTime={entry.date} className="text-xs text-muted-foreground">
                {dateFmt.format(new Date(entry.date))}
              </time>
            </div>
            <p className="text-sm text-foreground mt-1 leading-relaxed">{entry.summary}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
