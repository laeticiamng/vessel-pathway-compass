-- =====================================================================
-- FINAL HARDENING — Quiz answer leak + institution access alignment
-- =====================================================================

-- 1. QUIZZES: hide correct answers from client SELECT.
--    Replace public read with a SECURITY DEFINER function that returns
--    only the safe shape (no `correct` / `correctIndex` keys).
DROP POLICY IF EXISTS "View quizzes of published courses or own" ON public.quizzes;

CREATE POLICY "Authors view full quizzes"
ON public.quizzes
FOR SELECT
TO authenticated
USING (
  module_id IN (
    SELECT m.id
    FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE c.created_by = auth.uid()
  )
);

-- Safe quiz fetcher for learners: strips answer keys
CREATE OR REPLACE FUNCTION public.get_quiz_for_learner(_quiz_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _quiz record;
  _safe_questions jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT q.id, q.module_id, q.title, q.passing_score, q.questions
  INTO _quiz
  FROM public.quizzes q
  JOIN public.modules m ON m.id = q.module_id
  JOIN public.courses c ON c.id = m.course_id
  WHERE q.id = _quiz_id
    AND (c.is_published = true OR c.created_by = auth.uid());

  IF _quiz.id IS NULL THEN
    RAISE EXCEPTION 'Quiz not found or not accessible';
  END IF;

  -- Strip correct / correctIndex / answer fields from each question
  SELECT jsonb_agg(
    (q - 'correct' - 'correctIndex' - 'answer' - 'correctAnswer')
  )
  INTO _safe_questions
  FROM jsonb_array_elements(_quiz.questions) q;

  RETURN jsonb_build_object(
    'id', _quiz.id,
    'module_id', _quiz.module_id,
    'title', _quiz.title,
    'passing_score', _quiz.passing_score,
    'questions', COALESCE(_safe_questions, '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_quiz_for_learner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quiz_for_learner(uuid) TO authenticated;

-- Server-side scoring: client submits answers, server compares to keys
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  _quiz_id uuid,
  _answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _quiz record;
  _question jsonb;
  _idx int := 0;
  _correct_count int := 0;
  _total int := 0;
  _score numeric;
  _passed boolean;
  _attempt_id uuid;
  _user_answer jsonb;
  _correct_value jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT q.id, q.passing_score, q.questions
  INTO _quiz
  FROM public.quizzes q
  JOIN public.modules m ON m.id = q.module_id
  JOIN public.courses c ON c.id = m.course_id
  WHERE q.id = _quiz_id
    AND (c.is_published = true OR c.created_by = auth.uid());

  IF _quiz.id IS NULL THEN
    RAISE EXCEPTION 'Quiz not found';
  END IF;

  FOR _question IN SELECT * FROM jsonb_array_elements(_quiz.questions)
  LOOP
    _total := _total + 1;
    _user_answer := _answers -> _idx;
    _correct_value := COALESCE(
      _question -> 'correctIndex',
      _question -> 'correct',
      _question -> 'correctAnswer',
      _question -> 'answer'
    );
    IF _user_answer IS NOT NULL
       AND _correct_value IS NOT NULL
       AND _user_answer = _correct_value THEN
      _correct_count := _correct_count + 1;
    END IF;
    _idx := _idx + 1;
  END LOOP;

  _score := CASE WHEN _total > 0 THEN (_correct_count::numeric / _total) * 100 ELSE 0 END;
  _passed := _score >= _quiz.passing_score;

  INSERT INTO public.quiz_attempts (user_id, quiz_id, score, passed, answers)
  VALUES (auth.uid(), _quiz_id, _score, _passed, _answers)
  RETURNING id INTO _attempt_id;

  RETURN jsonb_build_object(
    'attempt_id', _attempt_id,
    'score', _score,
    'passed', _passed,
    'total', _total,
    'correct', _correct_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) TO authenticated;

-- 2. CASE_EVENTS: separate SELECT policy aligned on cases access
DROP POLICY IF EXISTS "Users can manage case events" ON public.case_events;

CREATE POLICY "Members can read case events"
ON public.case_events
FOR SELECT
TO authenticated
USING (
  case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

CREATE POLICY "Authors write case events"
ON public.case_events
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

CREATE POLICY "Authors update own case events"
ON public.case_events
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authors delete own case events"
ON public.case_events
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- 3. PROMS: align on cases (institution members) — keeps app-side case_id filter
DROP POLICY IF EXISTS "Users can manage proms for own cases" ON public.proms;

CREATE POLICY "Members access proms of accessible cases"
ON public.proms
FOR ALL
TO authenticated
USING (
  case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
)
WITH CHECK (
  case_id IN (
    SELECT id FROM public.cases
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);

-- 4. CONSENTS: align on patients (institution members)
DROP POLICY IF EXISTS "Users can manage consents for own patients" ON public.consents;

CREATE POLICY "Members access consents of accessible patients"
ON public.consents
FOR ALL
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
)
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE created_by = auth.uid()
       OR institution_id IN (SELECT public.user_institution_ids(auth.uid()))
  )
);
