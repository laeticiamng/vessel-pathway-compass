import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentGateProps {
  children: ReactNode;
}

export function ContentGate({ children }: ContentGateProps) {
  const { session } = useAuth();
  const { t } = useTranslation();

  if (session) return <>{children}</>;

  return (
    <div className="relative">
      <div className="max-h-[35vh] overflow-hidden" aria-hidden="true">
        {children}
      </div>
      {/* Gradient fade */}
      <div className="absolute inset-0 top-[15vh] bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none" />
      {/* CTA overlay */}
      <div className="relative -mt-16 flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{t("contentGate.title")}</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{t("contentGate.subtitle")}</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/auth">{t("contentGate.signIn")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/pricing">{t("contentGate.viewPlans")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
