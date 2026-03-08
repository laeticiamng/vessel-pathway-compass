import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionSettingsCard } from "@/components/SubscriptionSettingsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Building, Globe, Shield, Palette, CreditCard, ArrowRight, LogOut, User, Loader2 } from "lucide-react";
import { useTranslation, Language } from "@/i18n/context";
import { useTheme } from "next-themes";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SEOHead } from "@/components/SEOHead";

const langs: { lang: string; code: Language }[] = [
  { lang: "English", code: "en" },
  { lang: "Français", code: "fr" },
  { lang: "Deutsch", code: "de" },
];

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [displayName, setDisplayName] = useState("");
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setInstitution(profile.institution ?? "");
      setRole(profile.role ?? "");
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          institution,
          role,
        })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(t("settings.profile.saved"));
    },
    onError: () => toast.error(t("auth.error")),
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("common.signOut"));
    navigate("/");
  };

  const hasChanges =
    profile &&
    (displayName !== (profile.display_name ?? "") ||
      institution !== (profile.institution ?? "") ||
      role !== (profile.role ?? ""));

  return (
    <>
      <SEOHead title={t("seo.settings.title") as string} description={t("seo.settings.description") as string} path="/app/settings" noindex />
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
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> {t("settings.profile.title")}</CardTitle>
          <CardDescription>{t("settings.profile.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>{t("settings.profile.displayName")}</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("settings.profile.displayNamePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("settings.profile.role")}</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder={t("settings.profile.rolePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("settings.profile.institution")}</Label>
                <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder={t("settings.institution.namePlaceholder")} />
              </div>
              <Button onClick={() => updateProfile.mutate()} disabled={!hasChanges || updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("common.save")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <SubscriptionSettingsCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> {t("settings.language.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {langs.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.lang} ({l.code.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <Badge variant="secondary" className="text-xs">{t("common.comingSoon")}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("settings.security.rateLimiting")}</span>
            <Badge variant="secondary" className="text-xs">{t("common.comingSoon")}</Badge>
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
    </>
  );
}
