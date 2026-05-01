import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HeartPulse, Shield, Lock, Eye, FileText } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/context";

export default function SecurityPrivacy() {
  const { t } = useTranslation();

  const principles = [
    {
      icon: Lock,
      title: t("pages.security.principles.protection.title") as string,
      desc: t("pages.security.principles.protection.desc") as string,
    },
    {
      icon: Eye,
      title: t("pages.security.principles.visibility.title") as string,
      desc: t("pages.security.principles.visibility.desc") as string,
    },
    {
      icon: FileText,
      title: t("pages.security.principles.traceability.title") as string,
      desc: t("pages.security.principles.traceability.desc") as string,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("pages.security.seoTitle") as string}
        description={t("pages.security.seoDescription") as string}
        path="/securite-confidentialite"
      />

      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label="Navigation">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">AquaMR Flow</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              {t("pages.common.backHome")}
            </Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("pages.security.title")}</h1>
          <p className="text-muted-foreground text-lg">{t("pages.security.subtitle")}</p>
        </div>

        <section aria-labelledby="principles-title" className="mb-12">
          <h2 id="principles-title" className="text-2xl font-semibold mb-6">
            {t("pages.security.principlesTitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {principles.map((p) => (
              <article key={p.title} className="rounded-2xl border bg-card p-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="scope-title" className="mb-12 rounded-2xl border bg-card/60 p-8">
          <h2 id="scope-title" className="text-2xl font-semibold mb-3">
            {t("pages.security.scopeTitle")}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">{t("pages.security.scopeP1")}</p>
          <p className="text-muted-foreground leading-relaxed">{t("pages.security.scopeP2")}</p>
        </section>

        <section aria-labelledby="next-title" className="rounded-2xl border bg-card p-8 text-center">
          <h2 id="next-title" className="text-xl font-semibold mb-3">
            {t("pages.security.nextTitle")}
          </h2>
          <p className="text-muted-foreground mb-6">{t("pages.security.nextDesc")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/legal/privacy">{t("pages.common.privacyPolicy")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/legal/notice">{t("pages.common.legalNotice")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/contact">{t("pages.common.contactUs")}</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t("pages.common.home")}</Link>
          <span className="mx-2">•</span>
          <Link to="/pricing" className="hover:text-foreground">{t("pages.common.pricing")}</Link>
          <span className="mx-2">•</span>
          <Link to="/faq" className="hover:text-foreground">{t("pages.common.faq")}</Link>
          <span className="mx-2">•</span>
          <Link to="/contact" className="hover:text-foreground">{t("pages.common.contact")}</Link>
        </div>
      </footer>
    </div>
  );
}
