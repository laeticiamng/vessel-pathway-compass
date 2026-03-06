import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation, type Language } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const langLabels: Record<Language, string> = { en: "EN", fr: "FR", de: "DE" };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: t("auth.checkEmail"),
        description: t("auth.resetEmailSent"),
      });
      setIsForgot(false);
    } catch (error: any) {
      toast({
        title: t("auth.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          navigate("/app");
        } else {
          toast({
            title: t("auth.checkEmail"),
            description: t("auth.checkEmailDesc"),
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/app");
      }
    } catch (error: any) {
      toast({
        title: t("auth.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Globe className="h-4 w-4" />
              {langLabels[language]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["en", "fr", "de"] as Language[]).map((lang) => (
              <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className={language === lang ? "font-semibold" : ""}>
                {lang === "en" ? "English" : lang === "fr" ? "Français" : "Deutsch"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">Vascular Atlas</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {isForgot ? t("auth.forgotPassword") : isSignUp ? t("auth.createAccount") : t("auth.welcomeBack")}
            </CardTitle>
            <CardDescription>
              {isForgot ? t("auth.forgotPasswordDesc") : isSignUp ? t("auth.signUpDesc") : t("auth.signInDesc")}
            </CardDescription>
          </CardHeader>

          {isForgot ? (
            <form onSubmit={handleForgotPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("common.loading") : t("auth.sendResetLink")}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsForgot(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("auth.backToSignIn")}
                </button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgot(true)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t("auth.forgotPassword")}
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("common.loading") : isSignUp ? t("auth.createBtn") : t("auth.signInBtn")}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isSignUp ? t("auth.switchToSignIn") : t("auth.switchToSignUp")}
                </button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
