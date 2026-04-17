-- ============================================================
-- P0/P1 SECURITY HARDENING — Audit findings remediation
-- ============================================================

-- 1. CONTACT_MESSAGES: explicit deny for anon/authenticated inserts
--    (only service_role via edge function `contact-form` can insert)
DROP POLICY IF EXISTS "Block direct inserts from clients" ON public.contact_messages;
CREATE POLICY "Block direct inserts from clients"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- 2. SOUP_COMPONENTS: explicit SELECT for admins only, deny others
ALTER TABLE public.soup_components ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read SOUP components" ON public.soup_components;
CREATE POLICY "Admins can read SOUP components"
ON public.soup_components
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins can manage SOUP components" ON public.soup_components;
CREATE POLICY "Admins can manage SOUP components"
ON public.soup_components
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

-- 3. GOVERNANCE_EVENTS: restrict target_user_id visibility to admins
DROP POLICY IF EXISTS "Users view their own governance events" ON public.governance_events;
DROP POLICY IF EXISTS "Users view governance events as actor" ON public.governance_events;
CREATE POLICY "Users view governance events as actor"
ON public.governance_events
FOR SELECT
TO authenticated
USING (
  actor_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

-- 4. INSTITUTION_SETTINGS: scope hospital_admin to their own institutions only,
--    keep super_admin global, restrict admin to non-DPO fields via app layer.
--    (We tighten policy: hospital_admin must be member of that institution.)
DROP POLICY IF EXISTS "Hospital admins read own institution settings" ON public.institution_settings;
CREATE POLICY "Hospital admins read own institution settings"
ON public.institution_settings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    public.has_role(auth.uid(), 'hospital_admin')
    AND institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

-- 5. REALTIME.MESSAGES: scope notification channel subscriptions per-user.
--    Topic convention: notifications:<user_id>
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own notification topic" ON realtime.messages;
CREATE POLICY "Users read their own notification topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow only if topic matches the user's own UID
  realtime.topic() = ('notifications:' || auth.uid()::text)
  OR realtime.topic() NOT LIKE 'notifications:%'  -- non-notification channels untouched
);

-- 6. USER_ROLES: prevent direct INSERT/UPDATE/DELETE from clients (only via
--    SECURITY DEFINER helpers assign_role / revoke_role / freeze_user_account).
DROP POLICY IF EXISTS "Block direct user_roles writes" ON public.user_roles;
CREATE POLICY "Block direct user_roles writes"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Block direct user_roles updates" ON public.user_roles;
CREATE POLICY "Block direct user_roles updates"
ON public.user_roles
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Block direct user_roles deletes" ON public.user_roles;
CREATE POLICY "Block direct user_roles deletes"
ON public.user_roles
FOR DELETE
TO anon, authenticated
USING (false);
