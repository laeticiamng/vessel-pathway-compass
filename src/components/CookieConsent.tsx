import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/context";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-card border-t shadow-lg" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 max-w-4xl">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p>{t("cookies.message")}</p>
            <Link to="/legal/privacy" className="text-primary hover:underline text-xs">
              {t("cookies.learnMore")}
            </Link>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            {t("cookies.decline")}
          </Button>
          <Button size="sm" onClick={accept}>
            {t("cookies.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
