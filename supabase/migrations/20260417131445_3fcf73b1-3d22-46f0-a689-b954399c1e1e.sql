-- ============================================================
-- GOVERNANCE FOUNDATIONS — Domain-Driven Architecture
-- ============================================================

-- 1. governance_events : journal transverse
CREATE TABLE public.governance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  target_user_id uuid,
  target_entity_type text,
  target_entity_id uuid,
  institution_id uuid,
  event_category text NOT NULL CHECK (event_category IN ('security','compliance','clinical','research','administration','data_lifecycle')),
  event_action text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warn','error','critical')),
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gov_events_actor ON public.governance_events(actor_id);
CREATE INDEX idx_gov_events_target_user ON public.governance_events(target_user_id);
CREATE INDEX idx_gov_events_institution ON public.governance_events(institution_id);
CREATE INDEX idx_gov_events_category ON public.governance_events(event_category);
CREATE INDEX idx_gov_events_created ON public.governance_events(created_at DESC);

ALTER TABLE public.governance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own governance events"
  ON public.governance_events FOR SELECT
  USING (actor_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "DPO view all governance events"
  ON public.governance_events FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Hospital admins view institution events"
  ON public.governance_events FOR SELECT
  USING (
    has_role(auth.uid(), 'hospital_admin'::app_role)
    AND institution_id IN (SELECT user_institution_ids(auth.uid()))
  );

CREATE POLICY "Authenticated users insert own events"
  ON public.governance_events FOR INSERT
  WITH CHECK (actor_id = auth.uid());

-- 2. clinical_signoffs : double validation médicale
CREATE TABLE public.clinical_signoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('case','ai_output','outcome','imaging_summary')),
  entity_id uuid NOT NULL,
  signed_by uuid NOT NULL,
  cosigned_by uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','signed','cosigned','rejected','revoked')),
  justification text,
  metadata jsonb DEFAULT '{}'::jsonb,
  signed_at timestamptz,
  cosigned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_signoffs_entity ON public.clinical_signoffs(entity_type, entity_id);
CREATE INDEX idx_signoffs_signed_by ON public.clinical_signoffs(signed_by);
CREATE INDEX idx_signoffs_cosigned_by ON public.clinical_signoffs(cosigned_by);
CREATE INDEX idx_signoffs_status ON public.clinical_signoffs(status);

ALTER TABLE public.clinical_signoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signers manage own signoffs"
  ON public.clinical_signoffs FOR ALL
  USING (signed_by = auth.uid() OR cosigned_by = auth.uid())
  WITH CHECK (signed_by = auth.uid() OR cosigned_by = auth.uid());

CREATE POLICY "Expert reviewers view all signoffs"
  ON public.clinical_signoffs FOR SELECT
  USING (
    has_role(auth.uid(), 'expert_reviewer'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Experts cosign pending signoffs"
  ON public.clinical_signoffs FOR UPDATE
  USING (has_role(auth.uid(), 'expert_reviewer'::app_role) AND status = 'signed')
  WITH CHECK (cosigned_by = auth.uid());

CREATE TRIGGER trg_signoffs_updated
  BEFORE UPDATE ON public.clinical_signoffs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. data_lifecycle_policies : rétention RGPD
CREATE TABLE public.data_lifecycle_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL UNIQUE,
  retention_days integer NOT NULL,
  legal_basis text NOT NULL,
  automatic_action text NOT NULL DEFAULT 'soft_delete' CHECK (automatic_action IN ('soft_delete','hard_delete','anonymize','archive')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_lifecycle_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read lifecycle policies"
  ON public.data_lifecycle_policies FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Super admins manage lifecycle policies"
  ON public.data_lifecycle_policies FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_lifecycle_updated
  BEFORE UPDATE ON public.data_lifecycle_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default policies
INSERT INTO public.data_lifecycle_policies (entity_type, retention_days, legal_basis, automatic_action, description) VALUES
  ('patient', 3650, 'RGPD art. 9 - Intérêt vital / consentement explicite', 'anonymize', 'Données patient anonymisées après 10 ans'),
  ('case', 3650, 'RGPD art. 9 + Code Santé Publique', 'anonymize', 'Cas cliniques anonymisés après 10 ans'),
  ('audit_logs', 1825, 'RGPD art. 30 - Registre des traitements', 'archive', 'Logs d''audit conservés 5 ans puis archivés'),
  ('governance_events', 1825, 'RGPD art. 30', 'archive', 'Événements de gouvernance conservés 5 ans'),
  ('ai_outputs', 1095, 'RGPD art. 22 - Décision automatisée', 'soft_delete', 'Sorties IA conservées 3 ans'),
  ('contact_messages', 365, 'Intérêt légitime', 'hard_delete', 'Messages de contact supprimés après 1 an');

-- 4. rgpd_requests : demandes utilisateurs
CREATE TABLE public.rgpd_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('access','rectification','erasure','portability','restriction','objection')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','rejected')),
  description text,
  response text,
  handled_by uuid,
  handled_at timestamptz,
  due_date timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rgpd_user ON public.rgpd_requests(user_id);
CREATE INDEX idx_rgpd_status ON public.rgpd_requests(status);

ALTER TABLE public.rgpd_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own RGPD requests"
  ON public.rgpd_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users create own RGPD requests"
  ON public.rgpd_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "DPO view all RGPD requests"
  ON public.rgpd_requests FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "DPO handle RGPD requests"
  ON public.rgpd_requests FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_rgpd_updated
  BEFORE UPDATE ON public.rgpd_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Helper functions
CREATE OR REPLACE FUNCTION public.log_governance_event(
  _category text,
  _action text,
  _severity text DEFAULT 'info',
  _target_user uuid DEFAULT NULL,
  _target_entity_type text DEFAULT NULL,
  _target_entity_id uuid DEFAULT NULL,
  _institution_id uuid DEFAULT NULL,
  _context jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event_id uuid;
BEGIN
  INSERT INTO public.governance_events (
    actor_id, target_user_id, target_entity_type, target_entity_id,
    institution_id, event_category, event_action, severity, context
  ) VALUES (
    auth.uid(), _target_user, _target_entity_type, _target_entity_id,
    _institution_id, _category, _action, _severity, _context
  ) RETURNING id INTO _event_id;
  RETURN _event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.count_pending_signoffs(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.clinical_signoffs
  WHERE status = 'pending'
    AND (signed_by = _user_id OR cosigned_by = _user_id);
$$;