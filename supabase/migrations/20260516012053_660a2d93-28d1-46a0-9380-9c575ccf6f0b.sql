-- =============================================================
-- V9 — Research & Collaboration tables
-- NB: existing public.simulations (clinical scenarios) is untouched.
-- MRI simulations live in public.mri_simulations.
-- =============================================================

-- 1) MRI SIMULATIONS -----------------------------------------------
CREATE TABLE public.mri_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  field_strength_mt integer NOT NULL CHECK (field_strength_mt > 0 AND field_strength_mt <= 7000),
  sequence_type text NOT NULL CHECK (sequence_type IN ('FID','GRE','SE','TSE','bSSFP','FLASH','TOF','QISS')),
  parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  results jsonb,
  estimated_snr_gain numeric,
  name text
);

ALTER TABLE public.mri_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mri simulations"
  ON public.mri_simulations FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_mri_simulations_user ON public.mri_simulations(user_id, created_at DESC);

CREATE TRIGGER trg_mri_simulations_updated_at
  BEFORE UPDATE ON public.mri_simulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2) HARDWARE PROJECTS ---------------------------------------------
CREATE TABLE public.hardware_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  preset text NOT NULL DEFAULT 'custom' CHECK (preset IN ('osi2one','mri4all','custom')),
  modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_cost_eur jsonb NOT NULL DEFAULT '{"min":0,"max":0}'::jsonb,
  eco_score integer NOT NULL DEFAULT 0 CHECK (eco_score >= 0 AND eco_score <= 100),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','sourcing','ordered','assembling','completed','archived'))
);

ALTER TABLE public.hardware_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own hardware projects"
  ON public.hardware_projects FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_hardware_projects_user ON public.hardware_projects(user_id, created_at DESC);

CREATE TRIGGER trg_hardware_projects_updated_at
  BEFORE UPDATE ON public.hardware_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 3) PARTNERSHIPS --------------------------------------------------
CREATE TABLE public.partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  partner_name text NOT NULL,
  partner_institution text,
  partner_email text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','contacted','discussing','collaboration_active','paused','closed')),
  notes text,
  last_contact_date date,
  tags text[] NOT NULL DEFAULT '{}'::text[]
);

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own partnerships"
  ON public.partnerships FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_partnerships_user ON public.partnerships(user_id, status);

CREATE TRIGGER trg_partnerships_updated_at
  BEFORE UPDATE ON public.partnerships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 4) FUNDING APPLICATIONS ------------------------------------------
CREATE TABLE public.funding_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  funder text NOT NULL,
  programme text,
  amount_eur integer CHECK (amount_eur >= 0),
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','drafting','submitted','review','awarded','rejected','withdrawn')),
  deadline date,
  decision_date date,
  notes text
);

ALTER TABLE public.funding_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own funding applications"
  ON public.funding_applications FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_funding_applications_user ON public.funding_applications(user_id, status);

CREATE TRIGGER trg_funding_applications_updated_at
  BEFORE UPDATE ON public.funding_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 5) KNOWLEDGE RESOURCES (editorial library) -----------------------
CREATE TABLE public.knowledge_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  added_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  added_by uuid,
  type text NOT NULL CHECK (type IN ('paper','repo','tutorial','tool','dataset','checklist')),
  title text NOT NULL,
  authors text,
  pmid text,
  doi text,
  url text,
  abstract text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  is_published boolean NOT NULL DEFAULT true
);

ALTER TABLE public.knowledge_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read published resources"
  ON public.knowledge_resources FOR SELECT
  TO authenticated
  USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins manage knowledge resources"
  ON public.knowledge_resources FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX idx_knowledge_resources_type ON public.knowledge_resources(type, is_published);
CREATE INDEX idx_knowledge_resources_tags ON public.knowledge_resources USING GIN(tags);

CREATE TRIGGER trg_knowledge_resources_updated_at
  BEFORE UPDATE ON public.knowledge_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();