# Plan — Research Evidence : page de crédibilité scientifique unifiée

## Constat

Le projet a déjà 5 pages liées à la rigueur scientifique, mais éparses :
- `/methodology` (378 l.) — méthode statistique
- `/transparence` (747 l.) — transparence globale
- `/audit-limitations` (273 l.) — limites d'audit
- `/protocol` (309 l.) — protocole L1
- `/sap` (144 l.) — Statistical Analysis Plan

Aucune ne couvre **explicitement** ce que demande l'utilisateur : un **hub "Research Evidence"** qui rassemble en un coup d'œil hypothèses, limites, statut expérimental, niveau de validation, références, simulé-vs-réel, prospectif.

## Proposition

Créer une **nouvelle page `/research-evidence`** qui sert de **dashboard de crédibilité scientifique** — pas un duplicata, mais un **index synthétique** avec liens profonds vers les pages détaillées existantes.

### Structure de la page (7 sections, dans l'ordre demandé)

1. **Hypothèses** — Liste structurée des hypothèses cliniques et techniques du projet (chaîne visuelle v8.3, AquaMR sans iode, Digital Twin 18 segments, raisonnement L1).
2. **Limites** — Limites connues : taille d'échantillon, biais de sélection, généralisabilité, dépendance aux questionnaires en anglais, etc. → lien vers `/audit-limitations`.
3. **Statut expérimental** — Bandeau clair "Free Open Beta · Not a medical device · No CE/FDA clearance" + tableau du statut de chaque module (clinique en routine / pilote / R&D / prospectif).
4. **Niveau de validation** — Échelle TRL adaptée (TRL 1-9) appliquée à chaque module phare avec justification courte. Référence aux paramètres officiels de l'étude L1 (sample size, primary endpoint, MICE m=20, DSMB triggers).
5. **Références** — Bibliographie ciblée : VascuQoL-6, CIVIQ-14, CFS, Mehran score, Rutherford, guidelines ESVS/SVS. Citation format Vancouver, liens DOI/PMID quand disponibles.
6. **Simulé vs Réel** — Tableau explicite par module : ce qui est mesuré sur patients réels, ce qui est simulé/synthétique, ce qui est démo pédagogique (ex. cas Mme R.).
7. **Prospectif** — Roadmap scientifique : ce qui sera évalué dans l'étude L1, calendrier, jalons DSMB, publications attendues.

### Architecture technique

- **1 nouveau fichier** : `src/pages/ResearchEvidence.tsx` (~ 400-500 lignes, structuré en sous-sections au sein du même fichier — pas d'éparpillement).
- **1 route ajoutée** dans `src/App.tsx` : `/research-evidence` (public, lazy-loaded).
- **Aucune modif** des pages existantes (`/methodology`, `/transparency`, etc.) — uniquement des liens entrants depuis la nouvelle page.
- **Source unique de vérité** : réutilise la mémoire `mem://study/l1-clinical-parameters` pour les nombres officiels (sample size, primary endpoint, MICE m=20, DSMB triggers). Tous les paramètres L1 hardcodés dans des constantes en haut de fichier avec commentaire « source of truth: L1 clinical parameters memory ».
- **SEO** : `SEOHead` avec title "Research Evidence — Niveau de validation et limites · VASCU-LINK".
- **i18n** : clés sous `researchEvidence.*` (EN/FR/DE), mais conformité mémoire core : les questionnaires cités (VascuQoL-6, CIVIQ-14) restent en anglais.
- **Lien depuis le footer** sous "Science" + lien depuis la bannière DEMO (`DemoStepShell`) pour fermer la boucle « pourquoi croire à cette démo ».

### Composants internes (au sein du fichier)

- `<EvidenceSection title icon>` — wrapper sémantique pour les 7 sections.
- `<StatusBadge level="clinical|pilot|rd|prospective">` — pastille colorée.
- `<TRLChip value={1..9}>` — niveau de maturité technologique.
- `<RefItem authors year title journal doi>` — entrée bibliographique.

### Critères d'acceptation

- Page accessible publiquement à `/research-evidence` en 1 clic depuis footer + bannière DEMO.
- Les 7 sections sont présentes, distinctes, dans l'ordre demandé.
- Chaque module phare a un statut explicite (clinique / pilote / R&D / prospectif) **et** un TRL.
- Le tableau « simulé vs réel » couvre au minimum : VascScreen, AquaMR, Digital Twin, L1 Board, PROMs, démo AOMI.
- Aucune revendication de supériorité vs MRI/MRA/CTA/angiographie (règle v8.3).
- Bannière "Free Open Beta · Not a medical device" visible above the fold.
- Tous les nombres L1 (sample size, primary endpoint, etc.) cohérents avec la mémoire `mem://study/l1-clinical-parameters`.

## Hors scope

- Pas de refonte de `/methodology`, `/transparency`, `/audit-limitations`, `/protocol`, `/sap` (cette page **renvoie** vers elles, ne les remplace pas).
- Pas de nouvelle table Supabase, pas d'edge function.
- Pas de design system refait (réutilise les tokens HSL et composants shadcn existants).
- Pas de modification de la nav principale (uniquement footer + bannière DEMO).
- Pas de changement du protocole L1 lui-même (juste affichage des paramètres existants).

## Livrable

Un seul message implémentant la page complète + la route + les 2 liens entrants (footer, DemoStepShell).
