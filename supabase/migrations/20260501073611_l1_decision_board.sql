-- VASCU-LINK L1 Pre-Revascularization Decision Board
-- Captures the full pre-revascularization decision flow:
--   patient context → hemodynamics → AquaMR cartography → C4-i → PROMs
--   → decision before/after AquaMR → clinician sign-off → audit & export.
-- Design notes:
--   * Research prototype; never used to perform autonomous revascularization.
--   * RLS aligns with cases/patients: own + same institution.
--   * algorithm_version is captured for reproducibility (computeDecisionDelta versions).

create table if not exists public.l1_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,

  clinical_context jsonb not null default '{}'::jsonb,
  hemodynamics jsonb not null default '{}'::jsonb,
  aquamr_findings jsonb not null default '{}'::jsonb,
  c4i_assessment jsonb not null default '{}'::jsonb,
  proms_summary jsonb not null default '{}'::jsonb,

  decision_before_aquamr text,
  decision_after_aquamr text,
  decision_delta text,
  recommended_strategy text,
  failure_reason text,

  image_quality text not null default 'unknown',
  is_interpretable boolean,
  requires_standard_imaging boolean not null default false,

  clinician_summary text,
  algorithm_version text not null default 'l1-decision-board/v1',

  signed_by uuid,
  signed_at timestamptz,
  signoff_status text not null default 'draft',

  created_by uuid not null,
  institution_id uuid references public.institutions(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint l1_assessments_image_quality_chk
    check (image_quality in ('unknown', 'interpretable', 'limited', 'non_interpretable')),
  constraint l1_assessments_signoff_status_chk
    check (signoff_status in ('draft', 'pending_signoff', 'signed', 'cosigned', 'rejected')),
  constraint l1_assessments_decision_before_chk
    check (
      decision_before_aquamr is null or decision_before_aquamr in (
        'medical_optimized',
        'surveillance',
        'standard_imaging',
        'endovascular_discussion',
        'surgical_discussion'
      )
    ),
  constraint l1_assessments_decision_after_chk
    check (
      decision_after_aquamr is null or decision_after_aquamr in (
        'medical_optimized',
        'surveillance',
        'standard_imaging',
        'endovascular_discussion',
        'surgical_discussion'
      )
    ),
  constraint l1_assessments_delta_chk
    check (
      decision_delta is null or decision_delta in (
        'unchanged',
        'escalation',
        'de_escalation',
        'reclassification',
        'insufficient_image_quality'
      )
    )
);

create index if not exists l1_assessments_case_idx on public.l1_assessments(case_id);
create index if not exists l1_assessments_patient_idx on public.l1_assessments(patient_id);
create index if not exists l1_assessments_created_by_idx on public.l1_assessments(created_by);
create index if not exists l1_assessments_signoff_idx on public.l1_assessments(signoff_status);

alter table public.l1_assessments enable row level security;

drop policy if exists "Users manage own L1 assessments" on public.l1_assessments;
create policy "Users manage own L1 assessments"
  on public.l1_assessments
  for all
  to authenticated
  using (
    created_by = auth.uid()
    or institution_id in (select public.user_institution_ids(auth.uid()))
  )
  with check (
    created_by = auth.uid()
    or institution_id in (select public.user_institution_ids(auth.uid()))
  );

create or replace function public.touch_l1_assessment_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_l1_assessments_updated_at on public.l1_assessments;
create trigger trg_l1_assessments_updated_at
  before update on public.l1_assessments
  for each row
  execute function public.touch_l1_assessment_updated_at();

-- Per-segment angiographic findings tied to an L1 assessment.
create table if not exists public.l1_segment_findings (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.l1_assessments(id) on delete cascade,
  segment_id text not null,
  segment_label text,
  stenosis_percent numeric,
  occlusion boolean not null default false,
  lesion_length_mm numeric,
  runoff_score numeric,
  confidence_score numeric,
  notes text,
  created_at timestamptz not null default now(),

  constraint l1_segment_findings_stenosis_range
    check (stenosis_percent is null or (stenosis_percent >= 0 and stenosis_percent <= 100)),
  constraint l1_segment_findings_confidence_range
    check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1))
);

create index if not exists l1_segment_findings_assessment_idx
  on public.l1_segment_findings(assessment_id);

alter table public.l1_segment_findings enable row level security;

drop policy if exists "Users manage L1 segment findings via assessment" on public.l1_segment_findings;
create policy "Users manage L1 segment findings via assessment"
  on public.l1_segment_findings
  for all
  to authenticated
  using (
    assessment_id in (
      select id from public.l1_assessments
      where created_by = auth.uid()
        or institution_id in (select public.user_institution_ids(auth.uid()))
    )
  )
  with check (
    assessment_id in (
      select id from public.l1_assessments
      where created_by = auth.uid()
        or institution_id in (select public.user_institution_ids(auth.uid()))
    )
  );
