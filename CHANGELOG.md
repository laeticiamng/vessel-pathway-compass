# Changelog

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
