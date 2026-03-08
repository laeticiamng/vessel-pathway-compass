
-- Fix case-related tables: restrict INSERT to own cases
DROP POLICY IF EXISTS "Users can manage case events" ON public.case_events;
CREATE POLICY "Users can manage case events" ON public.case_events FOR ALL
  USING (created_by = auth.uid() AND case_id IN (SELECT id FROM cases WHERE created_by = auth.uid() OR institution_id IN (SELECT user_institution_ids(auth.uid()))))
  WITH CHECK (created_by = auth.uid() AND case_id IN (SELECT id FROM cases WHERE created_by = auth.uid() OR institution_id IN (SELECT user_institution_ids(auth.uid()))));

DROP POLICY IF EXISTS "Users can manage imaging summaries" ON public.imaging_summaries;
CREATE POLICY "Users can manage imaging summaries" ON public.imaging_summaries FOR ALL
  USING (created_by = auth.uid() AND case_id IN (SELECT id FROM cases WHERE created_by = auth.uid() OR institution_id IN (SELECT user_institution_ids(auth.uid()))))
  WITH CHECK (created_by = auth.uid() AND case_id IN (SELECT id FROM cases WHERE created_by = auth.uid() OR institution_id IN (SELECT user_institution_ids(auth.uid()))));

DROP POLICY IF EXISTS "Users can manage measurements" ON public.measurements;
CREATE POLICY "Users can manage measurements" ON public.measurements FOR ALL
  USING (created_by = auth.uid() AND case_id IN (SELECT id FROM cases WHERE created_by = auth.uid() OR institution_id IN (SELECT user_institution_ids(auth.uid()))))
  WITH CHECK (created_by = auth.uid() AND case_id IN (SELECT id FROM cases WHERE created_by = auth.uid() OR institution_id IN (SELECT user_institution_ids(auth.uid()))));

DROP POLICY IF EXISTS "Users can manage outcomes" ON public.outcomes;
CREATE POLICY "Users can manage outcomes" ON public.outcomes FOR ALL
  USING (created_by = auth.uid() AND case_id IN (SELECT id FROM cases WHERE created_by = auth.uid() OR institution_id IN (SELECT user_institution_ids(auth.uid()))))
  WITH CHECK (created_by = auth.uid() AND case_id IN (SELECT id FROM cases WHERE created_by = auth.uid() OR institution_id IN (SELECT user_institution_ids(auth.uid()))));

-- Fix forum: restrict to authenticated users only
DROP POLICY IF EXISTS "Authenticated can view forum posts" ON public.forum_posts;
CREATE POLICY "Authenticated can view forum posts" ON public.forum_posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can view votes" ON public.forum_votes;
CREATE POLICY "Authenticated can view votes" ON public.forum_votes FOR SELECT TO authenticated USING (true);
