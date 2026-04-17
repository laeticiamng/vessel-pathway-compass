import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Compass,
  Users,
  Sparkles,
  Stethoscope,
  ScanLine,
  FlaskConical,
  Building2,
  ClipboardList,
  Image as ImageIcon,
  Layers,
  Database,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/* =========================================================================
   EN BREF
   ======================================================================= */
export function EnBrefSection() {
  const items = [
    {
      icon: Compass,
      title: "Ce que c’est",
      desc: "Une plateforme web pour structurer la planification, l’imagerie, la simulation et la recherche en médecine vasculaire.",
    },
    {
      icon: Users,
      title: "Pour qui",
      desc: "Pour les équipes impliquées dans la préparation, la coordination et l’analyse des procédures vasculaires.",
    },
    {
      icon: Sparkles,
      title: "Ce que ça apporte",
      desc: "Une vue plus claire du workflow, moins de fragmentation entre outils, et une meilleure traçabilité des données.",
    },
  ];

  return (
    <section aria-labelledby="en-bref-title" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 id="en-bref-title" className="text-3xl md:text-4xl font-bold mb-3">
            En bref
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Comprendre AquaMR Flow en quelques secondes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <motion.article
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="rounded-2xl border bg-card p-6 card-hover"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   À QUI S’ADRESSE
   ======================================================================= */
export function AudienceSection() {
  const audiences = [
    { icon: Stethoscope, title: "Médecins vasculaires", desc: "Pour suivre les cas et structurer le workflow procédural." },
    { icon: ScanLine, title: "Radiologues / interventionnels", desc: "Pour organiser les données d’imagerie multimodale." },
    { icon: FlaskConical, title: "Équipes de recherche clinique", desc: "Pour centraliser les cohortes et faciliter l’analyse." },
    { icon: Building2, title: "Structures vasculaires", desc: "Pour mieux organiser les workflows à l’échelle de l’équipe." },
  ];

  return (
    <section aria-labelledby="audience-title" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 id="audience-title" className="text-3xl md:text-4xl font-bold mb-3">
            À qui s’adresse AquaMR Flow ?
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Une plateforme pensée pour les équipes vasculaires.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {audiences.map((a, i) => (
            <motion.article
              key={a.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="rounded-2xl border bg-card p-5 text-center card-hover"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <a.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">{a.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   COMMENT ÇA MARCHE
   ======================================================================= */
export function HowItWorksFRSection() {
  const steps = [
    { icon: ClipboardList, title: "Centraliser les informations", desc: "Centraliser les informations utiles au cas." },
    { icon: ImageIcon, title: "Préparer la procédure", desc: "Préparer la procédure avec les données d’imagerie disponibles." },
    { icon: Layers, title: "Structurer la simulation", desc: "Structurer la simulation clinique et la coordination du workflow." },
    { icon: Database, title: "Consolider les données", desc: "Consolider les données pour le suivi et la recherche." },
  ];

  return (
    <section aria-labelledby="how-fr-title" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 id="how-fr-title" className="text-3xl md:text-4xl font-bold mb-3">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Un parcours en quatre étapes.
          </p>
        </motion.div>

        <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="rounded-2xl border bg-card p-6 relative"
            >
              <span className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                {i + 1}
              </span>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* =========================================================================
   CAS D’USAGE
   ======================================================================= */
export function UseCasesSection() {
  const cases = [
    { title: "Préparation pré-procédure", desc: "Organiser les éléments cliniques et d’imagerie avant l’intervention." },
    { title: "Simulation clinique", desc: "Structurer des scénarios pour s’entraîner aux décisions de workflow." },
    { title: "Registre de recherche", desc: "Centraliser les cas pour le suivi longitudinal et l’analyse." },
  ];

  return (
    <section aria-labelledby="usecases-title" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 id="usecases-title" className="text-3xl md:text-4xl font-bold mb-3">
            Cas d’usage
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Trois manières concrètes d’utiliser AquaMR Flow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {cases.map((c, i) => (
            <motion.article
              key={c.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="rounded-2xl border bg-card p-6 card-hover"
            >
              <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   LIMITES ACTUELLES
   ======================================================================= */
export function LimitsSection() {
  return (
    <section aria-labelledby="limits-title" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto rounded-2xl border bg-card/60 p-8">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h2 id="limits-title" className="text-2xl md:text-3xl font-bold mb-3">
                Limites actuelles
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <li>Le contenu visible sur cette page décrit un prototype de recherche.</li>
                <li>
                  Le cadre exact d’usage clinique, réglementaire et opérationnel doit être précisé dans les pages
                  dédiées.
                </li>
                <li>
                  Les informations présentées ici ont pour but d’expliquer le produit, pas de formuler des promesses
                  non vérifiées.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link to="/securite-confidentialite" className="text-primary hover:underline">
                  Sécurité et confidentialité
                </Link>
                <span className="text-muted-foreground/50">•</span>
                <Link to="/legal/notice" className="text-primary hover:underline">
                  Mentions légales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   FAQ HOMEPAGE
   ======================================================================= */
export function HomeFAQSection() {
  const faqs = [
    {
      q: "Qu’est-ce qu’AquaMR Flow ?",
      a: "AquaMR Flow est une plateforme web qui aide à structurer la planification, l’imagerie, la simulation et la recherche autour des procédures vasculaires.",
    },
    {
      q: "À qui s’adresse la plateforme ?",
      a: "Aux équipes impliquées dans la préparation, la coordination et l’analyse des procédures vasculaires : médecins vasculaires, radiologues interventionnels, équipes de recherche et structures vasculaires.",
    },
    {
      q: "Quels problèmes le produit cherche-t-il à résoudre ?",
      a: "La fragmentation des outils, la difficulté à centraliser les informations utiles au cas, et le manque de traçabilité des données entre la préparation, la procédure et le suivi.",
    },
    {
      q: "Le produit remplace-t-il tous les outils existants ?",
      a: "Non. AquaMR Flow s’intègre dans un environnement existant et vise à mieux organiser le workflow autour des outils déjà utilisés par les équipes.",
    },
    {
      q: "Le produit est-il déjà déployé en routine ?",
      a: "Le contenu présenté ici décrit un prototype de recherche. Le cadre d’usage opérationnel précis est à confirmer avec l’équipe avant tout déploiement.",
    },
    {
      q: "Comment en savoir plus ou demander un accès ?",
      a: "Vous pouvez consulter la page Tarifs, parcourir la FAQ, ou contacter l’équipe via la page Contact.",
    },
  ];

  return (
    <section aria-labelledby="home-faq-title" className="py-20 bg-muted/40">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 id="home-faq-title" className="text-3xl md:text-4xl font-bold mb-3">
              Questions fréquentes
            </h2>
            <p className="text-muted-foreground text-base">
              Les réponses essentielles, sans promesses.
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem key={i} value={`home-faq-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left text-base hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Plus de questions ?{" "}
            <Link to="/faq" className="text-primary hover:underline">
              Consulter la FAQ complète
            </Link>{" "}
            ou{" "}
            <Link to="/contact" className="text-primary hover:underline">
              contacter l’équipe
            </Link>
            .
          </div>
        </div>
      </div>
    </section>
  );
}

/* JSON-LD for the FAQ section (for search engines) */
export const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu’est-ce qu’AquaMR Flow ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AquaMR Flow est une plateforme web qui aide à structurer la planification, l’imagerie, la simulation et la recherche autour des procédures vasculaires.",
      },
    },
    {
      "@type": "Question",
      name: "À qui s’adresse la plateforme ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Aux équipes impliquées dans la préparation, la coordination et l’analyse des procédures vasculaires.",
      },
    },
    {
      "@type": "Question",
      name: "Quels problèmes le produit cherche-t-il à résoudre ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La fragmentation des outils, la centralisation des informations cas et la traçabilité des données entre préparation, procédure et suivi.",
      },
    },
    {
      "@type": "Question",
      name: "Le produit remplace-t-il tous les outils existants ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. AquaMR Flow s’intègre dans un environnement existant et vise à mieux organiser le workflow.",
      },
    },
    {
      "@type": "Question",
      name: "Le produit est-il déjà déployé en routine ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le contenu présenté décrit un prototype de recherche. Le cadre d’usage opérationnel doit être confirmé avant tout déploiement.",
      },
    },
    {
      "@type": "Question",
      name: "Comment en savoir plus ou demander un accès ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Consulter la page Tarifs, la FAQ ou contacter l’équipe via la page Contact.",
      },
    },
  ],
};
