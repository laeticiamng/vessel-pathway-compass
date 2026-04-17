-- =====================================================================
-- P0 HARDENING — Lock down audit_logs & notifications writes
-- =====================================================================

-- 1. Create SECURITY DEFINER function for audit log inserts
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action text,
  _entity_type text,
  _entity_id uuid DEFAULT NULL,
  _details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, COALESCE(_details, '{}'::jsonb))
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event(text, text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, uuid, jsonb) TO authenticated;

-- 2. Block direct client INSERT on audit_logs
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Block direct audit_logs writes" ON public.audit_logs;
CREATE POLICY "Block direct audit_logs writes"
ON public.audit_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- 3. Create SECURITY DEFINER function for notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  _type text,
  _title text,
  _body text DEFAULT NULL,
  _reference_type text DEFAULT NULL,
  _reference_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Allowed self-notification types only (system events come via service_role)
  IF _type NOT IN ('reminder', 'user_action', 'export_ready', 'info') THEN
    RAISE EXCEPTION 'Notification type % not allowed from client', _type;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, reference_type, reference_id)
  VALUES (auth.uid(), _type, _title, _body, _reference_type, _reference_id)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification(text, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification(text, text, text, text, uuid) TO authenticated;

-- 4. Block direct client INSERT on notifications
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Block direct notifications writes" ON public.notifications;
CREATE POLICY "Block direct notifications writes"
ON public.notifications
FOR INSERT
TO anon, authenticated
WITH CHECK (false);
