# Hero-neon — visual fix + a11y + perf metrics + e2e

## 1. Fix the clipped/bleeding headline ("Plus de contrôle…")

Symptoms in the screenshot: descendants of `g`, `p`, `é` are cut off and a strong cyan halo bleeds on the right.

Root causes:
- `inline-block` + `filter: drop-shadow(...)` rasterizes within the glyph box → descenders get cropped.
- No bottom padding / generous line-height on the gradient span.
- `--neon-glow` opacity too high in dark mode for long French titles.

Fix in `src/index.css` `.hero-neon-text`:
- Add `line-height: 1.18`, `padding: 0.05em 0.08em 0.18em` so the rasterization box fully contains every glyph including descenders.
- Lower the dark-mode halo opacity (`0.26 → 0.20`) and the strong variant (`0.30 → 0.24`) — keeps the cockpit vibe without "blue bleed".
- Drop the redundant `0 1px 0 white` highlight on light mode (already covered by gradient).

## 2. Smarter IntersectionObserver for mobile

In `src/components/ui/neon-gradient-text.tsx`:
- Switch `rootMargin` to a viewport-relative value: `25% 0px 25% 0px` (was `120px`) → activates earlier on tall mobile screens, later on desktop.
- Use multiple thresholds `[0, 0.05, 0.25]` and trigger on first crossing — eliminates the flicker observed during fast flick-scroll.
- After activation, debounce a second `requestAnimationFrame` before flipping `data-hero-neon-active` so the skeleton-to-effect transition lands on a paint frame (no flash).
- Disconnect observer immediately on first activation (already done).

## 3. ARIA hardening

`NeonGradientText` props:
- New `decorative?: boolean` → when true, sets `aria-hidden="true"` and removes the element from the accessibility tree (use case: visual-only ornament next to a real heading).
- The skeleton state now sets `aria-busy="true"` and `aria-hidden="true"` so screen readers do NOT announce "loading" or shimmer placeholder text.
- `ariaLabel` keeps overriding the visible text for screen readers when needed.
- Auto-fallback: if children is a single string and no `ariaLabel` is provided, mirror the string into `aria-label` only when `decorative=false` AND the parent uses semantic role (preserves SR announcement quality on inline heading fragments).

## 4. Performance metrics panel

New `src/components/dev/HeroNeonMetricsPanel.tsx`:
- Captures three signals via `PerformanceObserver`:
  - **LCP** of the headline element (LargestContentfulPaint entry whose `element` matches `[data-hero-neon]`).
  - **GPU cost proxy** = average `frame duration` during the 1s window after activation, measured with `requestAnimationFrame` deltas (no GPU API exists in browser; this is the standard proxy).
  - **Skeleton→active latency** = `performance.now()` delta between `data-hero-neon-active` flipping `false→true` and the first paint after.
- Stores rolling stats in a `useHeroNeonMetrics()` hook (in-memory + `sessionStorage` for cross-route inspection).
- Tags each measurement with `device = (matchMedia("(pointer: coarse)").matches ? "mobile" : "desktop")` and emits a `console.info` line in dev. In production (`import.meta.env.PROD`), forwards to the existing `webVitals.ts` pipeline so the values appear on the existing **WebVitalsAdmin** page.

UI: the panel is a floating, collapsible chip rendered only when the URL contains `?heroDebug=1` (or on the new QA page). No production overhead by default.

## 5. QA page — `/dev/hero-neon`

New route registered in `src/App.tsx` (lazy-loaded), file `src/pages/dev/HeroNeonQa.tsx`.

Controls:
- Toggle **theme** (light / dark / system).
- Toggle **high-contrast** mode (uses existing `useHighContrast`).
- Toggle **prefers-reduced-motion** override (a local React state that injects `<style>* { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }</style>` and forces the `data-hero-neon-scrolling="true"` attribute on every hero-neon to simulate the OS pref).
- Toggle **lazy-load** (mounts/unmounts the headline with `lazy={true|false}`).
- Toggle **focusable** + show/hide focus ring tester.
- Slider for **intensity** (soft / medium / strong).
- Live render of `HeroNeonMetricsPanel`.
- Iframe-style preview at three viewport sizes (`375 × 812`, `768 × 1024`, `1440 × 900`) using CSS `transform: scale(...)` previews (no real iframe needed — same DOM, just constrained widths).

Route is dev-only: returns a 404 in `import.meta.env.PROD` UNLESS the user appends `?force=1`.

## 6. Playwright e2e tests

New `e2e/hero-neon.spec.ts` (Playwright config will be added: `playwright.config.ts` + `e2e/` + `package.json` script `test:e2e`).

Browsers: chromium, firefox, webkit (matches Chrome/Firefox/Safari).

Test matrix:
- **Render contract**: each browser navigates to `/`, takes a screenshot of the hero-neon, asserts the rendered box has `height >= computed font-size * 1.15` (no descender clipping).
- **Scroll**: scroll the page 1500 px in 200 ms, then assert the headline is still readable (text content present, computed `color !== rgba(0,0,0,0)` after `@supports not` paths) and the post-scroll filter is restored within 300 ms.
- **Keyboard focus**: tab into the hero CTA, then back-tab to the headline (when `focusable=true` in QA page), assert visible outline via `getComputedStyle().outlineWidth !== "0px"`.
- **Reduced motion**: launch context with `reducedMotion: 'reduce'`; assert that during scroll the `filter` computed style equals `none` and reverts to a non-`none` value after settle.
- **Fallback**: launch context with init script that overrides `CSS.supports` to return `false` for `-webkit-text-stroke`; assert the headline computed `color` is the solid token color (`rgb(...)` matching `--text-strong` or `--accent-cyan`), not transparent.
- **High-contrast**: navigate to `/dev/hero-neon?force=1`, click the toggle, assert `filter === "none"` and `color` matches `--contrast-strong` / `--contrast-cyan`.

## 7. Tests update

Extend `src/test/hero-neon.test.tsx` with:
- Assertion that `aria-hidden="true"` is set when `decorative` is true.
- Assertion that the skeleton container has `aria-busy="true"` and `aria-hidden="true"`.
- Assertion that `padding-bottom` is part of `.hero-neon-text` (regex on parsed CSS) — guards against re-introducing the descender clipping bug.
- Assertion that the rootMargin string used by the observer is viewport-relative (component exports a `HERO_NEON_IO_OPTIONS` const we can import in tests).

## Out of scope

- No DB / edge function changes.
- No backend metrics persistence beyond the existing `webVitals.ts` pipeline (already wired to `WebVitalsAdmin`).
- No content/i18n changes — we keep "Plus de contrôle sur vos procédures vasculaires." as-is and fix the rendering box around it.
