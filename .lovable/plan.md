# Plan — Démo Lot 2 + 7 priorités stratégiques

Articulation décidée : on **termine d'abord le Lot 2 de la démo AOMI** (branchement des vrais écrans), puis on enchaîne les 7 priorités dans l'ordre, avec un niveau d'agressivité **modéré (3/5)** sur P5-P7 (refactoring ciblé, pas de refonte du design system).

---

## Lot 2 — Démo AOMI : brancher les vrais écrans (PRIORITÉ IMMÉDIATE)

Objectif : remplacer les `VisualPlaceholder` de `/demo/aomi-fragile` par les vrais composants applicatifs alimentés en `demoData`.

**Écrans à brancher (6 étapes) :**
1. **Triage** → `VascScreenResults` en mode démo (props `demoData`, pas d'appel Supabase)
2. **AquaMR** → `FusionViewer` avec dataset DICOM mocké (image statique + overlay sténoses)
3. **Digital Twin** → `DigitalTwin` 18 segments alimenté par `AOMI_FRAGILE_CASE.segments`
4. **L1 Decision** → `L1DecisionBoard` avec recommandation pré-calculée
5. **Plan procédure** → `ProcedurePlanner` en lecture seule
6. **PROMs M3/M6** → vue `Registry` filtrée sur le cas

**Contrat technique :**
- Chaque composant accepte une prop optionnelle `demoData?: DemoCase` ; si présente, court-circuite tous les `useQuery`/`supabase.from(...)`.
- Bandeau DEMO sticky maintenu.
- Navigation clavier ←/→ conservée.
- Aucun écrit DB, aucun appel edge function.

**Critères d'acceptation Lot 2 :**
- Les 6 écrans s'affichent avec données Mme R. réalistes
- Parcours en ≤ 2 min
- Zéro requête réseau vers Supabase pendant la démo (vérifié via network panel)

---

## P1 — Clarifier le produit en 1 phrase

Je proposerai **3 formulations** dans le composant Landing hero, et tu choisiras :

- **A (raisonnement)** : « VASCU-LINK — le copilote de raisonnement vasculaire, du dépistage au suivi post-revascularisation. »
- **B (workflow)** : « VASCU-LINK — un workflow vasculaire unifié, de l'imagerie sans contraste aux PROMs longitudinaux. »
- **C (rupture techno)** : « VASCU-LINK — imagerie sans contraste + jumeau numérique vasculaire 18 segments, pour décider sans iode. »

Livrable : ask_questions visual_choice avec les 3 hero rendus, puis remplacement du H1 actuel.

---

## P2 — Bibliothèque de cas cliniques (proposition)

**5 cas** couvrant la matrice clinique de l'app :

| # | Cas | Module phare | Pourquoi |
|---|-----|--------------|----------|
| 1 | **Mme R., 82 ans — AOMI fragile, CI iode** | AquaMR + L1 | Déjà fait (démo de référence) |
| 2 | **M. T., 68 ans — Suivi post-revasc fémoro-poplité M6** | Digital Twin + PROMs (VascuQoL-6) | Démontre la chaîne longitudinale |
| 3 | **Mme L., 55 ans — Dépistage AOMI en MT (IPS limite)** | VascScreen + triage L1 | Démontre l'amont / médecine de ville |
| 4 | **Mme D., 47 ans — IVC C4, indication chirurgicale ?** | CIVIQ-14 + Digital Twin veineux | Démontre le versant veineux existant |
| 5 | **M. K., 71 ans — Pied diabétique à risque, plaie débutante** | VascScreen + risk assessment dynamique | Comorbidité la plus fréquente |

Chaque cas = 1 fiche standardisée : contexte, données d'entrée, raisonnement L1/L2, décision, outcomes M3/M6.

Architecture : `src/demo/cases/{caseId}.ts` + index `/demo` listant les 5 cas. Réutilise `DemoStepShell`.

---

## P3 — Preuve d'impact workflow

Ajout d'un **panneau "Impact workflow"** sur chaque cas et sur la Landing :
- Temps gagné (estimation : X min vs Y min standard)
- Examens évités (ex : 1 angio-CT iodée évitée → -Z g iode, -W kg CO₂ via Green Radiology déjà en place)
- Étapes automatisées (compteur)

Données : constantes par cas dans `src/demo/cases/*.ts`, agrégat affiché sur `/demo` index.

---

## P4 — Simplifier l'architecture UX

Audit + regroupement modéré (niveau 3) :
- **Nav principale réduite à 5 entrées** : Démo · Patients · Imagerie · Décision · Suivi
- Tout ce qui est R&D / Innovation Lab / Hardware Designer / Sequence Builder / Simulation Lab → regroupés sous un seul item **« Recherche »** (sous-menu)
- Marquage `BETA` cohérent sur les modules non cliniques
- Aucun module supprimé, juste déplacé

Livrable : refonte de `AppLayout` sidebar + breadcrumb cohérent.

---

## P5 — Cohérence visuelle (niveau 3)

- Audit des tokens HSL utilisés vs codés en dur → migration des écarts vers `index.css`
- Uniformisation des bannières "RESEARCH PROTOCOL" / "DEMO" / "BETA" via un seul composant `<ContextBanner variant="..." />`
- Espacements et radius harmonisés sur cards, tables, panels (3 tailles : sm/md/lg)
- Pas de refonte du design system, pas de changement de palette

---

## P6 — Réduire les gadgets (niveau 3)

- Audit des pages peu utilisées (analytics si dispo, sinon heuristique)
- Modules candidats à masquer derrière feature flag `?lab=1` : Hardware Designer, Sequence Builder, Simulation Lab, AIRecon (à confirmer après audit)
- Aucune suppression de code, juste hiding conditionnel dans la nav

---

## P7 — Transparence scientifique

- Section **« Science & Méthode »** sur la Landing
- Reprendre les paramètres officiels de l'étude L1 (mem://study/l1-clinical-parameters)
- Bandeau « Free Open Beta » consolidé (mem rule existante)
- Page `/method` dédiée : protocole L1, sample size, primary endpoint, comparator, MICE m=20, DSMB triggers, positionnement v8.3 (chaîne visuelle uniquement)
- Lien depuis footer + depuis chaque cas clinique

---

## Séquencement et livraison

```
Lot 2 (démo branchée)     → 1 message
P1 (phrase produit)        → 1 message (visual_choice + impl)
P2 (4 cas restants)        → 2-3 messages (2 cas / message)
P3 (impact workflow)       → 1 message
P4 (nav simplifiée)        → 1 message
P5 (cohérence visuelle)    → 1-2 messages
P6 (gadgets cachés)        → 1 message (après audit)
P7 (transparence)          → 1 message
```

**Hors scope global :**
- Pas de nouvelles tables Supabase
- Pas de nouveaux modules cliniques
- Pas de refonte du design system
- Pas de suppression de code existant
- Pas de revendication de supériorité vs MRI/MRA/CTA (règle v8.3)

---

## Détails techniques

- **Démo data** : extension de `src/demo/aomiFragileCase.ts` vers `src/demo/cases/index.ts` regroupant les 5 cas (`satisfies DemoCase`).
- **Composants demo-ready** : ajout systématique d'une prop optionnelle `demoData?: DemoCase` aux pages cibles (`DigitalTwin`, `FusionViewer`, `L1DecisionBoard`, `ProcedurePlanner`, `VascScreenResults`, `Registry`). Si présente, hooks Supabase court-circuités via early-return de données mockées.
- **i18n** : clés `demo.cases.{caseId}.*`, `landing.tagline.{a|b|c}`, `nav.research` (regroupement P4).
- **Feature flag P6** : lecture de `URLSearchParams.get('lab') === '1'` dans `AppLayout` ; persistance optionnelle en `localStorage`.
- **Pas de migration DB**, pas de nouvel edge function.
