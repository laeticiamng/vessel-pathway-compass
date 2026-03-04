import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Building, Globe, Shield, Palette, CreditCard, ArrowRight, LogOut } from "lucide-react";
import { useTranslation, Language } from "@/i18n/context";
import { useTheme } from "next-themes";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const langs: { lang: string; code: Language }[] = [
  { lang: "English", code: "en" },
  { lang: "Français", code: "fr" },
  { lang: "Deutsch", code: "de" },
];

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("common.signOut"));
    navigate("/");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> {t("settings.institution.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.institution.name")}</Label>
            <Input placeholder={t("settings.institution.namePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label>{t("settings.institution.country")}</Label>
            <Input placeholder={t("settings.institution.countryPlaceholder")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> {t("settings.plan.title")}</CardTitle>
          <CardDescription>{t("settings.plan.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{t("settings.plan.currentPlan")}</span>
              <Badge variant="secondary">{t("settings.plan.free")}</Badge>
            </div>
            <Button asChild variant="default" size="sm">
              <Link to="/pricing">
                {t("settings.plan.viewPlans")}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> {t("settings.language.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {langs.map((l) => (
            <div key={l.code} className="flex items-center justify-between">
              <span className="text-sm">{l.lang} ({l.code.toUpperCase()})</span>
              <Switch checked={language === l.code} onCheckedChange={() => setLanguage(l.code)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> {t("settings.appearance.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("settings.appearance.darkMode")}</span>
            <Switch checked={theme === "dark"} onCheckedChange={(c) => setTheme(c ? "dark" : "light")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> {t("settings.security.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("settings.security.sso")}</span>
            <Button variant="outline" size="sm">{t("common.configure")}</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("settings.security.rateLimiting")}</span>
            <Button variant="outline" size="sm">{t("common.configure")}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            {t("common.signOut")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
