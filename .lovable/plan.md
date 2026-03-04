

# Internationalization (EN/FR/DE) + Complete Page Content

## Approach

Create a lightweight i18n system using React Context + JSON translation dictionaries. No external library needed — the app has ~20 pages with moderate text volume, and a custom hook `useTranslation()` keeps things simple and fast.

## Architecture

```text
src/
├── i18n/
│   ├── context.tsx         # LanguageProvider + useTranslation hook
│   ├── en.ts               # English translations (~600 keys)
│   ├── fr.ts               # French translations
│   └── de.ts               # German translations
```

- `LanguageProvider` wraps the app, stores language in localStorage
- `useTranslation()` returns `{ t, language, setLanguage }` where `t("key")` returns the translated string
- Language switcher added to the AppLayout top bar (dropdown with EN/FR/DE flags)

## Translation Key Structure

Organized by page/section for maintainability:

```text
landing.hero.title = "Vascular Atlas"
landing.hero.subtitle = "Unifying clinical workflow..."
dashboard.title = "Dashboard"
dashboard.welcome = "Welcome back. Here's your clinical overview."
dashboard.quickActions.newPatient = "New Patient Case"
aiAssistant.title = "AI Clinical Assistant"
aiAssistant.disclaimer.title = "AI-Generated Content — Not a Diagnosis"
patients.title = "Patient Cases"
patients.columns.caseId = "Case ID"
...
```

## Files to Create

1. **`src/i18n/en.ts`** — Complete English dictionary with all text from every page (~600+ keys covering Landing, Pricing, Auth, Dashboard, AI Assistant, Patients, Digital Twin, Registry, Education, Simulation, Network, Research, Compliance, Team, Settings, and all 5 Beta pages)

2. **`src/i18n/fr.ts`** — Full French translation of all keys (professional medical French)

3. **`src/i18n/de.ts`** — Full German translation of all keys (professional medical German)

4. **`src/i18n/context.tsx`** — React context with:
   - `LanguageProvider` component (wraps app, persists to localStorage)
   - `useTranslation()` hook returning `{ t, language, setLanguage }`
   - Type-safe language union: `"en" | "fr" | "de"`

## Files to Modify

5. **`src/App.tsx`** — Wrap with `<LanguageProvider>`

6. **`src/components/layout/AppLayout.tsx`** — Add language switcher dropdown (EN/FR/DE) in top bar

7. **`src/components/layout/AppSidebar.tsx`** — Translate all sidebar navigation labels

8. **`src/components/CommandPalette.tsx`** — Translate command labels

9. **All 20 page files** — Replace hardcoded strings with `t("key")` calls:
   - `Landing.tsx`, `Pricing.tsx`, `Auth.tsx`, `NotFound.tsx`
   - `Dashboard.tsx`, `AIAssistant.tsx`, `Patients.tsx`, `DigitalTwin.tsx`
   - `Registry.tsx`, `Education.tsx`, `Simulation.tsx`, `Network.tsx`
   - `Research.tsx`, `Compliance.tsx`, `Team.tsx`, `Settings.tsx`
   - `beta/FederatedLearning.tsx`, `beta/AISafety.tsx`, `beta/Imaging.tsx`, `beta/Wearables.tsx`, `beta/ARTraining.tsx`

## Content Completion

While integrating translations, all pages will receive complete, rich content:

- **Landing**: Full hero copy, detailed module descriptions, trust signals, CTA sections
- **Pricing**: Complete feature lists per tier, comparison details
- **Dashboard**: Full activity descriptions, module descriptions
- **AI Assistant**: Complete disclaimer text, form labels, evidence panel content
- **Patients**: Complete table headers, status labels, search placeholders
- **Digital Twin**: Timeline descriptions, care plan goals, vascular map description
- **Registry**: Complete outcome categories, benchmarking descriptions
- **Education**: Track descriptions, badge metadata, CME details
- **Simulation**: Case descriptions, skill heatmap labels, authoring tool description
- **Network**: Discussion content, expert profiles, mentorship descriptions
- **Research**: Study descriptions, analytics labels
- **Compliance**: Audit log labels, consent items, AI safety metrics
- **Team**: Role labels, status labels, invite workflow text
- **Settings**: All form labels, section descriptions
- **Beta pages**: Complete concept descriptions in all 3 languages

## Language Switcher UI

A compact dropdown in the top bar next to the theme toggle:
- Shows current language as 2-letter code (EN/FR/DE)
- Dropdown with flag emoji + full language name
- Persists selection to localStorage key `vascular-atlas-lang`

