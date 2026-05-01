/**
 * JSON-LD structured data for the landing page.
 * Pure data module — kept separate from React component files so the
 * landing page can import these constants without dragging the heavy
 * section components into the initial bundle.
 */

export const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu'est-ce qu'AquaMR Flow ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AquaMR Flow est une plateforme web qui aide à structurer la planification, l'imagerie, la simulation et la recherche autour des procédures vasculaires.",
      },
    },
    {
      "@type": "Question",
      name: "À qui s'adresse la plateforme ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Aux équipes impliquées dans la préparation, la coordination et l'analyse des procédures vasculaires.",
      },
    },
    {
      "@type": "Question",
      name: "Quels problèmes le produit cherche-t-il à résoudre ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La fragmentation des outils et le manque de traçabilité des données entre la préparation, la procédure et le suivi.",
      },
    },
  ],
};

export const complianceFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does \"no regulatory approval\" mean for AquaMR Flow?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AquaMR Flow is a research prototype, not a CE-marked or FDA-cleared medical device. It is not intended for unsupervised diagnosis or treatment. Every decision-support output requires confirmation by a qualified clinician.",
      },
    },
    {
      "@type": "Question",
      name: "How is auditability ensured?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every clinical action (read, write, export, decision) is timestamped and attributable to an authenticated user. Logs are immutable in our backend and accessible to institution administrators upon request.",
      },
    },
    {
      "@type": "Question",
      name: "How is data security designed in?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Encryption at rest and in transit, Row-Level Security on all sensitive tables, role-based access control, pseudonymization of patient data, and an architecture targeting GDPR / Swiss nFADP and IEC 62304 compliance.",
      },
    },
  ],
};
