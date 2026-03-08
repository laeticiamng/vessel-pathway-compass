
-- ============================================================
-- MIGRATION: Convert ALL 68 RESTRICTIVE policies to PERMISSIVE
-- and fix security findings (validation escalation + expert role check)
-- ============================================================

-- ai_outputs
DROP POLICY IF EXISTS "Users can insert own AI outputs" ON public.ai_outputs;
DROP POLICY IF EXISTS "Users can update own AI outputs" ON public.ai_outputs;
DROP POLICY IF EXISTS "Users can view own AI outputs" ON public.ai_outputs;
CREATE POLICY "Users can view own AI outputs" ON public.ai_outputs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI outputs" ON public.ai_outputs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI outputs" ON public.ai_outputs FOR UPDATE USING (auth.uid() = user_id);

-- audit_logs
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- case_events
DROP POLICY IF EXISTS "Users can manage case events" ON public.case_events;
CREATE POLICY "Users can manage case events" ON public.case_events FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- cases
DROP POLICY IF EXISTS "Users can manage own cases" ON public.cases;
CREATE POLICY "Users can manage own cases" ON public.cases FOR ALL
  USING ((created_by = auth.uid()) OR (institution_id IN (SELECT user_institution_ids(auth.uid()))))
  WITH CHECK ((created_by = auth.uid()) OR (institution_id IN (SELECT user_institution_ids(auth.uid()))));

-- consents
DROP POLICY IF EXISTS "Users can manage consents for own patients" ON public.consents;
CREATE POLICY "Users can manage consents for own patients" ON public.consents FOR ALL
  USING (patient_id IN (SELECT id FROM patients WHERE created_by = auth.uid()))
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- courses
DROP POLICY IF EXISTS "Authors can manage courses" ON public.courses;
DROP POLICY IF EXISTS "View published courses" ON public.courses;
CREATE POLICY "Authors can manage courses" ON public.courses FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "View published courses" ON public.courses FOR SELECT USING ((is_published = true) OR (created_by = auth.uid()));

-- expert_requests
DROP POLICY IF EXISTS "Users can create expert requests" ON public.expert_requests;
DROP POLICY IF EXISTS "Users can update own expert requests" ON public.expert_requests;
DROP POLICY IF EXISTS "Users can view relevant expert requests" ON public.expert_requests;
CREATE POLICY "Users can create expert requests" ON public.expert_requests FOR INSERT WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Users can update own expert requests" ON public.expert_requests FOR UPDATE USING (requester_id = auth.uid());
CREATE POLICY "Users can view relevant expert requests" ON public.expert_requests FOR SELECT
  USING ((requester_id = auth.uid())
    OR (id IN (SELECT request_id FROM expert_responses WHERE expert_id = auth.uid()))
    OR has_role(auth.uid(), 'expert_reviewer'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role));

-- expert_responses (FIX: add role check on INSERT)
DROP POLICY IF EXISTS "Experts can insert responses" ON public.expert_responses;
DROP POLICY IF EXISTS "Users can view relevant expert responses" ON public.expert_responses;
CREATE POLICY "Experts can insert responses" ON public.expert_responses FOR INSERT
  WITH CHECK (expert_id = auth.uid() AND has_role(auth.uid(), 'expert_reviewer'::app_role));
CREATE POLICY "Users can view relevant expert responses" ON public.expert_responses FOR SELECT
  USING ((expert_id = auth.uid())
    OR (request_id IN (SELECT id FROM expert_requests WHERE requester_id = auth.uid()))
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role));

-- exports
DROP POLICY IF EXISTS "Users can manage own exports" ON public.exports;
CREATE POLICY "Users can manage own exports" ON public.exports FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- forum_posts
DROP POLICY IF EXISTS "Authenticated can view forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can insert own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update own forum posts" ON public.forum_posts;
CREATE POLICY "Authenticated can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own forum posts" ON public.forum_posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own forum posts" ON public.forum_posts FOR UPDATE USING (user_id = auth.uid());

-- forum_votes
DROP POLICY IF EXISTS "Authenticated can view votes" ON public.forum_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON public.forum_votes;
DROP POLICY IF EXISTS "Users can insert own votes" ON public.forum_votes;
DROP POLICY IF EXISTS "Users can update own votes" ON public.forum_votes;
CREATE POLICY "Authenticated can view votes" ON public.forum_votes FOR SELECT USING (true);
CREATE POLICY "Users can insert own votes" ON public.forum_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own votes" ON public.forum_votes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own votes" ON public.forum_votes FOR DELETE USING (user_id = auth.uid());

-- imaging_summaries
DROP POLICY IF EXISTS "Users can manage imaging summaries" ON public.imaging_summaries;
CREATE POLICY "Users can manage imaging summaries" ON public.imaging_summaries FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- institutions
DROP POLICY IF EXISTS "Admins can manage institutions" ON public.institutions;
DROP POLICY IF EXISTS "Members can view their institutions" ON public.institutions;
CREATE POLICY "Admins can manage institutions" ON public.institutions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Members can view their institutions" ON public.institutions FOR SELECT
  USING (id IN (SELECT user_institution_ids(auth.uid())));

-- logbook_entries
DROP POLICY IF EXISTS "Users manage own logbook entries" ON public.logbook_entries;
CREATE POLICY "Users manage own logbook entries" ON public.logbook_entries FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- measurements
DROP POLICY IF EXISTS "Users can manage measurements" ON public.measurements;
CREATE POLICY "Users can manage measurements" ON public.measurements FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- memberships
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.memberships;
CREATE POLICY "Admins can manage memberships" ON public.memberships FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users can view own memberships" ON public.memberships FOR SELECT USING (user_id = auth.uid());

-- modules
DROP POLICY IF EXISTS "Course authors can delete modules" ON public.modules;
DROP POLICY IF EXISTS "Course authors can insert modules" ON public.modules;
DROP POLICY IF EXISTS "Course authors can update modules" ON public.modules;
DROP POLICY IF EXISTS "View modules of published courses or own" ON public.modules;
CREATE POLICY "Course authors can insert modules" ON public.modules FOR INSERT
  WITH CHECK (course_id IN (SELECT id FROM courses WHERE created_by = auth.uid()));
CREATE POLICY "Course authors can update modules" ON public.modules FOR UPDATE
  USING (course_id IN (SELECT id FROM courses WHERE created_by = auth.uid()));
CREATE POLICY "Course authors can delete modules" ON public.modules FOR DELETE
  USING (course_id IN (SELECT id FROM courses WHERE created_by = auth.uid()));
CREATE POLICY "View modules of published courses or own" ON public.modules FOR SELECT
  USING (course_id IN (SELECT id FROM courses WHERE (is_published = true) OR (created_by = auth.uid())));

-- notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- outcomes
DROP POLICY IF EXISTS "Users can manage outcomes" ON public.outcomes;
CREATE POLICY "Users can manage outcomes" ON public.outcomes FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- patients
DROP POLICY IF EXISTS "Users can manage own patients" ON public.patients;
CREATE POLICY "Users can manage own patients" ON public.patients FOR ALL
  USING ((created_by = auth.uid()) OR (institution_id IN (SELECT user_institution_ids(auth.uid()))))
  WITH CHECK ((created_by = auth.uid()) OR (institution_id IN (SELECT user_institution_ids(auth.uid()))));

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- proms
DROP POLICY IF EXISTS "Users can manage proms for own cases" ON public.proms;
CREATE POLICY "Users can manage proms for own cases" ON public.proms FOR ALL
  USING (case_id IN (SELECT id FROM cases WHERE created_by = auth.uid()))
  WITH CHECK (case_id IN (SELECT id FROM cases WHERE created_by = auth.uid()));

-- quiz_attempts
DROP POLICY IF EXISTS "Users manage own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users manage own quiz attempts" ON public.quiz_attempts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- quizzes
DROP POLICY IF EXISTS "Course authors can delete quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Course authors can insert quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Course authors can update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "View quizzes of published courses or own" ON public.quizzes;
CREATE POLICY "Course authors can insert quizzes" ON public.quizzes FOR INSERT
  WITH CHECK (module_id IN (SELECT m.id FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.created_by = auth.uid()));
CREATE POLICY "Course authors can update quizzes" ON public.quizzes FOR UPDATE
  USING (module_id IN (SELECT m.id FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.created_by = auth.uid()));
CREATE POLICY "Course authors can delete quizzes" ON public.quizzes FOR DELETE
  USING (module_id IN (SELECT m.id FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.created_by = auth.uid()));
CREATE POLICY "View quizzes of published courses or own" ON public.quizzes FOR SELECT
  USING (module_id IN (SELECT m.id FROM modules m JOIN courses c ON c.id = m.course_id WHERE (c.is_published = true) OR (c.created_by = auth.uid())));

-- reputation_events
DROP POLICY IF EXISTS "Only admins can insert reputation events" ON public.reputation_events;
DROP POLICY IF EXISTS "Users can view own reputation" ON public.reputation_events;
CREATE POLICY "Users can view own reputation" ON public.reputation_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Only admins can insert reputation events" ON public.reputation_events FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- rubrics
DROP POLICY IF EXISTS "Simulation authors can delete rubrics" ON public.rubrics;
DROP POLICY IF EXISTS "Simulation authors can insert rubrics" ON public.rubrics;
DROP POLICY IF EXISTS "Simulation authors can update rubrics" ON public.rubrics;
DROP POLICY IF EXISTS "View rubrics of published simulations or own" ON public.rubrics;
CREATE POLICY "Simulation authors can insert rubrics" ON public.rubrics FOR INSERT
  WITH CHECK (simulation_id IN (SELECT id FROM simulations WHERE created_by = auth.uid()));
CREATE POLICY "Simulation authors can update rubrics" ON public.rubrics FOR UPDATE
  USING (simulation_id IN (SELECT id FROM simulations WHERE created_by = auth.uid()));
CREATE POLICY "Simulation authors can delete rubrics" ON public.rubrics FOR DELETE
  USING (simulation_id IN (SELECT id FROM simulations WHERE created_by = auth.uid()));
CREATE POLICY "View rubrics of published simulations or own" ON public.rubrics FOR SELECT
  USING (simulation_id IN (SELECT id FROM simulations WHERE (is_published = true) OR (created_by = auth.uid())));

-- simulation_runs
DROP POLICY IF EXISTS "Users manage own simulation runs" ON public.simulation_runs;
CREATE POLICY "Users manage own simulation runs" ON public.simulation_runs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- simulations
DROP POLICY IF EXISTS "Authors can manage simulations" ON public.simulations;
DROP POLICY IF EXISTS "View published simulations" ON public.simulations;
CREATE POLICY "Authors can manage simulations" ON public.simulations FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "View published simulations" ON public.simulations FOR SELECT USING ((is_published = true) OR (created_by = auth.uid()));

-- studies
DROP POLICY IF EXISTS "Creators can manage studies" ON public.studies;
DROP POLICY IF EXISTS "Members can view studies" ON public.studies;
CREATE POLICY "Creators can manage studies" ON public.studies FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Members can view studies" ON public.studies FOR SELECT
  USING ((created_by = auth.uid()) OR (id IN (SELECT study_id FROM study_members WHERE user_id = auth.uid())));

-- study_members
DROP POLICY IF EXISTS "Members can view study members" ON public.study_members;
DROP POLICY IF EXISTS "Study creators can manage members" ON public.study_members;
CREATE POLICY "Members can view study members" ON public.study_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Study creators can manage members" ON public.study_members FOR ALL
  USING (study_id IN (SELECT id FROM studies WHERE created_by = auth.uid()))
  WITH CHECK (study_id IN (SELECT id FROM studies WHERE created_by = auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- validations (FIX: prevent self-approval)
DROP POLICY IF EXISTS "Users can delete own validations" ON public.validations;
DROP POLICY IF EXISTS "Users can insert own validations" ON public.validations;
DROP POLICY IF EXISTS "Users can update own validations" ON public.validations;
DROP POLICY IF EXISTS "Users can view and manage own validations" ON public.validations;
CREATE POLICY "Users can view own validations" ON public.validations FOR SELECT
  USING ((user_id = auth.uid()) OR (validator_id = auth.uid()));
CREATE POLICY "Users can insert own validations" ON public.validations FOR INSERT
  WITH CHECK ((user_id = auth.uid()) AND (validator_id IS NULL));
CREATE POLICY "Users can update own validations" ON public.validations FOR UPDATE
  USING ((user_id = auth.uid()) OR (validator_id = auth.uid()))
  WITH CHECK (
    (user_id = auth.uid() AND validator_id IS DISTINCT FROM auth.uid())
    OR (validator_id = auth.uid() AND user_id IS DISTINCT FROM auth.uid())
  );
CREATE POLICY "Users can delete own validations" ON public.validations FOR DELETE USING (user_id = auth.uid());
