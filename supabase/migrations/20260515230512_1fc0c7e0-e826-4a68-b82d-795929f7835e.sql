-- P1 Visual Chain Engine: assessments table + RPC
CREATE TABLE public.visual_chain_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  institution_id uuid,
  current_layer text NOT NULL CHECK (current_layer IN ('L1','L2','L3','Post-PhD')),
  recommended_layer text NOT NULL CHECK (recommended_layer IN ('L1','L2','L3','Post-PhD')),
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  score jsonb NOT NULL DEFAULT '{}'::jsonb,
  rationale text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vca_case_id ON public.visual_chain_assessments(case_id);
CREATE INDEX idx_vca_created_by ON public.visual_chain_assessments(created_by);
CREATE INDEX idx_vca_inst_created ON public.visual_chain_assessments(institution_id, created_at DESC);

ALTER TABLE public.visual_chain_assessments ENABLE ROW LEVEL SECURITY;

-- SELECT: own row, same institution, or admin
CREATE POLICY "vca_select_own_or_inst_or_admin"
ON public.visual_chain_assessments FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR (institution_id IS NOT NULL AND institution_id IN (SELECT public.user_institution_ids(auth.uid())))
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

-- INSERT: must own the row; institution must be one of user's
CREATE POLICY "vca_insert_self"
ON public.visual_chain_assessments FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND (
    institution_id IS NULL
    OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  )
);

-- UPDATE: creator or admin
CREATE POLICY "vca_update_own_or_admin"
ON public.visual_chain_assessments FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

-- DELETE: creator or super_admin
CREATE POLICY "vca_delete_own_or_super"
ON public.visual_chain_assessments FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE TRIGGER trg_vca_updated_at
BEFORE UPDATE ON public.visual_chain_assessments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: compute recommendation per v8.3 visual chain rules
CREATE OR REPLACE FUNCTION public.compute_visual_chain_recommendation(_inputs jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _resource_level text := COALESCE(_inputs->>'resource_level', 'L2');
  _echo_quality text := COALESCE(_inputs->>'echo_quality', 'unknown'); -- conclusive | inconclusive | unknown
  _ci_aki_risk boolean := COALESCE((_inputs->>'ci_aki_risk')::boolean, false);
  _radiation_contraind boolean := COALESCE((_inputs->>'radiation_contraindicated')::boolean, false);
  _needs_research boolean := COALESCE((_inputs->>'research_context')::boolean, false);
  _pre_gesture_confirm boolean := COALESCE((_inputs->>'pre_gesture_confirmation_required')::boolean, false);
  _recommended text;
  _rationale text;
  _zero_contrast boolean := false;
  _zero_radiation boolean := false;
  _zero_invasive boolean := false;
  _zero_anesthesia boolean := false;
BEGIN
  -- Decision tree per v8.3 visual chain
  IF _needs_research THEN
    _recommended := 'Post-PhD';
    _rationale := 'Research / audit context — Post-PhD layer for retrospective study and registry analysis.';
  ELSIF _pre_gesture_confirm THEN
    _recommended := 'L3';
    _rationale := 'Pre-gesture confirmation required — L3 layer (intra-procedural validated imaging).';
  ELSIF _echo_quality = 'inconclusive' OR _resource_level IN ('L2','L3') THEN
    _recommended := 'L2';
    _rationale := 'Complementary non-iodinated cross-sectional mapping needed.';
  ELSE
    _recommended := 'L1';
    _rationale := 'Conclusive ultrasound at point of decision — L1 default per v8.3.';
  END IF;

  -- 4-zero rule scoring (visual chain only; mechanical gesture unchanged)
  IF _recommended IN ('L1','L2') THEN _zero_contrast := true; END IF;
  IF _recommended IN ('L1','L2') AND NOT _radiation_contraind THEN _zero_radiation := true; END IF;
  IF _recommended IN ('L1','L2') THEN _zero_invasive := true; END IF;
  IF _recommended IN ('L1','L2') THEN _zero_anesthesia := true; END IF;

  RETURN jsonb_build_object(
    'recommended_layer', _recommended,
    'rationale', _rationale,
    'score', jsonb_build_object(
      'zero_contrast', _zero_contrast,
      'zero_radiation', _zero_radiation,
      'zero_invasive', _zero_invasive,
      'zero_anesthesia', _zero_anesthesia
    ),
    'inputs_echo', jsonb_build_object(
      'resource_level', _resource_level,
      'echo_quality', _echo_quality,
      'ci_aki_risk', _ci_aki_risk
    )
  );
END;
$$;