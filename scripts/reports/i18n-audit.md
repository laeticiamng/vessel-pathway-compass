# i18n Audit Report

_Generated: 2026-05-01T09:52:26.886Z_

Three views for one purpose: **(1)** find translation keys called from the codebase but missing/empty in a locale, **(2)** detect dictionary keys never used in code (orphans) so we can prune, **(3)** flag remaining hardcoded strings on **public pages** (after filtering brand tokens, native language names, clinical instruments and lines already wrapped in `t()`).

## Summary

| Metric | Count |
|---|---:|
| Translation keys referenced from code | 1243 |
| Dynamic key prefixes detected | 33 |
| Keys missing in FR | 12 |
| Keys missing in EN | 12 |
| Keys missing in DE | 12 |
| Orphan keys (defined, unused) | 83 |
| Public pages with hardcoded candidates | 2 (2 findings) |

## Missing keys — FR

| Key | Reason | Used in |
|---|---|---|
| `foo.bar` | absent | src/i18n/context.tsx |
| `en` | absent | src/pages/app/VascScreenDashboard.tsx |
| `unchanged` | absent | src/test/l1.test.ts |
| `medical_optimized` | absent | src/test/l1.test.ts |
| `escalation` | absent | src/test/l1.test.ts |
| `endovascular_discussion` | absent | src/test/l1.test.ts |
| `de_escalation` | absent | src/test/l1.test.ts |
| `insufficient_image_quality` | absent | src/test/l1.test.ts |
| `standard_imaging` | absent | src/test/l1.test.ts |
| `surveillance` | absent | src/test/l1.test.ts |
| `unknown` | absent | src/test/l1.test.ts |
| `assessment_id` | absent | src/test/l1.test.ts |

## Missing keys — EN

| Key | Reason | Used in |
|---|---|---|
| `foo.bar` | absent | src/i18n/context.tsx |
| `en` | absent | src/pages/app/VascScreenDashboard.tsx |
| `unchanged` | absent | src/test/l1.test.ts |
| `medical_optimized` | absent | src/test/l1.test.ts |
| `escalation` | absent | src/test/l1.test.ts |
| `endovascular_discussion` | absent | src/test/l1.test.ts |
| `de_escalation` | absent | src/test/l1.test.ts |
| `insufficient_image_quality` | absent | src/test/l1.test.ts |
| `standard_imaging` | absent | src/test/l1.test.ts |
| `surveillance` | absent | src/test/l1.test.ts |
| `unknown` | absent | src/test/l1.test.ts |
| `assessment_id` | absent | src/test/l1.test.ts |

## Missing keys — DE

| Key | Reason | Used in |
|---|---|---|
| `foo.bar` | absent | src/i18n/context.tsx |
| `en` | absent | src/pages/app/VascScreenDashboard.tsx |
| `unchanged` | absent | src/test/l1.test.ts |
| `medical_optimized` | absent | src/test/l1.test.ts |
| `escalation` | absent | src/test/l1.test.ts |
| `endovascular_discussion` | absent | src/test/l1.test.ts |
| `de_escalation` | absent | src/test/l1.test.ts |
| `insufficient_image_quality` | absent | src/test/l1.test.ts |
| `standard_imaging` | absent | src/test/l1.test.ts |
| `surveillance` | absent | src/test/l1.test.ts |
| `unknown` | absent | src/test/l1.test.ts |
| `assessment_id` | absent | src/test/l1.test.ts |

## Orphan keys (defined in FR dictionary but never referenced)

_83 keys are present in the dictionary but no `t("…")` call references them. Some may be intentional (placeholders for upcoming features) — review before pruning._

```
common.appName
common.search
common.filter
common.configure
common.submit
common.viewAll
common.signUp
common.upload
command.dashboard
command.procedurePlanner
command.fusionViewer
command.patients
command.digitalTwin
command.ciAkiEngine
command.simulation
command.registry
command.education
command.research
command.analytics
command.settings
command.vascscreen
landing.hero.badge
landing.hero.title
landing.hero.headlinePre
landing.hero.headlineHighlight
landing.hero.subtitle
landing.hero.cta
landing.hero.secondary
landing.hero.socialProof
landing.socialProof.title
landing.testimonials.title
landing.testimonials.disclaimer
landing.testimonials.items
landing.footer.contact
auth.checkEmailDesc
dashboard.quickActions.newCase
dashboard.quickActions.education
dashboard.modules
dashboard.stats.cmeCredits
procedurePlanner.output.report
patients.columns.abi
registry.stats.avgPatency
registry.stats.amputationRate
education.cmeCredits
education.badges.inProgress
research.eligible
research.pi
settings.profile.avatar
settings.institution.title
settings.institution.name
settings.institution.country
settings.institution.countryPlaceholder
patientDetail.deleteDialog.deleting
patientDetail.toastsDeleted
patientDetail.toastsDeletedDesc
patientDetail.trash.title
home.enBref.items
home.audience.items
home.howItWorks.steps
home.useCases.items
home.faq.items
analytics.period
analytics.category
seo.landing.title
seo.landing.description
vascscreen.riskFactors
vascscreen.abiGuide
vascscreen.study
vascscreen.patientUpdated
vascscreen.abi.category
vascscreen.abi.recommendedAction
vascscreen.results.summary
vascscreen.results.riskProfile
vascscreen.results.abiResults
vascscreen.results.recommendation
vascscreen.results.generateReport
vascscreen.results.referralDate
vascscreen.results.padConfirmed
vascscreen.results.fontaineStage
vascscreen.pdf.referringPhysician
vascscreen.adr.colDomain
vascscreen.adr.colStatus
vascscreen.adr.colEvidence
```

## Hardcoded strings on public pages (refined)

_Filters applied: lines already containing `t(`, brand/clinical tokens, native language names, `className=` / SVG paths / units. Remaining items are real candidates to wire through `t()`._

### `src/components/ErrorBoundary.tsx` — 1

| Line | Kind | Value |
|---:|---|---|
| 58 | jsx-text | Home / Accueil / Startseite |

### `src/pages/CheckoutSuccess.tsx` — 1

| Line | Kind | Value |
|---:|---|---|
| 122 | jsx-text | AquaMR Flow Professional |
