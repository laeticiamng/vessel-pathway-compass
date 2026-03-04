
-- Allow course authors to insert modules
CREATE POLICY "Course authors can insert modules"
  ON public.modules FOR INSERT TO authenticated
  WITH CHECK (
    course_id IN (SELECT id FROM public.courses WHERE created_by = auth.uid())
  );

-- Allow course authors to update modules
CREATE POLICY "Course authors can update modules"
  ON public.modules FOR UPDATE TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE created_by = auth.uid())
  );

-- Allow course authors to delete modules
CREATE POLICY "Course authors can delete modules"
  ON public.modules FOR DELETE TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE created_by = auth.uid())
  );

-- Allow course authors to insert quizzes (via module ownership)
CREATE POLICY "Course authors can insert quizzes"
  ON public.quizzes FOR INSERT TO authenticated
  WITH CHECK (
    module_id IN (
      SELECT m.id FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE c.created_by = auth.uid()
    )
  );

-- Allow course authors to update quizzes
CREATE POLICY "Course authors can update quizzes"
  ON public.quizzes FOR UPDATE TO authenticated
  USING (
    module_id IN (
      SELECT m.id FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE c.created_by = auth.uid()
    )
  );

-- Allow course authors to delete quizzes
CREATE POLICY "Course authors can delete quizzes"
  ON public.quizzes FOR DELETE TO authenticated
  USING (
    module_id IN (
      SELECT m.id FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE c.created_by = auth.uid()
    )
  );
