

## Full i18n Integration Plan

### Problem
Several pages still use hardcoded English strings instead of the `t()` translation function. The i18n dictionaries (en/fr/de) are also missing keys for the PatientDetail page. Pages with hardcoded strings:

1. **Research.tsx** -- no `useTranslation`, all English hardcoded
2. **Education.tsx** -- no `useTranslation`, all English hardcoded
3. **Simulation.tsx** -- no `useTranslation`, all English hardcoded
4. **DigitalTwin.tsx** -- no `useTranslation`, all English hardcoded
5. **FederatedLearning.tsx** -- no `useTranslation`, all English hardcoded
6. **ARTraining.tsx** -- no `useTranslation`, all English hardcoded
7. **PatientDetail.tsx** -- uses `useTranslation` but has ~50 hardcoded strings (labels, dialogs, placeholders, empty states)

Pages already fully translated: Landing, Pricing, Auth, Dashboard, AIAssistant, Patients, Registry, Network, Compliance, Settings, Team, AISafety, Imaging, Wearables.

### Plan

#### Task 1: Add missing i18n keys to all three dictionaries

Add keys to `en.ts`, `fr.ts`, and `de.ts` for:

- **patientDetail**: header labels (Cases, Timeline Events, Measurements), tab names (Timeline, Measurements, Cases), dialog titles/descriptions/labels/placeholders for Edit Patient, Add Event, Add Measurement, empty states, event type options, measurement type options
- **research**: expand with `members`, `eligible`, `pi`, `analytics`, study statuses
- **education**: expand with track names, module descriptions, badge details, track progress text
- **simulation**: expand with case titles, difficulty levels, heatmap labels, authoring tool text
- **digitalTwin**: expand with timeline event data labels, vascular map placeholder details, simulation engine text, care plan goal labels
- **federated**: expand with ethics approval text, opt-in descriptions (already partially done but component not wired)
- **arTraining**: expand with checklist step texts, station training placeholder (already partially done but component not wired)

#### Task 2: Wire 6 pages to use `useTranslation`

For each of **Research, Education, Simulation, DigitalTwin, FederatedLearning, ARTraining**:
- Import `useTranslation`
- Replace all hardcoded strings with `t("key")` calls

#### Task 3: Complete PatientDetail i18n

Replace ~50 remaining hardcoded strings in PatientDetail.tsx with `t()` calls using the new `patientDetail.*` keys.

### Scope
- 3 dictionary files updated (en.ts, fr.ts, de.ts)
- 7 page components updated
- No database or routing changes
- No new dependencies

