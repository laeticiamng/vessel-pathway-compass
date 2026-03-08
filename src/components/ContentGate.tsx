import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentGateProps {
  children: ReactNode;
}

export function ContentGate({ children }: ContentGateProps) {
  const { session } = useAuth();
  const { t } = useTranslation();

  if (session) return <>{children}</>;

  return (
    <div>
      <div className="mb-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15 text-center">
        <p className="text-sm text-primary font-medium">{t("contentGate.previewBanner")}</p>
      </div>
      <div className="relative max-h-[38vh] overflow-hidden rounded-xl" aria-hidden="true">
        {children}
        <div className="absolute inset-0 backdrop-blur-[2px]" style={{
          background: "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.95) 20%, hsl(var(--background) / 0.6) 50%, transparent 100%)"
        }} />
      </div>
      <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
        <div className="rounded-2xl bg-muted/80 p-5 mb-5 border border-border/50">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{t("contentGate.title")}</h2>
        <p className="text-muted-foreground mb-7 max-w-md text-sm leading-relaxed">{t("contentGate.subtitle")}</p>
        <div className="flex gap-3">
          <Button asChild className="shadow-md shadow-primary/15">
            <Link to="/auth?mode=signup">
              {t("contentGate.createAccount")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/auth">{t("contentGate.signIn")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
