-- ============================================================
-- P5 GOVERNANCE: Event Sourcing, Compliance Score, Account Freeze
-- ============================================================

-- 1. CASE_REVISIONS — Immutable event log for cases (lightweight event sourcing)
CREATE TABLE IF NOT EXISTS public.case_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  revision_number integer NOT NULL,
  changed_by uuid NOT NULL,
  change_type text NOT NULL CHECK (change_type IN ('created','updated','status_changed','category_changed','deleted')),
  changed_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  previous_snapshot jsonb,
  new_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_case_revisions_case ON public.case_revisions(case_id, revision_number DESC);
CREATE INDEX IF NOT EXISTS idx_case_revisions_actor ON public.case_revisions(changed_by, created_at DESC);

ALTER TABLE public.case_revisions ENABLE ROW LEVEL SECURITY;

-- Read: anyone who can read the parent case
CREATE POLICY "Read revisions of accessible cases"
ON public.case_revisions FOR SELECT
USING (
  case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

-- No INSERT/UPDATE/DELETE from clients — managed by trigger only

-- Trigger function: capture revisions automatically
CREATE OR REPLACE FUNCTION public.capture_case_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _next_rev integer;
  _change_type text;
  _changed jsonb := '{}'::jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _change_type := 'created';
    _next_rev := 1;
    INSERT INTO public.case_revisions (case_id, revision_number, changed_by, change_type, new_snapshot)
    VALUES (NEW.id, _next_rev, COALESCE(auth.uid(), NEW.created_by), _change_type, to_jsonb(NEW));
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Determine specific change type
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      _change_type := 'status_changed';
      _changed := _changed || jsonb_build_object('status', jsonb_build_object('from', OLD.status, 'to', NEW.status));
    ELSIF NEW.category IS DISTINCT FROM OLD.category THEN
      _change_type := 'category_changed';
      _changed := _changed || jsonb_build_object('category', jsonb_build_object('from', OLD.category, 'to', NEW.category));
    ELSE
      _change_type := 'updated';
    END IF;

    IF NEW.title IS DISTINCT FROM OLD.title THEN
      _changed := _changed || jsonb_build_object('title', jsonb_build_object('from', OLD.title, 'to', NEW.title));
    END IF;
    IF NEW.summary IS DISTINCT FROM OLD.summary THEN
      _changed := _changed || jsonb_build_object('summary', jsonb_build_object('from', OLD.summary, 'to', NEW.summary));
    END IF;

    -- Skip if nothing relevant changed
    IF _changed = '{}'::jsonb AND _change_type = 'updated' THEN
      RETURN NEW;
    END IF;

    SELECT COALESCE(MAX(revision_number), 0) + 1 INTO _next_rev
    FROM public.case_revisions WHERE case_id = NEW.id;

    INSERT INTO public.case_revisions (
      case_id, revision_number, changed_by, change_type, changed_fields, previous_snapshot, new_snapshot
    ) VALUES (
      NEW.id, _next_rev, COALESCE(auth.uid(), NEW.created_by),
      _change_type, _changed, to_jsonb(OLD), to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_capture_case_revision ON public.cases;
CREATE TRIGGER trg_capture_case_revision
AFTER INSERT OR UPDATE ON public.cases
FOR EACH ROW EXECUTE FUNCTION public.capture_case_revision();

-- ============================================================
-- 2. COMPLIANCE SCORE — Aggregate global compliance health (0-100)
-- ============================================================
CREATE OR REPLACE FUNCTION public.compliance_score()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _dpia_score numeric := 0;
  _rgpd_score numeric := 0;
  _signoff_score numeric := 0;
  _anomaly_score numeric := 0;
  _lifecycle_score numeric := 0;
  _total numeric;

  _dpia_total integer;
  _dpia_approved integer;
  _rgpd_total integer;
  _rgpd_overdue integer;
  _signoff_total integer;
  _signoff_eidas integer;
  _anomalies_critical integer;
  _last_lifecycle timestamptz;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- DPIA score (0-25): % approved DPIAs
  SELECT count(*), count(*) FILTER (WHERE status = 'approved')
  INTO _dpia_total, _dpia_approved FROM public.dpia_assessments;
  _dpia_score := CASE WHEN _dpia_total = 0 THEN 10
                      ELSE (_dpia_approved::numeric / _dpia_total) * 25 END;

  -- RGPD score (0-25): 25 - penalty for overdue
  SELECT count(*), count(*) FILTER (WHERE status NOT IN ('completed','rejected') AND due_date < now())
  INTO _rgpd_total, _rgpd_overdue FROM public.rgpd_requests;
  _rgpd_score := CASE WHEN _rgpd_total = 0 THEN 25
                      ELSE GREATEST(0, 25 - (_rgpd_overdue * 5)) END;

  -- Signoff score (0-25): % with eIDAS reinforcement among signed
  SELECT count(*) FILTER (WHERE status IN ('signed','cosigned')),
         count(*) FILTER (WHERE status IN ('signed','cosigned') AND metadata ? 'eidas')
  INTO _signoff_total, _signoff_eidas FROM public.clinical_signoffs;
  _signoff_score := CASE WHEN _signoff_total = 0 THEN 15
                         ELSE (_signoff_eidas::numeric / _signoff_total) * 25 END;

  -- Anomalies score (0-15): 15 - penalty per critical event in 7d
  SELECT count(*) INTO _anomalies_critical
  FROM public.governance_events
  WHERE severity = 'critical' AND created_at > now() - interval '7 days';
  _anomaly_score := GREATEST(0, 15 - (_anomalies_critical * 3));

  -- Lifecycle score (0-10): recent enforcement run within 48h
  SELECT max(created_at) INTO _last_lifecycle
  FROM public.governance_events WHERE event_action = 'lifecycle.enforced';
  _lifecycle_score := CASE
    WHEN _last_lifecycle IS NULL THEN 0
    WHEN _last_lifecycle > now() - interval '48 hours' THEN 10
    WHEN _last_lifecycle > now() - interval '7 days' THEN 5
    ELSE 0 END;

  _total := _dpia_score + _rgpd_score + _signoff_score + _anomaly_score + _lifecycle_score;

  RETURN jsonb_build_object(
    'total', round(_total),
    'grade', CASE
      WHEN _total >= 85 THEN 'A'
      WHEN _total >= 70 THEN 'B'
      WHEN _total >= 55 THEN 'C'
      WHEN _total >= 40 THEN 'D'
      ELSE 'E' END,
    'breakdown', jsonb_build_object(
      'dpia', jsonb_build_object('score', round(_dpia_score), 'max', 25, 'approved', _dpia_approved, 'total', _dpia_total),
      'rgpd', jsonb_build_object('score', round(_rgpd_score), 'max', 25, 'overdue', _rgpd_overdue, 'total', _rgpd_total),
      'signoffs', jsonb_build_object('score', round(_signoff_score), 'max', 25, 'eidas', _signoff_eidas, 'total', _signoff_total),
      'anomalies', jsonb_build_object('score', round(_anomaly_score), 'max', 15, 'critical_7d', _anomalies_critical),
      'lifecycle', jsonb_build_object('score', round(_lifecycle_score), 'max', 10, 'last_run', _last_lifecycle)
    ),
    'computed_at', now()
  );
END;
$$;

-- ============================================================
-- 3. FREEZE_USER_ACCOUNT — Suspend all roles for a user (HR/security incident)
-- ============================================================
CREATE OR REPLACE FUNCTION public.freeze_user_account(_target_user_id uuid, _reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _revoked_roles text[];
  _evt_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF _target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot freeze own account';
  END IF;

  -- Collect roles before deletion
  SELECT array_agg(role::text) INTO _revoked_roles
  FROM public.user_roles WHERE user_id = _target_user_id;

  -- Revoke all roles
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;

  -- Audit as critical
  INSERT INTO public.governance_events (
    actor_id, target_user_id, event_category, event_action, severity, context
  ) VALUES (
    auth.uid(), _target_user_id, 'identity', 'account.frozen', 'critical',
    jsonb_build_object(
      'reason', _reason,
      'revoked_roles', COALESCE(_revoked_roles, ARRAY[]::text[]),
      'frozen_at', now()
    )
  ) RETURNING id INTO _evt_id;

  RETURN jsonb_build_object(
    'frozen', true,
    'revoked_roles', COALESCE(_revoked_roles, ARRAY[]::text[]),
    'event_id', _evt_id
  );
END;
$$;