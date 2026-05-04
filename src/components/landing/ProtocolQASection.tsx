import { useState } from "react";
import { ChevronDown, MessageSquareQuote } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface QAItem {
  q: string;
  a: string;
}

/**
 * Compliance-ready Q&A section for the public research protocol.
 *
 * 8 institutional questions/answers prepared for a scientific committee
 * review. Each consultation is logged via useProtocolAccessAudit (parent
 * page) when the section becomes visible.
 */
export function ProtocolQASection({ onItemOpen }: { onItemOpen?: (index: number) => void }) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = (t("pages.protocol.qa.items") as unknown as QAItem[]) ?? [];

  const toggle = (i: number) => {
    const next = openIndex === i ? null : i;
    setOpenIndex(next);
    if (next !== null) onItemOpen?.(next);
  };

  return (
    <section
      aria-labelledby="protocol-qa-title"
      className="mb-14 rounded-2xl border bg-card p-5 sm:p-7"
    >
      <header className="mb-5 flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MessageSquareQuote className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 id="protocol-qa-title" className="text-2xl font-bold">
            {t("pages.protocol.qa.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("pages.protocol.qa.subtitle")}
          </p>
        </div>
      </header>

      <ul className="space-y-2" role="list">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <li key={i} className="rounded-xl border bg-background/40">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`qa-panel-${i}`}
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
                  id={`qa-panel-${i}`}
                  role="region"
                  className="px-4 pb-4 pt-0 -mt-1 text-sm text-foreground/90 leading-relaxed whitespace-pre-line"
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
