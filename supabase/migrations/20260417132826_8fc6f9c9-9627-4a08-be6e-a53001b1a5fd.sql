-- P3: Anomaly detection trigger + DPO real-time notifications
-- When a critical/error governance event is inserted, automatically notify all DPOs.

CREATE OR REPLACE FUNCTION public.notify_dpo_on_critical_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _dpo_id uuid;
  _title text;
  _body text;
BEGIN
  -- Only act on critical or error events
  IF NEW.severity NOT IN ('critical', 'error') THEN
    RETURN NEW;
  END IF;

  -- Build notification payload
  _title := CASE NEW.severity
    WHEN 'critical' THEN '🚨 Événement critique détecté'
    ELSE '⚠️ Erreur de gouvernance'
  END;
  _body := format('[%s] %s · catégorie : %s', NEW.severity, NEW.event_action, NEW.event_category);

  -- Insert one notification per DPO (admin + super_admin)
  FOR _dpo_id IN
    SELECT user_id FROM public.user_roles
    WHERE role IN ('admin', 'super_admin')
  LOOP
    -- Skip self-notification
    IF _dpo_id IS DISTINCT FROM NEW.actor_id THEN
      INSERT INTO public.notifications (user_id, type, title, body, reference_type, reference_id)
      VALUES (_dpo_id, 'governance_alert', _title, _body, 'governance_event', NEW.id);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_dpo_on_critical_event ON public.governance_events;
CREATE TRIGGER trg_notify_dpo_on_critical_event
AFTER INSERT ON public.governance_events
FOR EACH ROW
EXECUTE FUNCTION public.notify_dpo_on_critical_event();

-- Helper RPC for system observability dashboard (super_admin only)
CREATE OR REPLACE FUNCTION public.system_health_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result jsonb;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT jsonb_build_object(
    'patients_total', (SELECT count(*) FROM public.patients),
    'patients_active', (SELECT count(*) FROM public.patients WHERE deleted_at IS NULL),
    'patients_soft_deleted', (SELECT count(*) FROM public.patients WHERE deleted_at IS NOT NULL),
    'cases_total', (SELECT count(*) FROM public.cases),
    'ai_outputs_total', (SELECT count(*) FROM public.ai_outputs),
    'governance_events_24h', (SELECT count(*) FROM public.governance_events WHERE created_at > now() - interval '24 hours'),
    'governance_events_critical_7d', (SELECT count(*) FROM public.governance_events WHERE severity IN ('critical','error') AND created_at > now() - interval '7 days'),
    'pending_signoffs', (SELECT count(*) FROM public.clinical_signoffs WHERE status = 'pending'),
    'pending_rgpd_requests', (SELECT count(*) FROM public.rgpd_requests WHERE status NOT IN ('completed','rejected')),
    'overdue_rgpd_requests', (SELECT count(*) FROM public.rgpd_requests WHERE status NOT IN ('completed','rejected') AND due_date < now()),
    'active_users_30d', (SELECT count(DISTINCT actor_id) FROM public.governance_events WHERE created_at > now() - interval '30 days' AND actor_id IS NOT NULL),
    'last_lifecycle_run', (SELECT max(created_at) FROM public.governance_events WHERE event_action = 'lifecycle.enforced'),
    'lifecycle_policies_count', (SELECT count(*) FROM public.data_lifecycle_policies),
    'institutions_count', (SELECT count(*) FROM public.institutions),
    'notifications_unread', (SELECT count(*) FROM public.notifications WHERE is_read = false)
  ) INTO _result;

  RETURN _result;
END;
$$;