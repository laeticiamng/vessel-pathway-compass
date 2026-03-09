

# AUDIT TECHNIQUE COMPLET — VASCULAR ATLAS (Post-corrections)

---

## 1. RESUME EXECUTIF

**Etat global:** Plateforme bien structuree avec des corrections significatives appliquees lors des iterations precedentes (i18n, ContentGate, filtres user, hreflang, AnimatePresence). La majorite des P0 precedents ont ete resolus. Quelques problemes residuels subsistent.

**Niveau de preparation:** ~82% — Nette amelioration. Quelques lacunes P1 restantes.

**Verdict go-live: NON EN L'ETAT** (proche, mais quelques correctifs restent necessaires)

### Top 5 P0 restants

1. **ClinicalPerformance.tsx ligne 92: `proms` query sans filtre user** — `supabase.from("proms").select("id, score, completed_at")` sans `.eq()` ni filtre par case_id. RLS protege mais defense-in-depth absente. Risque si RLS est modifiee.
2. **PatientOutcomes.tsx ligne 136: `toLocaleDateString("en-US")`** hardcode — les dates du chart ignorent la langue active (devrait utiliser la locale courante).
3. **ResearchExportButton.tsx ligne 27: proms query sans filtre user** — `supabase.from("proms").select("id, questionnaire_type, score, case_id")` sans `.eq("created_by")`. Le filtrage se fait cote client via `caseIds.has()` mais toutes les proms sont recuperees du serveur d'abord.
4. **CRON_SECRET manquant** — `cleanup-deleted-patients` ne peut pas etre declenche automatiquement.
5. **OG_IMAGE pointe vers un CDN temporaire Lovable** — `pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/...` pourrait expirer.

### Top 5 P1 restants

1. **Pas de monitoring/observabilite** — pas de Sentry, pas de health endpoint, pas d'analytics.
2. **CORS `Access-Control-Allow-Origin: *`** sur toutes les edge functions — devrait etre restreint au domaine de production.
3. **ErrorBoundary** — textes multilingues statiques (OK) mais le message secondaire est uniquement en anglais ("An unexpected error occurred...").
4. **Questionnaire items VascuQoL-6 et CIVIQ-14** sont en anglais hardcode dans le code source (lignes 23-48 de PatientOutcomes.tsx). Justifie comme "clinical standard" mais les utilisateurs FR/DE voient des items en anglais.
5. **SEOHead BASE_URL = "https://vascular-atlas.com"** — ce domaine n'est probablement pas configure, les canonical URLs pointent vers un domaine inexistant.

---

## 2. TABLEAU D'AUDIT RESIDUEL

| Priorite | Domaine | Fichier/Fonction | Probleme | Risque | Recommandation | Faisable? |
|----------|---------|------------------|----------|--------|----------------|-----------|
| P0 | Data | ClinicalPerformance.tsx:92 | proms query sans filtre user | Toutes les proms du systeme sont recuperees | Ajouter filtre par case_ids de l'user | Oui |
| P0 | i18n | PatientOutcomes.tsx:136 | `toLocaleDateString("en-US")` hardcode | Dates en anglais meme en FR/DE | Utiliser locale dynamique | Oui |
| P0 | Data | ResearchExportButton.tsx:27 | proms query sans filtre serveur | Toutes les proms transitent par le reseau | Filtrer par case_ids cote requete | Oui |
| P1 | Security | Edge functions | CORS `*` | Tout domaine peut appeler les APIs | Restreindre | Non (domaine requis) |
| P1 | SEO | SEOHead.tsx:11 | BASE_URL probablement non configure | Canonicals invalides | Confirmer domaine | Non (decision) |
| P1 | Observability | Global | Pas de monitoring | Erreurs prod invisibles | Ajouter Sentry | Non (service ext.) |
| P2 | i18n | PatientOutcomes.tsx:23-48 | Items questionnaire en anglais | UX inconstante en FR/DE | Decision: traduire ou garder en clinique? | Decision produit |
| P2 | i18n | ErrorBoundary.tsx:43 | Message secondaire anglais only | Incoherence | Ajouter versions FR/DE | Oui |
| P2 | Security | contact-form EF | Honeypot cote client OK mais pas de rate limiting | Spam possible | Rate limiting backend | Non (infra) |
| P3 | SEO | SEOHead.tsx:12 | OG image sur CDN temporaire | Pourrait expirer | Heberger sur domaine propre | Non (domaine) |
| P3 | Perf | Bundle | Recharts + framer-motion + jspdf + html2canvas | Bundle potentiellement lourd | Verifier tree-shaking | P3 |

---

## 3. DETAIL PAR CATEGORIE

### Frontend & Rendu
**Fonctionne:** Toutes les pages rendent correctement. Dark mode coherent. Lazy loading routes. ErrorBoundary fonctionnel. ContentGate ne rend plus les children sans session (corrige). AnimatePresence scroll-to-top corrige.

**Douteux:** Rien de bloquant.

### QA Fonctionnelle
**Fonctionne:** Auth (signup/signin/reset/OAuth Google), onboarding, patient CRUD, PROM submission, risk calculators, clinical dashboard, settings, subscription check.

**Non confirme:** Stripe checkout live, email verification complete, cron cleanup.

### Auth & Autorisations
**Fonctionne:** ProtectedRoute + PublicAppRoute bien structures. ContentGate ne charge plus les composants sans auth. Session refresh auto.

### APIs & Edge Functions
**Fonctionne:** Toutes font la validation JWT dans le code (pattern correct). Stripe webhook verifie la signature.

**Manquant:** CRON_SECRET.

### Database & RLS
**Fonctionne:** RLS RESTRICTIVE sur toutes les tables. `has_role()` SECURITY DEFINER avec search_path. Trigger `handle_new_user()`. `stripe_webhook_events` accessible uniquement par service role.

**Risque mineur:** proms query non filtree dans ClinicalPerformance (RLS protege mais query ramene tout).

### Securite
**OK:** Pas de secrets exposes cote client. Pas de routes admin accessibles. Honeypot contact form. JWT valide dans chaque edge function.

**A surveiller:** CORS `*`, rate limiting absent.

### Paiement & Billing
**Fonctionne:** Architecture coherente (create-checkout, check-subscription, customer-portal, stripe-webhook, verify-checkout-session). PremiumGate. SubscriptionSettingsCard.

**Non confirme:** Mode live vs test.

### i18n
**Corrige:** Sidebar, clinical modules, FHIRBadge, ResearchExport tous traduits via `t()`.

**Residuel:** Dates hardcodees `en-US` dans charts PatientOutcomes. Items questionnaire en anglais (decision clinique).

### SEO
**OK:** SEOHead sur toutes les pages, OG tags, JSON-LD, noindex sur app pages, sitemap, robots.txt.

**Residuel:** BASE_URL pointe vers domaine non confirme. OG image CDN temporaire.

### Performance
**OK:** Lazy loading routes, code splitting.

**A surveiller:** Bundle size (recharts + framer-motion + jspdf + html2canvas).

### Observabilite
**Absent:** Sentry, analytics, health endpoint.

**Present:** audit_logs table, structured logs dans edge functions.

---

## 4. PLAN D'ACTION

### Correctifs immediats (faisables maintenant)
1. **ClinicalPerformance.tsx** — Filtrer proms par case_ids de l'utilisateur (comme fait dans PatientOutcomes)
2. **PatientOutcomes.tsx** — Remplacer `"en-US"` par locale dynamique basee sur la langue active
3. **ResearchExportButton.tsx** — Filtrer proms par `.in("case_id", caseIds)` cote serveur au lieu de filtrage client
4. **ErrorBoundary.tsx** — Ajouter message secondaire trilingue

### Dependances externes
- CRON_SECRET a configurer
- Domaine custom a confirmer (BASE_URL, CORS, OG image)
- Sentry/monitoring a integrer
- Stripe live vs test a confirmer

