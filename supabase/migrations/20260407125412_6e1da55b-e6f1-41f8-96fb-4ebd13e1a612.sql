
-- =============================================
-- 1. Create eco_metrics table
-- =============================================
CREATE TABLE public.eco_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  created_by uuid NOT NULL,
  contrast_agent_type text NOT NULL DEFAULT 'gbca',
  contrast_volume_ml numeric NOT NULL DEFAULT 0,
  gadolinium_avoided_mg numeric NOT NULL DEFAULT 0,
  water_contamination_prevented_l numeric NOT NULL DEFAULT 0,
  eco_impact_score numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.eco_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own eco metrics"
  ON public.eco_metrics FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE TRIGGER update_eco_metrics_updated_at
  BEFORE UPDATE ON public.eco_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. Activate notification triggers
-- =============================================
CREATE TRIGGER trg_notify_expert_response
  AFTER INSERT ON public.expert_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_expert_response();

CREATE TRIGGER trg_notify_case_event
  AFTER INSERT ON public.case_events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_case_event();

CREATE TRIGGER trg_notify_forum_reply
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_forum_reply();
