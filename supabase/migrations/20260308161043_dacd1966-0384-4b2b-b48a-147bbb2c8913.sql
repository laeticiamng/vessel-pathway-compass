
-- Ticket 3: RLS for reputation_events — only system/admin can insert
CREATE POLICY "Only admins can insert reputation events"
ON public.reputation_events FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- Ticket 4: RLS for rubrics — simulation authors can manage
CREATE POLICY "Simulation authors can insert rubrics"
ON public.rubrics FOR INSERT TO authenticated
WITH CHECK (
  simulation_id IN (
    SELECT id FROM public.simulations WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Simulation authors can update rubrics"
ON public.rubrics FOR UPDATE TO authenticated
USING (
  simulation_id IN (
    SELECT id FROM public.simulations WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Simulation authors can delete rubrics"
ON public.rubrics FOR DELETE TO authenticated
USING (
  simulation_id IN (
    SELECT id FROM public.simulations WHERE created_by = auth.uid()
  )
);
