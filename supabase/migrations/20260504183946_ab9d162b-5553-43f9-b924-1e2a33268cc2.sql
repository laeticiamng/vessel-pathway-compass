-- Clinician confirmations for AIAuditCard rows (TRIPOD+AI traceability)
CREATE TABLE public.ai_audit_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evidence_id text NOT NULL,
  evidence_version text NOT NULL,
  note text,
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_audit_confirmations_evidence
  ON public.ai_audit_confirmations(evidence_id, evidence_version);
CREATE INDEX idx_ai_audit_confirmations_user
  ON public.ai_audit_confirmations(user_id);

ALTER TABLE public.ai_audit_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own confirmations"
ON public.ai_audit_confirmations FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users create own confirmations"
ON public.ai_audit_confirmations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger to mirror confirmations into audit_logs
CREATE OR REPLACE FUNCTION public.log_ai_audit_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    NEW.user_id,
    'ai_audit.evidence_confirmed',
    'ai_audit_evidence',
    NEW.id,
    jsonb_build_object(
      'evidence_id', NEW.evidence_id,
      'evidence_version', NEW.evidence_version,
      'note', NEW.note,
      'confirmed_at', NEW.confirmed_at
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_ai_audit_confirmation
AFTER INSERT ON public.ai_audit_confirmations
FOR EACH ROW EXECUTE FUNCTION public.log_ai_audit_confirmation();