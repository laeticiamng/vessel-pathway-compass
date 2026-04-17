-- =====================================================================
-- INSTITUTION ACCESS ALIGNMENT + LIFECYCLE POLICIES
-- =====================================================================

-- 1. OUTCOMES: split read (institution) from write (creator)
DROP POLICY IF EXISTS "Users can manage outcomes" ON public.outcomes;

CREATE POLICY "Members read outcomes of accessible cases"
ON public.outcomes
FOR SELECT
TO authenticated
USING (
  case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

CREATE POLICY "Authors write outcomes"
ON public.outcomes
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

CREATE POLICY "Authors update own outcomes"
ON public.outcomes
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
)
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authors delete own outcomes"
ON public.outcomes
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

-- 2. IMAGING_SUMMARIES: same pattern
DROP POLICY IF EXISTS "Users can manage imaging summaries" ON public.imaging_summaries;

CREATE POLICY "Members read imaging summaries"
ON public.imaging_summaries
FOR SELECT
TO authenticated
USING (
  case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

CREATE POLICY "Authors write imaging summaries"
ON public.imaging_summaries
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

CREATE POLICY "Authors update own imaging summaries"
ON public.imaging_summaries
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
)
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authors delete own imaging summaries"
ON public.imaging_summaries
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

-- 3. MEASUREMENTS: same pattern
DROP POLICY IF EXISTS "Users can manage measurements" ON public.measurements;

CREATE POLICY "Members read measurements"
ON public.measurements
FOR SELECT
TO authenticated
USING (
  case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

CREATE POLICY "Authors write measurements"
ON public.measurements
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

CREATE POLICY "Authors update own measurements"
ON public.measurements
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
)
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authors delete own measurements"
ON public.measurements
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

-- 4. CASE_EVENTS: tighten UPDATE/DELETE with case access check
DROP POLICY IF EXISTS "Authors update own case events" ON public.case_events;
DROP POLICY IF EXISTS "Authors delete own case events" ON public.case_events;

CREATE POLICY "Authors update own case events"
ON public.case_events
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
)
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authors delete own case events"
ON public.case_events
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  AND case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

-- 5. QUIZZES: allow learners to read quizzes for published courses.
--    Correct answers are filtered at app-layer via get_quiz_for_learner;
--    questions JSONB still contains them, so we keep the column readable
--    only via SECURITY DEFINER. We therefore DO NOT re-grant raw SELECT.
--    Instead we expose a LIST function for module-level discovery.
CREATE OR REPLACE FUNCTION public.list_quizzes_for_module(_module_id uuid)
RETURNS TABLE (id uuid, title text, passing_score numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT q.id, q.title, q.passing_score
  FROM public.quizzes q
  JOIN public.modules m ON m.id = q.module_id
  JOIN public.courses c ON c.id = m.course_id
  WHERE q.module_id = _module_id
    AND (c.is_published = true OR c.created_by = auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.list_quizzes_for_module(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_quizzes_for_module(uuid) TO authenticated;

-- 6. CONTACT_MESSAGES: allow admins to delete (RGPD purge)
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- 7. EXPORT_MANIFESTS: owners can delete, admins can purge expired
DROP POLICY IF EXISTS "Owners delete own export manifests" ON public.export_manifests;
CREATE POLICY "Owners delete own export manifests"
ON public.export_manifests
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
);
