
-- =====================================================
-- V9 collaboration + versioning + AI recon
-- =====================================================

-- 1) project_members ---------------------------------------------------------
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hardware_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  project_role TEXT NOT NULL DEFAULT 'viewer' CHECK (project_role IN ('owner','editor','viewer')),
  added_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);

-- Helper: is user member of a hardware project (any role)
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = _project_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.hardware_projects
    WHERE id = _project_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.project_role_of(_project_id uuid, _user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.hardware_projects WHERE id = _project_id AND user_id = _user_id)
      THEN 'owner'
    ELSE (SELECT project_role FROM public.project_members WHERE project_id = _project_id AND user_id = _user_id)
  END;
$$;

CREATE POLICY "Members and owners can view project members"
  ON public.project_members FOR SELECT
  USING (
    public.is_project_member(project_id, auth.uid())
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Project owners manage members"
  ON public.project_members FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.hardware_projects WHERE id = project_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Project owners update members"
  ON public.project_members FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.hardware_projects WHERE id = project_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Project owners remove members"
  ON public.project_members FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.hardware_projects WHERE id = project_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
    OR user_id = auth.uid()  -- self-leave
  );

-- 2) project_invitations -----------------------------------------------------
CREATE TABLE public.project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hardware_projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_role TEXT NOT NULL DEFAULT 'viewer' CHECK (invited_role IN ('editor','viewer')),
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','revoked')),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_project_invitations_project ON public.project_invitations(project_id);
CREATE INDEX idx_project_invitations_email ON public.project_invitations(lower(invited_email));

CREATE POLICY "Owners see project invitations"
  ON public.project_invitations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.hardware_projects WHERE id = project_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Owners create invitations"
  ON public.project_invitations FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.hardware_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Owners update invitations"
  ON public.project_invitations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.hardware_projects WHERE id = project_id AND user_id = auth.uid()));

CREATE POLICY "Owners delete invitations"
  ON public.project_invitations FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.hardware_projects WHERE id = project_id AND user_id = auth.uid()));

-- 3) project_messages --------------------------------------------------------
CREATE TABLE public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hardware_projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_project_messages_project ON public.project_messages(project_id, created_at DESC);

CREATE POLICY "Members read messages"
  ON public.project_messages FOR SELECT
  USING (
    public.is_project_member(project_id, auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Members and editors write messages"
  ON public.project_messages FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND public.project_role_of(project_id, auth.uid()) IN ('owner','editor')
  );

CREATE POLICY "Authors delete own messages"
  ON public.project_messages FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.hardware_projects WHERE id = project_id AND user_id = auth.uid())
  );

-- 4) sequence_designs (versioning Sequence Builder) -------------------------
CREATE TABLE public.sequence_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.hardware_projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  seq_text TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, version)
);
ALTER TABLE public.sequence_designs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_sequence_designs_user ON public.sequence_designs(user_id, name, version DESC);
CREATE INDEX idx_sequence_designs_project ON public.sequence_designs(project_id);

CREATE POLICY "Users read own sequences or via project membership"
  ON public.sequence_designs FOR SELECT
  USING (
    user_id = auth.uid()
    OR (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users insert own sequences"
  ON public.sequence_designs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own sequences"
  ON public.sequence_designs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users delete own sequences"
  ON public.sequence_designs FOR DELETE
  USING (user_id = auth.uid());

CREATE TRIGGER trg_sequence_designs_updated_at
  BEFORE UPDATE ON public.sequence_designs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) ai_recon_jobs -----------------------------------------------------------
CREATE TABLE public.ai_recon_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pipeline TEXT NOT NULL CHECK (pipeline IN ('compressed-sensing','unet-denoising','modl','diffusion')),
  input_path TEXT,
  input_type TEXT CHECK (input_type IN ('kspace','dicom','other')),
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','cancelled')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  results JSONB,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_recon_jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ai_recon_jobs_user ON public.ai_recon_jobs(user_id, created_at DESC);

CREATE POLICY "Users read own recon jobs"
  ON public.ai_recon_jobs FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own recon jobs"
  ON public.ai_recon_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own recon jobs"
  ON public.ai_recon_jobs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users delete own recon jobs"
  ON public.ai_recon_jobs FOR DELETE
  USING (user_id = auth.uid());

CREATE TRIGGER trg_ai_recon_jobs_updated_at
  BEFORE UPDATE ON public.ai_recon_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Storage policies on existing dicom-uploads bucket for recon inputs ------
-- Folder convention: recon-inputs/<auth.uid()>/<file>
CREATE POLICY "Users upload own recon inputs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'dicom-uploads'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND (storage.foldername(name))[1] = 'recon-inputs'
  );

CREATE POLICY "Users read own recon inputs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'dicom-uploads'
    AND (storage.foldername(name))[1] = 'recon-inputs'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users delete own recon inputs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'dicom-uploads'
    AND (storage.foldername(name))[1] = 'recon-inputs'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
