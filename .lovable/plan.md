

## Analysis

All five requested features already exist in the codebase:
1. **Patient Outcomes** — `src/pages/app/PatientOutcomes.tsx` (VascuQoL-6, CIVIQ-14, trend charts)
2. **Clinical Performance Dashboard** — `src/pages/app/ClinicalPerformance.tsx` (4 KPI cards vs EU benchmarks)
3. **Risk Calculator** — `src/pages/app/RiskCalculator.tsx` (SCORE2, Wells DVT, ABI tabs)
4. **Research Export** — `src/components/research/ResearchExportButton.tsx` (anonymized aggregate summary)
5. **FHIR Badge** — `src/components/patient/FHIRBadge.tsx` (on patient records)

The only gap: **the landing page does not showcase these features**. It currently shows 6 modules (AI, Digital Twin, Registry, Education, Simulation, Network). The 5 new features need to be added to the landing page modules grid.

## Plan

### 1. Add i18n keys for 5 new module cards (en.ts, fr.ts, de.ts)

Add entries under `landing.modules` for: `outcomes`, `performance`, `riskCalc`, `researchExport`, `fhir`.

Update subtitle from "Six integrated modules" to "Eleven integrated modules".

### 2. Update Landing.tsx module arrays

Add 5 new entries to `moduleIcons`, `moduleKeys`, and `modulePaths`:
- outcomes → `ClipboardList` → `/app/outcomes`
- performance → `Stethoscope` → `/app/performance`
- riskCalc → `Calculator` → `/app/risk-calculator`
- researchExport → `FileText` → `/app/research`
- fhir → `CheckCircle2` → `/app/patients` (FHIR is per-patient, link to patients list)

Import the additional icons from lucide-react.

### 3. No database or backend changes needed

All features are fully implemented. This is a landing page content update only.

