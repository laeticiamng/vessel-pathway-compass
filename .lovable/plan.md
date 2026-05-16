## Objectif

Transformer la démo unique "Mme R." en un véritable **mode Clinical Case** : une bibliothèque de 3 cas fictifs contrastés, chacun exposant patient, symptômes, Doppler, facteurs de risque, arbitrage L1/L2/L3, justification et suivi longitudinal. Réutilise l'infrastructure démo existante (panels, `DemoStepShell`) — aucune logique métier nouvelle, uniquement données + routing + 2 écrans.

## Pourquoi

Aujourd'hui un seul cas → on voit un système. Avec 3 cas contrastés (L1 fragile, L2 intermédiaire, L3 complexe) → on comprend instantanément **à quoi sert la plateforme** et **comment elle arbitre**.

## Livrables

### 1. Données — 3 cas contrastés (fictifs)

Nouveau fichier `src/demo/clinicalCases.ts` exportant `CLINICAL_CASES`, basé sur le type `DemoCase` existant **étendu** avec :

- `symptoms: string[]` (claudication, douleur de repos, ulcère…)
- `doppler: { abiRight, abiLeft, tbiRight?, tbiLeft?, waveform: "triphasique"|"biphasique"|"monophasique"|"absent", peakSystolicVelocityCmS?, notes }`
- `riskFactors: { diabetes, smoking, hypertension, dyslipidemia, ckd, priorMI, priorStroke, antiplatelet }`
- `longitudinalFollowUp: { m1, m3, m6, m12 }` avec pour chaque jalon : événement clinique, VascuQoL-6, distance de marche, ré-intervention oui/non
- `triageJustification: string` (texte court expliquant pourquoi L1/L2/L3)

Les 3 cas :

| ID | Profil | Niveau | Modalité | Particularité pédagogique |
|---|---|---|---|---|
| `mme-r-aomi-fragile` | F 82 ans, CKD 3b, allergie iode, ulcère | **L1** | AquaMR | Reprend Mme R. — contraste contre-indiqué |
| `m-d-claudicant` | H 64 ans, diabétique, tabagique actif, claudication 200 m | **L2** | CTA standard | Cas "courant" — arbitrage médical vs endovasculaire |
| `m-b-multietage` | H 71 ans, lésions multi-étagées aorto-iliaques + fémoro-poplitées | **L3** | DSA + planification hybride | Décision multidisciplinaire complexe |

Données 100% fictives, marquées DEMO, aucune persistance.

### 2. Page index — `/demo/clinical-cases`

Nouveau `src/pages/demo/ClinicalCases.tsx` (~120 lignes) :

- Hero court : titre, sous-titre, bandeau **"Cas fictifs — usage pédagogique uniquement — Free Open Beta"**
- Grille 3 cartes (une par cas) avec :
  - Initiales + âge + sexe + niveau L1/L2/L3 (badge couleur)
  - 1 phrase de pitch clinique
  - 3 facteurs de risque dominants (chips)
  - Modalité imagerie retenue
  - CTA "Ouvrir le cas →"
- Lien retour Landing / Research evidence

### 3. Runner générique — `/demo/clinical-cases/:caseId`

Nouveau `src/pages/demo/ClinicalCaseRunner.tsx` (~80 lignes) — généralisation de `AomiFragileDemo.tsx` :

- Lit `caseId` via `useParams`, résout via `getClinicalCase(caseId)`
- Si introuvable → redirect vers `/demo/clinical-cases`
- Réutilise **tel quel** `DemoStepShell` + les 6 panels existants (`TriagePanel`, `ImagingPanel`, `TwinPanel`, `DecisionPanel`, `PlanPanel`, `PromsPanel`) en leur passant `caseData` au lieu de la constante figée
- Ajoute une **7ᵉ étape `followup`** alimentée par `longitudinalFollowUp` (timeline M1→M12 simple, SVG horizontal + cards)

### 4. Adaptations panels existants

Les 6 panels actuels importent `AOMI_FRAGILE_CASE` directement. Refactor minimal :

- Chaque panel accepte une prop `case: DemoCase` (au lieu d'importer la constante)
- `AomiFragileDemo.tsx` continue de fonctionner (passe `AOMI_FRAGILE_CASE`) → **rétrocompatible**, l'URL `/demo/aomi-fragile` reste valide
- `TriagePanel` enrichi : affiche `symptoms`, `doppler.waveform`, chips `riskFactors` (champs optionnels — fallback silencieux pour Mme R. tant que pas remplis)
- `DecisionPanel` enrichi : encart "Justification du niveau L1/L2/L3" lisant `triageJustification`

### 5. Nouveau panel — `FollowUpPanel.tsx`

`src/components/demo/panels/FollowUpPanel.tsx` (~150 lignes) :

- Timeline horizontale M1 / M3 / M6 / M12
- Pour chaque jalon : badge événement, VascuQoL-6 (delta vs baseline), distance de marche, flag ré-intervention
- Graphique sparkline VascuQoL-6 (SVG inline, pas de lib)
- Bandeau honnêteté scientifique : "Données simulées, prospectives à 12 mois"

### 6. Routing + intégrations

- `src/App.tsx` : ajout routes lazy publiques
  - `/demo/clinical-cases` → `ClinicalCases`
  - `/demo/clinical-cases/:caseId` → `ClinicalCaseRunner`
  - `/demo/aomi-fragile` conservée (alias historique)
- `Landing.tsx` footer (section Product) : remplacer le lien "Démo AOMI" par **"Bibliothèque de cas cliniques"** pointant `/demo/clinical-cases`
- `ResearchEvidence.tsx` : dans section "Simulé vs Réel", lien "Parcourir les 3 cas pédagogiques →"
- `DemoStepShell` banner : bouton retour "← Tous les cas" quand on est dans un runner

## Hors périmètre

- Aucun nouveau cas réel, aucune table Supabase, aucune edge function
- Pas de comparateur de cas, pas de quiz, pas de scoring utilisateur
- Pas de modification du design system, pas de nouveaux tokens
- Pas de traduction i18n des nouveaux libellés en DE (FR + EN suffit pour cette itération — la 3ᵉ langue suivra si validé)
- Pas de changement aux questionnaires cliniques (VascuQoL-6 reste EN)

## Détails techniques

```text
src/
├── demo/
│   ├── aomiFragileCase.ts          (conservé, type DemoCase étendu)
│   └── clinicalCases.ts            (nouveau — registre + 3 cas)
├── pages/demo/
│   ├── AomiFragileDemo.tsx         (refactor : passe case en prop)
│   ├── ClinicalCases.tsx           (nouveau — index)
│   └── ClinicalCaseRunner.tsx      (nouveau — runner générique)
└── components/demo/panels/
    ├── TriagePanel.tsx             (accepte prop case, enrichi)
    ├── DecisionPanel.tsx           (accepte prop case, enrichi)
    ├── {Imaging,Twin,Plan,Proms}Panel.tsx (accepte prop case)
    └── FollowUpPanel.tsx           (nouveau)
```

`DemoStepId` devient `"triage"|"imaging"|"twin"|"decision"|"plan"|"proms"|"followup"`.

Compatibilité v8.3 : tous les cas respectent la règle "chaîne visuelle uniquement", aucune revendication de supériorité diagnostique vs MRI/CTA/DSA. Bandeau "Not a medical device · No CE/FDA" présent sur index et runner.
