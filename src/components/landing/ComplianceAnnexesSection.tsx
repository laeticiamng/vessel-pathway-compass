import { BookMarked, ShieldCheck, FileWarning, Database, Activity, ScrollText } from "lucide-react";
import { useTranslation } from "@/i18n/context";

/**
 * Compliance Annexes — institutional appendix for scientific committee review.
 *
 * Lists references, protocol limits, and traceable elements (RGPD/nLPD,
 * security, ADR/DSMB) so a CHUV-grade reviewer can find chain-of-evidence
 * in a single place.
 */
export function ComplianceAnnexesSection() {
  const { t } = useTranslation();

  const references = (t("pages.protocol.annexes.references.items") as unknown as string[]) ?? [];
  const limits = (t("pages.protocol.annexes.limits.items") as unknown as string[]) ?? [];
  const privacy = (t("pages.protocol.annexes.privacy.items") as unknown as string[]) ?? [];
  const security = (t("pages.protocol.annexes.security.items") as unknown as string[]) ?? [];
  const adr = (t("pages.protocol.annexes.adr.items") as unknown as string[]) ?? [];
  const traceability = (t("pages.protocol.annexes.traceability.items") as unknown as string[]) ?? [];

  const blocks: { icon: React.ElementType; title: string; items: string[] }[] = [
    { icon: BookMarked, title: t("pages.protocol.annexes.references.title") as string, items: references },
    { icon: FileWarning, title: t("pages.protocol.annexes.limits.title") as string, items: limits },
    { icon: Database, title: t("pages.protocol.annexes.privacy.title") as string, items: privacy },
    { icon: ShieldCheck, title: t("pages.protocol.annexes.security.title") as string, items: security },
    { icon: Activity, title: t("pages.protocol.annexes.adr.title") as string, items: adr },
    { icon: ScrollText, title: t("pages.protocol.annexes.traceability.title") as string, items: traceability },
  ];

  return (
    <section
      aria-labelledby="protocol-annexes-title"
      className="mb-14 rounded-2xl border-2 border-border bg-muted/20 p-5 sm:p-6"
    >
      <header className="mb-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <ScrollText className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <h2 id="protocol-annexes-title" className="text-2xl font-bold">
            {t("pages.protocol.annexes.title")}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-12 leading-relaxed">
          {t("pages.protocol.annexes.subtitle")}
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {blocks.map((b, i) => (
          <article key={i} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <b.icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-semibold">{b.title}</h3>
            </div>
            <ul className="space-y-1.5" role="list">
              {b.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
