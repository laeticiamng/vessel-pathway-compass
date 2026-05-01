import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
  /** Override the default OG image (must be 1200x630, absolute URL or /-prefixed path) */
  image?: string;
  imageAlt?: string;
  /** og:type — defaults to 'website'. Use 'article' for blog/doc pages. */
  type?: "website" | "article";
}

const BASE_URL = "https://aquamr-flow.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const DEFAULT_OG_ALT =
  "AquaMR Flow — vascular clinical platform: non-ionizing, contrast-sparing, evidence-based.";
const TWITTER_HANDLE = "@aquamrflow";

/**
 * Truncate to a safe length for OG/Twitter previews.
 * - title: 60 chars (Google), platforms typically clip ~70
 * - description: 160 chars (Google), Twitter clips ~200, FB ~300
 */
function clamp(text: string, max: number): string {
  if (!text) return text;
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export function SEOHead({
  title,
  description,
  path = "/",
  noindex = false,
  jsonLd,
  image,
  imageAlt,
  type = "website",
}: SEOHeadProps) {
  const fullTitle = path === "/" ? title : `${title} | AquaMR Flow`;
  const safeTitle = clamp(fullTitle, 60);
  const safeDescription = clamp(description, 160);
  const canonicalUrl = `${BASE_URL}${path}`;

  // Resolve image to an absolute URL when a relative path is provided
  const resolvedImage = !image
    ? DEFAULT_OG_IMAGE
    : image.startsWith("http")
      ? image
      : `${BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  const resolvedAlt = imageAlt ?? DEFAULT_OG_ALT;

  return (
    <Helmet>
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="AquaMR Flow" />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:secure_url" content={resolvedImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={resolvedAlt} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={clamp(description, 200)} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:image:alt" content={resolvedAlt} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
