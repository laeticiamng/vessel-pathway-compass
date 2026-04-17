-- ========== P7: IEC 62304 — Software lifecycle traceability ==========

CREATE TABLE public.software_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  released_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  release_notes TEXT,
  risk_class TEXT NOT NULL DEFAULT 'A' CHECK (risk_class IN ('A','B','C')),
  git_sha TEXT,
  signed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.software_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read software versions"
  ON public.software_versions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admin manage software versions"
  ON public.software_versions FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.soup_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  license TEXT,
  cve_status TEXT NOT NULL DEFAULT 'clear' CHECK (cve_status IN ('clear','watch','vulnerable','patched')),
  purpose TEXT,
  risk_assessment TEXT,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, version)
);

ALTER TABLE public.soup_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin manage SOUP"
  ON public.soup_components FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_soup_components_updated_at
  BEFORE UPDATE ON public.soup_components
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.clinical_algorithms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  validation_status TEXT NOT NULL DEFAULT 'draft' CHECK (validation_status IN ('draft','validated','deprecated')),
  evidence_url TEXT,
  last_review_at TIMESTAMPTZ,
  reviewer_id UUID,
  risk_class TEXT NOT NULL DEFAULT 'B' CHECK (risk_class IN ('A','B','C')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, version)
);

ALTER TABLE public.clinical_algorithms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read clinical algorithms"
  ON public.clinical_algorithms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admin manage clinical algorithms"
  ON public.clinical_algorithms FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_clinical_algorithms_updated_at
  BEFORE UPDATE ON public.clinical_algorithms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== P7: Multi-tenant institution settings ==========

CREATE TABLE public.institution_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL UNIQUE REFERENCES public.institutions(id) ON DELETE CASCADE,
  data_region TEXT NOT NULL DEFAULT 'eu-west' CHECK (data_region IN ('eu-west','eu-central','eu-north')),
  retention_override_days INTEGER,
  dpo_contact_email TEXT,
  mdr_class TEXT NOT NULL DEFAULT 'I' CHECK (mdr_class IN ('I','IIa','IIb','III')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hospital admin reads own institution settings"
  ON public.institution_settings FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'hospital_admin')
        AND institution_id IN (SELECT public.user_institution_ids(auth.uid())))
  );

CREATE POLICY "Hospital admin updates own institution settings"
  ON public.institution_settings FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR (public.has_role(auth.uid(), 'hospital_admin')
        AND institution_id IN (SELECT public.user_institution_ids(auth.uid())))
  );

CREATE POLICY "Super admin manage institution settings"
  ON public.institution_settings FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_institution_settings_updated_at
  BEFORE UPDATE ON public.institution_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== P7: SLA incidents ==========

CREATE TABLE public.sla_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('sev1','sev2','sev3','sev4')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  mttr_minutes INTEGER,
  affected_users INTEGER DEFAULT 0,
  root_cause TEXT,
  postmortem_url TEXT,
  declared_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read SLA incidents"
  ON public.sla_incidents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admin manage SLA incidents"
  ON public.sla_incidents FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_sla_incidents_updated_at
  BEFORE UPDATE ON public.sla_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-compute MTTR on resolve
CREATE OR REPLACE FUNCTION public.compute_sla_mttr()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.resolved_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.mttr_minutes := EXTRACT(EPOCH FROM (NEW.resolved_at - NEW.started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sla_compute_mttr
  BEFORE INSERT OR UPDATE ON public.sla_incidents
  FOR EACH ROW EXECUTE FUNCTION public.compute_sla_mttr();

-- ========== P7: Export manifests (chain-of-custody) ==========

CREATE TABLE public.export_manifests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  export_format TEXT NOT NULL DEFAULT 'pdf' CHECK (export_format IN ('pdf','csv','json')),
  row_count INTEGER NOT NULL DEFAULT 0,
  sha256 TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  download_count INTEGER NOT NULL DEFAULT 1,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.export_manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own export manifests"
  ON public.export_manifests FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users insert own export manifests"
  ON public.export_manifests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_export_manifests_user_created ON public.export_manifests(user_id, created_at DESC);

-- ========== P7: RPCs ==========

CREATE OR REPLACE FUNCTION public.institution_health(_institution_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result JSONB;
BEGIN
  -- Access check: hospital_admin of this institution OR super_admin/admin
  IF NOT (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'hospital_admin')
        AND _institution_id IN (SELECT public.user_institution_ids(auth.uid())))
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT jsonb_build_object(
    'institution_id', _institution_id,
    'patients_active', (SELECT count(*) FROM public.patients WHERE institution_id = _institution_id AND deleted_at IS NULL),
    'patients_total', (SELECT count(*) FROM public.patients WHERE institution_id = _institution_id),
    'cases_total', (SELECT count(*) FROM public.cases WHERE institution_id = _institution_id),
    'members_count', (SELECT count(*) FROM public.memberships WHERE institution_id = _institution_id),
    'pending_signoffs', (
      SELECT count(*) FROM public.clinical_signoffs cs
      JOIN public.cases c ON c.id = cs.entity_id AND cs.entity_type = 'case'
      WHERE c.institution_id = _institution_id AND cs.status = 'pending'
    ),
    'anomalies_7d', (
      SELECT count(*) FROM public.governance_events
      WHERE institution_id = _institution_id
        AND severity IN ('critical','error')
        AND created_at > now() - interval '7 days'
    ),
    'events_30d', (
      SELECT count(*) FROM public.governance_events
      WHERE institution_id = _institution_id
        AND created_at > now() - interval '30 days'
    ),
    'computed_at', now()
  ) INTO _result;

  RETURN _result;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_export_manifest(
  _entity_type TEXT,
  _export_format TEXT,
  _row_count INTEGER,
  _sha256 TEXT,
  _purpose TEXT,
  _context JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
  _recent_count INTEGER;
  _alert BOOLEAN := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- Suspicious volume detection: > 5 exports / hour
  SELECT count(*) INTO _recent_count
  FROM public.export_manifests
  WHERE user_id = auth.uid()
    AND created_at > now() - interval '1 hour';

  IF _recent_count >= 5 THEN
    _alert := true;
  END IF;

  INSERT INTO public.export_manifests (
    user_id, entity_type, export_format, row_count, sha256, purpose, context, expires_at
  ) VALUES (
    auth.uid(), _entity_type, _export_format, _row_count, _sha256, _purpose, _context,
    now() + interval '90 days'
  ) RETURNING id INTO _id;

  -- Audit
  INSERT INTO public.governance_events (
    actor_id, event_category, event_action, severity, target_entity_type, target_entity_id, context
  ) VALUES (
    auth.uid(), 'compliance', 'export.manifest.registered',
    CASE WHEN _alert THEN 'warn' ELSE 'info' END,
    _entity_type, _id,
    jsonb_build_object(
      'sha256', _sha256, 'rows', _row_count, 'purpose', _purpose,
      'recent_hour_count', _recent_count + 1, 'alert', _alert
    )
  );

  RETURN jsonb_build_object('manifest_id', _id, 'alert_high_volume', _alert, 'recent_hour_count', _recent_count + 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.sla_metrics_30d()
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total_minutes_30d NUMERIC := 30 * 24 * 60;
  _downtime_minutes NUMERIC;
  _total_incidents INTEGER;
  _avg_mttr NUMERIC;
  _by_severity JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT COALESCE(SUM(mttr_minutes), 0) INTO _downtime_minutes
  FROM public.sla_incidents
  WHERE started_at > now() - interval '30 days'
    AND resolved_at IS NOT NULL
    AND severity IN ('sev1','sev2');

  SELECT count(*), AVG(mttr_minutes) INTO _total_incidents, _avg_mttr
  FROM public.sla_incidents
  WHERE started_at > now() - interval '30 days';

  SELECT jsonb_object_agg(severity, cnt) INTO _by_severity FROM (
    SELECT severity, count(*) AS cnt
    FROM public.sla_incidents
    WHERE started_at > now() - interval '30 days'
    GROUP BY severity
  ) s;

  RETURN jsonb_build_object(
    'uptime_pct', round(((_total_minutes_30d - _downtime_minutes) / _total_minutes_30d * 100)::numeric, 3),
    'downtime_minutes', _downtime_minutes,
    'total_incidents', _total_incidents,
    'avg_mttr_minutes', COALESCE(round(_avg_mttr::numeric, 1), 0),
    'by_severity', COALESCE(_by_severity, '{}'::jsonb),
    'computed_at', now()
  );
END;
$$;

-- ========== Seed: clinical algorithms (P7) ==========

INSERT INTO public.clinical_algorithms (name, version, description, validation_status, risk_class, last_review_at)
VALUES
  ('CI-AKI Risk Calculator', '1.0.0', 'Mehran score for contrast-induced acute kidney injury risk', 'validated', 'B', now()),
  ('ESC 2024 PAD Guidelines', '2024.1', 'European Society of Cardiology criteria for peripheral artery disease screening', 'validated', 'B', now()),
  ('ABI Scoring (VascScreen)', '1.0.0', 'Ankle-Brachial Index automated interpretation per ESC/AHA thresholds', 'validated', 'B', now())
ON CONFLICT (name, version) DO NOTHING;

INSERT INTO public.software_versions (version, release_notes, risk_class)
VALUES ('7.0.0', 'P7 release: IEC 62304 traceability, multi-tenant data residency, SLA tracking, export chain-of-custody', 'B')
ON CONFLICT (version) DO NOTHING;