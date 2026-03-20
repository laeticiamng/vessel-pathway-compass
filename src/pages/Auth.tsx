import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, Globe, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation, type Language } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export default function Auth() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [isForgot, setIsForgot] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const langLabels: Record<Language, string> = { en: "EN", fr: "FR", de: "DE" };

  // Redirect if already authenticated
  if (session) {
    return <Navigate to="/app" replace />;
  }

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
          setConfirmationEmail(email);
          setShowConfirmation(true);
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
    <div className="min-h-screen-safe flex items-center justify-center bg-background p-4 sm:p-6">
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
        <SEOHead title={t("seo.auth.title") as string} description={t("seo.auth.description") as string} path="/auth" noindex />
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">AquaMR Flow</span>
        </Link>

        {showConfirmation ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto rounded-full bg-primary/10 p-4 mb-2">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{t("auth.confirmationTitle")}</CardTitle>
              <CardDescription>
                {t("auth.confirmationDesc")} <strong>{confirmationEmail}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">{t("auth.confirmationNote")}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  const { error } = await supabase.auth.resend({ type: "signup", email: confirmationEmail });
                  if (error) {
                    toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
                  } else {
                    toast({ title: t("auth.checkEmail"), description: t("auth.resendSuccess") });
                  }
                  setLoading(false);
                }}
              >
                {t("auth.resendEmail")}
              </Button>
              <button
                type="button"
                onClick={() => { setShowConfirmation(false); setIsSignUp(false); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("auth.backToLogin")}
              </button>
            </CardFooter>
          </Card>
        ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {isForgot ? t("auth.forgotPassword") : isSignUp ? t("auth.createAccount") : t("auth.welcomeBack")}
            </CardTitle>
            <CardDescription>
              {isForgot ? t("auth.forgotPasswordDesc") : isSignUp ? t("auth.signUpDesc") : t("auth.signInDesc")}
            </CardDescription>
          </CardHeader>

          {!isForgot && (
            <CardContent className="pb-0">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) {
                    toast({ title: t("auth.error"), description: String(error), variant: "destructive" });
                    setLoading(false);
                  }
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {t("auth.continueWithGoogle")}
              </Button>
              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  {t("auth.orContinueWith")}
                </span>
              </div>
            </CardContent>
          )}

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
              <CardContent className="space-y-4 pt-0">
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
                    minLength={8}
                  />
                  {isSignUp && password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => {
                          const strength = (password.length >= 8 ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
                          return (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= strength
                                  ? strength <= 1 ? "bg-destructive" : strength <= 2 ? "bg-warning" : "bg-success"
                                  : "bg-muted"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const strength = (password.length >= 8 ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
                          return strength <= 1 ? t("auth.passwordWeak") : strength <= 2 ? t("auth.passwordMedium") : t("auth.passwordStrong");
                        })()}
                      </p>
                    </div>
                  )}
                </div>
                {isSignUp && (
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(c) => setAcceptedTerms(c === true)}
                      />
                      <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                        {t("auth.acceptTerms")}{" "}
                        <Link to="/legal/terms" className="text-primary hover:underline" target="_blank">{t("legal.tabs.terms")}</Link>
                        {" & "}
                        <Link to="/legal/privacy" className="text-primary hover:underline" target="_blank">{t("legal.tabs.privacy")}</Link>
                      </label>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 pl-6">{t("auth.acceptTermsHint")}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading || (isSignUp && !acceptedTerms)}>
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
        )}
      </div>
    </div>
  );
}
