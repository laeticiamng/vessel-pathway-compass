

# Wire Patients Page to Real Database Data

## Overview

Replace mock data in `Patients.tsx` with live queries to `patients` and `cases` tables. Add a "New Case" dialog to create patient + case records. Include search, loading/empty states, and i18n.

## Database Tables Used

- **`patients`**: `id`, `pseudonym`, `age_range`, `sex`, `risk_factors` (jsonb), `created_by`, `institution_id`
- **`cases`**: `id`, `patient_id`, `category`, `status`, `title`, `summary`, `created_by`, `institution_id`, `created_at`, `updated_at`
- **`measurements`**: For ABI values — `case_id`, `measurement_type`, `value`, `site`

No schema changes needed — all tables and RLS policies exist.

## Implementation — `src/pages/app/Patients.tsx`

### Data Fetching
- Use `useQuery` to fetch patients with their latest case info:
  1. Query `patients` ordered by `updated_at desc`
  2. For each patient, fetch related `cases` (category, status, updated_at)
  3. Derive "risk" from `risk_factors` jsonb field
- Paginate with limit 50 + "Load More"
- Client-side search filtering on pseudonym and category

### New Case Dialog
- Dialog form with fields: Pseudonym, Age Range (select), Sex (select), Category (select: PAD/Aortic/Venous/Carotid/DVT-PE), Case Title
- On submit: insert into `patients` table, then insert into `cases` table with the new `patient_id`
- Use `useMutation` with query invalidation

### UI States
- Loading: skeleton rows
- Empty: friendly message with icon
- Error: toast notification

### i18n
- Use existing `patients.*` translation keys
- Add missing keys for the new case form (pseudonym, ageRange, sex, caseTitle, create, cancel) to all 3 language files

## Files to Modify

1. **`src/pages/app/Patients.tsx`** — Full rewrite: remove mock data, add Supabase queries, dialog form, search, loading/empty states, i18n
2. **`src/i18n/en.ts`** — Add ~10 new keys under `patients.*` for form labels
3. **`src/i18n/fr.ts`** — French translations for new keys
4. **`src/i18n/de.ts`** — German translations for new keys

