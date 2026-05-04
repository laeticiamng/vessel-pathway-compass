import { BookMarked, ShieldCheck, FileWarning, Database, Activity, ScrollText, Lock, EyeOff } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ANNEX_ACCESS, canAccessTier, type AccessTier } from "@/lib/annexAccess";
import { ReferencesLibrary } from "./ReferencesLibrary";

/**
 * Compliance Annexes — institutional appendix for scientific committee review.
 *
 * Content is gated by role using the ANNEX_ACCESS matrix:
 *   - References & limits: public
 *   - Privacy (RGPD/nLPD): any authenticated
 *   - Security: research_lead / admin
 *   - ADR/DSMB: clinical roles + research/admin
 *   - Traceability: admin only
 *
 * Restricted blocks render a clear placeholder with the access rule and
 * a compliance disclaimer instead of the actual content.
 */
export function ComplianceAnnexesSection() {
  const { t } = useTranslation();
  const { roles, isAuthenticated, isLoading } = useUserRoles();

  const get = <T,>(k: string): T => t(k) as unknown as T;

  const blocks: { icon: React.ElementType; id: string }[] = [
    { icon: BookMarked, id: "references" },
    { icon: FileWarning, id: "limits" },
    { icon: Database, id: "privacy" },
    { icon: ShieldCheck, id: "security" },
    { icon: Activity, id: "adr" },
    { icon: ScrollText, id: "traceability" },
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
        <p className="text-xs text-muted-foreground/80 ml-12 mt-2 italic">
          {t("pages.protocol.annexes.accessDisclaimer")}
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {blocks.map((b) => {
          const access = ANNEX_ACCESS.find((a) => a.id === b.id)!;
          const allowed = canAccessTier(access.tier, { isAuthenticated, roles });
          const title = get<string>(`pages.protocol.annexes.${b.id}.title`);
          const items = get<string[]>(`pages.protocol.annexes.${b.id}.items`) ?? [];

          return (
            <article key={b.id} className="rounded-xl border bg-card p-4">
              <header className="flex items-center gap-2 mb-3">
                <b.icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-semibold flex-1">{title}</h3>
                <TierBadge tier={access.tier} t={t} />
              </header>

              {allowed ? (
                <ul className="space-y-1.5" role="list">
                  {items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <RestrictedPlaceholder tier={access.tier} t={t} isAuthenticated={isAuthenticated} isLoading={isLoading} />
              )}
            </article>
          );
        })}
      </div>

      {/* Dedicated references library — claims → named documents */}
      <ReferencesLibrary />
    </section>
  );
}

function TierBadge({ tier, t }: { tier: AccessTier; t: (k: string) => unknown }) {
  const label = String(t(`pages.protocol.annexes.tiers.${tier}`));
  const cls =
    tier === "public"
      ? "border-success/40 bg-success/10 text-success"
      : tier === "authenticated"
        ? "border-primary/40 bg-primary/10 text-primary"
        : tier === "clinical"
          ? "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400"
          : tier === "research"
            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            : "border-destructive/40 bg-destructive/10 text-destructive";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {tier !== "public" && <Lock className="h-2.5 w-2.5" aria-hidden="true" />}
      {label}
    </span>
  );
}

function RestrictedPlaceholder({
  tier,
  t,
  isAuthenticated,
  isLoading,
}: {
  tier: AccessTier;
  t: (k: string) => unknown;
  isAuthenticated: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
        {String(t("pages.protocol.annexes.checking"))}
      </div>
    );
  }
  const ruleKey = isAuthenticated
    ? `pages.protocol.annexes.restrictedRule.${tier}`
    : "pages.protocol.annexes.restrictedRule.signedOut";

  return (
    <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 p-3">
      <div className="flex items-start gap-2">
        <EyeOff className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-xs font-medium text-foreground/80">{String(t(ruleKey))}</p>
          <p className="text-[11px] text-muted-foreground mt-1.5 italic leading-relaxed">
            {String(t("pages.protocol.annexes.restrictedDisclaimer"))}
          </p>
        </div>
      </div>
    </div>
  );
}
