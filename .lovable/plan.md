## Objectif

Rendre l'**AI Reconstruction Lab** (`/app/research/ai-recon`) scientifiquement honnête : remplacer l'apparence "IA magique" par une transparence explicite sur limites, baseline, datasets, provenance des modèles et nature simulée des métriques.

## Diagnostic actuel

`src/pages/app/research/AIRecon.tsx` :
- 4 pipelines listés (Compressed Sensing, U-Net, MoDL, Diffusion) avec 1 référence chacun.
- `simulateProcessing()` génère des métriques aléatoires (`Math.random()`) : SNR gain, acceleration, runtime — **rien n'est calculé**.
- Un seul bandeau ambre "simulation mode" en haut, vite invisible une fois scrollé.
- Aucune baseline, aucun dataset, aucune carte modèle, aucune limite méthodologique affichée.

Risque : un utilisateur peut citer "SNR +5,8 dB en MoDL" comme un résultat de la plateforme alors que c'est `Math.random()`.

## Livrables

### 1. Constantes scientifiques — `src/lib/aiRecon/modelRegistry.ts` (nouveau)

Source unique de vérité, typée, par pipeline :

- `id`, `name`, `family` (classical | supervised-DL | unrolled | generative)
- `provenance` : `paperRef` (Vancouver), `codeRef` (GitHub URL ou "Reimplemented in-house"), `weightsOrigin` ("Pretrained author weights" | "Trained in-house" | "Not loaded — placeholder"), `license`
- `trainingData` : `dataset` (fastMRI / NYU knee, IXI, HCP, "Synthetic only"…), `nSubjects`, `bodyRegion`, `fieldStrength`, `acquisitionType`
- `validationData` : `dataset`, `nSubjects`, `metricsReported` (PSNR / SSIM / NRMSE…)
- `publishedMetrics` : array of `{ metric, value, conditions }` recopiés des papiers (avec citation)
- `domainShift` : texte court — pourquoi les résultats publiés ne s'appliquent pas tels quels au domaine vasculaire MRA
- `limitations` : array de 3-5 limites courtes (ex : "Pas entraîné sur peripheral run-off", "Hallucinations possibles à acceleration > 6×")
- `currentStatus` : "Simulated output only — no GPU backend" | "Inference active"
- `trl` (1-9)

3 pipelines factuellement existants + 1 placeholder honnêtement marqué.

### 2. Baseline obligatoire dans chaque job

Étendre l'objet `results` produit par `simulateProcessing` :

```ts
{
  status: "simulated",                  // explicite
  baseline: {
    method: "Zero-filled IFFT",         // baseline standard
    psnr_db: <calculated or N/A>,
    ssim: <calculated or N/A>
  },
  ai_output: {
    psnr_db, ssim, nrmse,               // toujours marquées "simulated"
  },
  delta_vs_baseline: { ... },           // pour éviter de citer un absolu sans référence
  acquisition_assumptions: { acceleration_factor, undersampling_mask, coil_count },
  not_clinically_valid: true,
  generated_by: "client-side stub v1"
}
```

Ces valeurs restent stub côté front (pas de GPU), mais structurées comme des vraies métriques avec **baseline obligatoire** : on ne peut plus afficher un chiffre sans son point de comparaison.

### 3. Refonte de l'UI AIRecon

`src/pages/app/research/AIRecon.tsx` réorganisé en 3 zones, sans changer le flux d'upload :

- **Bandeau persistant non-dismissible** en tête : "Research preview · Simulated output · Not for clinical use · TRL 3-4". Reste visible sticky pendant le scroll.
- **Onglets** (`Tabs` shadcn) sur la zone pipeline :
  - **Run** (actuel) — upload + launch
  - **Model card** — pour le pipeline sélectionné : provenance, training data, validation data, métriques publiées, limites, domain shift, statut, TRL. Lit `modelRegistry`.
  - **Methodology** — explication baseline (zero-filled IFFT), métriques (PSNR/SSIM/NRMSE définies), conditions de comparaison loyale.
- **Job result card** repensée :
  - Tableau 2 colonnes **Baseline vs AI** (jamais un seul chiffre isolé)
  - Chaque métrique flagged `simulated` avec icône ℹ︎
  - Section "Assumptions" repliée par défaut (acceleration, mask, coil count)
  - Lien "Model card" en bas pour rappeler la provenance
  - Bandeau "Ces résultats ne doivent pas être cités hors contexte recherche"

### 4. Composant réutilisable — `src/components/research/ModelCard.tsx`

Carte structurée avec sections normalisées (Provenance / Training / Validation / Published metrics / Limitations / Domain shift / Status / TRL). Réutilisable depuis Research Evidence.

### 5. Intégration Research Evidence

Dans `src/pages/ResearchEvidence.tsx` :
- Section **3. Statut expérimental** : ajouter une ligne par pipeline IA (4 lignes) lisant `modelRegistry` — TRL réel et statut "Simulated output".
- Section **6. Simulé vs Réel** : ajouter ligne "AI Reconstruction Lab : sortie 100% simulée côté client, pas de GPU, baseline zero-filled IFFT obligatoire."

### 6. Hors périmètre

- Pas de vrai backend GPU, pas d'edge function de reconstruction.
- Pas de modification du schéma `ai_recon_jobs` (les nouveaux champs vivent dans la colonne `results` JSON déjà présente).
- Pas de connexion à fastMRI / dataset externes.
- Pas de changement design system, pas de nouveaux tokens.
- I18n : libellés FR seulement (cohérent avec la page actuelle).

## Détails techniques

```text
src/
├── lib/aiRecon/
│   └── modelRegistry.ts            (nouveau — source de vérité 4 modèles)
├── components/research/
│   └── ModelCard.tsx               (nouveau — carte standardisée)
└── pages/
    ├── app/research/AIRecon.tsx    (refonte UI : tabs Run / Model card / Methodology + résultats avec baseline)
    └── ResearchEvidence.tsx        (lignes IA ajoutées dans TRL table + simulé/réel)
```

Compatibilité v8.3 : aucune revendication de supériorité diagnostique vs MRI/CTA/DSA. Chaque métrique simulée est explicitement marquée. La baseline (zero-filled IFFT) est imposée pour éviter le "chiffre absolu sortant de nulle part".
