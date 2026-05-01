# i18n Audit Report

_Generated: 2026-05-01T10:21:25.010Z_

Three views for one purpose: **(1)** find translation keys called from the codebase but missing/empty in a locale, **(2)** detect dictionary keys never used in code (orphans) so we can prune, **(3)** flag remaining hardcoded strings on **public pages** (after filtering brand tokens, native language names, clinical instruments and lines already wrapped in `t()`).

## Summary

| Metric | Count |
|---|---:|
| Translation keys referenced from code | 1306 |
| Dynamic key prefixes detected | 33 |
| Keys missing in FR | 0 |
| Keys missing in EN | 0 |
| Keys missing in DE | 0 |
| Orphan keys (defined, unused) | 50 |
| Public pages with hardcoded candidates | 2 (2 findings) |

## Missing keys — FR

_None ✅_

## Missing keys — EN

_None ✅_

## Missing keys — DE

_None ✅_

## Orphan keys (defined in FR dictionary but never referenced)

_50 keys are present in the dictionary but no `t("…")` call references them. Some may be intentional (placeholders for upcoming features) — review before pruning._

```
common.appName
common.search
common.filter
common.configure
common.submit
common.viewAll
common.signUp
common.upload
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
analytics.period
analytics.category
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
