/**
 * Centralized parser for `protocol-access-guard` edge function responses.
 *
 * Every caller (hook, badge, exporter, admin config panel) must funnel
 * its `fetch(...)` Response through this helper so the shape of
 * `{ ok, status, requestId, error, data }` stays identical across the
 * app. This is what guarantees:
 *
 *  - consistent request-id propagation (header > body > client fallback),
 *  - consistent error string (`body.error` > `HTTP <status>`),
 *  - silent handling of non-2xx (no `console.error`, no dev overlay),
 *  - a single place to evolve the contract if the server changes.
 */
export interface ParsedGuardResponse<T = unknown> {
  ok: boolean;
  status: number;
  requestId?: string;
  error?: string;
  data: T | null;
}

interface GuardBody {
  ok?: boolean;
  error?: string;
  request_id?: string;
  [k: string]: unknown;
}

export async function parseGuardResponse<T = GuardBody>(
  res: Response,
  fallbackRequestId?: string,
): Promise<ParsedGuardResponse<T>> {
  const body = (await res.json().catch(() => null)) as GuardBody | null;

  const requestId =
    res.headers.get("x-request-id") ??
    body?.request_id ??
    fallbackRequestId;

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      requestId,
      error: body?.error ?? `HTTP ${res.status}`,
      data: null,
    };
  }

  return {
    ok: body?.ok !== false,
    status: res.status,
    requestId,
    data: (body as T) ?? null,
  };
}

/** Stable request-id generator shared by all guard callers. */
export function newGuardRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `r-${Date.now()}`;
}
