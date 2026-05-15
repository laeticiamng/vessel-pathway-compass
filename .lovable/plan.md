## V8.3 — Plan d'exécution séquencé (1 phase = 1 objectif = 1 test)

Le ticket réoriente la plateforme autour de la **distinction geste mécanique vs chaîne visuelle 4-zéro** (L1/L2/L3/Post-PhD), introduit RSVP, 4 cas CDS unifiés, page Global Health/OMS, disclaimers v8.3 renforcés, et un audit clinique avec indicateurs OMS-compatibles. Voici le découpage que je propose, dans l'ordre d'exécution. Chaque phase est mergeable seule.

---

### Phase 0 — Cadrage & métadonnées (≈30 min)
- Bump `package.json` → `0.8.3`, `src/lib/appVersion.ts`.
- `index.html` : nouveau `<title>` + meta description v8.3 + JSON-LD mis à jour.
- Mémoires Lovable : ajouter `mem://positioning/visual-chain-v8.3` (4-zero, geste mécanique inchangé, L1/L2/L3, vision OMS) — devient règle Core.
- **Test** : `scripts/check-version-consistency.mjs` vert.

### Phase 1 — Disclaimer v8.3 + acceptation persistante
- `src/components/MedicalDisclaimerStrong.tsx` (bandeau permanent + variante modale).
- `src/hooks/useDisclaimerAcceptance.ts` (clé `vlink_disclaimer_accepted_v83`).
- i18n en/fr/de des 9 puces + qualification professionnelle.
- Bandeau monté sur les futures routes `/cds/*` et `/visual-chain`.
- **Test** : unit Vitest sur le hook (1ʳᵉ visite → modal ; refus → blocage CDS).

### Phase 2 — Toggle "Low-resource mode" global
- `src/hooks/useLowResourceMode.ts` (`localStorage['vlink_low_resource_mode']`).
- Insertion d'un toggle a11y dans le header sculptural existant (AppLayout + Landing header).
- Diffusion via Context pour CDS et `/rsvp`.
- **Test** : E2E court — toggle persiste après reload, force RSVP Niveau 1.

### Phase 3 — Page pivot `/visual-chain` ⭐
- `src/pages/VisualChain.tsx` + `src/components/visual-chain/{LevelCard,CostFootprintTable}.tsx`.
- 4 cards L1/L2/L3/Post-PhD avec badges de statut (sources réutilisent `ResearchPreviewBadge`).
- Tableau coût/empreinte avec sources DOI/PMID cliquables.
- Phrases signature (haut + bas) en 3 langues.
- Route publique + lien depuis Landing + sidebar.
- **Test** : E2E `e2e/visual-chain.spec.ts` (4 cards, tableau, phrase signature, a11y nav).

### Phase 4 — Module RSVP `/rsvp`
- `src/pages/RSVP.tsx` + `src/components/rsvp/{ResourceLevelSelector,Level1Pathway,Level2Pathway,Level3Pathway}.tsx`.
- Sélecteur visuel 3 niveaux + algo + critères d'escalade + red flags + tableau coût/délai/transposabilité LMIC.
- Synchro avec Low-resource mode.
- **Test** : E2E sélection des 3 niveaux + assertion contenu unique par niveau.

### Phase 5 — Calculateurs cliniques sourcés
- `src/lib/calculators/{mehran2004,ckdEpi2021,wellsDVT,c4i}.ts`, chaque fichier avec PMID en commentaire et tests Vitest exhaustifs (cas-pivots issus des publis).
- **Test** : `src/test/calculators.test.ts` couvre Mehran (4 vignettes), CKD-EPI (homme/femme, ethnies retirées 2021), Wells DVT (low/mod/high).

### Phase 6 — Couche `ClinicalDecisionLayer` + audit Supabase
- `src/components/cds/ClinicalDecisionLayer.tsx` (layout commun : disclaimer, RSVP, inputs, outputs, références footer).
- Migration Supabase : table `clinical_decisions_log` + RLS (insert pour user authentifié, select limité à son user_id) + politique d'audit immuable.
- Hook `useClinicalDecisionLog.ts` pour persister chaque décision.
- **Test** : Vitest sur le builder de payload + linter Supabase OK.

### Phase 7 — Cas CDS 1 : `/cds/aomi-prerevasc` (cas central)
- Page `src/pages/cds/AOMIPreRevasc.tsx` consommant `ClinicalDecisionLayer`, `mehran2004`, `ckdEpi2021`, `c4i`.
- 5 catégories de décision + score de confiance 4-zéro + alternatives RSVP.
- Bouton export PDF (réutilise pdf-builders).
- **Test** : E2E avec cas factice ticket §14.3 → décision rendue + flag Gd.

### Phase 8 — Cas CDS 2 : `/cds/ciaki-risk`
- Refonte `CIAKIEngine` existant en page publique `/cds/ciaki-risk` (alias + redirection app).
- Mise au standard `ClinicalDecisionLayer`.
- **Test** : Vitest score Mehran sur 4 vignettes.

### Phase 9 — Cas CDS 3 : `/cds/dvt-triage`
- Page neuve avec `wellsDVT` + arbre décisionnel + références.
- **Test** : E2E low/moderate/high.

*(Stroke Triage MVP+1 → exclu, conformément au ticket.)*

### Phase 10 — Page `/global-health`
- 4 sections (burden / imaging scarcity / why visual chain / transposability + disclaimer aspirational).
- Citations sourcées (Song 2019, Heye 2020, Thiel 2024).
- i18n en/fr/de complet.
- **Test** : E2E rapide + scan i18n.

### Phase 11 — Sidebar & menu v8.3
- Refonte `AppSidebar.tsx` selon §2.1 (sections : Visual Chain, RSVP, CDS, Research Tools, Global Health, Methodology).
- Ajout entrée publique "Visual Chain" sur la nav Landing/AppLayout (SculpturalLink).
- **Test** : E2E header présent, structure groupée, focus order conservé.

### Phase 12 — Audit dashboard `/research/audit` (visual chain)
- Section dans Research/Audit existant : distribution décisions, taux d'évitement Gd/iode, override, indicateurs OMS (delay-to-decision, exposition évitée).
- Source: `clinical_decisions_log` via vues SQL agrégées.
- **Test** : Vitest sur agrégations + rendu cards.

### Phase 13 — i18n strict + screenshots + checks finaux
- ~100 nouvelles clés dans `src/i18n/{en,fr,de}.ts`.
- Lance `scripts/i18n-strict-check.mjs`, `scripts/check-design-system.mjs`, `vitest`, `playwright` (suites existantes + nouvelles).
- Génère les 8 captures demandées (Home, /visual-chain, /rsvp ×3, /cds/*, /global-health, /research/audit) → `/mnt/documents/v8.3-screenshots/`.

---

### Détails techniques

**Routing public ajouté** : `/visual-chain`, `/rsvp`, `/cds/aomi-prerevasc`, `/cds/ciaki-risk`, `/cds/dvt-triage`, `/global-health`. Tous via `PublicAppRoute` ou route publique simple selon que ContentGate s'applique (CDS = ContentGate, Visual Chain et Global Health = publics).

**Réutilisation de l'existant** :
- `RegulatoryDisclaimer` → conservé pour la couche réglementaire générique. `MedicalDisclaimerStrong` est plus fort et CDS-spécifique.
- `CIAKIEngine` interne → wrappé par `/cds/ciaki-risk`.
- Sculpture/SculpturalLink/Breadcrumbs → utilisés sur les nouvelles pages publiques.

**Supabase** :
```sql
create table public.clinical_decisions_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  case_type text not null check (case_type in ('aomi_prerevasc','ciaki_risk','dvt_triage','stroke_triage')),
  resource_level int not null check (resource_level in (1,2,3)),
  inputs jsonb not null,
  outputs jsonb not null,
  decision_rendered text not null,
  imaging_avoided_type text check (imaging_avoided_type in ('gd','iodine','none')),
  override_applied boolean not null default false,
  override_reason text
);
alter table public.clinical_decisions_log enable row level security;
create policy "own_decisions_select" on public.clinical_decisions_log
  for select to authenticated using (auth.uid() = user_id);
create policy "own_decisions_insert" on public.clinical_decisions_log
  for insert to authenticated with check (auth.uid() = user_id);
-- pas d'update/delete : audit immuable
```

**Garde-fous respectés** :
- Aucune animation parallax/Lenis sur pages CDS (formulaires patients).
- Tokens HSL uniquement, jamais de couleur en dur.
- `prefers-reduced-motion` → fallback statique.
- WCAG AA conservé sur le header sculptural existant.
- Pas de Stroke Triage (gardé MVP+1).
- Pas de modification des schémas réservés Supabase.

---

### Livraison

Je propose d'enchaîner **Phases 0 → 4** dans une première salve (cadrage + disclaimer + toggle + Visual Chain + RSVP) — c'est le socle visible qui démontre déjà la vision v8.3. Puis on enchaîne **Phases 5 → 9** (calculateurs + CDS), enfin **Phases 10 → 13** (Global Health, sidebar, audit, i18n+QA).

Confirme et je lance la **Phase 0+1+2** dans la foulée. Si tu veux modifier l'ordre, regrouper, ou écarter une phase, dis-le maintenant.