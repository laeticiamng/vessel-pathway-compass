# AquaMR Flow — Architecture & Gouvernance

> Document d'architecture domain-driven et de gouvernance. Mis à jour : 2026-04.

## 1. Vision système

AquaMR Flow est une plateforme clinique **multi-tenants (institutions)**, **multi-personas**, traitant des données de santé sensibles (PHI/PD) sous contraintes **RGPD**, **MDR (futur)**, **ISO 14971/13485**. Trois exigences cardinales :

1. **Sécurité par défaut** — RLS systématique, principe du moindre privilège, audit transverse.
2. **Souveraineté de la donnée** — chaque action sensible est tracée, datée, attribuable.
3. **Traçabilité clinique** — toute décision impactant un patient est versionnée et signée.

## 2. Bounded contexts (DDD)

| Contexte | Responsabilité | Tables noyau | Personas |
|---|---|---|---|
| **Identity & Access** | Auth, profils, rôles, institutions, memberships | `auth.users`, `profiles`, `user_roles`, `memberships`, `institutions` | Tous |
| **Clinical** | Patients, cas, mesures, événements cliniques, imaging, outcomes, PROMs | `patients`, `cases`, `case_events`, `measurements`, `imaging_summaries`, `outcomes`, `proms`, `consents` | Physician, Trainee, Expert |
| **Education** | Cours, modules, quizz, simulations, logbook | `courses`, `modules`, `quizzes`, `simulations`, `logbook_entries`, `validations` | Trainee, Physician |
| **Research** | Études, cohortes, exports anonymisés | `studies`, `study_members`, `exports` | Research Lead |
| **Network** | Forum, requêtes d'expertise, votes, réputation | `forum_posts`, `forum_votes`, `expert_requests`, `expert_responses`, `reputation_events` | Tous |
| **AI Assist** | Sorties IA, signoff utilisateur | `ai_outputs` | Physician, Expert |
| **Governance** ⭐ | Audit, signoffs, cycle de vie, RGPD | `audit_logs`, `governance_events`, `clinical_signoffs`, `data_lifecycle_policies`, `rgpd_requests` | DPO, Super Admin, Hospital Admin |
| **Billing** | Stripe, abonnements | `subscriptions`, `stripe_webhook_events` | Tous |
| **Notifications** | Notifications temps réel, contact | `notifications`, `contact_messages` | Tous |

> Le contexte **Governance** est transverse : il observe et journalise les autres contextes sans les coupler.

## 3. Matrice RBAC

| Rôle | Clinical | Education | Research | Network | AI | Governance |
|---|---|---|---|---|---|---|
| **trainee** | R own | R+W | R | R+W | R+W | R own |
| **physician** | R+W own/inst | R+W | R+W (member) | R+W | R+W | R own |
| **expert_reviewer** | R inst + cosign | R | R | R+W | R | R signoffs |
| **research_lead** | R study cohort | R | R+W own | R | R | R own |
| **hospital_admin** | R inst | R | R inst | R+W | R | R inst events |
| **admin** | R all | R+W | R+W | R+W | R | R+W (DPO) |
| **super_admin** | R+W all | R+W all | R+W all | R+W all | R+W all | R+W all + policies |

R = Read, W = Write, *own* = ses données, *inst* = institution, *study cohort* = membre étude.

## 4. Architecture Decision Records (ADR)

### ADR-001 — Audit transverse via `governance_events`
**Contexte** : `audit_logs` existe mais n'est pas systématiquement alimenté.  
**Décision** : créer `governance_events` typée (catégorie/action/sévérité) + helper SQL `log_governance_event()` + hook React `useAuditLog()`. Chaque mutation sensible appelle ce hook.  
**Conséquence** : journal central exploitable par le dashboard DPO sans toucher au code métier.

### ADR-002 — Double validation clinique via `clinical_signoffs`
**Contexte** : MDR exige une chaîne de responsabilité sur les décisions cliniques.  
**Décision** : table `clinical_signoffs` avec `signed_by` + `cosigned_by` optionnel ; expert reviewer peut cosigner.  
**Conséquence** : workflow d'attestation auditable pour cases, AI outputs, outcomes.

### ADR-003 — Cycle de vie via `data_lifecycle_policies`
**Contexte** : RGPD impose des durées de conservation par type de donnée.  
**Décision** : table de politique versionnée + cron quotidien (déjà en place pour `patients`) à généraliser.  
**Conséquence** : conformité documentée et automatisable.

### ADR-004 — Demandes RGPD self-service via `rgpd_requests`
**Contexte** : droit d'accès / portabilité / effacement RGPD art. 15-22.  
**Décision** : utilisateur soumet une demande typée, DPO traite dans 30 jours (due_date auto).  
**Conséquence** : preuve de respect des délais légaux.

### ADR-005 — Pas de FK vers `auth.users`
**Contexte** : `auth.users` est managé par Supabase, FK fragiles.  
**Décision** : on stocke des `uuid` simples côté `actor_id`, `target_user_id`, `signed_by`. RLS via `auth.uid()`.  
**Conséquence** : robustesse aux migrations Supabase.

### ADR-006 — Rôles dans `user_roles` (jamais sur `profiles`)
**Contexte** : risque de privilege escalation.  
**Décision** : `user_roles` + fonction `has_role()` SECURITY DEFINER. RLS via `has_role()`.  
**Conséquence** : impossible pour un utilisateur d'auto-promouvoir son rôle.

### ADR-007 — Event sourcing léger via `case_revisions`
**Contexte** : MDR / IEC 62304 exigent une traçabilité immuable des modifications cliniques.
**Décision** : table append-only `case_revisions` alimentée par trigger `capture_case_revision()` sur `cases`. Aucun INSERT/UPDATE/DELETE depuis le client. Snapshot `previous` + `new` + diff structuré dans `changed_fields`.
**Conséquence** : timeline versionnée disponible dans `PatientDetail` ; reconstitution complète possible à tout instant ; preuve d'intégrité opposable.

### ADR-008 — Score de conformité agrégé via RPC `compliance_score()`
**Contexte** : besoin d'une métrique unique pour piloter la conformité (RGPD/MDR/ISO 14971) sans agrégation côté client.
**Décision** : fonction SECURITY DEFINER calculant 5 sous-scores pondérés (DPIA 25 / RGPD 25 / signoffs eIDAS 25 / anomalies 15 / lifecycle 10) → note 0-100 + grade A→E. Restreinte aux DPO/super_admin.
**Conséquence** : KPI exécutif unique, refresh 60 s, exposable en API future pour tableau de bord direction.

### ADR-009 — Gel de compte via `freeze_user_account()`
**Contexte** : incident RH ou sécurité → besoin de suspendre instantanément tous les rôles applicatifs sans supprimer le compte.
**Décision** : RPC SECURITY DEFINER qui (1) collecte les rôles, (2) les supprime atomiquement, (3) journalise l'action en sévérité `critical` avec motif obligatoire. Réservée à `super_admin`. Auto-protection : impossible de geler son propre compte.
**Conséquence** : réponse à incident en 1 clic, traçabilité complète, réversibilité par réattribution manuelle des rôles.

## 5. Couche audit applicative

```
┌─────────────────────────────────────┐
│  Composant React (mutation)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  useAuditLog().log(category, action)│
└──────────────┬──────────────────────┘
               │ supabase.rpc('log_governance_event', …)
               ▼
┌─────────────────────────────────────┐
│  governance_events (RLS)            │
└──────────────┬──────────────────────┘
               │ realtime
               ▼
┌─────────────────────────────────────┐
│  Dashboard /app/governance (DPO)    │
└─────────────────────────────────────┘
```

**Règle d'or** : toute mutation des contextes Clinical / Research / AI / Identity doit appeler `useAuditLog().log()`.

## 6. Roadmap priorisée

### P0 — Fondations (livré dans cette itération)
- ✅ Tables `governance_events`, `clinical_signoffs`, `data_lifecycle_policies`, `rgpd_requests` + RLS
- ✅ Helpers SQL `log_governance_event()`, `count_pending_signoffs()`
- ✅ Hook `useAuditLog()`
- ✅ Dashboard `/app/governance` multi-onglets (DPO, Hospital Admin, Research Lead, Expert Reviewer)
- ✅ HIBP activé
- ✅ Demandes RGPD self-service (page Settings)

### P1 — Industrialisation (prochaine itération)
- [ ] Instrumenter toutes les mutations Patient/Case/AI avec `useAuditLog`
- [ ] Workflow signoff intégré dans `PatientDetail` et `CIAKIEngine`
- [ ] Edge function `export-user-data` (zip JSON + CSV pour droit accès RGPD)
- [ ] Cron généralisé sur `data_lifecycle_policies` (pas seulement patients)
- [ ] Page `/app/governance/audit-search` avec filtres avancés

### P2 — Conformité avancée
- [ ] Signature électronique qualifiée (eIDAS) pour signoffs critiques
- [ ] Export registre des traitements (RGPD art. 30) en PDF
- [ ] Détection d'anomalie sur `governance_events` (accès massifs, exports inhabituels)
- [ ] DPIA (Data Protection Impact Assessment) workflow
- [ ] Préparation IEC 62304 (SOUP, traçabilité exigences ↔ tests)

### P2 — Conformité avancée (livré)
- ✅ Signature électronique qualifiée (eIDAS substantiel) via `sign_with_eidas()` — hash SHA-256 + timestamp RFC3161-compatible
- ✅ Export registre des traitements (RGPD art. 30) en PDF (`ProcessingRegisterButton`)
- ✅ Détection d'anomalie sur `governance_events` via vue `governance_anomalies`
- ✅ DPIA workflow complet (`dpia_assessments` + page `/app/governance/dpia` + export PDF)
- ✅ Notification temps réel DPO sur événement critique (trigger `notify_dpo_on_critical_event`)
- ✅ Cycle de vie automatisé via cron `enforce_data_lifecycle()` quotidien

### P3 — Observabilité & RBAC avancé (livré)
- ✅ Dashboard santé système `/app/admin/system-health` (RPC `system_health_metrics()`, refresh 30 s)
- ✅ Page UI politiques cycle de vie `/app/governance/policies` avec preview d'impact
- ✅ Gestion utilisateurs `/app/admin/users` (RPC `list_users_with_activity` + assign/revoke)
- ✅ Recherche audit avancée `/app/governance/audit-search` avec export CSV

### P4 — Event sourcing & gouvernance exécutive (livré)
- ✅ Event sourcing léger sur `cases` via `case_revisions` immuable + trigger
- ✅ Timeline versionnée intégrée dans `PatientDetail` (onglet "Historique versionné")
- ✅ Score de conformité global `/app/governance/compliance` (5 sous-scores + grade A-E)
- ✅ Gel de compte via `freeze_user_account()` + bouton dans `UsersAdmin` (action critical)

### P5 — Scale & certification
- [ ] Bounded context `Billing` séparé en edge functions dédiées
- [ ] Multi-région avec data residency par institution
- [ ] Préparation IEC 62304 (SOUP, traçabilité exigences ↔ tests)
- [ ] Reconstitution d'état historique d'un case à instant T (replay des `case_revisions`)
- [ ] Export "compliance pack" PDF (score + DPIA + registre + anomalies 30 j) pour audit externe

## 7. Conventions techniques

- **Code applicatif** : aucun appel direct à `audit_logs.insert()` — passer par `useAuditLog()`.
- **Edge functions** : appeler `log_governance_event()` via service role pour les actions backend (Stripe webhook, cleanup cron…).
- **Rôles** : nouveaux rôles ajoutés dans `app_role` enum + colonne `user_roles.role` + politique RLS.
- **Migrations** : jamais d'`ALTER` sur `auth.*`, `storage.*`, `realtime.*`.
- **RLS** : toujours via `has_role()` (jamais de sous-requête sur la même table).

## 8. Glossaire

- **PHI** : Protected Health Information.
- **DPO** : Data Protection Officer (mappé sur rôle `admin`/`super_admin`).
- **Signoff** : acte de validation médicale tracé, daté, attribuable.
- **Cosign** : seconde validation par un expert reviewer.
- **RGPD self-service** : capacité utilisateur à exercer ses droits sans contact humain.
