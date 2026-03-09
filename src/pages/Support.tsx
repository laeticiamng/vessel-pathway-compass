import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, HeartPulse, Mail, MessageCircle, BookOpen, Shield, Globe, Send, Loader2 } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Support() {
  const { t, language, setLanguage } = useTranslation();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);

  const faqItems: { q: string; a: string }[] = (t("support.faq.items") as any) || [];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("contact-form", {
        body: { name: contactName.trim(), email: contactEmail.trim(), message: contactMessage.trim() },
      });
      if (error) throw error;
      toast.success(t("support.contact.sent") as string);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error(t("support.contact.error") as string);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seo.support.title") as string}
        description={t("seo.support.description") as string}
        path="/support"
      />
      <nav className="border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <HeartPulse className="h-5 w-5 text-primary" />
            <span className="font-bold">Vascular Atlas</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="h-4 w-4" />
                {language.toUpperCase()}
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
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">{t("support.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("support.subtitle")}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t("support.email.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("support.email.desc")}</p>
                <a href="mailto:support@vascularatlas.com" className="text-sm text-primary hover:underline mt-2 inline-block">
                  support@vascularatlas.com
                </a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t("support.response.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("support.response.desc")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-1">{t("support.contact.title")}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t("support.contact.desc")}</p>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">{t("support.contact.name")}</Label>
                  <Input
                    id="contact-name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={t("support.contact.namePlaceholder") as string}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">{t("support.contact.email")}</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder={t("support.contact.emailPlaceholder") as string}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">{t("support.contact.message")}</Label>
                <Textarea
                  id="contact-message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={t("support.contact.messagePlaceholder") as string}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" disabled={sending} className="gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? (t("common.loading") as string) : (t("support.contact.send") as string)}
              </Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-6">{t("support.faq.title")}</h2>
        {Array.isArray(faqItems) && faqItems.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          <Button variant="outline" asChild>
            <Link to="/legal/terms" className="gap-2">
              <Shield className="h-4 w-4" />
              {t("support.links.terms")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/legal/privacy" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {t("support.links.privacy")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
