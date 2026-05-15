-- 1. Allow 'cancelled' status
ALTER TABLE public.governance_export_jobs
  DROP CONSTRAINT IF EXISTS governance_export_jobs_status_check;
ALTER TABLE public.governance_export_jobs
  ADD CONSTRAINT governance_export_jobs_status_check
  CHECK (status IN ('queued','running','done','failed','cancelled'));

-- 2. Explicit deny policies for client mutations (server-only via service_role)
DROP POLICY IF EXISTS "deny client insert jobs" ON public.governance_export_jobs;
DROP POLICY IF EXISTS "deny client update jobs" ON public.governance_export_jobs;
DROP POLICY IF EXISTS "deny client delete jobs" ON public.governance_export_jobs;

CREATE POLICY "deny client insert jobs"
  ON public.governance_export_jobs FOR INSERT TO authenticated
  WITH CHECK (false);
CREATE POLICY "deny client update jobs"
  ON public.governance_export_jobs FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);
CREATE POLICY "deny client delete jobs"
  ON public.governance_export_jobs FOR DELETE TO authenticated
  USING (false);

-- 3. Cancel RPC: only the owner can cancel their queued/running job
CREATE OR REPLACE FUNCTION public.cancel_export_job(_job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.governance_export_jobs;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT * INTO _row FROM public.governance_export_jobs WHERE id = _job_id;
  IF _row.id IS NULL THEN
    RAISE EXCEPTION 'not found';
  END IF;
  IF _row.user_id <> auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin')
     AND NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _row.status NOT IN ('queued','running') THEN
    RETURN jsonb_build_object('cancelled', false, 'status', _row.status);
  END IF;

  UPDATE public.governance_export_jobs
    SET status = 'cancelled', error = COALESCE(error, 'Cancelled by user')
    WHERE id = _job_id;

  INSERT INTO public.governance_events (
    actor_id, event_category, event_action, severity,
    target_entity_type, target_entity_id, context
  ) VALUES (
    auth.uid(), 'compliance', 'governance_events.export.cancelled', 'info',
    'governance_export_job', _job_id, jsonb_build_object('format', _row.format)
  );

  RETURN jsonb_build_object('cancelled', true);
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_export_job(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_export_job(uuid) TO authenticated;

-- 4. Lock the new SECURITY DEFINER helpers down to service_role only
REVOKE EXECUTE ON FUNCTION public.governance_events_for_user(
  uuid, text, uuid, timestamptz, timestamptz, text, text, integer, integer
) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.governance_events_count_for_user(
  uuid, text, uuid, timestamptz, timestamptz, text, text
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.governance_events_for_user(
  uuid, text, uuid, timestamptz, timestamptz, text, text, integer, integer
) TO service_role;
GRANT EXECUTE ON FUNCTION public.governance_events_count_for_user(
  uuid, text, uuid, timestamptz, timestamptz, text, text
) TO service_role;