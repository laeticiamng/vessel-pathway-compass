import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HeartPulse, Shield, Lock, Eye, FileText } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const principles = [
  {
    icon: Lock,
    title: "Protection des données",
    desc: "Les données sont chiffrées en transit et au repos. L’accès est contrôlé par compte authentifié.",
  },
  {
    icon: Eye,
    title: "Visibilité limitée",
    desc: "Chaque utilisateur n’accède qu’aux données qui le concernent, selon son rôle dans la plateforme.",
  },
  {
    icon: FileText,
    title: "Traçabilité",
    desc: "Les opérations sensibles font l’objet d’un journal pour assurer une traçabilité claire des actions.",
  },
];

export default function SecurityPrivacy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Sécurité et confidentialité — AquaMR Flow"
        description="Approche d’AquaMR Flow en matière de sécurité, de confidentialité et de protection des données : principes, périmètre du prototype et liens vers les mentions légales."
        path="/securite-confidentialite"
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
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Sécurité et confidentialité</h1>
          <p className="text-muted-foreground text-lg">
            Notre approche de la protection des données dans le cadre du prototype actuel.
          </p>
        </div>

        <section aria-labelledby="principles-title" className="mb-12">
          <h2 id="principles-title" className="text-2xl font-semibold mb-6">Principes</h2>
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
          <h2 id="scope-title" className="text-2xl font-semibold mb-3">Périmètre du prototype</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            AquaMR Flow est aujourd’hui un prototype de recherche. Les fonctionnalités, le périmètre exact des
            traitements et les engagements opérationnels sont susceptibles d’évoluer.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Pour toute information précise sur le traitement des données, le responsable de traitement et les droits
            associés, se référer aux mentions légales et à la politique de confidentialité.
          </p>
        </section>

        <section aria-labelledby="next-title" className="rounded-2xl border bg-card p-8 text-center">
          <h2 id="next-title" className="text-xl font-semibold mb-3">Pour aller plus loin</h2>
          <p className="text-muted-foreground mb-6">
            Consulter les pages dédiées ou contacter l’équipe pour toute question.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/legal/privacy">Politique de confidentialité</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/legal/notice">Mentions légales</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/contact">Nous contacter</Link>
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
          <Link to="/faq" className="hover:text-foreground">FAQ</Link>
          <span className="mx-2">•</span>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
