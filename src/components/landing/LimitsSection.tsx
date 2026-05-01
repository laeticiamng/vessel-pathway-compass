import { AlertTriangle, Stethoscope, Cpu, Gauge, ShieldAlert } from "lucide-react";
import { useTranslation } from "@/i18n/context";

type Section = {
  key: "regulatory" | "clinical" | "technical" | "usage";
  icon: typeof AlertTriangle;
};

const SECTIONS: Section[] = [
  { key: "regulatory", icon: ShieldAlert },
  { key: "clinical", icon: Stethoscope },
  { key: "technical", icon: Cpu },
  { key: "usage", icon: Gauge },
];

/**
 * Public-facing transparency section listing the prototype's current limitations.
 * Fully translated via `pages.limits.*` (FR/EN/DE).
 */
export function LimitsSection() {
  const { t } = useTranslation();

  return (
    <section
      id="limits"
      aria-labelledby="limits-title"
      className="border-y bg-muted/30"
    >
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning mb-4">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t("pages.limits.subtitle")}</span>
          </div>
          <h2 id="limits-title" className="text-3xl md:text-4xl font-bold mb-3">
            {t("pages.limits.title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {SECTIONS.map(({ key, icon: Icon }) => {
            const items = (t(`pages.limits.sections.${key}.items`) as unknown as string[]) ?? [];
            return (
              <article
                key={key}
                className="rounded-2xl border bg-card p-6 flex flex-col gap-3"
              >
                <header className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-warning" />
                  </div>
                  <h3 className="font-semibold text-base">
                    {t(`pages.limits.sections.${key}.title`)}
                  </h3>
                </header>
                <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  {Array.isArray(items) &&
                    items.map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden className="text-warning shrink-0">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="text-center mt-10 max-w-xl mx-auto">
          <h3 className="font-semibold mb-2">{t("pages.limits.ctaTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("pages.limits.ctaDesc")}</p>
        </div>
      </div>
    </section>
  );
}
