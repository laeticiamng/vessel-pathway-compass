# Release Notes Template

Every new version added to `CHANGELOG.md` MUST follow this structure so that
methodology framing, guardrails, and security changes are visible at a glance.

```markdown
## vX.Y.Z — <short title> (YYYY-MM-DD)

<1-2 paragraph summary positioning the release with respect to the
diagnostic concordance / pragmatic non-inferiority framing. Avoid superiority
or replacement claims.>

### Methodology framing
- <Concordance vs superiority impact, Doppler-first rule, safety fallback,
  L1/L2/L3 scope, regulatory disclaimer wording>

### Added
- <New user-facing features, components, pages, scripts>

### Changed
- <Behavior, copy or UX changes; pricing/visibility changes>

### Guardrails
- <Non-overpromise checks, i18n CI, content version pins, role gating,
  audit log coverage, evidence/PROBAST badges>

### Security
- <RLS, SECURITY DEFINER, role gating, secret rotation, edge function auth>

### Removed / Deprecated
- <Anything taken out and rationale>
```

## Rules

1. The first line MUST match `^## v(\d+\.\d+\.\d+) — .+ \(\d{4}-\d{2}-\d{2}\)$`.
2. The most recent version in `CHANGELOG.md` MUST equal `APP_VERSION` from
   `src/lib/appVersion.ts` and the date stamp in `README.md`.
3. The four required H3 sections (`Methodology framing`, `Added`, `Guardrails`,
   `Security`) MUST be present even if the body is `- _none_`.
4. Never include marketing-grade superiority phrases (see
   `scripts/check-non-overpromise.mjs`).
5. Run `npm run check:release` before publishing.
