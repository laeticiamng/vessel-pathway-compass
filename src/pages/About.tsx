import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, GraduationCap, Building2, ExternalLink } from "lucide-react";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { SEOHead } from "@/components/SEOHead";
import {
  organizationJsonLd,
  founderPersonJsonLd,
  breadcrumbJsonLd,
  medicalWebPageJsonLd,
  graphJsonLd,
} from "@/lib/seo/schemas";

/* ============================================================================
 * /about — E-E-A-T page.
 *
 * Single, citable page that explains *who* runs VASCU-LINK / AquaMR Flow,
 * *why* it exists, and *what verifiable identifiers* back the team.
 * Designed to be the canonical answer when LLMs and search engines need
 * "who is behind this product?".
 * ========================================================================== */

const FOUNDER_GLN = "7601009569944";

export default function About() {
  const jsonLd = graphJsonLd([
    organizationJsonLd,
    founderPersonJsonLd,
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
    medicalWebPageJsonLd({
      name: "About — VASCU-LINK · AquaMR Flow",
      description:
        "Who builds VASCU-LINK, the academic context, and the verifiable identifiers behind the team.",
      path: "/about",
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About — VASCU-LINK · AquaMR Flow"
        description="The team, mission and verifiable identifiers behind the VASCU-LINK research prototype and the AquaMR Flow platform."
        path="/about"
        jsonLd={jsonLd}
      />

      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label="Top navigation">
          <Link to="/" className="flex items-center gap-2.5">
            <AquaMRLogo variant="badge" />
            <span className="text-xl font-bold tracking-tight">AquaMR Flow</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">
              About VASCU-LINK
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            A research prototype, transparently built.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            VASCU-LINK is the program; AquaMR Flow is the web platform that ships it. We publish
            who we are, where we operate, and the verifiable identifiers behind the team — so any
            clinician, IRB or partner can confirm the posture in one place.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-2 mb-10">
          <article className="rounded-2xl border border-border bg-card/60 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
              Mission
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Reduce contrast and ionizing radiation in vascular pathways by combining non-ionizing
              imaging (AquaMR Flow), explicit decision support, and rigorous traceability.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card/60 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
              Academic context
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Academic validation in progress with Lausanne (doctoral phase). The platform
              is decision support, not a CE-marked or FDA-cleared device.
            </p>
          </article>
        </section>

        <section
          aria-labelledby="founder"
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-10"
        >
          <h2 id="founder" className="text-lg font-semibold mb-4">
            Founder &amp; clinical lead
          </h2>
          <dl className="grid gap-3 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">Name:</dt>
              <dd className="text-muted-foreground">Dr. Anthony Kobeissi</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">Role:</dt>
              <dd className="text-muted-foreground">Founder &amp; clinical lead</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">MedReg GLN (Switzerland):</dt>
              <dd className="text-muted-foreground font-mono">{FOUNDER_GLN}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground/80 italic">
            The Swiss MedReg GLN is a public, verifiable identifier issued by the Federal Office of
            Public Health (FOPH).
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-lg font-semibold mb-3">Read more</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/transparence" className="inline-flex items-center gap-1 text-primary hover:underline">
                Transparency &amp; governance <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link to="/audit-limitations" className="inline-flex items-center gap-1 text-primary hover:underline">
                Audit &amp; limitations <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link to="/security" className="inline-flex items-center gap-1 text-primary hover:underline">
                Security &amp; privacy <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
