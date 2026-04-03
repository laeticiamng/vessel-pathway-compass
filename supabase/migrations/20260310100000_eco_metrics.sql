-- PhytoTech Integration: eco_metrics table for tracking environmental impact
CREATE TABLE IF NOT EXISTS eco_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  contrast_agent_type TEXT NOT NULL DEFAULT 'gbca' CHECK (contrast_agent_type IN ('gbca', 'bbca', 'none')),
  contrast_volume_ml NUMERIC NOT NULL DEFAULT 0,
  gadolinium_avoided_mg NUMERIC NOT NULL DEFAULT 0,
  radiation_avoided_mgy NUMERIC NOT NULL DEFAULT 0,
  water_contamination_prevented_l NUMERIC NOT NULL DEFAULT 0,
  eco_impact_score NUMERIC NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_eco_metrics_user FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE eco_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own eco_metrics" ON eco_metrics FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert own eco_metrics" ON eco_metrics FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own eco_metrics" ON eco_metrics FOR UPDATE USING (auth.uid() = created_by);
