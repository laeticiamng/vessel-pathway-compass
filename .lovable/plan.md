

# Wire Compliance Center to Real Database Data

## What Changes

Replace all hardcoded mock data in `Compliance.tsx` with live queries to `audit_logs`, `ai_outputs`, and `consents` tables.

## Implementation

### 1. Compliance.tsx — Full Rewrite of Data Layer

- Import `supabase` client and `useQuery` from TanStack
- **Audit Log tab**: Fetch from `audit_logs` table ordered by `created_at desc`, limit 50. Display `action`, `entity_type` as badge, `details` JSONB for status, and formatted timestamp.
- **Stats cards**: 
  - Audit Events count → `audit_logs` count
  - AI Outputs Logged → `ai_outputs` count
  - Pending Sign-offs → `ai_outputs` count where `user_signoff = false`
  - Consent Records → `consents` count
- **Consent tab**: Fetch from `consents` table joined through patient ownership. Group by `consent_type`, show granted/revoked status.
- **AI Safety tab**: 
  - Fetch latest `model_version` from `ai_outputs`
  - Calculate sign-off rate: `count(user_signoff=true) / count(*)` from `ai_outputs`
  - Count issues: `ai_outputs` where `user_signoff = false`

### 2. Empty States

When no data exists yet, show a friendly "No audit logs recorded yet" message with an icon, rather than an empty table.

### 3. Pagination

Add simple "Load More" button for audit logs (fetch in pages of 50).

### 4. i18n

The page currently uses hardcoded English strings. Will use `useTranslation()` hook with existing translation keys from `compliance.*` namespace.

## Files Modified

- `src/pages/app/Compliance.tsx` — replace mock data with Supabase queries, add loading/empty states, integrate i18n

## No Schema Changes Needed

All required tables (`audit_logs`, `ai_outputs`, `consents`) and RLS policies already exist.

