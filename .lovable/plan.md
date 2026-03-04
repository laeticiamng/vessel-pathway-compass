

## Plan: Refactor Patients Page into Smaller Components

Split the 360-line `Patients.tsx` monolith into 4 focused files under `src/components/patient/`.

### New Files

**1. `src/components/patient/PatientFilters.tsx`**
- Receives `search`, `filterCategory`, `filterStatus` + their setters as props
- Renders the search input, category select, status select, and clear button
- Uses shared constants `CATEGORIES`, `STATUSES` exported from a constants file or kept inline

**2. `src/components/patient/PatientsTable.tsx`**
- Receives `patients` (filtered list), `isLoading`, `onRowClick`, `onNewCase` as props
- Renders the Card with table: header, skeleton rows, data rows, empty state
- Contains `riskFromFactors` and `riskColor` as local helpers

**3. `src/components/patient/NewCaseDialog.tsx`**
- Receives `open`, `onOpenChange`, `onCreated` as props
- Owns all form state internally (`pseudonym`, `ageRange`, `sex`, `category`, `caseTitle`)
- Owns the `useMutation` for creating patient + case
- Calls `onCreated()` on success to trigger parent query invalidation

**4. `src/pages/app/Patients.tsx` (slimmed down)**
- Orchestrator: manages filter state, the `useQuery` for fetching patients, client-side search filtering
- Renders `<PatientFilters>`, `<PatientsTable>`, `<NewCaseDialog>`
- ~60 lines instead of 360

### Constants
`CATEGORIES`, `STATUSES`, `AGE_RANGES` stay in `Patients.tsx` and are passed as props or imported from a shared location. Simplest: keep them in each component that needs them (`NewCaseDialog` needs `CATEGORIES`/`AGE_RANGES`, `PatientFilters` needs `CATEGORIES`/`STATUSES`).

### No behavioral changes
Pure refactor -- identical UI, same queries, same mutations. No new dependencies.

