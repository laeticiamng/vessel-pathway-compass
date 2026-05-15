# AquaMR Flow

<!-- VERSION-STAMP -->
> **Version `v2.3.0`** — Last updated **2026-05-15**
> _v8.3 — Visual Chain · RSVP · OMS-compatible_
>
> [![release-checks](https://github.com/laeticiamng/vessel-pathway-compass/actions/workflows/release-checks.yml/badge.svg?branch=main)](https://github.com/laeticiamng/vessel-pathway-compass/actions/workflows/release-checks.yml) — `npm run check:release` verifies that `CHANGELOG.md`, `README.md` and [`src/lib/appVersion.ts`](./src/lib/appVersion.ts) agree on version + date before every publish.
<!-- /VERSION-STAMP -->

**Non-ionizing vascular workflow platform for interventional teams.**

AquaMR Flow is a clinical software cockpit for contrast-sparing and non-ionizing vascular procedures. It combines procedure planning, multimodal imaging fusion, CI-AKI risk prevention, clinical simulation, and a research registry into a single platform built for interventional cardiologists, interventional radiologists, vascular medicine physicians, clinical researchers, and trainees.

> **Status:** Research prototype — not a certified medical device.

---

## Core Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Clinical cockpit with workflow overview, CI-AKI risk distribution, and program metrics |
| **L1 Decision Board** | VASCU-LINK pre-revascularization decision support: AquaMR cartography, C4-i, PROMs, decision delta, sign-off and research export |
| **Procedure Planner** | Workflow recommendations and modality selection (IVUS-first, OCT-saline, non-contrast MRA) |
| **Fusion Viewer** | Multimodal imaging tabs (MRI / IVUS / OCT / Ultrasound) with DICOM-ready architecture |
| **AquaMR Digital Twin** | Patient-specific vascular modeling with segment-based vessel mapping |
| **CI-AKI Prevention Engine** | eGFR-based risk stratification with contrast-sparing strategy suggestions |
| **Procedure Simulation Lab** | Non-ionizing workflow scenarios (coronary, peripheral, renal, carotid) |
| **AquaMR Registry** | Track contrast volume, radiation avoided, AKI outcomes, and procedural success |
| **Research** | Study cohort creation, pseudo-anonymized exports, and collaboration tools |
| **AquaMR Academy** | Education on low-field MRI, non-contrast MRA, and IVUS-guided techniques |
| **Program Analytics** | Zero-contrast rates, contrast avoided, radiation avoided, and institutional dashboards |

---

## Scientific Positioning

VASCU-LINK is **not designed as a Doppler replacement**. Doppler remains the
first-line hemodynamic examination.

The platform explores whether selected angiographic functions can be
progressively reconstructed in a **4-zero chain**:

- no ionizing radiation,
- no injected iodinated or gadolinium contrast,
- no helium,
- radically reduced infrastructure and ecological footprint.

The translational sequence is:

1. **L1 — See & Decide**: pre-revascularization mapping and decision.
2. **L2 — Simulate & Guide**: phantom / simulation guidance.
3. **L3 — Preclinical Intervention**: non-human intervention feasibility.
4. **Post-PhD — Selected 4-Zero Revascularization**: long-term horizon only.

The platform does not perform or autonomously recommend human revascularization.
Conventional angiography remains mandatory for emergencies, complex high-risk
interventions, insufficient image quality, or when standard-of-care requires it.

---

## AquaMR vs AquaMR Flow vs VASCU-LINK

- **AquaMR** — 4-zero angiographic imaging device concept.
- **AquaMR Flow** — clinical cockpit and pre-revascularization
  decision platform.
- **VASCU-LINK** — full translational chain combining AquaMR, Doppler, C4-i,
  PROMs, registry, simulation and preclinical guidance roadmap.

---

## VASCU-LINK L1 flow

The **L1 Decision Board** (`/app/l1-decision-board`) is the central pre-revascularization
flow that wires together every brick relevant to the doctoral protocol:

```
patient → Doppler / ABI / TBI → AquaMR cartography → C4-i concordance →
  PROMs (WIQ / VascuQol-6 / 6-MWT) → decision before/after AquaMR →
  clinician sign-off → audit log → research export (CSV / JSON / PDF)
```

L1 makes the AOMI patient legible, classable and routable. It does **not** treat. The
decision categories produced are limited to:

- `medical_optimized`
- `surveillance`
- `standard_imaging`
- `endovascular_discussion`
- `surgical_discussion`

If AquaMR cartography is non-interpretable, the board automatically recommends a
fallback to standard-of-care imaging.

Backed by:

- `supabase/migrations/20260501073611_l1_decision_board.sql` (`l1_assessments`,
  `l1_segment_findings` + RLS aligned with `cases`)
- `src/lib/l1/decision.ts` — `computeDecisionDelta()`
- `src/lib/l1/schemas.ts` — Zod payload validation + direct-identifier guard
- `src/test/l1.test.ts` — Vitest coverage of decision logic, schemas and exports

---

## Tech Stack

- **Frontend:** React 18 · TypeScript · Vite
- **UI:** shadcn/ui · Tailwind CSS · Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Row-Level Security)
- **Data:** TanStack Query · React Hook Form · Zod
- **Visualization:** Recharts · Framer Motion
- **i18n:** English, French, German

---

## Project Status

AquaMR Flow is a **research and prototype platform**. It is designed to explore non-ionizing and contrast-sparing vascular workflow concepts.

### What this platform is:
- A clinical decision support and workflow planning tool
- A multimodal imaging fusion concept viewer
- A CI-AKI risk stratification and prevention support system
- A procedure simulation and training environment
- A research registry and analytics platform

### What this platform is NOT:
- A certified medical device (not CE-marked, not FDA-cleared)
- A replacement for standard catheterization laboratory workflows in emergency settings
- A validated STEMI intervention workflow
- An autonomous catheter navigation or robotic intervention system
- A diagnostic imaging interpretation system

All clinical decision support outputs require review and confirmation by a qualified clinician.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (for backend services)

### Installation

```bash
git clone https://github.com/laeticiamng/vessel-pathway-compass.git
cd vessel-pathway-compass
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:8080`.

### Build

```bash
npm run build
```

---

## Supabase

The platform uses Supabase for:
- **Authentication:** Email/password and Google OAuth
- **Database:** PostgreSQL with Row-Level Security (RLS)
- **Storage:** For future DICOM and document storage

Database migrations are in `supabase/migrations/`. Apply them with the Supabase CLI.

---

## Architecture Overview

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui primitives
│   ├── layout/       # App shell, sidebar, top bar
│   ├── digital-twin/ # Vascular map visualization
│   ├── simulation/   # Simulation runner
│   ├── education/    # Course and module components
│   └── ...
├── pages/            # Route-level page components
│   ├── app/          # Authenticated app pages
│   └── ...           # Public pages (landing, auth, legal)
├── hooks/            # Custom React hooks
├── i18n/             # Internationalization (en, fr, de)
├── integrations/     # Supabase client and types
└── lib/              # Utilities
```

---

## Recent Additions (v2.2 — Methodological framing & non-overpromise guardrails)

- **Methodological framing — concordance vs superiority** — `NonInferioritySection` (Landing + Protocol `compact`) makes explicit that L1 is a **diagnostic concordance study with a pragmatic non-inferiority rationale**, not a superiority claim against hospital MRI / CTA / catheter angiography (EN/FR/DE).
- **Above-hero framing line** — `AboveHeroFramingLine` displays the research-prototype / non-superiority message above the home hero in EN/FR/DE so the framing is understood within the first seconds.
- **Protocol non-superiority FAQ** — `ProtocolNonSuperiorityFAQ` (4 Q&A) on `/protocol` covering concordance vs superiority, Doppler-first rule and safety fallback (EN/FR/DE).
- **Non-overpromise content check** — `scripts/check-non-overpromise.mjs` flags marketing-like superiority/replacement phrases (e.g. *"better than MRI"*, *"replace angiography"*) on Landing, Protocol, landing components and i18n bundles. Run via `npm run check:overpromise` (also chained in `npm run check:prepublish`).
- **Home intro video** — 30s Remotion-rendered teaser (`public/vascu-link-intro.mp4`) integrated via `HomeIntroVideoSection` (EN/FR/DE).
- **AI Audit Card** — versioned, source-linked evidence panel with validated/pending filter, one-click PDF export, clinician confirmation workflow + per-row history (role-gated to clinician/reviewer, audit-logged).
- **PROBAST Badge** — methodological risk-of-bias indicator on the Digital Twin, fully localized EN/FR/DE with visual regression coverage.
- **T12 public pages** — Protocol, Methodology, SAP, DMP, Incidental Findings, Audit Limitations, Trajectory, Why VASCU-LINK, About AquaMR with validated `ResearchProject` JSON-LD and route-matched SEO.
- **Pricing removed** — institutional/research access only (`VITE_PUBLIC_PRICING_ENABLED=false`); regulatory disclaimer mounted globally.
- **E2E coverage** — Playwright specs for T12 pages, footer i18n navigation, ProBAST visual regression, AI Audit PDF generation.

---

## Roadmap

- [ ] DICOM viewer integration (cornerstone.js)
- [ ] Real multimodal fusion overlay engine
- [ ] 3D vascular modeling (Digital Twin v2)
- [ ] CI-AKI outcome tracking with real clinical validation
- [ ] FHIR R4 export pipeline
- [ ] Federated learning for privacy-preserving AI
- [ ] Mobile companion app for patient-reported outcomes

---

## Compliance Roadmap

AquaMR Flow is being designed with future regulatory pathways in mind:

| Standard | Relevance | Status |
|----------|-----------|--------|
| **IEC 62304** | Software lifecycle for medical device software | Architecture aligned |
| **EU MDR 2017/745** | Medical device regulation (Class IIa SaMD) | Pre-assessment phase |
| **ISO 14971** | Risk management for medical devices | Framework planned |
| **ISO 13485** | Quality management for medical devices | Not yet implemented |
| **GDPR** | Data protection | Designed for compliance |
| **HIPAA** | US health data protection | Architecture supports |

> This platform is currently a research prototype and has not been submitted for regulatory approval.

---

## Contributing

We welcome contributions from clinicians, engineers, and researchers.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please ensure all contributions maintain the clinical credibility and scientific accuracy of the platform.

---

## Disclaimer

**AquaMR Flow is a research and prototype platform. It is NOT a certified medical device.**

- All clinical decision support outputs are for informational purposes only
- Outputs require review and confirmation by qualified healthcare professionals
- This platform does not provide autonomous procedural guidance
- Not validated for use in emergency or life-threatening clinical scenarios
- Not a substitute for standard-of-care clinical judgment

Use of this platform in clinical settings is at the sole responsibility of the supervising clinician and institution.

---

## License

Proprietary — EMOTIONSCARE SASU. All rights reserved.

---

*Built by [EMOTIONSCARE](https://emotionscare.com) — Amiens, France*
