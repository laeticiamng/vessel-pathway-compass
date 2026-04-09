-- VascScreen Module: PAD Screening tables
-- Based on ESC 2024 Guidelines (Mazzolai et al.)

-- Table: vascscreen_patients (screening records)
CREATE TABLE IF NOT EXISTS public.vascscreen_patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  -- Demographics
  age INTEGER NOT NULL,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  -- ESC 2024 risk factors
  smoking_status TEXT CHECK (smoking_status IN ('never', 'former', 'current')),
  diabetes BOOLEAN DEFAULT false,
  hypertension BOOLEAN DEFAULT false,
  dyslipidemia BOOLEAN DEFAULT false,
  family_history_cvd BOOLEAN DEFAULT false,
  known_cvd BOOLEAN DEFAULT false,
  ckd BOOLEAN DEFAULT false,
  egfr DECIMAL,
  -- Symptoms
  claudication BOOLEAN DEFAULT false,
  rest_pain BOOLEAN DEFAULT false,
  non_healing_wounds BOOLEAN DEFAULT false,
  erectile_dysfunction BOOLEAN DEFAULT false,
  -- Screening result
  screening_eligible BOOLEAN,
  screening_recommendation TEXT,
  risk_score DECIMAL,
  -- ABI
  abi_right DECIMAL,
  abi_left DECIMAL,
  abi_interpretation TEXT CHECK (abi_interpretation IN (
    'normal',
    'borderline',
    'mild_pad',
    'moderate_pad',
    'severe_pad',
    'non_compressible'
  )),
  -- Referral
  referred_to_angiologist BOOLEAN DEFAULT false,
  referral_date TIMESTAMPTZ,
  referral_report_url TEXT,
  -- Follow-up
  pad_confirmed BOOLEAN,
  pad_fontaine_stage TEXT,
  time_to_diagnosis_days INTEGER,
  -- Research
  study_consent BOOLEAN DEFAULT false,
  study_cohort_id UUID,
  pseudonym TEXT
);

-- Table: vascscreen_practice_stats
CREATE TABLE IF NOT EXISTS public.vascscreen_practice_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_id UUID NOT NULL,
  practice_name TEXT,
  practice_canton TEXT,
  period_start DATE,
  period_end DATE,
  total_patients_seen INTEGER,
  eligible_patients INTEGER,
  patients_screened INTEGER,
  abi_performed INTEGER,
  pad_detected INTEGER,
  patients_referred INTEGER,
  screening_rate DECIMAL,
  detection_rate DECIMAL,
  mean_time_to_referral_days DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: vascscreen_study_cohorts
CREATE TABLE IF NOT EXISTS public.vascscreen_study_cohorts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  study_protocol TEXT,
  start_date DATE,
  end_date DATE,
  principal_investigator TEXT,
  ethics_approval_number TEXT,
  status TEXT CHECK (status IN ('draft', 'recruiting', 'active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Foreign key from patients to cohorts
ALTER TABLE public.vascscreen_patients
  ADD CONSTRAINT fk_vascscreen_patients_cohort
  FOREIGN KEY (study_cohort_id) REFERENCES public.vascscreen_study_cohorts(id);

-- RLS
ALTER TABLE public.vascscreen_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vascscreen_practice_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vascscreen_study_cohorts ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can manage their own records
CREATE POLICY "Users can manage own vascscreen patients"
  ON public.vascscreen_patients AS PERMISSIVE FOR ALL TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view own practice stats"
  ON public.vascscreen_practice_stats AS PERMISSIVE FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage own study cohorts"
  ON public.vascscreen_study_cohorts AS PERMISSIVE FOR ALL TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
