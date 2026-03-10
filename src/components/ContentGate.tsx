import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentGateProps {
  children: ReactNode;
}

export function ContentGate({ children }: ContentGateProps) {
  const { session } = useAuth();
  const { t } = useTranslation();

  if (session) return <>{children}</>;

  const benefits = (t("contentGate.benefits") as any) as string[] | undefined;

  return (
    <div>
      <div className="mb-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15 text-center">
        <p className="text-sm text-primary font-medium">{t("contentGate.previewBanner")}</p>
      </div>

      {/* Simulated module preview — gives a sense of what's inside */}
      <div className="relative max-h-[28vh] overflow-hidden rounded-xl" aria-hidden="true">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
          <div className="h-20 sm:h-24 rounded-lg bg-muted/50 border" />
          <div className="h-20 sm:h-24 rounded-lg bg-muted/50 border" />
          <div className="h-20 sm:h-24 rounded-lg bg-muted/50 border hidden sm:block" />
          <div className="h-14 sm:h-16 rounded-lg bg-muted/30 border col-span-2" />
          <div className="h-14 sm:h-16 rounded-lg bg-muted/30 border hidden sm:block" />
        </div>
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, hsl(var(--background)) 10%, hsl(var(--background) / 0.85) 40%, hsl(var(--background) / 0.3) 80%, transparent 100%)"
        }} />
      </div>

      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-2xl bg-primary/10 p-4 mb-5 border border-primary/20">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{t("contentGate.title")}</h2>
        <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed">{t("contentGate.subtitle")}</p>

        {/* Benefits list */}
        {Array.isArray(benefits) && benefits.length > 0 && (
          <ul className="text-left mb-8 space-y-2.5 max-w-sm">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="shadow-md shadow-primary/15">
            <Link to="/auth?mode=signup">
              {t("contentGate.createAccount")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">{t("contentGate.signIn")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
