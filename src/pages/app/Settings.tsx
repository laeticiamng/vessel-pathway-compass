import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionSettingsCard } from "@/components/SubscriptionSettingsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings as SettingsIcon, Building, Globe, Shield, Palette, CreditCard, ArrowRight, LogOut, User, Loader2, Camera, Trash2 } from "lucide-react";
import { useTranslation, Language } from "@/i18n/context";
import { useTheme } from "next-themes";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { SEOHead } from "@/components/SEOHead";

function PasswordChangeForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error(t("settings.security.minLength") || "Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.security.mismatch") || "Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("settings.security.changed") || "Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>{t("settings.security.newPassword") || "New Password"}</Label>
        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <Label>{t("settings.security.confirmPassword") || "Confirm Password"}</Label>
        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <Button onClick={handleChangePassword} disabled={loading || !newPassword || !confirmPassword} variant="outline">
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {t("settings.security.changePassword") || "Change Password"}
      </Button>
    </div>
  );
}

function AvatarUpload({ userId, currentUrl, onUpdated }: { userId?: string; currentUrl?: string | null; onUpdated: () => void }) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2MB)");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: avatarUrl } as any).eq("user_id", userId);
      toast.success(t("settings.profile.avatarUpdated"));
      onUpdated();
    } catch (err) {
      console.error(err);
      toast.error(t("settings.profile.avatarError"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!userId) return;
    setUploading(true);
    try {
      await supabase.from("profiles").update({ avatar_url: null } as any).eq("user_id", userId);
      toast.success(t("settings.profile.avatarRemoved"));
      onUpdated();
    } catch {
      toast.error(t("settings.profile.avatarError"));
    } finally {
      setUploading(false);
    }
  };

  const initials = userId?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={currentUrl ?? undefined} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{t("settings.profile.avatarDesc")}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Camera className="h-3.5 w-3.5 mr-1" />}
            {t("settings.profile.uploadAvatar")}
          </Button>
          {currentUrl && (
            <Button size="sm" variant="ghost" onClick={handleRemove} disabled={uploading}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              {t("settings.profile.removeAvatar")}
            </Button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  );
}

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
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
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
              <AvatarUpload userId={user?.id} currentUrl={(profile as any)?.avatar_url} onUpdated={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} />
              <div className="space-y-2">
                <Label>{t("settings.profile.displayName")}</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("settings.profile.displayNamePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("settings.profile.role")}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.profile.rolePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(["physician", "trainee", "expert_reviewer", "hospital_admin", "research_lead"] as const).map((r) => (
                      <SelectItem key={r} value={r}>{t(`onboarding.roles.${r}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("settings.security.desc")}</p>
          <PasswordChangeForm />
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
