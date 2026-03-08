import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SEOHead title={t("seo.notFound.title") as string} description={t("seo.notFound.description") as string} noindex />
      <div className="text-center px-6">
        <p className="text-7xl font-bold text-primary mb-4">404</p>
        <h1 className="mb-3 text-2xl font-bold">{t("notFound.title")}</h1>
        <p className="mb-8 text-muted-foreground max-w-md mx-auto">{t("notFound.message")}</p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("notFound.backHome")}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
