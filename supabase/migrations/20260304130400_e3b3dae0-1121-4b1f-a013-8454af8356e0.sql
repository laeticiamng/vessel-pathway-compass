
-- Fix overly permissive policies on proms and consents

DROP POLICY "Authenticated can manage proms" ON public.proms;
CREATE POLICY "Users can manage proms for own cases" ON public.proms
  FOR ALL TO authenticated
  USING (case_id IN (SELECT id FROM public.cases WHERE created_by = auth.uid()));

DROP POLICY "Authenticated can manage consents" ON public.consents;
CREATE POLICY "Users can manage consents for own patients" ON public.consents
  FOR ALL TO authenticated
  USING (patient_id IN (SELECT id FROM public.patients WHERE created_by = auth.uid()));
