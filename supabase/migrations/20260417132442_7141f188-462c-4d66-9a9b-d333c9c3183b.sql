
-- 1) Generic lifecycle enforcer function
CREATE OR REPLACE FUNCTION public.enforce_data_lifecycle()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _policy RECORD;
  _affected integer;
  _total integer := 0;
  _result jsonb := '[]'::jsonb;
BEGIN
  FOR _policy IN SELECT * FROM public.data_lifecycle_policies LOOP
    _affected := 0;

    IF _policy.entity_type = 'patients' AND _policy.automatic_action = 'soft_delete' THEN
      UPDATE public.patients
      SET deleted_at = now()
      WHERE deleted_at IS NULL
        AND created_at < now() - (_policy.retention_days || ' days')::interval;
      GET DIAGNOSTICS _affected = ROW_COUNT;

    ELSIF _policy.entity_type = 'governance_events' AND _policy.automatic_action = 'hard_delete' THEN
      DELETE FROM public.governance_events
      WHERE created_at < now() - (_policy.retention_days || ' days')::interval;
      GET DIAGNOSTICS _affected = ROW_COUNT;

    ELSIF _policy.entity_type = 'audit_logs' AND _policy.automatic_action = 'hard_delete' THEN
      DELETE FROM public.audit_logs
      WHERE created_at < now() - (_policy.retention_days || ' days')::interval;
      GET DIAGNOSTICS _affected = ROW_COUNT;

    ELSIF _policy.entity_type = 'notifications' AND _policy.automatic_action = 'hard_delete' THEN
      DELETE FROM public.notifications
      WHERE created_at < now() - (_policy.retention_days || ' days')::interval
        AND is_read = true;
      GET DIAGNOSTICS _affected = ROW_COUNT;

    ELSIF _policy.entity_type = 'ai_outputs' AND _policy.automatic_action = 'anonymize' THEN
      UPDATE public.ai_outputs
      SET input_summary = '{"__anonymized": true}'::jsonb
      WHERE created_at < now() - (_policy.retention_days || ' days')::interval
        AND input_summary <> '{"__anonymized": true}'::jsonb;
      GET DIAGNOSTICS _affected = ROW_COUNT;

    ELSIF _policy.entity_type = 'patients_purge' AND _policy.automatic_action = 'hard_delete' THEN
      DELETE FROM public.patients
      WHERE deleted_at IS NOT NULL
        AND deleted_at < now() - (_policy.retention_days || ' days')::interval;
      GET DIAGNOSTICS _affected = ROW_COUNT;
    END IF;

    IF _affected > 0 THEN
      INSERT INTO public.governance_events (
        actor_id, event_category, event_action, severity,
        target_entity_type, context
      ) VALUES (
        NULL, 'data_lifecycle', 'lifecycle.enforced', 'info',
        _policy.entity_type,
        jsonb_build_object(
          'affected_rows', _affected,
          'policy_id', _policy.id,
          'action', _policy.automatic_action,
          'retention_days', _policy.retention_days
        )
      );
    END IF;

    _total := _total + _affected;
    _result := _result || jsonb_build_object(
      'entity_type', _policy.entity_type,
      'action', _policy.automatic_action,
      'affected', _affected
    );
  END LOOP;

  RETURN jsonb_build_object('total_affected', _total, 'details', _result);
END;
$$;

-- 2) Anomaly detection view (security_invoker = true so RLS of governance_events applies)
CREATE OR REPLACE VIEW public.governance_anomalies
WITH (security_invoker = true)
AS
WITH actor_activity AS (
  SELECT
    actor_id,
    date_trunc('day', created_at) AS day,
    COUNT(*) FILTER (WHERE event_action LIKE 'patient.%' OR event_action LIKE 'case.%') AS phi_access_count,
    COUNT(*) FILTER (WHERE event_action LIKE '%export%') AS export_count,
    COUNT(*) FILTER (WHERE event_action LIKE 'signoff.%') AS signoff_count,
    COUNT(*) FILTER (WHERE severity IN ('error','critical')) AS error_count,
    COUNT(*) AS total_events,
    MAX(created_at) AS last_event_at
  FROM public.governance_events
  WHERE actor_id IS NOT NULL
    AND created_at > now() - interval '7 days'
  GROUP BY actor_id, date_trunc('day', created_at)
)
SELECT
  actor_id,
  day,
  phi_access_count,
  export_count,
  signoff_count,
  error_count,
  total_events,
  last_event_at,
  CASE
    WHEN phi_access_count > 100 THEN 'mass_phi_access'
    WHEN export_count > 10 THEN 'unusual_exports'
    WHEN signoff_count > 20 THEN 'serial_signoffs'
    WHEN error_count > 5 THEN 'repeated_errors'
    ELSE NULL
  END AS anomaly_type,
  CASE
    WHEN phi_access_count > 100 OR export_count > 10 THEN 'critical'
    WHEN signoff_count > 20 OR error_count > 5 THEN 'warn'
    ELSE 'info'
  END AS severity
FROM actor_activity
WHERE phi_access_count > 100
   OR export_count > 10
   OR signoff_count > 20
   OR error_count > 5;

-- 3) Seed default lifecycle policies (idempotent on entity_type unique)
INSERT INTO public.data_lifecycle_policies (entity_type, retention_days, legal_basis, automatic_action, description)
VALUES
  ('patients', 3650, 'RGPD art. 5(1)(e) - 10 ans dossier médical', 'soft_delete', 'Soft-delete des patients inactifs depuis 10 ans'),
  ('patients_purge', 30, 'RGPD art. 17 - droit à l''effacement', 'hard_delete', 'Purge définitive 30j après soft-delete'),
  ('governance_events', 1825, 'RGPD art. 30 + ISO 27001 - 5 ans audit', 'hard_delete', 'Rotation journal d''audit après 5 ans'),
  ('audit_logs', 1825, 'RGPD art. 30 - 5 ans', 'hard_delete', 'Legacy audit_logs rotation'),
  ('notifications', 90, 'Donnée transactionnelle', 'hard_delete', 'Notifications lues supprimées après 90 jours'),
  ('ai_outputs', 730, 'Anonymisation après 2 ans', 'anonymize', 'Anonymisation des inputs IA après 2 ans')
ON CONFLICT (entity_type) DO NOTHING;
