
-- Audit trail for protocol-access-guard security threshold configuration
CREATE TABLE public.protocol_security_config_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_at timestamptz NOT NULL DEFAULT now(),
  observed_by uuid,
  request_id text,
  config_hash text NOT NULL,
  previous_config jsonb,
  current_config jsonb NOT NULL,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'edge_env'
);

CREATE INDEX idx_protocol_security_config_history_changed_at
  ON public.protocol_security_config_history (changed_at DESC);

ALTER TABLE public.protocol_security_config_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read protocol security config history"
  ON public.protocol_security_config_history
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role));

-- All writes blocked for clients (server-only via service_role).
CREATE POLICY "Block client inserts on config history"
  ON public.protocol_security_config_history
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Block client updates on config history"
  ON public.protocol_security_config_history
  FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Block client deletes on config history"
  ON public.protocol_security_config_history
  FOR DELETE TO anon, authenticated
  USING (false);


-- Saved views for Protocol Audit Console
CREATE TABLE public.protocol_audit_saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_shared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_protocol_audit_saved_views_owner
  ON public.protocol_audit_saved_views (owner_id, updated_at DESC);
CREATE INDEX idx_protocol_audit_saved_views_shared
  ON public.protocol_audit_saved_views (is_shared) WHERE is_shared = true;

ALTER TABLE public.protocol_audit_saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own saved views"
  ON public.protocol_audit_saved_views
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'research_lead'::app_role)
    )
  );

CREATE POLICY "Auditors read shared saved views"
  ON public.protocol_audit_saved_views
  FOR SELECT TO authenticated
  USING (
    is_shared = true
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'research_lead'::app_role)
    )
  );

CREATE TRIGGER trg_protocol_audit_saved_views_updated_at
  BEFORE UPDATE ON public.protocol_audit_saved_views
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
