/**
 * Centralized JSON-LD schema builders for SEO + GEO discoverability.
 *
 * Goal: give Google, Bing/Copilot, and ChatGPT Search well-formed
 * structured data that explains *what* the platform is, *who* runs it,
 * and *where* it sits in the site graph — without overpromising
 * (no CE/FDA/HIPAA claims).
 */

export const BASE_URL = "https://aquamr-flow.com";

/** Single source of truth for the publisher Organization node. */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "VASCU-LINK · AquaMR Flow",
  alternateName: ["AquaMR Flow", "VASCU-LINK"],
  url: BASE_URL,
  logo: `${BASE_URL}/og-image.jpg`,
  description:
    "Research prototype for non-ionizing, contrast-sparing vascular clinical workflow. Decision support — not a regulated medical device.",
  foundingDate: "2024",
  areaServed: ["CH", "EU"],
  knowsAbout: [
    "Vascular imaging",
    "MR angiography",
    "Contrast-induced acute kidney injury",
    "Clinical decision support",
    "Patient-reported outcomes",
  ],
};

/**
 * Founder / clinical lead Person node.
 * GLN per project memory (mem://identity/medreg-gln).
 */
export const founderPersonJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${BASE_URL}/about#founder`,
  name: "Dr. Anthony Kobeissi",
  jobTitle: "Founder & Clinical Lead",
  worksFor: { "@id": `${BASE_URL}/#organization` },
  identifier: [
    {
      "@type": "PropertyValue",
      propertyID: "MedReg GLN (Switzerland)",
      value: "7601009569944",
    },
  ],
  knowsAbout: [
    "Interventional radiology",
    "Vascular imaging",
    "Clinical research",
  ],
};

/** Build a BreadcrumbList for a given trail. Pass [{ name, path }, ...]. */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: `${BASE_URL}${it.path.startsWith("/") ? it.path : `/${it.path}`}`,
    })),
  };
}

/**
 * MedicalWebPage node for trust/transparency content.
 * `audience` is intentionally HealthcareProfessional — this is decision
 * support material, not patient-facing diagnostic content.
 */
export function medicalWebPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  lastReviewed?: string; // ISO date
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: opts.name,
    description: opts.description,
    url: `${BASE_URL}${opts.path}`,
    inLanguage: ["en", "fr", "de"],
    audience: {
      "@type": "MedicalAudience",
      audienceType: "HealthcareProfessional",
    },
    publisher: { "@id": `${BASE_URL}/#organization` },
    ...(opts.lastReviewed
      ? { lastReviewed: opts.lastReviewed, datePublished: opts.lastReviewed }
      : {}),
    // Explicit non-claim — useful signal for LLMs that summarize trust posture.
    isAccessibleForFree: true,
    specialty: "Radiology",
  };
}

/** Wrap multiple nodes in a single @graph container. */
export function graphJsonLd(nodes: Array<Record<string, unknown>>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.map((n) => {
      // Strip duplicate @context inside graph nodes.
      const { ["@context"]: _ctx, ...rest } = n as Record<string, unknown>;
      return rest;
    }),
  };
}
