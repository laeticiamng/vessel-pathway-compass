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
    <div>
      <div className="relative max-h-[35vh] overflow-hidden" aria-hidden="true">
        {children}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      </div>
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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
