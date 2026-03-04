
-- ============================================
-- CORE: Institutions & Memberships & Roles
-- ============================================

CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  country text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, institution_id)
);
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.app_role AS ENUM ('admin', 'physician', 'trainee', 'expert_reviewer', 'hospital_admin', 'research_lead', 'super_admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.user_institution_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id FROM public.memberships WHERE user_id = _user_id
$$;

-- ============================================
-- CLINICAL
-- ============================================

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  pseudonym text NOT NULL,
  age_range text,
  sex text,
  risk_factors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  institution_id uuid REFERENCES public.institutions(id),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'pad',
  status text NOT NULL DEFAULT 'active',
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.case_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_date timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text,
  data jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.imaging_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  modality text NOT NULL,
  findings text,
  measurements jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.imaging_summaries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  measurement_type text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  site text,
  measured_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES public.institutions(id),
  outcome_type text NOT NULL,
  outcome_date timestamptz NOT NULL DEFAULT now(),
  details jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.proms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  questionnaire_type text NOT NULL,
  score numeric,
  responses jsonb,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.proms ENABLE ROW LEVEL SECURITY;

-- ============================================
-- EDUCATION
-- ============================================

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  track text NOT NULL,
  difficulty text NOT NULL DEFAULT 'beginner',
  duration_hours numeric,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  sort_order int NOT NULL DEFAULT 0,
  module_type text NOT NULL DEFAULT 'lesson',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  passing_score numeric NOT NULL DEFAULT 70,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  score numeric NOT NULL,
  answers jsonb,
  passed boolean NOT NULL DEFAULT false,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.logbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track text NOT NULL,
  procedure_type text NOT NULL,
  description text,
  supervisor_id uuid,
  supervisor_validated boolean NOT NULL DEFAULT false,
  validated_at timestamptz,
  performed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.logbook_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track text NOT NULL,
  validation_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  validator_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.validations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SIMULATION
-- ============================================

CREATE TABLE public.simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'pad',
  difficulty text NOT NULL DEFAULT 'intermediate',
  time_limit_seconds int,
  scenario jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.simulation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  score numeric,
  duration_seconds int,
  decisions jsonb,
  feedback jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  criteria text NOT NULL,
  max_score numeric NOT NULL DEFAULT 10,
  weight numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NETWORK
-- ============================================

CREATE TABLE public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.expert_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  topic text NOT NULL,
  title text NOT NULL,
  case_summary text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expert_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.expert_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.expert_requests(id) ON DELETE CASCADE,
  expert_id uuid NOT NULL,
  response_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expert_responses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reputation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  points int NOT NULL DEFAULT 0,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RESEARCH
-- ============================================

CREATE TABLE public.studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  eligibility_criteria jsonb,
  data_points jsonb,
  created_by uuid NOT NULL,
  institution_id uuid REFERENCES public.institutions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.study_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES public.studies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(study_id, user_id)
);
ALTER TABLE public.study_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid REFERENCES public.studies(id),
  user_id uuid NOT NULL,
  export_type text NOT NULL,
  row_count int,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMPLIANCE: Consents
-- ============================================

CREATE TABLE public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  granted boolean NOT NULL DEFAULT false,
  granted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_simulations_updated_at BEFORE UPDATE ON public.simulations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expert_requests_updated_at BEFORE UPDATE ON public.expert_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_studies_updated_at BEFORE UPDATE ON public.studies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_validations_updated_at BEFORE UPDATE ON public.validations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

CREATE POLICY "Members can view their institutions" ON public.institutions FOR SELECT TO authenticated USING (id IN (SELECT public.user_institution_ids(auth.uid())));
CREATE POLICY "Admins can manage institutions" ON public.institutions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own memberships" ON public.memberships FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage memberships" ON public.memberships FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can manage own patients" ON public.patients FOR ALL TO authenticated USING (created_by = auth.uid() OR institution_id IN (SELECT public.user_institution_ids(auth.uid())));
CREATE POLICY "Users can manage own cases" ON public.cases FOR ALL TO authenticated USING (created_by = auth.uid() OR institution_id IN (SELECT public.user_institution_ids(auth.uid())));
CREATE POLICY "Users can manage case events" ON public.case_events FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can manage imaging summaries" ON public.imaging_summaries FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can manage measurements" ON public.measurements FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can manage outcomes" ON public.outcomes FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Authenticated can manage proms" ON public.proms FOR ALL TO authenticated USING (true);

CREATE POLICY "View published courses" ON public.courses FOR SELECT TO authenticated USING (is_published = true OR created_by = auth.uid());
CREATE POLICY "Authors can manage courses" ON public.courses FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Authenticated can view modules" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view quizzes" ON public.quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own quiz attempts" ON public.quiz_attempts FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own logbook entries" ON public.logbook_entries FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own validations" ON public.validations FOR ALL TO authenticated USING (user_id = auth.uid() OR validator_id = auth.uid());

CREATE POLICY "View published simulations" ON public.simulations FOR SELECT TO authenticated USING (is_published = true OR created_by = auth.uid());
CREATE POLICY "Authors can manage simulations" ON public.simulations FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users manage own simulation runs" ON public.simulation_runs FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated can view rubrics" ON public.rubrics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can view forum posts" ON public.forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own forum posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own forum posts" ON public.forum_posts FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Authenticated can view expert requests" ON public.expert_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create expert requests" ON public.expert_requests FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Users can update own expert requests" ON public.expert_requests FOR UPDATE TO authenticated USING (requester_id = auth.uid());

CREATE POLICY "Authenticated can view expert responses" ON public.expert_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Experts can insert responses" ON public.expert_responses FOR INSERT TO authenticated WITH CHECK (expert_id = auth.uid());

CREATE POLICY "Authenticated can view reputation" ON public.reputation_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Members can view studies" ON public.studies FOR SELECT TO authenticated USING (created_by = auth.uid() OR id IN (SELECT study_id FROM public.study_members WHERE user_id = auth.uid()));
CREATE POLICY "Creators can manage studies" ON public.studies FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Members can view study members" ON public.study_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Study creators can manage members" ON public.study_members FOR ALL TO authenticated USING (study_id IN (SELECT id FROM public.studies WHERE created_by = auth.uid()));

CREATE POLICY "Users can manage own exports" ON public.exports FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated can manage consents" ON public.consents FOR ALL TO authenticated USING (true);
