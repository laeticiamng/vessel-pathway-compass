-- =====================================================================
-- P1/P2 SECURITY HARDENING — Round 2 (8 findings)
-- =====================================================================

-- 1. AUDIT_LOGS: allow admins/super_admins to read all audit logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- 2. CASE_REVISIONS: explicitly block client INSERT/UPDATE/DELETE
--    (writes happen only via service_role triggers)
DROP POLICY IF EXISTS "Block client writes case_revisions insert" ON public.case_revisions;
CREATE POLICY "Block client writes case_revisions insert"
ON public.case_revisions
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Block client writes case_revisions update" ON public.case_revisions;
CREATE POLICY "Block client writes case_revisions update"
ON public.case_revisions
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Block client writes case_revisions delete" ON public.case_revisions;
CREATE POLICY "Block client writes case_revisions delete"
ON public.case_revisions
FOR DELETE
TO anon, authenticated
USING (false);

-- 3. COMPLIANCE_SNAPSHOTS: explicitly block UPDATE/DELETE (immutable)
DROP POLICY IF EXISTS "Block compliance_snapshots updates" ON public.compliance_snapshots;
CREATE POLICY "Block compliance_snapshots updates"
ON public.compliance_snapshots
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Block compliance_snapshots deletes" ON public.compliance_snapshots;
CREATE POLICY "Block compliance_snapshots deletes"
ON public.compliance_snapshots
FOR DELETE
TO anon, authenticated
USING (false);

-- 4. GOVERNANCE_EVENTS: constrain client INSERTs to safe categories
--    + force severity 'info'. Critical events must use SECURITY DEFINER
--    function log_governance_event() which runs as service.
DROP POLICY IF EXISTS "Authenticated users insert own events" ON public.governance_events;
CREATE POLICY "Authenticated users insert own events"
ON public.governance_events
FOR INSERT
TO authenticated
WITH CHECK (
  actor_id = auth.uid()
  AND severity = 'info'
  AND event_category IN ('user_action', 'navigation', 'export_request')
);

-- 5. SLA_INCIDENTS: restrict SELECT to admins only
DROP POLICY IF EXISTS "Authenticated read SLA incidents" ON public.sla_incidents;
DROP POLICY IF EXISTS "Admins read SLA incidents" ON public.sla_incidents;
CREATE POLICY "Admins read SLA incidents"
ON public.sla_incidents
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- 6. INSTITUTION_SETTINGS: drop overly-permissive {public} admin policy
--    Keep only: super_admin global + hospital_admin scoped to own institution
DROP POLICY IF EXISTS "Hospital admin reads own institution settings" ON public.institution_settings;
DROP POLICY IF EXISTS "Hospital admin updates own institution settings" ON public.institution_settings;

CREATE POLICY "Hospital admin updates own institution settings"
ON public.institution_settings
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR (
    public.has_role(auth.uid(), 'hospital_admin'::public.app_role)
    AND institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR (
    public.has_role(auth.uid(), 'hospital_admin'::public.app_role)
    AND institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

-- 7. REALTIME.MESSAGES: tighten — only allow notifications:{uid} topics
DROP POLICY IF EXISTS "Users read their own notification topic" ON realtime.messages;
CREATE POLICY "Users read their own notification topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = ('notifications:' || auth.uid()::text)
);
