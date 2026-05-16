## Objectif

Passer de "plateforme impressionnante mais difficile à situer" à "outil de raisonnement vasculaire crédible" via **une seule démo de 2 minutes** qui traverse le workflow clinique de bout en bout, avec un cas fictif réaliste comme fil rouge — sans ajouter de nouvelles features.

## Cas fil rouge — "Mme R., 82 ans"

- **Profil** : 82 ans, fragile (Frailty 5), IRC stade 3b (DFG 32 mL/min), allergie iode documentée → **contre-indication formelle au contraste iodé**.
- **Clinique** : claudication serrée à 50 m, IPS 0,42 à droite, ulcère malléolaire G débutant — Rutherford 4–5.
- **Décision attendue** : remplacement de l'angio-CT par AquaMR pour bilan, puis revascularisation fémoro-poplitée G.
- Données 100 % fictives, marquées `DEMO` à l'écran, jamais persistées en base.

## Architecture — 1 route, 6 étapes, 3 intros

```text
/demo/aomi-fragile
 ├── ?intro=jury        → slide d'intro "Pertinence scientifique / protocole L1"
 ├── ?intro=clinician   → slide d'intro "Gain workflow vs CTA en patient fragile"
 ├── ?intro=partner     → slide d'intro "Différenciation marché / chaîne visuelle"
 │
 ├── step 1 — Triage VascScreen   (IPS + Frailty + risque CI-AKI)
 ├── step 2 — Imagerie AquaMR     (FusionViewer, comparaison vs CTA absente)
 ├── step 3 — Digital Twin        (mapping 18 segments, lésion fémorale G)
 ├── step 4 — Décision L1         (L1DecisionBoard, raisonnement annoté)
 ├── step 5 — Plan opératoire     (ProcedurePlanner, parcours patient)
 └── step 6 — Suivi PROMs M3/M6   (VascuQoL-6, courbe de QoL)
```

Chaque étape = **un panneau plein écran** avec : à gauche le visuel de l'app (composant existant alimenté par les données du cas), à droite un encart "Pourquoi cette étape" en 3 lignes + bouton `Suivant`. Barre de progression sticky en haut.

## Réduction du bruit (sans suppression)

- Sur la **Landing** : un seul CTA primaire `▶ Voir la démo (2 min)` au-dessus de la fold + 3 chips audience en sous-CTA (Jury / Clinicien / Partenaire) qui pré-sélectionnent l'intro.
- Le bloc "Plateforme complète" et la grille des modules secondaires passent en **section repliable** plus bas.
- La sidebar app expose un groupe `Démo guidée` épinglé en haut ; les groupes R&D / Innovation Lab restent mais sont collapsés par défaut pour un utilisateur non connecté.

## Détails techniques

- **Nouveau** : `src/pages/demo/AomiFragileDemo.tsx` + `src/demo/aomiFragileCase.ts` (données figées du cas).
- **Nouveau** : `src/components/demo/DemoStepShell.tsx` (layout split + progression + nav clavier ←/→).
- **Nouveau** : `src/components/demo/DemoIntroSlide.tsx` (3 variantes audience).
- **Réutilisation** : `DigitalTwin`, `FusionViewer`, `L1DecisionBoard`, `ProcedurePlanner`, `VascScreenResults`, `Registry` PROMs view sont rendus en **mode démo** via une prop `demoData` (fallback sur leur logique normale si non fournie). Aucun appel Supabase pendant la démo.
- **Routing** : ajouter `/demo/aomi-fragile` (public, hors `PublicAppRoute`) dans `src/App.tsx`.
- **i18n** : nouvelles clés sous `demo.aomi.*` en EN/FR/DE — textes cliniques restent EN, encarts narratifs traduits.
- **Bandeau** : disclaimer `DEMO — Données fictives, à but pédagogique` sticky tout le long, distinct du `ResearchPreviewBanner`.

## Landing — 3 portes d'entrée

```text
[HERO]
 The vascular workflow platform without radiation or contrast injection
 ▶  Voir la démo guidée (2 min)
    [Jury de thèse]  [Clinicien vasculaire]  [Partenaire]
 ──────────────────────────────────────────────────
 (les autres CTA — RSVP, protocole, etc. — passent en secondaire)
```

Les 3 chips n'ouvrent pas 3 démos différentes : ils ouvrent **la même** route avec `?intro=jury|clinician|partner`, donc 1 seul flow à maintenir.

## Découpage en lots

1. **Squelette + cas figé** — route, layout `DemoStepShell`, fichier `aomiFragileCase.ts`, 6 étapes vides numérotées, barre de progression, nav clavier. *Livrable : on peut traverser les 6 étapes vides.*
2. **Branchement des écrans existants en mode démo** — chaque étape monte le composant réel avec `demoData`. *Livrable : la démo affiche les vrais visuels app.*
3. **Encarts narratifs + 3 intros audience** — copywriting clinique court (3 lignes max par étape), variantes intro. *Livrable : la démo raconte une histoire cohérente.*
4. **Landing — CTA primaire + chips audience + repli des sections secondaires.** *Livrable : un visiteur arrive sur la home et trouve la démo en moins de 3 secondes.*
5. **i18n EN/FR/DE + bandeau DEMO + test E2E playwright** (parcours complet des 6 étapes sur desktop + mobile). *Livrable : démo prête à montrer en jury.*

## Hors-scope explicite (pour rester sur le sujet)

- Pas de nouvelle table Supabase.
- Pas de nouveau module clinique.
- Pas de refonte visuelle des écrans existants — on les *utilise* tels quels.
- Pas de vidéo/voix-off — la démo est interactive, pas un film.
- Pas de suppression d'écrans R&D — seulement repli/dé-priorisation visuelle.

## Critères d'acceptation

- Un visiteur non connecté lance la démo depuis la home en **un clic**.
- Les 6 étapes se traversent en **≤ 2 minutes** lecture normale.
- À chaque étape, la phrase "pourquoi cette étape" répond à : *quelle décision clinique, basée sur quelle donnée*.
- Le cas est cliniquement défendable devant un angiologue (revue de cohérence par toi avant publication).
- Aucune donnée du cas n'atteint Supabase (vérifié via onglet Network).
