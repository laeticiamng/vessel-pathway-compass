import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const sections = ["terms", "privacy", "notice"] as const;
type Section = typeof sections[number];

export default function Legal() {
  const { section = "terms" } = useParams<{ section: string }>();
  const { t } = useTranslation();
  const current = sections.includes(section as Section) ? (section as Section) : "terms";

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto flex items-center h-16 px-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <HeartPulse className="h-5 w-5 text-primary" />
            <span className="font-bold">Vascular Atlas</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="flex gap-2 mb-8 flex-wrap">
          {sections.map((s) => (
            <Button key={s} variant={current === s ? "default" : "outline"} size="sm" asChild>
              <Link to={`/legal/${s}`}>{t(`legal.tabs.${s}`)}</Link>
            </Button>
          ))}
        </div>

        <h1 className="text-3xl font-bold mb-2">{t(`legal.${current}.title`)}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t(`legal.${current}.lastUpdated`)}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          {((t(`legal.${current}.sections`) as any) as { heading: string; body: string }[])?.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold mb-2">{s.heading}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t text-sm text-muted-foreground">
          <p>{t("legal.contact")}</p>
        </div>
      </div>
    </div>
  );
}
