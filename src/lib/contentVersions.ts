/**
 * Internal content versioning registry for static editorial pages.
 *
 * Each entry tracks:
 *  - `version`: semantic version string (MAJOR.MINOR.PATCH)
 *  - `updatedAt`: ISO date the current content was last edited
 *  - `changelog`: reverse-chronological list of changes
 *
 * Bump rules (internal convention):
 *  - PATCH: typo / wording / locale-only change.
 *  - MINOR: added or removed item, new section, regulatory rephrasing.
 *  - MAJOR: structural rewrite or change in editorial posture.
 *
 * This file is the single source of truth referenced by:
 *  - /audit-limitations (page footer + PDF export)
 *  - /faq (page footer)
 *  - PDF builders for chain-of-custody on exported documents.
 */

export interface ContentChangelogEntry {
  version: string;
  date: string; // ISO YYYY-MM-DD
  summary: string;
}

export interface ContentVersion {
  id: string;
  version: string;
  updatedAt: string; // ISO YYYY-MM-DD
  changelog: ContentChangelogEntry[];
}

export const CONTENT_VERSIONS: Record<string, ContentVersion> = {
  "audit-limitations": {
    id: "audit-limitations",
    version: "1.1.0",
    updatedAt: "2026-05-03",
    changelog: [
      {
        version: "1.1.0",
        date: "2026-05-03",
        summary:
          "Added PDF export with table of contents, content version date and compliance-ready disclaimers (no regulatory promises).",
      },
      {
        version: "1.0.0",
        date: "2026-04-28",
        summary:
          "Initial publication: 'does / does not / traceability' triptych aligned with VASCU-LINK thesis v7 and T8/T10 audit.",
      },
    ],
  },
  faq: {
    id: "faq",
    version: "1.2.0",
    updatedAt: "2026-05-03",
    changelog: [
      {
        version: "1.2.0",
        date: "2026-05-03",
        summary:
          "Synchronized compliance-ready statements with /audit-limitations and exposed internal version metadata in the page footer.",
      },
      {
        version: "1.1.0",
        date: "2026-04-28",
        summary:
          "Removed HIPAA wording, softened GDPR/nFADP claims to 'designed to target requirements', mention of simplified DPIA for institutional pilots.",
      },
      {
        version: "1.0.0",
        date: "2026-04-15",
        summary:
          "Initial public FAQ aligned with VASCU-LINK launch and i18n EN/FR/DE.",
      },
    ],
  },
};

export function getContentVersion(id: string): ContentVersion | undefined {
  return CONTENT_VERSIONS[id];
}
