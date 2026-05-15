
# Refonte visuelle « Sculpture / Awwwards » — VASCU-LINK

Objectif : élever le site (public + app clinique) au niveau Teenage Engineering / B&O / Sonos sans casser les contraintes médicales (MDR, WCAG, reduced-motion, RGPD).

Méthodologie respectée : **1 phase = 1 objectif = 1 test immédiat**. Chaque phase est mergeable indépendamment et n'invalide pas les phases suivantes.

---

## Garde-fous non négociables

- `prefers-reduced-motion` désactive Lenis + toutes les animations lourdes (fallback scroll natif, pas d'AnimatePresence orchestrée).
- High-contrast mode désactive glow/parallax/blur (déjà géré via `useHighContrast`).
- App clinique (`/app/*`) : animations limitées aux transitions de page et hover de cartes — **jamais** sur formulaires patient, scoring CI-AKI, alertes, audit. Sécurité > effet.
- Tous les tests Playwright existants (`global-header-responsive`, `landing-responsive`, `hero-neon-static-modes`) doivent rester verts.
- Tokens HSL via `index.css` uniquement, jamais de couleur en dur.

---

## Phase 1 — Fondations « sculpture »

**But** : poser la grammaire visuelle réutilisable.

- `src/lib/sculpture/` : tokens sculpturaux (matériaux, profondeur, ombres portées multi-couches type B&O), courbes d'easing signature (Teenage Engineering : `cubic-bezier(0.16, 1, 0.3, 1)`).
- `src/components/sculpture/` :
  - `Sculptural.tsx` (wrapper magnétique : tilt subtil au mouseMove, ressort framer-motion).
  - `MaterialSurface.tsx` (carte avec gradient brushed + reflet light qui suit le curseur).
  - `EngravedText.tsx` (typo gravée light/dark, micro-shadow inset).
  - `RevealOnScroll.tsx` (variantes : fade, mask, slide-mask, stagger ; respecte `reduced-motion`).
- `src/hooks/useMagneticHover.ts`, `useParallaxLayer.ts`.
- Test : `src/test/sculpture-tokens.test.ts` (tokens présents, valeurs HSL, fallback reduced-motion).

## Phase 2 — Smooth scroll Lenis global

- `bun add lenis`
- `src/lib/lenis.tsx` : `LenisProvider` monté dans `App.tsx` autour du Router, avec :
  - Auto-disable si `prefers-reduced-motion`.
  - Désactivation sur routes `/app/patients/*`, `/app/l1/*`, `/app/ci-aki`, `/app/fusion-viewer` (perf + scroll natif requis pour formulaires longs et viewer DICOM).
  - Sync framer-motion `useScroll` via `lenis.on('scroll', ...)`.
- E2E : `e2e/lenis-smooth-scroll.spec.ts` (présent sur Landing, absent sur PatientDetail, absent en reduced-motion).

## Phase 3 — Landing « parchemin matériaux/ingénierie »

Remplace les sections statiques par un scroll narratif :
- Hero conservé (NeonGradientText déjà premium) + ajout d'un layer parallax léger.
- Nouvelle section `MaterialsScroll.tsx` : pinning scroll qui dévoile, étape par étape, les « matériaux » de VASCU-LINK (pipeline IA → audit → conformité MDR → DSMB) sous forme de strates qui se révèlent — métaphore « parchemin qui se déroule ».
- Nouvelle section `EngineeringExploded.tsx` : vue éclatée du moteur clinique (CI-AKI, L1, Digital Twin) avec hover qui isole chaque pièce.
- ComplianceFAQ + Pricing : transitions reveal-on-scroll, pas de re-design.
- Test : `e2e/landing-narrative.spec.ts` (sections présentes, scroll progression mesurable).

## Phase 4 — Header global sculptural

- Refonte `Landing.tsx` header + `AppLayout.tsx` header :
  - Fond glass dynamique qui s'opacifie au scroll (déjà partiellement fait, à raffiner).
  - Logo magnétique (hover tilt subtil).
  - Lien actif avec underline animé type Awwwards (mask reveal).
- Conserve `breakpoints.ts` et tous les tests responsive verts.

## Phase 5 — Micro-interactions universelles

- Variantes Button shadcn : ajout d'une variante `sculptural` (press depth, ripple discret framer-motion).
- Cards (`PremiumCard`, `ModuleCard`, `MetricCard`) : hover light-sweep + élévation multi-couche.
- Inputs : focus ring animé (mask).
- Liens nav : underline mask reveal.
- Toast / Dialog : entry animation easing signature.
- App clinique : appliquer **uniquement** aux composants déjà décoratifs (Dashboard cards, Modules tiles, Network), **pas** aux tables patient, formulaires d'évaluation, signatures DSMB.

## Phase 6 — App clinique : version « sobre Awwwards »

- Dashboard, Modules, Network, Education, Innovation Lab, Settings, About : reveal-on-scroll + cards sculpturales + transitions de page.
- Patients, PatientDetail, CI-AKI, L1, FusionViewer, Audit, Governance, Compliance : **read-only animations** (transition page + hover doux). Pas de Lenis. Pas de parallax.
- Test : `e2e/app-clinical-no-motion.spec.ts` vérifie que les pages cliniques critiques n'ont ni Lenis ni animation perturbante.

## Phase 7 — Page transitions & finition

- `AnimatePresence` au niveau Router (mode `wait`, mask reveal entre routes publiques).
- Cursor custom optionnel (désactivable, off par défaut sur mobile et reduced-motion).
- Audit Lighthouse : viser CLS < 0.05, LCP < 2.5s sur Landing.
- Pass de QA visuelle Playwright sur les 10 routes principales × 4 modes (light/dark/HC/RM) × 3 viewports.

---

## Détails techniques

```text
src/
├─ lib/
│  ├─ lenis.tsx                  ← provider + route filter + RM guard
│  └─ sculpture/
│     ├─ tokens.ts               ← easings, depth layers, materials
│     └─ variants.ts             ← framer-motion variants partagées
├─ components/sculpture/
│  ├─ Sculptural.tsx
│  ├─ MaterialSurface.tsx
│  ├─ EngravedText.tsx
│  └─ RevealOnScroll.tsx
├─ hooks/
│  ├─ useMagneticHover.ts
│  └─ useParallaxLayer.ts
└─ components/landing/
   ├─ MaterialsScroll.tsx        ← pinning scroll narratif
   └─ EngineeringExploded.tsx    ← vue éclatée hover-isolation
```

Stack ajouté : `lenis` (~5kb gzip). Pas de `locomotive-scroll` (Lenis est plus léger et mieux maintenu).

---

## Estimation & livraison

7 phases, livrées séquentiellement. Chaque phase = un commit autonome avec tests verts. Tu peux stopper après n'importe quelle phase si le rendu te convient.

Je propose de commencer par les **Phases 1 + 2** (fondations + Lenis) — c'est le socle qui rend tout le reste possible. Puis on itère phase par phase avec validation visuelle de ta part entre chaque.

Confirme et je lance la Phase 1.
