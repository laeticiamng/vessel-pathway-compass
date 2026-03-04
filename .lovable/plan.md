

## Plan: Wire All Remaining Hardcoded English Strings to i18n

### Scope

After auditing the full codebase, here are the remaining hardcoded English strings that need i18n wiring:

**1. Compliance.tsx** (5 strings)
- `"No audit logs recorded yet"`
- `"No consent records yet"`
- `"No AI outputs recorded yet"`
- `"Load More"`
- `"granted"` / `"revoked"` labels in consent summary

**2. AIAssistant.tsx** (2 strings)
- `"Rate limited"` + `"Please try again in a moment."`
- `"Credits required"` + `"Please add credits to continue using AI features."`

**3. Patients.tsx** (4 placeholders)
- `placeholder="e.g. PAT-2026-001"`
- `placeholder="Select"` (×3 in form selects)
- `placeholder="e.g. Right SFA occlusion"`

**4. Team.tsx** (2 strings)
- Member `status` values `"Active"` / `"Invited"` displayed as badges (should use `t("team.statuses.active")` etc.)
- Member `role` values (`"Physician"`, `"Hospital Admin"`, etc.) — these are demo data, best left as-is or add role translation keys

**5. AppLayout.tsx** (1 string)
- `aria-label="Toggle theme"`

### Implementation Steps

#### Step 1: Add new i18n keys to all 3 language files

Add to `en.ts`, `fr.ts`, `de.ts`:

```
compliance.empty.audit / consent / aiOutputs
compliance.loadMore
compliance.consent.granted / revoked

aiAssistant.errors.rateLimited / rateLimitedDesc
aiAssistant.errors.creditsRequired / creditsRequiredDesc

patients.form.pseudonymPlaceholder / selectPlaceholder / caseTitlePlaceholder

topBar.toggleTheme
```

#### Step 2: Update Compliance.tsx
- Replace 3 empty-state strings with `t("compliance.empty.audit")` etc.
- Replace `"Load More"` with `t("compliance.loadMore")`
- Replace `"granted"` / `"revoked"` with `t("compliance.consent.granted")` / `t("compliance.consent.revoked")`

#### Step 3: Update AIAssistant.tsx
- Replace toast titles/descriptions for 429 and 402 errors with `t(...)` calls

#### Step 4: Update Patients.tsx
- Replace hardcoded `placeholder` strings with `t(...)` calls

#### Step 5: Update Team.tsx
- Replace `m.status` badge display with `t(\`team.statuses.${m.status.toLowerCase()}\`)`

#### Step 6: Update AppLayout.tsx
- Replace `aria-label="Toggle theme"` with `aria-label={t("topBar.toggleTheme")}`

### Translation Content

| Key | EN | FR | DE |
|-----|----|----|-----|
| compliance.empty.audit | No audit logs recorded yet | Aucun journal d'audit enregistré | Noch keine Audit-Protokolle |
| compliance.empty.consent | No consent records yet | Aucun enregistrement de consentement | Noch keine Einwilligungen |
| compliance.empty.aiOutputs | No AI outputs recorded yet | Aucune sortie IA enregistrée | Noch keine KI-Ausgaben |
| compliance.loadMore | Load More | Charger plus | Mehr laden |
| compliance.consent.granted | granted | accordé(s) | erteilt |
| compliance.consent.revoked | revoked | révoqué(s) | widerrufen |
| aiAssistant.errors.rateLimited | Rate limited | Limite de débit atteinte | Ratenbegrenzung erreicht |
| aiAssistant.errors.rateLimitedDesc | Please try again in a moment. | Veuillez réessayer dans un instant. | Bitte versuchen Sie es gleich erneut. |
| aiAssistant.errors.creditsRequired | Credits required | Crédits nécessaires | Credits erforderlich |
| aiAssistant.errors.creditsRequiredDesc | Please add credits to continue using AI features. | Veuillez ajouter des crédits pour continuer. | Bitte fügen Sie Credits hinzu, um fortzufahren. |
| patients.form.pseudonymPlaceholder | e.g. PAT-2026-001 | ex. : PAT-2026-001 | z.B. PAT-2026-001 |
| patients.form.selectPlaceholder | Select | Sélectionner | Auswählen |
| patients.form.caseTitlePlaceholder | e.g. Right SFA occlusion | ex. : Occlusion AFS droite | z.B. AFS-Verschluss rechts |
| topBar.toggleTheme | Toggle theme | Changer le thème | Thema wechseln |

### Files Modified
- `src/i18n/en.ts` — add ~14 new keys
- `src/i18n/fr.ts` — add ~14 new keys
- `src/i18n/de.ts` — add ~14 new keys
- `src/pages/app/Compliance.tsx` — replace 5 hardcoded strings
- `src/pages/app/AIAssistant.tsx` — replace 2 toast messages
- `src/pages/app/Patients.tsx` — replace 4 placeholders
- `src/pages/app/Team.tsx` — use translated status labels
- `src/components/layout/AppLayout.tsx` — translate aria-label

