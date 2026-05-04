import { BookOpen, ExternalLink } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface ProtocolReference {
  /** Stable citation key, e.g. "MDR-2017-745" */
  citationKey: string;
  /** Human title of the source document. */
  document: string;
  /** Public URL when available, otherwise null = placeholder. */
  url: string | null;
}

interface ProtocolClaim {
  /** Short statement extracted from the protocol. */
  claim: string;
  /** One or more references supporting this claim. */
  refs: ProtocolReference[];
}

/**
 * References Library — explicit "claim → named source" map for the
 * scientific committee. Every protocol claim is anchored to one or
 * more named documents with a stable citation key. Missing public
 * URLs render as placeholders ("[available on request]") so the
 * dependency is transparent for the reviewer.
 */
export function ReferencesLibrary() {
  const { t } = useTranslation();

  const claims = (t("pages.protocol.annexes.referencesLibrary.claims") as unknown as ProtocolClaim[]) ?? [];
  const placeholderLabel = t("pages.protocol.annexes.referencesLibrary.placeholder") as string;

  return (
    <section
      aria-labelledby="references-library-title"
      className="mt-6 rounded-2xl border-2 border-dashed border-primary/30 bg-background p-5"
    >
      <header className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 id="references-library-title" className="text-base font-semibold">
          {t("pages.protocol.annexes.referencesLibrary.title")}
        </h3>
      </header>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        {t("pages.protocol.annexes.referencesLibrary.subtitle")}
      </p>

      <ol className="space-y-3" role="list">
        {claims.map((c, i) => (
          <li key={i} className="rounded-lg border bg-card p-3">
            <p className="text-sm font-medium leading-snug mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary mr-1.5">
                C{(i + 1).toString().padStart(2, "0")}
              </span>
              {c.claim}
            </p>
            <ul className="space-y-1.5 ml-4" role="list">
              {c.refs.map((r, j) => (
                <li key={j} className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-[10px] rounded border border-border bg-muted/40 px-1.5 py-0.5 text-muted-foreground shrink-0">
                    {r.citationKey}
                  </span>
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 leading-snug"
                    >
                      {r.document}
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground leading-snug">
                      {r.document}{" "}
                      <span className="italic text-muted-foreground/70">— {placeholderLabel}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
