/**
 * Editorial overlay for content versioning.
 *
 * The static `CONTENT_VERSIONS` registry remains the canonical, code-shipped
 * source of truth. This module adds a *local* editorial layer:
 *
 *  - Admin users can stage version bumps, date corrections and changelog
 *    edits without touching the codebase.
 *  - Every change is recorded in a local audit log (who, when, before/after)
 *    so an editor can review or revert.
 *  - The overlay is intentionally `localStorage` based: changes stay on the
 *    device of the editor until a developer commits them to
 *    `src/lib/contentVersions.ts`. This keeps the regulatory chain of
 *    custody auditable in the codebase while letting non-developers prepare
 *    drafts safely.
 */

import {
  CONTENT_VERSIONS,
  type ContentVersion,
  type ContentChangelogEntry,
} from "./contentVersions";

const OVERLAY_KEY = "vascu-content-versions-overlay";
const AUDIT_KEY = "vascu-content-versions-audit";

export interface AuditLogEntry {
  id: string;
  contentId: string;
  at: string; // ISO timestamp
  actor: string; // email or user id
  action: "draft" | "publish" | "revert";
  before: ContentVersion | null;
  after: ContentVersion;
}

type Overlay = Record<string, ContentVersion>;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readOverlay(): Overlay {
  if (typeof window === "undefined") return {};
  return safeParse<Overlay>(localStorage.getItem(OVERLAY_KEY), {});
}

function writeOverlay(o: Overlay) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OVERLAY_KEY, JSON.stringify(o));
}

export function readAuditLog(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  const log = safeParse<AuditLogEntry[]>(localStorage.getItem(AUDIT_KEY), []);
  return log.sort((a, b) => (a.at < b.at ? 1 : -1));
}

function appendAudit(entry: AuditLogEntry) {
  if (typeof window === "undefined") return;
  const current = safeParse<AuditLogEntry[]>(
    localStorage.getItem(AUDIT_KEY),
    [],
  );
  current.push(entry);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(current));
}

export function getEffectiveVersion(id: string): ContentVersion | undefined {
  const overlay = readOverlay();
  return overlay[id] ?? CONTENT_VERSIONS[id];
}

export function getCanonicalVersion(id: string): ContentVersion | undefined {
  return CONTENT_VERSIONS[id];
}

export function listKnownContentIds(): string[] {
  const overlay = readOverlay();
  return Array.from(
    new Set([...Object.keys(CONTENT_VERSIONS), ...Object.keys(overlay)]),
  ).sort();
}

export interface SaveDraftInput {
  contentId: string;
  actor: string;
  next: ContentVersion;
}

export function saveDraft({ contentId, actor, next }: SaveDraftInput) {
  const overlay = readOverlay();
  const before = overlay[contentId] ?? CONTENT_VERSIONS[contentId] ?? null;
  overlay[contentId] = next;
  writeOverlay(overlay);
  appendAudit({
    id: `${contentId}-${Date.now()}`,
    contentId,
    at: new Date().toISOString(),
    actor: actor || "anonymous",
    action: "draft",
    before,
    after: next,
  });
}

export function revertToCanonical(contentId: string, actor: string) {
  const overlay = readOverlay();
  if (!overlay[contentId]) return;
  const before = overlay[contentId];
  delete overlay[contentId];
  writeOverlay(overlay);
  const canonical = CONTENT_VERSIONS[contentId];
  if (canonical) {
    appendAudit({
      id: `${contentId}-${Date.now()}`,
      contentId,
      at: new Date().toISOString(),
      actor: actor || "anonymous",
      action: "revert",
      before,
      after: canonical,
    });
  }
}

export function clearAuditLog() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUDIT_KEY);
}

/** Compare changelog entries between two versions (line-level). */
export interface DiffLine {
  type: "context" | "added" | "removed";
  text: string;
}

function serializeForDiff(v: ContentVersion): string[] {
  const head = [
    `version: ${v.version}`,
    `updatedAt: ${v.updatedAt}`,
    "changelog:",
  ];
  const body = v.changelog.map(
    (c: ContentChangelogEntry) => `  - v${c.version} (${c.date}) — ${c.summary}`,
  );
  return [...head, ...body];
}

export function diffVersions(a: ContentVersion, b: ContentVersion): DiffLine[] {
  const left = serializeForDiff(a);
  const right = serializeForDiff(b);
  const out: DiffLine[] = [];
  // Naive longest-common-subsequence-free diff: line-by-line presence test.
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  for (const line of left) {
    if (!rightSet.has(line)) out.push({ type: "removed", text: line });
    else out.push({ type: "context", text: line });
  }
  for (const line of right) {
    if (!leftSet.has(line)) out.push({ type: "added", text: line });
  }
  return out;
}
