

## i18n Completion Plan: Dashboard, Network, Registry

### Analysis

Research, Education, Simulation, and DigitalTwin were already fully wired to i18n in the previous round. The three pages with remaining hardcoded English strings are:

**Dashboard.tsx** (5 hardcoded strings):
- `"Outcomes"`, `"Registry entries"`, `"Completed"` in stat cards
- `"Your latest actions across all modules"` activity subtitle
- `"No recent activity yet"` empty state

**Network.tsx** (~15 hardcoded strings):
- `"Error"` in toast titles
- Dialog labels: `"Title"`, `"Topic"`, `"Content"`, `"Select topic"`, `"De-identified Case Summary"`
- Dialog placeholders for post/expert forms
- Empty states: `"No discussions yet..."`, `"No expert requests yet"`
- `"Mentorship matching — coming soon"` description
- `"Start a de-identified case discussion"` dialog description

**Registry.tsx** (7 hardcoded strings):
- `"30-day Mortality"`, `"Complication Rate"`, `"PROMs Collected"` stat labels
- `"No outcomes data yet..."` empty table message
- `"Institution Aggregate"`, `"Network Benchmarking"` card titles
- `"Privacy-first"` badge

### Implementation

**Step 1**: Add ~25 new keys to `en.ts`, `fr.ts`, `de.ts` under existing `dashboard`, `network`, and `registry` namespaces.

**Step 2**: Replace all hardcoded strings in the three page components with `t()` calls.

### Scope
- 3 dictionary files updated
- 3 page components updated
- No new dependencies, routing, or database changes

