-- Tighten validations UPDATE policy to prevent column-tampering by validators
DROP POLICY IF EXISTS "Validator can update validation status" ON public.validations;
CREATE POLICY "Validator can update validation status"
ON public.validations
FOR UPDATE
TO authenticated
USING (validator_id = auth.uid())
WITH CHECK (
  validator_id = auth.uid()
  -- Validator cannot change ownership/track/type
  AND user_id = (SELECT v.user_id FROM public.validations v WHERE v.id = validations.id)
  AND track = (SELECT v.track FROM public.validations v WHERE v.id = validations.id)
  AND validation_type = (SELECT v.validation_type FROM public.validations v WHERE v.id = validations.id)
);
