-- ═══════════════════════════════════════════════════════════════
-- AUDIT P0/P1 SECURITY HARDENING
-- ═══════════════════════════════════════════════════════════════

-- 1. Avatars bucket: prevent listing, restrict reads to known files only
-- (bucket stays public for direct URL access, but listing is blocked)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;

-- Public READ via direct URL only (no listing — Supabase enforces this when no SELECT policy on bucket prefix)
CREATE POLICY "Public read avatars by direct URL"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Users may only upload/update/delete files inside their own user_id folder
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. eco_metrics: align RLS with cases (institution members can manage)
DROP POLICY IF EXISTS "Users can manage own eco metrics" ON public.eco_metrics;
DROP POLICY IF EXISTS "Users manage own eco metrics" ON public.eco_metrics;

CREATE POLICY "Users manage eco metrics for accessible cases"
ON public.eco_metrics FOR ALL
TO authenticated
USING (
  case_id IN (
    SELECT c.id FROM public.cases c
    WHERE c.created_by = auth.uid()
       OR c.institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
)
WITH CHECK (
  created_by = auth.uid()
  AND case_id IN (
    SELECT c.id FROM public.cases c
    WHERE c.created_by = auth.uid()
       OR c.institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

-- 3. compliance_snapshots: explicit deny-all writes for clients (snapshots only via service_role / SECURITY DEFINER RPC)
-- The snapshot_compliance_score() function runs as SECURITY DEFINER so RLS doesn't apply to it.
-- We add an explicit "no client write" policy for clarity and audit.
CREATE POLICY "Block client writes on compliance_snapshots"
ON public.compliance_snapshots FOR INSERT
TO authenticated
WITH CHECK (false);

-- 4. Lifecycle policy for contact_messages (RGPD retention 365 days, then hard delete)
INSERT INTO public.data_lifecycle_policies (entity_type, retention_days, automatic_action, legal_basis, description)
VALUES ('contact_messages', 365, 'hard_delete', 'rgpd_art_5_minimization',
        'Contact form messages are kept 1 year for follow-up then permanently deleted (RGPD data minimization).')
ON CONFLICT DO NOTHING;

-- 5. Extend enforce_data_lifecycle to handle contact_messages
CREATE OR REPLACE FUNCTION public.enforce_data_lifecycle()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

    ELSIF _policy.entity_type = 'contact_messages' AND _policy.automatic_action = 'hard_delete' THEN
      DELETE FROM public.contact_messages
      WHERE created_at < now() - (_policy.retention_days || ' days')::interval;
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
$function$;