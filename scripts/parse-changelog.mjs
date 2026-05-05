#!/usr/bin/env node
/**
 * Parse a CHANGELOG.md file into a structured release array.
 *
 * Expected per-release format (see RELEASE_TEMPLATE.md):
 *   ## vX.Y.Z — <codename> (YYYY-MM-DD)
 *   <free-form summary paragraph(s)>
 *   ### <Section Title>
 *   - item
 *   - item
 *
 * Exports: parseChangelog(markdown) -> Release[]
 */

const HEADER_RE = /^## v(\d+\.\d+\.\d+) — (.+?) \((\d{4}-\d{2}-\d{2})\)\s*$/;
const SECTION_RE = /^### (.+?)\s*$/;
const BULLET_RE = /^[-*]\s+(.+?)\s*$/;

export function parseChangelog(markdown) {
  const lines = markdown.split(/\r?\n/);
  const releases = [];
  let cur = null;
  let curSection = null;
  let summaryBuf = [];

  const flushSummary = () => {
    if (cur && summaryBuf.length && !cur.summary) {
      cur.summary = summaryBuf.join(" ").replace(/\s+/g, " ").trim();
    }
    summaryBuf = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    const h = line.match(HEADER_RE);
    if (h) {
      flushSummary();
      cur = {
        version: h[1],
        codename: h[2].trim(),
        date: h[3],
        summary: "",
        sections: [],
      };
      curSection = null;
      releases.push(cur);
      continue;
    }
    if (!cur) continue;

    const s = line.match(SECTION_RE);
    if (s) {
      flushSummary();
      curSection = { title: s[1].trim(), items: [] };
      cur.sections.push(curSection);
      continue;
    }

    if (curSection) {
      const b = line.match(BULLET_RE);
      if (b) {
        // strip markdown emphasis/inline-code for plain UI text
        const text = b[1]
          .replace(/`([^`]+)`/g, "$1")
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .trim();
        curSection.items.push(text);
      }
      continue;
    }

    if (line.trim()) summaryBuf.push(line.trim());
  }
  flushSummary();
  return releases;
}
