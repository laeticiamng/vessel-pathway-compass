
-- =====================================================
-- 1) R&D audit log table
-- =====================================================
CREATE TABLE public.research_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.hardware_projects(id) ON DELETE CASCADE,
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_research_audit_project ON public.research_audit_logs(project_id, created_at DESC);
CREATE INDEX idx_research_audit_actor ON public.research_audit_logs(actor_id, created_at DESC);

CREATE POLICY "Members and admins view research audit"
  ON public.research_audit_logs FOR SELECT
  USING (
    actor_id = auth.uid()
    OR (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );
-- No INSERT/UPDATE/DELETE policy: rows are only inserted by SECURITY DEFINER triggers/functions.

-- Generic logger (server-side only, no role grant to anon/public)
CREATE OR REPLACE FUNCTION public.log_research_event(
  _project_id uuid,
  _action text,
  _entity_type text,
  _entity_id uuid DEFAULT NULL,
  _context jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _id uuid;
BEGIN
  INSERT INTO public.research_audit_logs (project_id, actor_id, action, entity_type, entity_id, context)
  VALUES (_project_id, auth.uid(), _action, _entity_type, _entity_id, COALESCE(_context, '{}'::jsonb))
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- =====================================================
-- 2) Audit triggers
-- =====================================================
CREATE OR REPLACE FUNCTION public.trg_audit_project_members()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_research_event(NEW.project_id, 'member.added', 'project_member', NEW.id,
      jsonb_build_object('user_id', NEW.user_id, 'role', NEW.project_role));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.project_role IS DISTINCT FROM OLD.project_role THEN
    PERFORM public.log_research_event(NEW.project_id, 'member.role_changed', 'project_member', NEW.id,
      jsonb_build_object('user_id', NEW.user_id, 'from', OLD.project_role, 'to', NEW.project_role));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_research_event(OLD.project_id, 'member.removed', 'project_member', OLD.id,
      jsonb_build_object('user_id', OLD.user_id, 'role', OLD.project_role));
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_audit_project_members
AFTER INSERT OR UPDATE OR DELETE ON public.project_members
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_project_members();

CREATE OR REPLACE FUNCTION public.trg_audit_project_invitations()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_research_event(NEW.project_id, 'invitation.created', 'project_invitation', NEW.id,
      jsonb_build_object('email', NEW.invited_email, 'role', NEW.invited_role));
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_research_event(NEW.project_id, 'invitation.' || NEW.status, 'project_invitation', NEW.id,
      jsonb_build_object('email', NEW.invited_email, 'from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_audit_project_invitations
AFTER INSERT OR UPDATE ON public.project_invitations
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_project_invitations();

CREATE OR REPLACE FUNCTION public.trg_audit_project_messages()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.log_research_event(NEW.project_id, 'message.posted', 'project_message', NEW.id,
    jsonb_build_object('length', length(NEW.body)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_audit_project_messages
AFTER INSERT ON public.project_messages
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_project_messages();

CREATE OR REPLACE FUNCTION public.trg_audit_sequence_designs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_research_event(NEW.project_id, 'sequence.saved', 'sequence_design', NEW.id,
      jsonb_build_object('name', NEW.name, 'version', NEW.version));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_research_event(OLD.project_id, 'sequence.deleted', 'sequence_design', OLD.id,
      jsonb_build_object('name', OLD.name, 'version', OLD.version));
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_audit_sequence_designs
AFTER INSERT OR DELETE ON public.sequence_designs
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_sequence_designs();

CREATE OR REPLACE FUNCTION public.trg_audit_ai_recon_jobs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_research_event(NULL, 'ai_job.queued', 'ai_recon_job', NEW.id,
      jsonb_build_object('pipeline', NEW.pipeline, 'input_type', NEW.input_type));
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_research_event(NULL, 'ai_job.' || NEW.status, 'ai_recon_job', NEW.id,
      jsonb_build_object('pipeline', NEW.pipeline, 'from', OLD.status, 'to', NEW.status,
                        'progress', NEW.progress));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_audit_ai_recon_jobs
AFTER INSERT OR UPDATE ON public.ai_recon_jobs
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_ai_recon_jobs();

-- =====================================================
-- 3) Lock down SECURITY DEFINER function permissions
--    Revoke from PUBLIC + anon. Keep authenticated where RPC is needed.
--    Functions with internal admin checks already raise 'forbidden' if misused.
-- =====================================================
DO $$
DECLARE _f record;
BEGIN
  FOR _f IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon', _f.proname, _f.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated, service_role', _f.proname, _f.args);
  END LOOP;
END $$;

-- Cron-/service-only functions: also revoke from authenticated (only service_role keeps it)
REVOKE EXECUTE ON FUNCTION public.enforce_data_lifecycle() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.snapshot_compliance_score() FROM authenticated;

-- Internal trigger helpers should not be callable by anyone other than the DB itself
REVOKE EXECUTE ON FUNCTION public.trg_audit_project_members() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_audit_project_invitations() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_audit_project_messages() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_audit_sequence_designs() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_audit_ai_recon_jobs() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_research_event(uuid, text, text, uuid, jsonb) FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_case_event() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_expert_response() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_forum_reply() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_dpo_on_critical_event() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.capture_case_revision() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_ai_audit_confirmation() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.compute_sla_mttr() FROM authenticated, PUBLIC;
