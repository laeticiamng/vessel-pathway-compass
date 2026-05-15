
-- =============================
-- P2: RSVP Resource Stratification
-- =============================
CREATE TABLE public.rsvp_stratifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  requested_level text NOT NULL CHECK (requested_level IN ('L1','L2','L3')),
  recommended_level text NOT NULL CHECK (recommended_level IN ('L1','L2','L3')),
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  bands jsonb NOT NULL DEFAULT '{}'::jsonb,
  rationale text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rsvp_created_by ON public.rsvp_stratifications(created_by);
CREATE INDEX idx_rsvp_institution ON public.rsvp_stratifications(institution_id);
CREATE INDEX idx_rsvp_case ON public.rsvp_stratifications(case_id);

ALTER TABLE public.rsvp_stratifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rsvp: insert own"
  ON public.rsvp_stratifications FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "rsvp: read own or institution"
  ON public.rsvp_stratifications FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE TRIGGER trg_rsvp_updated_at
  BEFORE UPDATE ON public.rsvp_stratifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: compute_rsvp_recommendation
CREATE OR REPLACE FUNCTION public.compute_rsvp_recommendation(_inputs jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _requested text := COALESCE(_inputs->>'requested_level', 'L2');
  _low_resource boolean := COALESCE((_inputs->>'low_resource_mode')::boolean, false);
  _lmic boolean := COALESCE((_inputs->>'lmic_context')::boolean, false);
  _urgent boolean := COALESCE((_inputs->>'urgent')::boolean, false);
  _iod_contra boolean := COALESCE((_inputs->>'iodine_contraindicated')::boolean, false);
  _gad_contra boolean := COALESCE((_inputs->>'gadolinium_contraindicated')::boolean, false);
  _radiation_contra boolean := COALESCE((_inputs->>'radiation_contraindicated')::boolean, false);
  _l1l2_insufficient boolean := COALESCE((_inputs->>'l1l2_insufficient')::boolean, false);
  _recommended text;
  _rationale text;
  _bands jsonb;
BEGIN
  -- Decision tree (v8.3 RSVP)
  IF _low_resource OR _lmic OR _urgent OR _iod_contra OR _radiation_contra THEN
    _recommended := 'L1';
    _rationale := 'Constraints favour minimal stack (Doppler + AquaMR low-field): zero iodine, zero radiation, fastest delay.';
  ELSIF _l1l2_insufficient AND NOT _gad_contra THEN
    _recommended := 'L3';
    _rationale := 'L1/L2 insufficient and full multi-modal stack acceptable — escalate to L3 with documented benefit/risk.';
  ELSE
    _recommended := COALESCE(NULLIF(_requested,''), 'L2');
    IF _recommended NOT IN ('L1','L2','L3') THEN _recommended := 'L2'; END IF;
    _rationale := 'Standard stack — MRA without gadolinium, structured reporting, audit trail.';
  END IF;

  _bands := CASE _recommended
    WHEN 'L1' THEN jsonb_build_object('cost','€','delay','same_day','lmic','high')
    WHEN 'L2' THEN jsonb_build_object('cost','€€','delay','1_3_days','lmic','medium')
    ELSE jsonb_build_object('cost','€€€','delay','1plus_week','lmic','low')
  END;

  RETURN jsonb_build_object(
    'recommended_level', _recommended,
    'rationale', _rationale,
    'bands', _bands,
    'inputs_echo', _inputs
  );
END;
$$;
