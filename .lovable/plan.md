

## Add Server-Side Category & Status Filters to Patients Page

### Current State
The Patients page has a search input and a non-functional "Filter" button. Filtering is client-side only (text search on pseudonym/category/status). The query fetches all patients then joins cases client-side.

### Plan

**1. Add filter state and wire to query**
- Add `filterCategory` and `filterStatus` state variables
- Replace the dummy Filter button with two `Select` dropdowns (Category and Status) next to the search bar
- Include filter values in the `queryKey` so React Query refetches on change
- Apply `.eq("category", filterCategory)` and `.eq("status", filterStatus)` server-side on the `cases` query when filters are set
- For category filter: filter the cases query, then only show patients that have matching cases
- For status filter: same approach on the cases query
- Add an "All" option (empty string) to clear each filter

**2. Add i18n keys**
- Add `patients.filters.allCategories`, `patients.filters.allStatuses` to en/fr/de dictionaries

**3. UI Layout**
Replace the current filter bar with:
```
[Search input............] [Category ▼] [Status ▼]
```
Remove the non-functional Filter button.

### Files to Change
- `src/pages/app/Patients.tsx` — add filter selects, wire to server-side query
- `src/i18n/en.ts`, `fr.ts`, `de.ts` — add filter label keys

