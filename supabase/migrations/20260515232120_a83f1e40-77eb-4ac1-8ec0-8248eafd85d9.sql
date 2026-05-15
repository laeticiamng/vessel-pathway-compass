
-- Helper: revoke from PUBLIC + anon for every SECURITY DEFINER function in public schema.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', r.sig);
  END LOOP;
END$$;

-- Admin-only functions: revoke from authenticated, keep service_role.
DO $$
DECLARE
  fn text;
  admin_fns text[] := ARRAY[
    'public.assign_role(uuid, app_role)',
    'public.revoke_role(uuid, app_role)',
    'public.freeze_user_account(uuid, text)',
    'public.reactivate_user_account(uuid, app_role, text)',
    'public.snapshot_compliance_score()',
    'public.list_users_with_activity()',
    'public.sla_metrics_30d()',
    'public.system_health_metrics()',
    'public.institution_health(uuid)',
    'public.compliance_score()',
    'public.enforce_data_lifecycle()',
    'public.replay_case_at(uuid, timestamptz)'
  ];
BEGIN
  FOREACH fn IN ARRAY admin_fns LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
  END LOOP;
END$$;

-- Trigger functions: no user-level grant needed.
DO $$
DECLARE
  fn text;
  trg_fns text[] := ARRAY[
    'public.capture_case_revision()',
    'public.handle_new_user()',
    'public.notify_case_event()',
    'public.notify_dpo_on_critical_event()',
    'public.notify_expert_response()',
    'public.notify_forum_reply()'
  ];
BEGIN
  FOREACH fn IN ARRAY trg_fns LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn);
  END LOOP;
END$$;

-- User-facing functions: keep EXECUTE for authenticated.
DO $$
DECLARE
  fn text;
  user_fns text[] := ARRAY[
    'public.has_role(uuid, app_role)',
    'public.user_institution_ids(uuid)',
    'public.log_audit_event(text, text, uuid, jsonb)',
    'public.log_governance_event(text, text, text, uuid, text, uuid, uuid, jsonb)',
    'public.register_export_manifest(text, text, integer, text, text, jsonb)',
    'public.count_pending_signoffs(uuid)',
    'public.create_notification(text, text, text, text, uuid)',
    'public.get_ai_audit_evidence_history(text)',
    'public.get_quiz_for_learner(uuid)',
    'public.list_quizzes_for_module(uuid)',
    'public.submit_quiz_attempt(uuid, jsonb)',
    'public.sign_with_eidas(uuid, text)',
    'public.log_ai_audit_confirmation()'
  ];
BEGIN
  FOREACH fn IN ARRAY user_fns LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', fn);
  END LOOP;
END$$;
