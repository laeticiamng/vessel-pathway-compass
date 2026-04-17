
P0–P6 livrés (audit transverse, lifecycle, anomalies, DPIA, eIDAS, event sourcing, compliance pack, replay temporel, snapshots quotidiens). La maturité gouvernance est élevée. Le prochain palier logique est **P7 : Certification & opérations multi-tenant** — passer d'une plateforme conforme à une plateforme **certifiable DM (IEC 62304)** et **opérable à l'échelle hospitalière** (multi-institution avec cloisonnement strict + observabilité SLA).

## P7 — Plan : certification dispositif médical & opérations multi-tenant

### 1. Traçabilité IEC 62304 (SOUP & versioning logiciel)
Norme obligatoire pour toute fonction clinique d'aide à la décision (CI-AKI, ESC 2024, scoring vasculaire).
- Table `software_versions` : `version`, `released_at`, `release_notes`, `risk_class` (A/B/C), `git_sha`, `signed_by`.
- Table `soup_components` (Software Of Unknown Provenance) : `name`, `version`, `license`, `cve_status`, `purpose`, `risk_assessment`.
- Table `clinical_algorithms` : `name`, `version`, `validation_status`, `evidence_url`, `last_review_at`, `reviewer_id`.
- Page `/app/governance/iec62304` : 3 onglets (Versions / SOUP / Algorithmes), export PDF "Technical File".

### 2. Cloisonnement multi-institution renforcé (data residency)
Aujourd'hui : RLS via `user_institution_ids()`. Manque : **vue admin par hôpital** + métriques cloisonnées.
- Table `institution_settings` : `data_region` (eu-west / eu-central), `retention_override_days`, `dpo_contact_email`, `mdr_class` (I/IIa/IIb).
- RPC `institution_health(_institution_id)` : métriques scopées (patients actifs, signoffs en attente, anomalies 7j) — accessible `hospital_admin` de l'institution uniquement.
- Page `/app/admin/institution` (rôle `hospital_admin`) : tableau de bord cloisonné + paramètres + liste des membres.

### 3. SLA & observabilité opérationnelle
- Table `sla_incidents` : `severity` (sev1-4), `started_at`, `resolved_at`, `mttr_minutes`, `affected_users`, `root_cause`, `postmortem_url`.
- Vue `sla_metrics_30d` : disponibilité calculée (uptime %), MTTR moyen, nb incidents par sévérité.
- Widget SLA dans `/app/admin/system-health` : badge uptime + bouton "Déclarer un incident" (super_admin).

### 4. Audit chain-of-custody pour exports
Les exports CSV/PDF actuels ne sont pas traçables après téléchargement.
- Table `export_manifests` : `export_id`, `user_id`, `entity_type`, `row_count`, `sha256`, `purpose`, `expires_at`, `download_count`.
- À chaque export (`AuditSearch.tsx`, `CompliancePackButton`, `ProcessingRegisterButton`, `ResearchExportButton`), insérer un manifest + injecter le hash SHA-256 en pied de page PDF/CSV.
- Page `/app/governance/exports` : historique des exports avec hash, motif déclaré, et alertes si volume suspect (> 5 exports/h).

### 5. Documentation
- `ARCHITECTURE.md` : ADR-012 (IEC 62304), ADR-013 (Multi-tenant data residency), ADR-014 (Export chain-of-custody), ADR-015 (SLA tracking).
- Roadmap P7 livrée + amorce P8 : marquage CE technique file generator + intégration FHIR R5 inbound.

### Contexte technique
| Élément | Type | Détail |
|---|---|---|
| `software_versions` | table | RLS lecture authentifiée, écriture super_admin |
| `soup_components` | table | RLS super_admin only |
| `clinical_algorithms` | table | RLS super_admin write, authenticated read |
| `institution_settings` | table | RLS hospital_admin de l'institution |
| `sla_incidents` | table | RLS super_admin write, authenticated read |
| `export_manifests` | table | RLS user voit ses exports + super_admin tout |
| `institution_health(uuid)` | RPC | check `hospital_admin` + membership |
| `register_export_manifest()` | RPC | appelée par tous les boutons d'export |
| `IEC62304Page.tsx` | page | 3 onglets + export PDF "Technical File" |
| `InstitutionAdmin.tsx` | page | dashboard hospital_admin scopé |
| `ExportsAudit.tsx` | page | historique + détection volume suspect |
| `SLAWidget.tsx` | composant | uptime + MTTR + incidents |

### Personas impactés
- **Super admin / DPO** : technical file IEC 62304, SLA tracking, audit exports global
- **Hospital admin** : dashboard institution scopé + paramètres data residency
- **Tous utilisateurs** : exports désormais signés SHA-256 + motif obligatoire

### Livrables fichiers
- Nouveau : `src/pages/app/IEC62304.tsx`, `src/pages/app/InstitutionAdmin.tsx`, `src/pages/app/ExportsAudit.tsx`, `src/components/admin/SLAWidget.tsx`, `src/components/governance/IECTechnicalFileButton.tsx`, `src/components/governance/ExportManifestRow.tsx`
- Migration SQL : 6 tables + 2 RPC + RLS + seed des 3 algorithmes cliniques existants (CI-AKI, ESC 2024, ABI)
- Édités : `src/App.tsx`, `src/components/layout/AppSidebar.tsx`, `src/pages/app/Governance.tsx`, `src/pages/app/SystemHealth.tsx`, `src/pages/app/AuditSearch.tsx`, `src/components/governance/CompliancePackButton.tsx`, `src/components/governance/ProcessingRegisterButton.tsx`, `ARCHITECTURE.md`

Aucun secret ni dépendance npm supplémentaire (jspdf déjà présent).
