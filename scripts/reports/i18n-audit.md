# i18n Audit Report

_Generated: 2026-05-06T15:23:11.832Z_

Three views for one purpose: **(1)** find translation keys called from the codebase but missing/empty in a locale, **(2)** detect dictionary keys never used in code (orphans) so we can prune, **(3)** flag remaining hardcoded strings on **public pages** (after filtering brand tokens, native language names, clinical instruments and lines already wrapped in `t()`).

## Summary

| Metric | Count |
|---|---:|
| Translation keys referenced from code | 1538 |
| Dynamic key prefixes detected | 49 |
| Keys missing in FR | 1 |
| Keys missing in EN | 1 |
| Keys missing in DE | 1 |
| Orphan keys (defined, unused) | 98 |
| Public pages with hardcoded candidates | 1 (1 findings) |

## Missing keys — FR

| Key | Reason | Used in |
|---|---|---|
| `sidebar.hospitalAudit` | absent | src/components/layout/AppSidebar.tsx |

## Missing keys — EN

| Key | Reason | Used in |
|---|---|---|
| `sidebar.hospitalAudit` | absent | src/components/layout/AppSidebar.tsx |

## Missing keys — DE

| Key | Reason | Used in |
|---|---|---|
| `sidebar.hospitalAudit` | absent | src/components/layout/AppSidebar.tsx |

## Orphan keys (defined in FR dictionary but never referenced)

_98 keys are present in the dictionary but no `t("…")` call references them. Some may be intentional (placeholders for upcoming features) — review before pruning._

```
branding.deviceName
branding.tagline
common.appName
common.search
common.filter
common.configure
common.submit
common.viewAll
common.signUp
common.getStarted
common.learnMore
common.upload
landing.nav.pricing
landing.nav.access
pricing.currency.label
pricing.currency.chf
pricing.currency.eur
auth.checkEmailDesc
dashboard.quickActions.newCase
dashboard.quickActions.education
dashboard.modules
dashboard.stats.cmeCredits
dashboard.moduleDesc.procedurePlanner
dashboard.moduleDesc.twin
dashboard.moduleDesc.registry
dashboard.moduleDesc.education
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
vasculink.arch.description
vasculink.arch.cockpitBanner
vasculink.arch.l1Fallback
pages.changelog.sections.methodology_framing
pages.changelog.sections.cadrage_méthodologique
pages.changelog.sections.added
pages.changelog.sections.ajouté
pages.changelog.sections.changed
pages.changelog.sections.modifié
pages.changelog.sections.guardrails
pages.changelog.sections.garde-fous
pages.changelog.sections.security
pages.changelog.sections.sécurité
pages.changelog.sections.removed
pages.changelog.sections.deprecated
pages.protocol.complianceBadge.statusOk
pages.protocol.complianceBadge.statusWarn
pages.protocol.complianceBadge.statusError
pages.protocol.annexes.references.title
pages.protocol.annexes.references.items
pages.protocol.annexes.limits.title
pages.protocol.annexes.limits.items
pages.protocol.annexes.privacy.title
pages.protocol.annexes.privacy.items
pages.protocol.annexes.security.title
pages.protocol.annexes.security.items
pages.protocol.annexes.adr.title
pages.protocol.annexes.adr.items
pages.protocol.annexes.traceability.title
pages.protocol.annexes.traceability.items
pages.protocol.annexes.restrictedRule.signedOut
pages.protocol.annexes.restrictedRule.authenticated
pages.protocol.annexes.restrictedRule.clinical
pages.protocol.annexes.restrictedRule.research
pages.protocol.annexes.restrictedRule.governance
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

### `src/pages/CheckoutSuccess.tsx` — 1

| Line | Kind | Value |
|---:|---|---|
| 123 | jsx-text | AquaMR Flow Professional |
