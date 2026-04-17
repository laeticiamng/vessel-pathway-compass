# Scripts

## `check-i18n.mjs` — i18n consistency check

Scans `src/**` for `t("some.key")` usages and verifies every key exists in
`src/i18n/fr.ts`, `en.ts` and `de.ts`. Exits with code **1** (and a detailed
diagnostic) if any key is missing in at least one locale.

### Usage

```bash
node scripts/check-i18n.mjs
```

### Wire it as a pre-build hook

Add to `package.json` `scripts`:

```json
{
  "scripts": {
    "prebuild": "node scripts/check-i18n.mjs",
    "build": "vite build"
  }
}
```

> ⚠️ `package.json` is managed automatically in this project. To enable the
> hook, ask the maintainer to add the `prebuild` entry above (or run the
> script manually in CI before `vite build`).

### CI integration

```yaml
- name: i18n check
  run: node scripts/check-i18n.mjs
```

### What it ignores

- Single-segment strings inside `t("foo")` (no dot) — likely not translation
  keys.
- Files inside `src/i18n/` themselves.
