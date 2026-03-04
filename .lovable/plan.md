

# Vascular Atlas — Implementation Plan

## Overview
A world-class web platform for vascular medicine unifying clinical workflow, outcomes registry, education, research, and expert networking. Built with Lovable Cloud (Supabase), real AI via Lovable AI gateway, and Apple-level UX.

## Phase 1: Foundation & Layout

### App Shell & Design System
- Dark/light premium theme with clean typography, generous whitespace, and card-based layouts
- Responsive sidebar navigation with module icons (collapsible on mobile)
- Command Palette (⌘K) for power users: search patients, open AI assistant, create case, start simulation
- Top bar with institution switcher, notifications, language selector (EN/FR/DE)
- i18n infrastructure for English, French, German

### Authentication & Roles
- Email/password auth with Lovable Cloud
- Role-based access: Physician, Trainee, Expert Reviewer, Hospital Admin, Research Lead, Super Admin
- Roles stored in separate `user_roles` table with RLS security definer functions
- Institution workspaces with membership management

### Landing & Marketing Pages
- Apple-style landing page with hero, feature modules showcase, trust signals
- Pricing page (B2B institution plans + individual plans)
- Auth pages (login, signup, password reset)

## Phase 2: Core Modules

### Module A — AI Clinical Assistant
- Structured intake forms (symptoms, risk factors, ABI, Doppler, CTA/MRA, labs, meds)
- Real AI generates: SOAP note, differentials + red flags, care pathway suggestions (with citation placeholders), patient-friendly summary, follow-up plan
- "Evidence & Rationale" panel showing data used, suggestions, uncertainty, clinician confirmation required
- PDF export and "Copy to EHR" (plain text) buttons
- Full audit trail of every AI output (inputs, output, model version, user sign-off)

### Module B — Vascular Digital Twin + Timeline
- Patient longitudinal timeline: ABI trends, symptom evolution, imaging events, interventions, outcomes
- Interactive vascular map (arterial/venous SVG) with lesion markers
- Scenario simulation (labeled as hypothetical, non-medical-device)
- Care Plan layer with goals, tasks, reminders

### Module C — Global Outcomes Registry
- Registry categories: PAD, aortic, carotid, venous, thromboembolic, wound/limb preservation
- Standardized outcomes: amputations, restenosis, complications, mortality, PROMs
- Dashboards: individual physician (private), institution aggregate, anonymized network benchmarking
- Privacy-first: only aggregated data in benchmarking, no re-identification

### Module D — Certification + Logbook + CME
- 5 Competency Tracks: Vascular Ultrasound, PAD/Limb Preservation, Aorta, Venous, Thrombosis
- Each track: micro-lessons, quizzes, supervised logbook, OSCE checklists, final assessment
- Digital badges with verifiable metadata (completion date, modules, supervisor validation)

### Module E — Clinical Simulation Lab
- Interactive branching case player with timer (8-min OSCE mode + learning mode)
- Case authoring tool for experts (scenario, branches, rubrics, feedback)
- AI feedback constrained by rubrics (no hallucinated guidelines)
- Skill Heatmap: triage accuracy, safety adherence, documentation quality, communication

### Module F — Global Expert Network
- Case discussion boards by topic (PAD, aorta, venous, carotid, wounds, thrombosis)
- "Ask an Expert" workflow: de-identified case submission → expert routing → structured response
- Mentorship matching (specialty, language, location)
- Contribution-based reputation system

## Phase 3: Research & Compliance

### Research Hub
- Study builder: define eligibility, data points, team members
- Analytics on eligible de-identified datasets
- Export functionality with audit trail

### Compliance & Safety Center
- Audit log viewer (clinical changes, AI outputs, data exports)
- Consent management: patient de-identification workflow, opt-in for registry/research/federated learning
- AI Safety dashboard (model versioning, confidence indicators, human override tracking)

## Phase 4: Futuristic Beta Modules

### X1 — Federated Learning Beta
- Concept page with institution opt-in, governance settings, ethics approval placeholders
- UI for federated node status, training rounds, model version (architecture-ready, no actual ML)

### X2 — AI Safety Layer Beta
- Model versioning dashboard, drift detection placeholders, error reporting
- "Report issue" button on every AI output, audit trails

### X3 — Imaging Pipeline Beta
- Upload imaging summaries, structured measurement forms (aneurysm diameters, stenosis grading)
- Annotation tool mock with export
- DICOM architecture placeholder

### X4 — Wearables & Home Monitoring Beta
- Patient app concept: walking tests, symptom diary, wound photos, compression adherence
- Consent & data sharing settings

### X5 — Immersive Training (AR) Beta
- AR checklist mode concept UI
- Station-based ultrasound training mock

## Phase 5: Database & Security

### Database Schema (all tables with RLS)
- Core: `institutions`, `memberships`, `user_roles`
- Clinical: `patients` (de-identified), `cases`, `case_events`, `imaging_summaries`, `measurements`, `outcomes`, `proms`
- AI: `ai_outputs` (input_summary, output_text, model_version, user_signoff)
- Education: `courses`, `modules`, `quizzes`, `quiz_attempts`, `logbook_entries`, `validations`
- Simulation: `simulations`, `simulation_runs`, `rubrics`
- Network: `forum_posts`, `expert_requests`, `expert_responses`, `reputation_events`
- Research: `studies`, `study_members`, `exports`
- Compliance: `audit_logs`, `consents`

### Security
- RLS policies scoped by role AND institution
- Security definer functions for role checks
- Rate limiting placeholders
- Encrypted storage placeholders

## Pages (~30+ routes)
Landing, Pricing, Auth, Dashboard, Patient Workspace, AI Assistant, Digital Twin, Registry Dashboards, Education Hub, Simulation Lab, Expert Network, Research Hub, Compliance Center, Settings, all Beta module pages

## Key Design Principles
- Every AI output has "Clinician Confirmation Required" — never presented as definitive
- Citation fields use placeholders — no fabricated guidelines
- "Beta" modules clearly labeled as preview
- No regulatory approval claims — "compliance-ready" with audit infrastructure

