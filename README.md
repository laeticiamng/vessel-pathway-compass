# AquaMR Flow

**Non-ionizing vascular workflow platform for interventional teams.**

AquaMR Flow is a clinical software cockpit for contrast-sparing and non-ionizing vascular procedures. It combines procedure planning, multimodal imaging fusion, CI-AKI risk prevention, clinical simulation, and a research registry into a single platform built for interventional cardiologists, interventional radiologists, vascular medicine physicians, clinical researchers, and trainees.

> **Status:** Research prototype — not a certified medical device.

---

## Core Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Clinical cockpit with workflow overview, CI-AKI risk distribution, and program metrics |
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
