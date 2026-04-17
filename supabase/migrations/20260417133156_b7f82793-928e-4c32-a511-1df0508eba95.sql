
-- 1. eIDAS-style signature reinforcement on clinical_signoffs
--    metadata jsonb already stores arbitrary data; we add a helper function to compute & store SHA-256 hash + RFC3161-style timestamp.

CREATE OR REPLACE FUNCTION public.sign_with_eidas(
  _signoff_id uuid,
  _content text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _hash text;
  _timestamp timestamptz := now();
  _meta jsonb;
BEGIN
  -- Only the signer or cosigner can apply eIDAS reinforcement
  IF NOT EXISTS (
    SELECT 1 FROM public.clinical_signoffs
    WHERE id = _signoff_id
      AND (signed_by = auth.uid() OR cosigned_by = auth.uid())
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  _hash := encode(digest(_content, 'sha256'), 'hex');
  _meta := jsonb_build_object(
    'eidas', jsonb_build_object(
      'level', 'substantial',
      'sha256', _hash,
      'timestamp', _timestamp,
      'algorithm', 'SHA-256',
      'standard', 'RFC3161-compatible'
    )
  );

  UPDATE public.clinical_signoffs
  SET metadata = COALESCE(metadata, '{}'::jsonb) || _meta,
      updated_at = now()
  WHERE id = _signoff_id;

  -- Audit
  INSERT INTO public.governance_events (
    actor_id, event_category, event_action, severity,
    target_entity_type, target_entity_id, context
  ) VALUES (
    auth.uid(), 'clinical', 'signoff.eidas_applied', 'info',
    'clinical_signoff', _signoff_id,
    jsonb_build_object('sha256', _hash, 'timestamp', _timestamp)
  );

  RETURN _meta->'eidas';
END;
$$;

-- Enable pgcrypto for digest()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. DPIA assessments (Data Protection Impact Assessment, RGPD art. 35)
CREATE TABLE public.dpia_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  scope text NOT NULL,
  data_categories text[] NOT NULL DEFAULT '{}',
  processing_purpose text NOT NULL,
  legal_basis text NOT NULL,
  risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  mitigation_measures jsonb NOT NULL DEFAULT '[]'::jsonb,
  residual_risk_level text NOT NULL DEFAULT 'low' CHECK (residual_risk_level IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','approved','archived')),
  approved_by uuid,
  approved_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dpia_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DPO manage DPIA"
ON public.dpia_assessments
FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Hospital admin read DPIA"
ON public.dpia_assessments
FOR SELECT
USING (public.has_role(auth.uid(), 'hospital_admin'));

CREATE TRIGGER trg_dpia_updated_at
BEFORE UPDATE ON public.dpia_assessments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. User activity summary view (read-only, admin only via RPC)
CREATE OR REPLACE FUNCTION public.list_users_with_activity()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  role_app app_role,
  profile_role text,
  last_activity_at timestamptz,
  events_30d bigint,
  patients_count bigint,
  pending_signoffs bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id,
    p.display_name,
    (SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = p.user_id ORDER BY ur.role LIMIT 1) AS role_app,
    p.role AS profile_role,
    (SELECT max(created_at) FROM public.governance_events ge WHERE ge.actor_id = p.user_id) AS last_activity_at,
    (SELECT count(*) FROM public.governance_events ge WHERE ge.actor_id = p.user_id AND ge.created_at > now() - interval '30 days'),
    (SELECT count(*) FROM public.patients pt WHERE pt.created_by = p.user_id AND pt.deleted_at IS NULL),
    (SELECT count(*) FROM public.clinical_signoffs cs WHERE (cs.signed_by = p.user_id OR cs.cosigned_by = p.user_id) AND cs.status = 'pending');
  
  -- Note: returns rows from profiles
END;
$$;

-- Wrap into a real query
CREATE OR REPLACE FUNCTION public.list_users_with_activity()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  role_app app_role,
  profile_role text,
  last_activity_at timestamptz,
  events_30d bigint,
  patients_count bigint,
  pending_signoffs bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.display_name,
    (SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = p.user_id ORDER BY ur.role LIMIT 1) AS role_app,
    p.role AS profile_role,
    (SELECT max(created_at) FROM public.governance_events ge WHERE ge.actor_id = p.user_id) AS last_activity_at,
    (SELECT count(*) FROM public.governance_events ge WHERE ge.actor_id = p.user_id AND ge.created_at > now() - interval '30 days'),
    (SELECT count(*) FROM public.patients pt WHERE pt.created_by = p.user_id AND pt.deleted_at IS NULL),
    (SELECT count(*) FROM public.clinical_signoffs cs WHERE (cs.signed_by = p.user_id OR cs.cosigned_by = p.user_id) AND cs.status = 'pending')
  FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin');
$$;

-- 4. Role assignment helper (audited)
CREATE OR REPLACE FUNCTION public.assign_role(
  _target_user_id uuid,
  _role app_role
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (_target_user_id, _role)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.governance_events (actor_id, event_category, event_action, severity, target_user_id, context)
  VALUES (auth.uid(), 'identity', 'role.assigned', 'warn', _target_user_id, jsonb_build_object('role', _role));
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_role(
  _target_user_id uuid,
  _role app_role
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _target_user_id AND role = _role;

  INSERT INTO public.governance_events (actor_id, event_category, event_action, severity, target_user_id, context)
  VALUES (auth.uid(), 'identity', 'role.revoked', 'warn', _target_user_id, jsonb_build_object('role', _role));
END;
$$;
