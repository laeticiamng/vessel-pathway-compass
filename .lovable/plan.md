
The platform has reached a mature governance state through P0–P5 (audit transverse, signoffs eIDAS, DPIA, lifecycle automation, anomaly detection, compliance scoring, event sourcing, account freeze). The natural next step is **P6: Executive consolidation, temporal replay & continuous compliance monitoring** — turning the foundations into operational, externally-auditable artefacts.

## P6 — Plan : consolidation exécutive & conformité continue

### 1. Compliance Pack PDF (export auditeur externe)
Un seul bouton dans `/app/governance/compliance` génère un PDF consolidé :
- Page 1 : score global + grade A-E + 5 sous-scores (visuel)
- Page 2 : DPIA approuvées (titre, périmètre, risque résiduel)
- Page 3 : registre RGPD art. 30 (politiques cycle de vie)
- Page 4 : anomalies 30 j (vue `governance_anomalies`)
- Page 5 : événements critiques 30 j + signature horodatée du pack
→ Composant `CompliancePackButton.tsx` dans `ComplianceScore.tsx`.

### 2. Historique du score de conformité (90 jours)
- Nouvelle table `compliance_snapshots` (date, score, grade, breakdown jsonb).
- Cron quotidien `pg_cron` qui appelle `compliance_score()` et insère un snapshot.
- Page `/app/governance/compliance` enrichie d'un graphe Recharts (90 j) avec tendance.

### 3. Réactivation de compte gelé
- Bouton `UnfreezeAccountButton` dans `UsersAdmin` (visible uniquement si l'utilisateur n'a aucun rôle).
- RPC `reactivate_user_account(_target, _role, _reason)` : réattribue 1 rôle de base + log `account.reactivated` sévérité `warn`.

### 4. Replay temporel d'un case
- Bouton « Voir à la date… » dans `CaseRevisionsTimeline`.
- Sélecteur de date → reconstitue le snapshot du case à T en parcourant `case_revisions` (déjà immuable, ADR-007).
- Diff visuel vs version actuelle (champ par champ).

### 5. Documentation
- Mise à jour `ARCHITECTURE.md` : ADR-010 (Compliance snapshots), ADR-011 (Replay temporel), roadmap P6 livrée + amorce P7 (multi-région, IEC 62304).

### Contexte technique
| Élément | Type | Détail |
|---|---|---|
| `compliance_snapshots` | table | `id`, `captured_at`, `score`, `grade`, `breakdown jsonb`, RLS DPO/super_admin |
| `snapshot_compliance_score()` | RPC | SECURITY DEFINER, appelée par pg_cron 03:30 UTC |
| `reactivate_user_account()` | RPC | super_admin only, log `identity/account.reactivated` |
| `replay_case_at(case_id, ts)` | RPC | retourne le snapshot reconstruit |
| `CompliancePackButton.tsx` | component | jspdf + jspdf-autotable (déjà installés) |
| `ComplianceTrendChart.tsx` | component | Recharts area chart 90j |
| `CaseReplayDialog.tsx` | component | Dialog + date picker + diff renderer |

### Flux de cron
```text
03:15 UTC → enforce_data_lifecycle()      (déjà en place)
03:30 UTC → snapshot_compliance_score()   (nouveau)
```

### Personas impactés
- **DPO / super_admin** : Compliance Pack + tendance 90 j + réactivation
- **Hospital admin** : lecture des snapshots
- **Physician / expert reviewer** : replay temporel des cases

### Livrables fichiers
- Nouveau : `src/components/governance/CompliancePackButton.tsx`, `src/components/governance/ComplianceTrendChart.tsx`, `src/components/governance/UnfreezeAccountButton.tsx`, `src/components/patient/CaseReplayDialog.tsx`
- Migration SQL : table `compliance_snapshots` + 2 RPC + cron
- Édités : `src/pages/app/ComplianceScore.tsx`, `src/pages/app/UsersAdmin.tsx`, `src/components/patient/CaseRevisionsTimeline.tsx`, `ARCHITECTURE.md`

Aucun secret supplémentaire, aucune dépendance npm nouvelle (jspdf et recharts sont déjà présents).
