
-- 1. Jobs table
CREATE TABLE public.governance_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  format text NOT NULL CHECK (format IN ('csv','pdf')),
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
  rows_total integer,
  rows_processed integer NOT NULL DEFAULT 0,
  download_path text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.governance_export_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners and admins read jobs"
  ON public.governance_export_jobs
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );
-- No INSERT/UPDATE/DELETE policies = service_role only.

CREATE TRIGGER governance_export_jobs_updated_at
  BEFORE UPDATE ON public.governance_export_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.governance_export_jobs;

-- 2. Storage bucket + read policy
INSERT INTO storage.buckets (id, name, public)
  VALUES ('governance-exports', 'governance-exports', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "owners read own export files"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'governance-exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. RLS-equivalent server helper for the worker (service role) and edge function
CREATE OR REPLACE FUNCTION public.governance_events_for_user(
  _user uuid,
  _category text DEFAULT NULL,        -- 'visual_chain' | 'rsvp' | NULL = both
  _institution uuid DEFAULT NULL,
  _from timestamptz DEFAULT NULL,
  _to timestamptz DEFAULT NULL,
  _recommended text DEFAULT NULL,
  _current text DEFAULT NULL,
  _limit integer DEFAULT 1000,
  _offset integer DEFAULT 0
)
RETURNS SETOF public.governance_events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ge.*
  FROM public.governance_events ge
  WHERE ge.event_category IN ('visual_chain','rsvp')
    AND (_category IS NULL OR ge.event_category = _category)
    AND (_institution IS NULL OR ge.institution_id = _institution)
    AND (_from IS NULL OR ge.created_at >= _from)
    AND (_to IS NULL OR ge.created_at <= _to)
    AND (
      _recommended IS NULL
      OR ge.context->>'recommended_layer' = _recommended
      OR ge.context->>'recommended_level' = _recommended
    )
    AND (
      _current IS NULL
      OR ge.context->>'current_layer' = _current
      OR ge.context->>'requested_level' = _current
    )
    AND (
      public.has_role(_user, 'super_admin')
      OR public.has_role(_user, 'admin')
      OR (
        public.has_role(_user, 'hospital_admin')
        AND ge.institution_id IN (SELECT public.user_institution_ids(_user))
      )
    )
  ORDER BY ge.created_at DESC, ge.id DESC
  LIMIT _limit OFFSET _offset;
$$;

REVOKE ALL ON FUNCTION public.governance_events_for_user(uuid, text, uuid, timestamptz, timestamptz, text, text, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.governance_events_for_user(uuid, text, uuid, timestamptz, timestamptz, text, text, integer, integer) TO authenticated, service_role;

-- Count helper (same predicates) to avoid scanning twice
CREATE OR REPLACE FUNCTION public.governance_events_count_for_user(
  _user uuid,
  _category text DEFAULT NULL,
  _institution uuid DEFAULT NULL,
  _from timestamptz DEFAULT NULL,
  _to timestamptz DEFAULT NULL,
  _recommended text DEFAULT NULL,
  _current text DEFAULT NULL
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint
  FROM public.governance_events ge
  WHERE ge.event_category IN ('visual_chain','rsvp')
    AND (_category IS NULL OR ge.event_category = _category)
    AND (_institution IS NULL OR ge.institution_id = _institution)
    AND (_from IS NULL OR ge.created_at >= _from)
    AND (_to IS NULL OR ge.created_at <= _to)
    AND (
      _recommended IS NULL
      OR ge.context->>'recommended_layer' = _recommended
      OR ge.context->>'recommended_level' = _recommended
    )
    AND (
      _current IS NULL
      OR ge.context->>'current_layer' = _current
      OR ge.context->>'requested_level' = _current
    )
    AND (
      public.has_role(_user, 'super_admin')
      OR public.has_role(_user, 'admin')
      OR (
        public.has_role(_user, 'hospital_admin')
        AND ge.institution_id IN (SELECT public.user_institution_ids(_user))
      )
    );
$$;

REVOKE ALL ON FUNCTION public.governance_events_count_for_user(uuid, text, uuid, timestamptz, timestamptz, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.governance_events_count_for_user(uuid, text, uuid, timestamptz, timestamptz, text, text) TO authenticated, service_role;
