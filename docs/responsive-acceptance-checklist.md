# Responsive Acceptance Checklist — Landing & Menus

A pre-release smoke checklist to validate the landing page (`/`), the global header,
and the burger menu across the breakpoints, zoom levels, and orientations we officially
support. Run it before every release **after** the automated visual-regression suite is green.

> Tailwind breakpoints (default): `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
> The header switches between **burger menu** and **inline nav** at `lg` (1024px).
> The "AquaMR Flow Platform" subtitle only appears at `xl` (1280px) and above.

## 1. Viewport sizes (portrait, 100% zoom, light + dark)

For each width, open `/` and verify the header layout, then open the burger / inline nav.

| Device class      | Width × Height | Expected nav  | Subtitle visible? |
| ----------------- | -------------- | ------------- | ----------------- |
| Mobile XXS        | 280 × 653      | Burger        | No                |
| Mobile XS         | 320 × 568      | Burger        | No                |
| Mobile (iPhone)   | 390 × 844      | Burger        | No                |
| Phablet           | 414 × 896      | Burger        | No                |
| Tablet portrait   | 768 × 1024     | Burger        | No                |
| Tablet (iPad Air) | 820 × 1180     | Burger        | No                |
| Tablet large      | 834 × 1194     | Burger        | No                |
| Laptop small      | 1024 × 768     | Inline nav    | No                |
| Laptop            | 1366 × 768     | Inline nav    | Yes (≥1280)       |
| Desktop FHD       | 1920 × 1080    | Inline nav    | Yes               |
| Desktop QHD       | 2560 × 1440    | Inline nav    | Yes               |

For each row check:

- [ ] No horizontal scrollbar on `<html>` or `<body>`.
- [ ] `VASCU-LINK` renders on a **single line** (no wrap, no clipping).
- [ ] Subtitle (`AquaMR Flow Platform`) is hidden below `xl` and never overlaps the nav.
- [ ] Logo + brand text + nav/burger fit inside the 16-tall (`h-16`) header.
- [ ] Hero CTA buttons are not covered by the fixed nav, the FourZeroBanner, or the framing line.
- [ ] No two header items overlap (≥ 4 px tolerance).

## 2. Landscape orientation (mobile + tablet)

| Device           | Width × Height |
| ---------------- | -------------- |
| iPhone landscape | 844 × 390      |
| Pixel landscape  | 800 × 360      |
| iPad landscape   | 1180 × 820     |

- [ ] Burger button still visible and tappable (≥ 44 × 44 CSS px hit target).
- [ ] When the sheet is open, scroll inside the sheet works and content does not get clipped under the address bar.

## 3. Browser zoom levels (desktop)

At `1366 × 768`, set the browser zoom and re-verify the header:

| Zoom | Expected behaviour                                                 |
| ---- | ------------------------------------------------------------------ |
| 80%  | Inline nav, subtitle visible, no overlap.                          |
| 100% | Inline nav, subtitle visible, no overlap.                          |
| 125% | Inline nav, may collapse to burger if effective width < 1024 CSS px. Either state must be clean. |
| 150% | Burger expected (effective width ≈ 910 px). VASCU-LINK still single-line. |
| 175% | Burger. No header overflow, no horizontal scroll.                  |
| 200% | Burger. Hero CTAs still reachable. WCAG 1.4.10 reflow respected.   |

- [ ] No `…` truncation of brand or nav labels.
- [ ] Focus ring visible on tab navigation in both light and dark mode.

## 4. Localization

Repeat steps 1–3 with `EN`, `FR`, `DE` (the three longest-label locales differ). Verify:

- [ ] No raw i18n keys (e.g. `landing.nav.why`) leak into the header at any size.
- [ ] German labels (longest) do not push the burger off-screen at 1024 px.

## 5. Menu / burger interactions

At 390 × 844 and 1366 × 768:

- [ ] Burger opens the side sheet; ESC closes it; clicking outside closes it.
- [ ] Sheet contains every link present in the inline nav (parity).
- [ ] Language and theme toggles are reachable from inside the sheet.
- [ ] Navigating from a sheet item closes the sheet automatically.

## 6. High-contrast / reduced motion

- [ ] Toggle `prefers-reduced-motion`: header transitions are disabled.
- [ ] High-contrast toggle: nav, burger, and CTAs keep ≥ 4.5:1 contrast.

## 7. Automated coverage

These items are also enforced by:

- `e2e/visual-regression.spec.ts` (full-page snapshots + DOM overlap)
- `e2e/landing-responsive.spec.ts` (focused header / VASCU-LINK / breakpoint switch)
- `scripts/i18n-strict-check.mjs` (key parity)
- `scripts/i18n-icu-check.mjs` (ICU placeholder parity)

If any manual item fails, file the diff in `test-results/` and update the relevant
Playwright baseline rather than silently widening the tolerance.
