import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, HeartPulse, Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/context";

export default function Contact() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("contact-form", {
        body: { name: name.trim(), email: email.trim(), message: message.trim() },
      });
      if (error) throw error;
      toast.success(t("contactPage.success"));
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error(t("contactPage.error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("contactPage.seo.title")}
        description={t("contactPage.seo.description")}
        path="/contact"
      />

      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label={t("home.nav.mainAria")}>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">AquaMR Flow</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              {t("contactPage.backHome")}
            </Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-2xl">
        <div className="text-center mb-10">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("contactPage.title")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("contactPage.subtitle")}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
                aria-hidden="true"
              />
              <div>
                <Label htmlFor="contact-name">{t("contactPage.nameLabel")}</Label>
                <Input
                  id="contact-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("contactPage.namePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="contact-email">{t("contactPage.emailLabel")}</Label>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("contactPage.emailPlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="contact-message">{t("contactPage.messageLabel")}</Label>
                <Textarea
                  id="contact-message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("contactPage.messagePlaceholder")}
                  rows={6}
                />
              </div>
              <Button type="submit" disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("contactPage.sending")}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("contactPage.send")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("contactPage.seeAlso")}{" "}
          <Link to="/faq" className="text-primary hover:underline">FAQ</Link>{" "}•{" "}
          <Link to="/securite-confidentialite" className="text-primary hover:underline">{t("contactPage.securityLink")}</Link>{" "}•{" "}
          <Link to="/pricing" className="text-primary hover:underline">{t("contactPage.pricingLink")}</Link>
        </p>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t("contactPage.backHome")}</Link>
          <span className="mx-2">•</span>
          <Link to="/pricing" className="hover:text-foreground">{t("contactPage.pricingLink")}</Link>
        </div>
      </footer>
    </div>
  );
}
