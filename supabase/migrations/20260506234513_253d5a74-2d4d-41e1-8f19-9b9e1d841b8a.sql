-- Lock down all SECURITY DEFINER functions: revoke EXECUTE from PUBLIC and anon.
-- Each function still enforces its own auth/role checks internally; this is
-- defense-in-depth so an unauthenticated PostgREST/RPC call cannot even reach
-- the function body. Trigger-only functions are revoked from everyone except
-- the table owner (postgres) — triggers don't need EXECUTE grants.

-- Trigger / internal functions: callable only by postgres (owner) and triggers.
DO $$
DECLARE fn text;
BEGIN
  FOR fn IN
    SELECT unnest(ARRAY[
      'public.handle_new_user()',
      'public.update_updated_at_column()',
      'public.notify_case_event()',
      'public.notify_expert_response()',
      'public.notify_forum_reply()',
      'public.notify_dpo_on_critical_event()',
      'public.capture_case_revision()',
      'public.log_ai_audit_confirmation()',
      'public.compute_sla_mttr()',
      'public.enforce_data_lifecycle()'
    ])
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;

-- User-callable SECURITY DEFINER functions: only authenticated users.
-- Internal role checks still apply (has_role / auth.uid() guards).
DO $$
DECLARE fn text;
BEGIN
  FOR fn IN
    SELECT unnest(ARRAY[
      'public.has_role(uuid, public.app_role)',
      'public.user_institution_ids(uuid)',
      'public.count_pending_signoffs(uuid)',
      'public.log_governance_event(text, text, text, uuid, text, uuid, uuid, jsonb)',
      'public.log_audit_event(text, text, uuid, jsonb)',
      'public.create_notification(text, text, text, text, uuid)',
      'public.list_users_with_activity()',
      'public.system_health_metrics()',
      'public.assign_role(uuid, public.app_role)',
      'public.revoke_role(uuid, public.app_role)',
      'public.freeze_user_account(uuid, text)',
      'public.reactivate_user_account(uuid, public.app_role, text)',
      'public.sign_with_eidas(uuid, text)',
      'public.compliance_score()',
      'public.snapshot_compliance_score()',
      'public.institution_health(uuid)',
      'public.sla_metrics_30d()',
      'public.replay_case_at(uuid, timestamptz)',
      'public.register_export_manifest(text, text, integer, text, text, jsonb)',
      'public.list_quizzes_for_module(uuid)',
      'public.get_quiz_for_learner(uuid)',
      'public.submit_quiz_attempt(uuid, jsonb)',
      'public.get_ai_audit_evidence_history(text)'
    ])
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', fn);
  END LOOP;
END $$;