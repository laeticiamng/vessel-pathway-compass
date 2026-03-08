
-- ============================================================
-- FIX: Convert all RESTRICTIVE policies to PERMISSIVE
-- PostgreSQL default is PERMISSIVE; RESTRICTIVE requires at
-- least one PERMISSIVE policy to pass first. With only
-- RESTRICTIVE policies, zero rows are ever returned.
-- ============================================================

-- ai_outputs
DROP POLICY IF EXISTS "Users can insert own AI outputs" ON public.ai_outputs;
DROP POLICY IF EXISTS "Users can update own AI outputs" ON public.ai_outputs;
DROP POLICY IF EXISTS "Users can view own AI outputs" ON public.ai_outputs;

CREATE POLICY "Users can insert own AI outputs" ON public.ai_outputs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI outputs" ON public.ai_outputs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own AI outputs" ON public.ai_outputs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- audit_logs
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;

CREATE POLICY "Users can insert own audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- case_events
DROP POLICY IF EXISTS "Users can manage case events" ON public.case_events;
CREATE POLICY "Users can manage case events" ON public.case_events FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- cases
DROP POLICY IF EXISTS "Users can manage own cases" ON public.cases;
CREATE POLICY "Users can manage own cases" ON public.cases FOR ALL TO authenticated USING ((created_by = auth.uid()) OR (institution_id IN (SELECT user_institution_ids(auth.uid())))) WITH CHECK ((created_by = auth.uid()) OR (institution_id IN (SELECT user_institution_ids(auth.uid()))));

-- consents
DROP POLICY IF EXISTS "Users can manage consents for own patients" ON public.consents;
CREATE POLICY "Users can manage consents for own patients" ON public.consents FOR ALL TO authenticated USING (patient_id IN (SELECT id FROM patients WHERE created_by = auth.uid())) WITH CHECK (patient_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- courses
DROP POLICY IF EXISTS "Authors can manage courses" ON public.courses;
DROP POLICY IF EXISTS "View published courses" ON public.courses;
CREATE POLICY "Authors can manage courses" ON public.courses FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "View published courses" ON public.courses FOR SELECT TO authenticated USING ((is_published = true) OR (created_by = auth.uid()));

-- expert_requests — FIX: restrict SELECT to requester + experts who responded
DROP POLICY IF EXISTS "Authenticated can view expert requests" ON public.expert_requests;
DROP POLICY IF EXISTS "Users can create expert requests" ON public.expert_requests;
DROP POLICY IF EXISTS "Users can update own expert requests" ON public.expert_requests;

CREATE POLICY "Users can view relevant expert requests" ON public.expert_requests FOR SELECT TO authenticated USING (
  requester_id = auth.uid()
  OR id IN (SELECT request_id FROM public.expert_responses WHERE expert_id = auth.uid())
  OR public.has_role(auth.uid(), 'expert_reviewer'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);
CREATE POLICY "Users can create expert requests" ON public.expert_requests FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Users can update own expert requests" ON public.expert_requests FOR UPDATE TO authenticated USING (requester_id = auth.uid());

-- expert_responses — FIX: restrict SELECT to requester + expert
DROP POLICY IF EXISTS "Authenticated can view expert responses" ON public.expert_responses;
DROP POLICY IF EXISTS "Experts can insert responses" ON public.expert_responses;

CREATE POLICY "Users can view relevant expert responses" ON public.expert_responses FOR SELECT TO authenticated USING (
  expert_id = auth.uid()
  OR request_id IN (SELECT id FROM public.expert_requests WHERE requester_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);
CREATE POLICY "Experts can insert responses" ON public.expert_responses FOR INSERT TO authenticated WITH CHECK (expert_id = auth.uid());

-- exports
DROP POLICY IF EXISTS "Users can manage own exports" ON public.exports;
CREATE POLICY "Users can manage own exports" ON public.exports FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- forum_posts
DROP POLICY IF EXISTS "Authenticated can view forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can insert own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update own forum posts" ON public.forum_posts;

CREATE POLICY "Authenticated can view forum posts" ON public.forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own forum posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own forum posts" ON public.forum_posts FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- forum_votes
DROP POLICY IF EXISTS "Authenticated can view votes" ON public.forum_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON public.forum_votes;
DROP POLICY IF EXISTS "Users can insert own votes" ON public.forum_votes;
DROP POLICY IF EXISTS "Users can update own votes" ON public.forum_votes;

CREATE POLICY "Authenticated can view votes" ON public.forum_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can delete own votes" ON public.forum_votes FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own votes" ON public.forum_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own votes" ON public.forum_votes FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- imaging_summaries
DROP POLICY IF EXISTS "Users can manage imaging summaries" ON public.imaging_summaries;
CREATE POLICY "Users can manage imaging summaries" ON public.imaging_summaries FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- institutions
DROP POLICY IF EXISTS "Admins can manage institutions" ON public.institutions;
DROP POLICY IF EXISTS "Members can view their institutions" ON public.institutions;
CREATE POLICY "Admins can manage institutions" ON public.institutions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Members can view their institutions" ON public.institutions FOR SELECT TO authenticated USING (id IN (SELECT user_institution_ids(auth.uid())));

-- logbook_entries
DROP POLICY IF EXISTS "Users manage own logbook entries" ON public.logbook_entries;
CREATE POLICY "Users manage own logbook entries" ON public.logbook_entries FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- measurements
DROP POLICY IF EXISTS "Users can manage measurements" ON public.measurements;
CREATE POLICY "Users can manage measurements" ON public.measurements FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- memberships
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.memberships;
CREATE POLICY "Admins can manage memberships" ON public.memberships FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users can view own memberships" ON public.memberships FOR SELECT TO authenticated USING (user_id = auth.uid());

-- modules — FIX: gate behind course publication
DROP POLICY IF EXISTS "Authenticated can view modules" ON public.modules;
DROP POLICY IF EXISTS "Course authors can delete modules" ON public.modules;
DROP POLICY IF EXISTS "Course authors can insert modules" ON public.modules;
DROP POLICY IF EXISTS "Course authors can update modules" ON public.modules;

CREATE POLICY "View modules of published courses or own" ON public.modules FOR SELECT TO authenticated USING (
  course_id IN (SELECT id FROM public.courses WHERE is_published = true OR created_by = auth.uid())
);
CREATE POLICY "Course authors can insert modules" ON public.modules FOR INSERT TO authenticated WITH CHECK (course_id IN (SELECT id FROM courses WHERE created_by = auth.uid()));
CREATE POLICY "Course authors can update modules" ON public.modules FOR UPDATE TO authenticated USING (course_id IN (SELECT id FROM courses WHERE created_by = auth.uid()));
CREATE POLICY "Course authors can delete modules" ON public.modules FOR DELETE TO authenticated USING (course_id IN (SELECT id FROM courses WHERE created_by = auth.uid()));

-- notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- outcomes
DROP POLICY IF EXISTS "Users can manage outcomes" ON public.outcomes;
CREATE POLICY "Users can manage outcomes" ON public.outcomes FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- patients
DROP POLICY IF EXISTS "Users can manage own patients" ON public.patients;
CREATE POLICY "Users can manage own patients" ON public.patients FOR ALL TO authenticated USING ((created_by = auth.uid()) OR (institution_id IN (SELECT user_institution_ids(auth.uid())))) WITH CHECK ((created_by = auth.uid()) OR (institution_id IN (SELECT user_institution_ids(auth.uid()))));

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- proms
DROP POLICY IF EXISTS "Users can manage proms for own cases" ON public.proms;
CREATE POLICY "Users can manage proms for own cases" ON public.proms FOR ALL TO authenticated USING (case_id IN (SELECT id FROM cases WHERE created_by = auth.uid())) WITH CHECK (case_id IN (SELECT id FROM cases WHERE created_by = auth.uid()));

-- quiz_attempts
DROP POLICY IF EXISTS "Users manage own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users manage own quiz attempts" ON public.quiz_attempts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- quizzes — FIX: gate behind course publication
DROP POLICY IF EXISTS "Authenticated can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Course authors can delete quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Course authors can insert quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Course authors can update quizzes" ON public.quizzes;

CREATE POLICY "View quizzes of published courses or own" ON public.quizzes FOR SELECT TO authenticated USING (
  module_id IN (SELECT m.id FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.is_published = true OR c.created_by = auth.uid())
);
CREATE POLICY "Course authors can insert quizzes" ON public.quizzes FOR INSERT TO authenticated WITH CHECK (module_id IN (SELECT m.id FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.created_by = auth.uid()));
CREATE POLICY "Course authors can update quizzes" ON public.quizzes FOR UPDATE TO authenticated USING (module_id IN (SELECT m.id FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.created_by = auth.uid()));
CREATE POLICY "Course authors can delete quizzes" ON public.quizzes FOR DELETE TO authenticated USING (module_id IN (SELECT m.id FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.created_by = auth.uid()));

-- reputation_events
DROP POLICY IF EXISTS "Authenticated can view reputation" ON public.reputation_events;
DROP POLICY IF EXISTS "Only admins can insert reputation events" ON public.reputation_events;

CREATE POLICY "Users can view own reputation" ON public.reputation_events FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Only admins can insert reputation events" ON public.reputation_events FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- rubrics
DROP POLICY IF EXISTS "Authenticated can view rubrics" ON public.rubrics;
DROP POLICY IF EXISTS "Simulation authors can delete rubrics" ON public.rubrics;
DROP POLICY IF EXISTS "Simulation authors can insert rubrics" ON public.rubrics;
DROP POLICY IF EXISTS "Simulation authors can update rubrics" ON public.rubrics;

CREATE POLICY "View rubrics of published simulations or own" ON public.rubrics FOR SELECT TO authenticated USING (
  simulation_id IN (SELECT id FROM simulations WHERE is_published = true OR created_by = auth.uid())
);
CREATE POLICY "Simulation authors can insert rubrics" ON public.rubrics FOR INSERT TO authenticated WITH CHECK (simulation_id IN (SELECT id FROM simulations WHERE created_by = auth.uid()));
CREATE POLICY "Simulation authors can update rubrics" ON public.rubrics FOR UPDATE TO authenticated USING (simulation_id IN (SELECT id FROM simulations WHERE created_by = auth.uid()));
CREATE POLICY "Simulation authors can delete rubrics" ON public.rubrics FOR DELETE TO authenticated USING (simulation_id IN (SELECT id FROM simulations WHERE created_by = auth.uid()));

-- simulation_runs
DROP POLICY IF EXISTS "Users manage own simulation runs" ON public.simulation_runs;
CREATE POLICY "Users manage own simulation runs" ON public.simulation_runs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- simulations
DROP POLICY IF EXISTS "Authors can manage simulations" ON public.simulations;
DROP POLICY IF EXISTS "View published simulations" ON public.simulations;
CREATE POLICY "Authors can manage simulations" ON public.simulations FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "View published simulations" ON public.simulations FOR SELECT TO authenticated USING ((is_published = true) OR (created_by = auth.uid()));

-- studies
DROP POLICY IF EXISTS "Creators can manage studies" ON public.studies;
DROP POLICY IF EXISTS "Members can view studies" ON public.studies;
CREATE POLICY "Creators can manage studies" ON public.studies FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Members can view studies" ON public.studies FOR SELECT TO authenticated USING ((created_by = auth.uid()) OR (id IN (SELECT study_id FROM study_members WHERE user_id = auth.uid())));

-- study_members
DROP POLICY IF EXISTS "Members can view study members" ON public.study_members;
DROP POLICY IF EXISTS "Study creators can manage members" ON public.study_members;
CREATE POLICY "Members can view study members" ON public.study_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Study creators can manage members" ON public.study_members FOR ALL TO authenticated USING (study_id IN (SELECT id FROM studies WHERE created_by = auth.uid())) WITH CHECK (study_id IN (SELECT id FROM studies WHERE created_by = auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- validations
DROP POLICY IF EXISTS "Users can view own validations" ON public.validations;
CREATE POLICY "Users can view own validations" ON public.validations FOR ALL TO authenticated USING ((user_id = auth.uid()) OR (validator_id = auth.uid())) WITH CHECK ((user_id = auth.uid()) OR (validator_id = auth.uid()));
