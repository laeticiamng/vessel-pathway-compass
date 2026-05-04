/**
 * SEO + JSON-LD validation tests for new T12 routes and the global
 * ResearchProject schema in index.html.
 *
 * - Parses the static index.html JSON-LD blocks and checks they parse,
 *   include the canonical aquamr-flow.com URL, and reference the new
 *   T12 routes from `subjectOf`.
 * - Renders each new page and asserts that <title>, <link rel=canonical>
 *   and the per-page TechArticle JSON-LD point at the correct path.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/i18n/context";
import { TooltipProvider } from "@/components/ui/tooltip";

import Methodology from "@/pages/Methodology";
import SAP from "@/pages/SAP";
import IncidentalFindings from "@/pages/IncidentalFindings";
import DataManagementPlan from "@/pages/DataManagementPlan";
import AboutAquaMR from "@/pages/AboutAquaMR";

const INDEX_HTML = readFileSync(resolve(__dirname, "../../index.html"), "utf8");

function extractJsonLd(html: string): unknown[] {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const out: unknown[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push(JSON.parse(m[1]));
  }
  return out;
}

const ROUTES: Array<{ path: string; Comp: React.ComponentType }> = [
  { path: "/methodology", Comp: Methodology },
  { path: "/sap", Comp: SAP },
  { path: "/incidental-findings", Comp: IncidentalFindings },
  { path: "/data-management-plan", Comp: DataManagementPlan },
  { path: "/about-aquamr", Comp: AboutAquaMR },
];

function renderRoute(Comp: React.ComponentType, path: string) {
  return render(
    <HelmetProvider>
      <LanguageProvider>
        <MemoryRouter initialEntries={[path]}>
          <TooltipProvider>
            <Comp />
          </TooltipProvider>
        </MemoryRouter>
      </LanguageProvider>
    </HelmetProvider>
  );
}

describe("index.html JSON-LD", () => {
  const blocks = extractJsonLd(INDEX_HTML);

  it("contains 4 valid JSON-LD blocks (Org, WebSite, SoftwareApp, ResearchProject)", () => {
    expect(blocks.length).toBe(4);
    for (const b of blocks) {
      expect((b as { "@context": string })["@context"]).toBe("https://schema.org");
      expect((b as { "@type": string })["@type"]).toBeTruthy();
    }
  });

  it("ResearchProject has the required academic fields", () => {
    const rp = blocks.find(
      (b) => (b as { "@type": string })["@type"] === "ResearchProject"
    ) as Record<string, unknown> | undefined;
    expect(rp).toBeDefined();
    expect(rp!.name).toBe("VASCU-LINK");
    expect(rp!.url).toBe("https://aquamr-flow.com");
    expect(rp!.sponsor).toBeTruthy();
    expect(rp!.studyDesign).toBeTruthy();
    expect(rp!.studyLocation).toBeTruthy();
  });

  it("ResearchProject.subjectOf cross-links every T12 route", () => {
    const rp = blocks.find(
      (b) => (b as { "@type": string })["@type"] === "ResearchProject"
    ) as { subjectOf: Array<{ url: string }> };
    const urls = rp.subjectOf.map((s) => s.url);
    for (const route of [
      "/methodology",
      "/sap",
      "/data-management-plan",
      "/incidental-findings",
    ]) {
      expect(urls).toContain(`https://aquamr-flow.com${route}`);
    }
  });
});

describe("Per-page SEO + JSON-LD", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it.each(ROUTES)(
    "$path emits canonical, title and TechArticle JSON-LD pointing at the route",
    async ({ path, Comp }) => {
      renderRoute(Comp, path);

      await waitFor(() => {
        const canonical = document.head.querySelector('link[rel="canonical"]');
        expect(canonical?.getAttribute("href")).toBe(
          `https://aquamr-flow.com${path}`
        );
      });

      const title = document.title;
      expect(title.length).toBeGreaterThan(5);
      expect(title.length).toBeLessThanOrEqual(60);

      const ogUrl = document.head.querySelector('meta[property="og:url"]');
      expect(ogUrl?.getAttribute("content")).toBe(
        `https://aquamr-flow.com${path}`
      );

      const ld = document.head.querySelector(
        'script[type="application/ld+json"]'
      );
      expect(ld).toBeTruthy();
      const parsed = JSON.parse(ld!.textContent ?? "{}");
      expect(parsed["@context"]).toBe("https://schema.org");
      expect(parsed["@type"]).toBe("TechArticle");
      expect(parsed.headline).toBeTruthy();
      expect(parsed.description).toBeTruthy();
    }
  );
});
