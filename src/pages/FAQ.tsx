import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, HeartPulse, HelpCircle } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const faqs = [
  {
    q: "Qu’est-ce qu’AquaMR Flow ?",
    a: "AquaMR Flow est une plateforme web qui aide à structurer la planification, l’imagerie, la simulation et la recherche autour des procédures vasculaires. Le contenu présenté ici décrit un prototype de recherche.",
  },
  {
    q: "À qui s’adresse la plateforme ?",
    a: "Aux équipes impliquées dans la préparation, la coordination et l’analyse des procédures vasculaires : médecins vasculaires, radiologues interventionnels, équipes de recherche clinique et structures vasculaires.",
  },
  {
    q: "Quels problèmes le produit cherche-t-il à résoudre ?",
    a: "La fragmentation entre outils, la difficulté à centraliser les informations utiles au cas, et le manque de traçabilité des données entre la préparation, la procédure et le suivi.",
  },
  {
    q: "Le produit remplace-t-il tous les outils existants ?",
    a: "Non. AquaMR Flow vise à mieux organiser le workflow autour des outils déjà utilisés et ne remplace pas les systèmes en place.",
  },
  {
    q: "Le produit est-il déjà déployé en routine ?",
    a: "Le contenu visible ici décrit un prototype de recherche. Le cadre exact d’usage clinique et opérationnel doit être précisé avec l’équipe avant tout déploiement.",
  },
  {
    q: "Comment en savoir plus ou demander un accès ?",
    a: "Vous pouvez consulter la page Tarifs pour voir les options, ou utiliser la page Contact pour échanger directement avec l’équipe.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: "Les questions de sécurité, de confidentialité et de traitement des données sont décrites sur la page Sécurité et confidentialité ainsi que dans nos mentions légales.",
  },
  {
    q: "Y a-t-il des limites au prototype actuel ?",
    a: "Oui. Les fonctionnalités présentées sont en cours d’évolution. Toute information non explicitement confirmée sur le site doit être considérée comme indicative.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="FAQ — Questions fréquentes sur AquaMR Flow"
        description="Réponses aux questions fréquentes sur AquaMR Flow : ce que c’est, à qui ça s’adresse, limites du prototype, sécurité, accès et tarifs."
        path="/faq"
        jsonLd={faqJsonLd}
      />

      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label="Navigation principale">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">AquaMR Flow</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Accueil
            </Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Questions fréquentes</h1>
          <p className="text-muted-foreground text-lg">
            Comprendre AquaMR Flow, ses usages et ses limites.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left text-base hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <section aria-labelledby="faq-next-title" className="mt-16 rounded-2xl border bg-card p-8 text-center">
          <h2 id="faq-next-title" className="text-xl font-semibold mb-3">Vous ne trouvez pas votre réponse ?</h2>
          <p className="text-muted-foreground mb-6">
            Consultez les autres pages dédiées ou contactez directement l’équipe.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/contact">Nous contacter</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">Voir les tarifs</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/securite-confidentialite">Sécurité et confidentialité</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Accueil</Link>
          <span className="mx-2">•</span>
          <Link to="/pricing" className="hover:text-foreground">Tarifs</Link>
          <span className="mx-2">•</span>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
          <span className="mx-2">•</span>
          <Link to="/securite-confidentialite" className="hover:text-foreground">Sécurité</Link>
        </div>
      </footer>
    </div>
  );
}
