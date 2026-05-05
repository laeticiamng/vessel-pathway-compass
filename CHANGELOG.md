# Changelog

## v2.2.0 — Methodological framing & non-overpromise guardrails (2026-05-05)

Reinforces academic clarity for the CHUV submission: VASCU-LINK / AquaMR Flow
is positioned as a **diagnostic concordance study with a pragmatic
non-inferiority rationale**, not as a superiority claim against hospital
MRI / CTA / catheter angiography.

### Methodology framing
- Reaffirms **diagnostic concordance with a pragmatic non-inferiority rationale** — no superiority claim against hospital MRI / CTA / catheter angiography.
- **Doppler-first** rule kept explicit: Duplex ultrasound remains the first-line hemodynamic examination.
- **Safety fallback** mandatory: if AquaMR cartography is non-interpretable, the L1 board recommends standard-of-care imaging.
- L1 scope is restricted to *See & Decide* (pre-revascularization mapping); no autonomous human revascularization.

### Added
- **NonInferioritySection** (`src/components/landing/NonInferioritySection.tsx`) — trilingual EN/FR/DE academic block on Landing and Protocol (`compact`) with three pillars (not superior imaging, sufficient mapping, safety fallback) and explicit "do NOT use" rules.
- **AboveHeroFramingLine** (`src/components/landing/AboveHeroFramingLine.tsx`) — short banner above the hero on `/` stating "Research prototype — diagnostic concordance study with pragmatic non-inferiority rationale" in EN/FR/DE.
- **ProtocolNonSuperiorityFAQ** (`src/components/landing/ProtocolNonSuperiorityFAQ.tsx`) — 4-question FAQ on `/protocol` (concordance vs superiority, why not a superiority trial, Doppler-first rule, safety fallback).
- **Home intro video** — 30s Remotion-rendered teaser (`public/vascu-link-intro.mp4`) with `HomeIntroVideoSection` (EN/FR/DE).
- **Non-overpromise content check** (`scripts/check-non-overpromise.mjs`) — scans Landing, Protocol, landing components and i18n bundles for marketing-like superiority/replacement phrases (EN/FR/DE), with negation- and question-aware filtering. Wired as `npm run check:overpromise` and `npm run check:prepublish`.
- **AI Audit Card** — versioned, source-linked evidence panel; per-row clinician confirmation with history; one-click PDF export with EN/FR/DE evidence labels, versions, timestamps and source URLs; Vitest coverage in `src/test/ai-audit-pdf.test.ts`.
- **PROBAST Badge** on Digital Twin (EN/FR/DE) with Playwright visual regression.
- **T12 public pages** — Protocol, Methodology, SAP, DMP, Incidental Findings, Audit Limitations, Trajectory, Why VASCU-LINK, About AquaMR with validated `ResearchProject` JSON-LD.
- Playwright e2e specs: T12 pages, footer i18n navigation, ProBAST visual regression, AI Audit PDF.

### Changed
- Public pricing removed — institutional/research access only (`VITE_PUBLIC_PRICING_ENABLED=false`); regulatory disclaimer mounted globally.
- Evidence confirmation restricted to `clinician`/`reviewer` roles with explicit unauthorized UI error.
- AI Audit Card surfaces per-evidence confirmation history and related audit-log entries over time.

### Guardrails
- `npm run check:overpromise` — flags marketing-like superiority/replacement phrases on Landing, Protocol, landing components and i18n bundles (EN/FR/DE).
- `npm run check:release` — verifies CHANGELOG.md, README.md and `src/lib/appVersion.ts` agree on version + date and that the latest entry follows `RELEASE_TEMPLATE.md`.
- `npm run check:prepublish` chains overpromise + i18n + version-consistency checks.
- Role-gated evidence confirmation (clinician/reviewer) with audit-log coverage.
- PROBAST badge + Playwright visual regression on the Digital Twin.

### Security
- Restricted `EXECUTE` on the SECURITY DEFINER trigger function and ensured it can not be invoked by unauthenticated users (Supabase linter warnings cleared).

## v2.0.0 — AquaMR Flow Rebrand (2026-03-20)

Complete platform rebrand from "Vascular Atlas" to **AquaMR Flow** — a non-ionizing, contrast-sparing vascular workflow platform.

### Added
- **Procedure Planner** — workflow recommendations and modality selection (IVUS-first, OCT-saline, non-contrast MRA)
- **Fusion Viewer** — multimodal imaging tabs (MRI / IVUS / OCT / Ultrasound) with DICOM-ready architecture
- **CI-AKI Prevention Engine** — eGFR-based risk stratification with contrast-sparing strategy suggestions
- Premium dark-first medtech design system (navy/graphite/muted cyan palette)
- "Research Prototype" badges on all clinical modules
- Decision support disclaimers throughout
- Legacy route redirects for backwards compatibility
- CHANGELOG.md

### Changed
- **AI Assistant** → Procedure Planner (route: `/app/procedure-planner`)
- **Risk Calculator** → CI-AKI Prevention Engine (route: `/app/ci-aki-engine`)
- **Imaging beta** → Fusion Viewer (promoted to main nav, route: `/app/fusion-viewer`)
- **Digital Twin** → AquaMR Digital Twin
- **Education** → AquaMR Academy
- **Registry** → AquaMR Registry
- **Simulation Lab** → Procedure Simulation Lab
- **Analytics** → Program Analytics
- Navigation restructured: flat clinical workflow + collapsible platform section
- All branding, SEO, i18n (en/fr/de) updated for AquaMR Flow
- Color palette shifted from blue to muted cyan/navy for medical device aesthetic
- README.md completely rewritten with clinical scope, compliance roadmap, and disclaimer

### Removed
- Innovation Lab / Beta section (features promoted to main nav)
- Expert Network standalone page (folded into Research)
- Patient Outcomes standalone page (folded into Registry)
- Clinical Performance standalone page (folded into Analytics)
- Compliance standalone page (folded into Settings)
- Team standalone page (folded into Settings)
- Beta pages: Federated Learning, AI Safety, Wearables, AR Training
- Generic Lovable README
- SCORE2, Wells DVT, ABI calculators (replaced by CI-AKI Engine)
