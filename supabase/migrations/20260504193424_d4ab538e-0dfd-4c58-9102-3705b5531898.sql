
-- Tighten EXECUTE on SECURITY DEFINER trigger function
REVOKE ALL ON FUNCTION public.log_ai_audit_confirmation() FROM PUBLIC, anon, authenticated;
-- Trigger executes as table owner regardless; only the trigger needs it.

-- Restrict INSERT to clinician/reviewer roles
DROP POLICY IF EXISTS "Users create own confirmations" ON public.ai_audit_confirmations;
CREATE POLICY "Clinicians create own confirmations"
ON public.ai_audit_confirmations FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_role(auth.uid(), 'physician')
    OR public.has_role(auth.uid(), 'expert_reviewer')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  )
);

-- Per-evidence history accessible to authenticated clinicians/reviewers (anonymized display name)
CREATE OR REPLACE FUNCTION public.get_ai_audit_evidence_history(_evidence_id text)
RETURNS TABLE (
  id uuid,
  evidence_id text,
  evidence_version text,
  confirmed_at timestamptz,
  note text,
  user_display_name text,
  is_self boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.evidence_id,
    c.evidence_version,
    c.confirmed_at,
    c.note,
    COALESCE(p.display_name, 'Clinician'),
    (c.user_id = auth.uid())
  FROM public.ai_audit_confirmations c
  LEFT JOIN public.profiles p ON p.user_id = c.user_id
  WHERE c.evidence_id = _evidence_id
    AND (
      public.has_role(auth.uid(), 'physician')
      OR public.has_role(auth.uid(), 'expert_reviewer')
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'hospital_admin')
    )
  ORDER BY c.confirmed_at DESC
  LIMIT 200;
$$;

REVOKE ALL ON FUNCTION public.get_ai_audit_evidence_history(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_ai_audit_evidence_history(text) TO authenticated;
