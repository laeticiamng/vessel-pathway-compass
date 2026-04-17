-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =========================================================
-- 1. Compliance snapshots table (ADR-010)
-- =========================================================
CREATE TABLE public.compliance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  captured_at timestamptz NOT NULL DEFAULT now(),
  score integer NOT NULL,
  grade text NOT NULL,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_snapshots_captured_at
  ON public.compliance_snapshots (captured_at DESC);

ALTER TABLE public.compliance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DPO read compliance snapshots"
ON public.compliance_snapshots FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'hospital_admin')
);

-- No INSERT/UPDATE/DELETE policy: only SECURITY DEFINER functions can write.

-- =========================================================
-- 2. snapshot_compliance_score()
-- =========================================================
CREATE OR REPLACE FUNCTION public.snapshot_compliance_score()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _score_data jsonb;
  _id uuid;
  _dpia_score numeric := 0;
  _rgpd_score numeric := 0;
  _signoff_score numeric := 0;
  _anomaly_score numeric := 0;
  _lifecycle_score numeric := 0;
  _total numeric;
  _grade text;
  _dpia_total integer; _dpia_approved integer;
  _rgpd_total integer; _rgpd_overdue integer;
  _signoff_total integer; _signoff_eidas integer;
  _anomalies_critical integer;
  _last_lifecycle timestamptz;
BEGIN
  -- Inline computation (cannot call compliance_score because it has a role check)
  SELECT count(*), count(*) FILTER (WHERE status = 'approved')
  INTO _dpia_total, _dpia_approved FROM public.dpia_assessments;
  _dpia_score := CASE WHEN _dpia_total = 0 THEN 10
                      ELSE (_dpia_approved::numeric / _dpia_total) * 25 END;

  SELECT count(*), count(*) FILTER (WHERE status NOT IN ('completed','rejected') AND due_date < now())
  INTO _rgpd_total, _rgpd_overdue FROM public.rgpd_requests;
  _rgpd_score := CASE WHEN _rgpd_total = 0 THEN 25
                      ELSE GREATEST(0, 25 - (_rgpd_overdue * 5)) END;

  SELECT count(*) FILTER (WHERE status IN ('signed','cosigned')),
         count(*) FILTER (WHERE status IN ('signed','cosigned') AND metadata ? 'eidas')
  INTO _signoff_total, _signoff_eidas FROM public.clinical_signoffs;
  _signoff_score := CASE WHEN _signoff_total = 0 THEN 15
                         ELSE (_signoff_eidas::numeric / _signoff_total) * 25 END;

  SELECT count(*) INTO _anomalies_critical
  FROM public.governance_events
  WHERE severity = 'critical' AND created_at > now() - interval '7 days';
  _anomaly_score := GREATEST(0, 15 - (_anomalies_critical * 3));

  SELECT max(created_at) INTO _last_lifecycle
  FROM public.governance_events WHERE event_action = 'lifecycle.enforced';
  _lifecycle_score := CASE
    WHEN _last_lifecycle IS NULL THEN 0
    WHEN _last_lifecycle > now() - interval '48 hours' THEN 10
    WHEN _last_lifecycle > now() - interval '7 days' THEN 5
    ELSE 0 END;

  _total := round(_dpia_score + _rgpd_score + _signoff_score + _anomaly_score + _lifecycle_score);
  _grade := CASE
    WHEN _total >= 85 THEN 'A'
    WHEN _total >= 70 THEN 'B'
    WHEN _total >= 55 THEN 'C'
    WHEN _total >= 40 THEN 'D'
    ELSE 'E' END;

  _score_data := jsonb_build_object(
    'dpia', jsonb_build_object('score', round(_dpia_score), 'max', 25, 'approved', _dpia_approved, 'total', _dpia_total),
    'rgpd', jsonb_build_object('score', round(_rgpd_score), 'max', 25, 'overdue', _rgpd_overdue, 'total', _rgpd_total),
    'signoffs', jsonb_build_object('score', round(_signoff_score), 'max', 25, 'eidas', _signoff_eidas, 'total', _signoff_total),
    'anomalies', jsonb_build_object('score', round(_anomaly_score), 'max', 15, 'critical_7d', _anomalies_critical),
    'lifecycle', jsonb_build_object('score', round(_lifecycle_score), 'max', 10, 'last_run', _last_lifecycle)
  );

  INSERT INTO public.compliance_snapshots (score, grade, breakdown)
  VALUES (_total::integer, _grade, _score_data)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

-- =========================================================
-- 3. reactivate_user_account()
-- =========================================================
CREATE OR REPLACE FUNCTION public.reactivate_user_account(
  _target_user_id uuid,
  _role app_role,
  _reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _evt_id uuid;
  _existing_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF _target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot reactivate own account';
  END IF;

  SELECT count(*) INTO _existing_count
  FROM public.user_roles WHERE user_id = _target_user_id;

  IF _existing_count > 0 THEN
    RAISE EXCEPTION 'account is not frozen (has % role(s))', _existing_count;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.governance_events (
    actor_id, target_user_id, event_category, event_action, severity, context
  ) VALUES (
    auth.uid(), _target_user_id, 'identity', 'account.reactivated', 'warn',
    jsonb_build_object(
      'reason', _reason,
      'restored_role', _role,
      'reactivated_at', now()
    )
  ) RETURNING id INTO _evt_id;

  RETURN jsonb_build_object(
    'reactivated', true,
    'role', _role,
    'event_id', _evt_id
  );
END;
$$;

-- =========================================================
-- 4. replay_case_at()
-- =========================================================
CREATE OR REPLACE FUNCTION public.replay_case_at(
  _case_id uuid,
  _at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _snapshot jsonb;
  _has_access boolean;
BEGIN
  -- Access check: same logic as case_revisions RLS
  SELECT EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id = _case_id
      AND (
        c.created_by = auth.uid()
        OR c.institution_id IN (SELECT public.user_institution_ids(auth.uid()))
      )
  ) OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  INTO _has_access;

  IF NOT _has_access THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Get the new_snapshot of the latest revision <= _at
  SELECT new_snapshot INTO _snapshot
  FROM public.case_revisions
  WHERE case_id = _case_id
    AND created_at <= _at
  ORDER BY revision_number DESC
  LIMIT 1;

  RETURN _snapshot;
END;
$$;

-- =========================================================
-- 5. Schedule daily snapshot at 03:30 UTC
-- =========================================================
SELECT cron.schedule(
  'compliance-score-daily-snapshot',
  '30 3 * * *',
  $$ SELECT public.snapshot_compliance_score(); $$
);
