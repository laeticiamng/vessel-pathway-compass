import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const BASE_URL = "https://vascular-atlas.com";
const OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/804abac6-e232-40c4-ad96-d95870e4f118/id-preview-02ca198e--22a2eaf4-5506-427a-b4e7-0077ed460f35.lovable.app-1772885625498.png";

export function SEOHead({ title, description, path = "/", noindex = false, jsonLd }: SEOHeadProps) {
  const fullTitle = path === "/" ? title : `${title} | Vascular Atlas`;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Hreflang alternates */}
      <link rel="alternate" hreflang="en" href={`${BASE_URL}${path}`} />
      <link rel="alternate" hreflang="fr" href={`${BASE_URL}${path}${path.includes('?') ? '&' : '?'}lang=fr`} />
      <link rel="alternate" hreflang="de" href={`${BASE_URL}${path}${path.includes('?') ? '&' : '?'}lang=de`} />
      <link rel="alternate" hreflang="x-default" href={`${BASE_URL}${path}`} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Vascular Atlas" />
      <meta property="og:image" content={OG_IMAGE} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
