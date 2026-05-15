## Scope

Four related improvements to the admin governance-events export flow on `/app/admin/visual-chain-events`.

### 1. Server-side export edge function (`governance-events-export`)

New edge function with `verify_jwt = true` that owns *all* CSV/PDF generation. Replaces the client-side `fetchAllMatching` that issues raw `range(0, 9999)`.

- **Input (zod-validated)**: `{ format: "csv"|"pdf", filters: { category: "all"|"visual_chain"|"rsvp", institution_id?: uuid, from?: ISO, to?: ISO, recommended?: layer, current?: layer }, mode: "sync"|"async" }`.
- **Auth + RLS**: builds a Supabase client with the caller's `Authorization` header (NOT service role). All queries thus pass through RLS — `admin` / `super_admin` see all, `hospital_admin` is automatically scoped to their institution(s) via the existing policies. Adds a defensive `event_category IN (visual_chain, rsvp)` server-side and rejects requests where the role has none of the three admin roles.
- **Sort order**: explicit `order('created_at', { ascending: false }).order('id', { ascending: false })` — same as the table view, applied identically in sync and async paths so pagination order matches the export order exactly.
- **Sync path** (≤ 1000 rows after a fast `count`): streams the CSV/PDF directly in the response with `Content-Disposition: attachment`. Page through results in 1000-row batches server-side.
- **Async path** (> 1000 rows OR mode=async): emits an Inngest event `governance/export.requested` carrying the validated filters + `user_id` + a generated `job_id`, and returns `{ job_id }`. A new `governance_export_jobs` table tracks `status` (queued/running/done/failed), `progress` (rows_processed / rows_total), `format`, `filters`, `download_url`, `error`.
- Always logs `governance_events` with category `export_request`, action `governance_events.exported`, and the filter set in `context`.

### 2. Inngest worker + storage

- New private storage bucket `governance-exports` (RLS: only owner can read).
- Inngest function `governance-export` (in a second edge function `inngest-governance-export` mounted as the serve endpoint, signed with `INNGEST_SIGNING_KEY`):
  - reads the job row, marks it `running`,
  - paginates through `governance_events` with the same RLS-enforced query (uses caller `user_id` via service role + recursive role check, OR safer: stores caller JWT temporarily in the job row encrypted — see "Decision" below),
  - writes batches to a temp string buffer, updates `progress` every batch,
  - uploads the final CSV or PDF to `governance-exports/{user_id}/{job_id}.{ext}`,
  - generates a 1-hour signed URL and stores it on the job row, status = `done`,
  - on failure: status = `failed`, error message stored.

**Decision on RLS for the worker**: the Inngest worker runs without a user JWT. To preserve RLS guarantees we will *re-derive scope* server-side using the service role + an explicit role check identical to the RLS policy:

```sql
-- Reusable security-definer helper
CREATE FUNCTION governance_events_for_user(_user uuid, ...filters)
  RETURNS SETOF governance_events
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT ge.*
  FROM governance_events ge
  WHERE ge.event_category IN ('visual_chain','rsvp')
    AND (
      has_role(_user, 'super_admin') OR has_role(_user, 'admin')
      OR (has_role(_user, 'hospital_admin')
          AND ge.institution_id IN (SELECT user_institution_ids(_user)))
    )
    AND (filters...)
  ORDER BY created_at DESC, id DESC
  LIMIT _limit OFFSET _offset
$$;
```

The function uses the same predicates as the table's RLS policies — so the worker can never return more than what the user could see interactively.

### 3. Admin UI changes (`VisualChainEventsAdmin.tsx`)

- "Export all matching (CSV/PDF)" buttons now call the edge function with `mode: "async"` when `count > 1000`, otherwise sync (direct download).
- New `<ExportJobsPanel>` component: subscribes to `governance_export_jobs` for the current user via Realtime, shows a progress bar (rows_processed / rows_total) per running job, and a "Download" button when `status = done` (uses the stored signed URL, refreshes if expired).
- Toast on enqueue: "Export queued — you can keep working".

### 4. End-to-end test

`supabase/functions/governance-events-export/index.test.ts`:

1. Sign in a seeded admin user.
2. Insert a known `governance_events` row with category `visual_chain`, action `assessment.created`, recommended_layer `L2` in context, and a unique marker in `context.test_marker`.
3. Insert a *non-matching* row (category `rsvp`, recommended `L3`).
4. Call the export edge function with filters `{category: visual_chain, recommended: L2}` in CSV mode.
5. Parse the returned CSV; assert it contains the marker row and **does not** contain the non-matching row.
6. Same with PDF mode — render-check the page count and that `pdf-parse`-extracted text contains the marker.
7. Cleanup inserted rows.

Skipped automatically when `TEST_ADMIN_EMAIL` / `TEST_ADMIN_PASSWORD` env vars are not set.

### 5. Sort-order verification

`VisualChainEventsAdmin.tsx` already orders by `created_at desc`. Update both the table query and the export edge function to add `.order('id', { ascending: false })` as a deterministic tiebreaker so pagination and exports stay in lock-step even when multiple events share a millisecond.

---

## Database changes (new migration)

```sql
CREATE TABLE governance_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  format text NOT NULL CHECK (format IN ('csv','pdf')),
  filters jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','done','failed')),
  rows_total integer,
  rows_processed integer NOT NULL DEFAULT 0,
  download_path text,         -- bucket path
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE governance_export_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners read own jobs" ON governance_export_jobs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR has_role(auth.uid(), 'super_admin')
         OR has_role(auth.uid(), 'admin'));

-- No client INSERT/UPDATE/DELETE — only service role writes.

ALTER PUBLICATION supabase_realtime ADD TABLE governance_export_jobs;

-- Storage bucket + read policy
INSERT INTO storage.buckets (id, name, public) VALUES ('governance-exports','governance-exports', false);
CREATE POLICY "owners read own export files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'governance-exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Helper function described above
CREATE FUNCTION governance_events_for_user(...) ...
```

## Inngest setup

Lovable Cloud Inngest connector required. I will:
1. Call `standard_connectors--connect` to wire Inngest if not already connected, then read `LOVABLE_API_KEY`, `INNGEST_API_KEY`, `INNGEST_SIGNING_KEY` from the project secrets.
2. Add the `inngest-governance-export` edge function as the Inngest serve endpoint, default-exporting `serve({ client, functions })` from `inngest/deno`.
3. Sync = the user visits the function URL once after deploy (or triggers from Inngest dashboard). I'll surface that URL in the closing message.

## Out of scope (explicitly)

- No re-architecture of the existing `visual-chain-engine` / `rsvp-engine` functions.
- No changes to the P1/P2 audit views — only the admin page.
- No PDF templating overhaul; we keep the existing `jsPDF + autotable` style, just on the server with `pdf-lib` (Deno-friendly) — small visual diff acceptable.

---

## Confirmation needed

Two questions before I start coding:

1. **Inngest connector**: do you already have the Lovable Inngest connector enabled? If not, may I enable it (no extra credentials required from you)?
2. **Async threshold**: 1000 rows is a sensible cutoff for sync vs async — keep it, or prefer "always async" for the buttons (cleaner UX, but every export incurs the queue round-trip)?
