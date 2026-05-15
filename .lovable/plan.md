## P1 — Visual Chain Engine (MVP complet)

Backend qui orchestre la chaîne visuelle L1/L2/L3/Post-PhD côté serveur, alimente la page `/visual-chain` avec des données réelles (au lieu du contenu statique actuel) et expose des évaluations par cas patient.

### Périmètre

**1 nouvelle table** + **1 RPC** + **1 edge function** + **mise à jour `/visual-chain`** + **i18n EN/FR/DE**.

Pas de modification du geste mécanique. Aucune revendication de supériorité (Core rule v8.3).

### Schéma BD

Table `public.visual_chain_assessments`
- `id` uuid PK
- `case_id` uuid → `cases(id)` cascade (nullable pour évaluations standalone)
- `created_by` uuid (auth.users)
- `institution_id` uuid (nullable, repris du case)
- `current_layer` text CHECK in (`L1`,`L2`,`L3`,`Post-PhD`)
- `recommended_layer` text (calculé)
- `inputs` jsonb (résultats Doppler/écho, contre-indications, ressources dispo)
- `score` jsonb (4-zero rule: zero_contrast/zero_radiation/zero_invasive/zero_anesthesia booleans + raisons)
- `rationale` text
- `created_at`, `updated_at`

RLS:
- SELECT/INSERT/UPDATE: créateur ou même institution (via `user_institution_ids`)
- super_admin/admin: full access via `has_role`
- DELETE: créateur ou super_admin

Index: `(case_id)`, `(created_by)`, `(institution_id, created_at DESC)`.

Trigger `update_updated_at_column` (existante).

### Logique serveur

RPC `public.compute_visual_chain_recommendation(_inputs jsonb)` (SECURITY DEFINER, STABLE):
- Lit `_inputs` (resource_level disponible, contre-indications, qualité écho)
- Applique les règles v8.3 (mémoire `visual-chain-v8.3`):
  - L1 par défaut si zéro contraste possible et écho concluante
  - L2 si besoin de cartographie complémentaire non-iodée
  - L3 si confirmation pré-geste indispensable
  - Post-PhD si recherche/audit
- Retourne `{ recommended_layer, score, rationale }`

### Edge Function

`supabase/functions/visual-chain-engine/index.ts`
- `verify_jwt = true` (Core rule)
- `https://esm.sh/` imports (Core rule)
- Validation Zod du body
- Vérifie rôle (`physician`/`admin`/`super_admin`)
- POST: appelle la RPC, persiste dans `visual_chain_assessments`, log dans `governance_events` (catégorie `visual_chain`, action `assessment.created`)
- GET `?case_id=` : liste des évaluations d'un cas (filtré serveur, défense en profondeur)

### UI `/visual-chain`

Conserve la page statique existante (positionnement v8.3) et ajoute en bas:
- Section « Assessment Engine » (auth requise)
- Formulaire: niveau de ressources dispo, contre-indications (checkboxes), qualité écho
- Bouton « Évaluer » → appel `supabase.functions.invoke('visual-chain-engine')`
- Affichage résultat: layer recommandée, badges 4-zero, rationale
- Si non-auth: CTA `/auth`

Pas d'entrée dans patients/cases dans cette itération (lien optionnel via param `?case_id=`).

### i18n

Clés ajoutées dans `src/i18n/locales/{en,fr,de}.json` sous `visualChain.engine.*` (titre section, labels formulaire, messages, badges 4-zero). Respect strict EN/FR/DE (Core rule).

### Tests / vérifications

1. Migration appliquée → linter OK
2. `tsc --noEmit` OK
3. `npm run build` OK
4. `curl_edge_functions` POST avec body de test → 200 + assessment persisté
5. UI: soumission formulaire affiche résultat sans erreur console
6. RLS: lecture cross-institution refusée

### Hors périmètre (P1)

- Visualisation timeline des assessments (P2)
- Export PDF (P3)
- Intégration L1 Decision Board page existante (suit après validation P1)
- Modèle ML pour scoring (Post-PhD/recherche)
