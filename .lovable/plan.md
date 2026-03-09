

# AUDIT TECHNIQUE COMPLET — VASCULAR ATLAS

---

## 1. RESUME EXECUTIF

**Etat global:** Plateforme fonctionnellement riche, bien structuree architecturalement, avec une bonne couverture i18n et un design coherent. Cependant, plusieurs problemes structurels empechent un go-live serein.

**Niveau de preparation:** 70% — Bonne base, mais des lacunes critiques en i18n des nouveaux modules, securite edge functions, et coherence UX.

**Verdict go-live: NON EN L'ETAT**

### Top 5 P0

1. **3 modules cliniques (Outcomes, Performance, Risk Calculator) entierement en anglais hardcode** — pas de traduction i18n, incohérent avec le reste de l'app trilingue
2. **`verify_jwt = false` sur toutes les edge functions** sans validation JWT systematique dans le code (cleanup-deleted-patients OK, contact-form n'authentifie pas du tout — correct pour son usage, mais check-subscription/create-checkout/customer-portal font `getUser()` ce qui est correct)
3. **`CRON_SECRET` non configure** — la fonction cleanup-deleted-patients ne pourra pas etre declenchee par un cron
4. **Console error: `AnimatePresence` reçoit un ref sur un function component** dans Landing.tsx — warning React visible en production
5. **ContentGate rend les enfants (donnees Supabase) meme pour les utilisateurs non authentifies** — les composants enfants font des queries Supabase qui echoueront silencieusement ou exposeront des etats vides trompeurs

### Top 5 P1

1. **Sidebar affiche "Patient Outcomes", "Clinical Performance", "Risk Calculator" en anglais dur** — pas de cles i18n
2. **PatientOutcomes/ClinicalPerformance fetches sans filtre `created_by`/`eq("created_by", user.id)`** — s'appuie uniquement sur RLS, mais si RLS est mal configuree les donnees seraient exposees. Les queries `cases` et `outcomes` dans ClinicalPerformance ne filtrent pas par user.
3. **Hreflang implementation incorrecte** — utilise `?lang=fr` comme parametre URL mais l'app ne lit pas ce parametre (la langue est stockee en localStorage)
4. **ResearchExportButton fait des queries sans filtre user** — meme probleme, s'appuie sur RLS
5. **Pas de monitoring/observabilite** — pas de Sentry, pas de health endpoint, pas d'analytics

---

## 2. TABLEAU D'AUDIT

| Priorite | Domaine | Page/Fonction | Probleme | Preuve | Risque | Recommandation | Faisable immediatement? |
|----------|---------|---------------|----------|--------|--------|----------------|------------------------|
| P0 | i18n | PatientOutcomes, ClinicalPerformance, RiskCalculator | Textes 100% hardcodes en anglais | Code source: "Patient Outcomes (PROMs)", "Clinical Performance Dashboard", "Vascular Risk Calculator" etc. | UX cassee pour utilisateurs FR/DE | Ajouter toutes les cles i18n dans en/fr/de.ts | Oui |
| P0 | i18n | AppSidebar | Sidebar items hardcodes en anglais | `"Patient Outcomes"`, `"Clinical Performance"`, `"Risk Calculator"` ligne 73-76 | Navigation incoherente en FR/DE | Utiliser `t("sidebar.xxx")` | Oui |
| P0 | Frontend | Landing.tsx | AnimatePresence ref warning | Console error visible | Warning React en prod, impression de bug | Wraper le button dans `motion.button` correctement | Oui |
| P0 | Security | Edge functions | `CRON_SECRET` non configure | Liste des secrets — absent | cleanup-deleted-patients inaccessible par cron | Ajouter le secret | Non — necessite decision humaine |
| P1 | Data | ClinicalPerformance | Queries sans filtre user_id | `supabase.from("cases").select(...)` sans `.eq("created_by", user.id)` | Depend entierement de RLS — fragile si RLS change | Ajouter filtre explicite | Oui |
| P1 | Data | PatientOutcomes | Query proms sans filtre user | `supabase.from("proms").select(...)` sans filtre | Meme risque | Ajouter filtre via join sur cases | Oui |
| P1 | Data | ResearchExportButton | Queries sans filtre user | Toutes les queries dans generateExport | Meme risque | Ajouter filtres | Oui |
| P1 | SEO | SEOHead | Hreflang `?lang=fr` non fonctionnel | L'app ne lit pas `?lang=` depuis l'URL | Google indexe des URLs non fonctionnelles | Retirer hreflang ou implementer lecture URL | Oui (retirer) |
| P1 | Security | CORS | `Access-Control-Allow-Origin: *` sur toutes les edge functions | Code source | Toute origine peut appeler les APIs | Restreindre au domaine de production | Non — necessite domaine final |
| P1 | UX | ContentGate | Composants enfants rendus sans auth | `children` rendu dans un div `overflow-hidden` mais les hooks/queries s'executent | Queries Supabase qui echouent, erreurs silencieuses | Conditionner le rendu des enfants a la session | Oui |
| P2 | i18n | PatientOutcomes | Toast messages en anglais | `toast.success("Questionnaire submitted successfully")` | Incohérence linguistique | Utiliser `t()` | Oui |
| P2 | i18n | ResearchExportButton | Tout le dialog en anglais | Titres, descriptions, badges | Meme probleme | Ajouter cles i18n | Oui |
| P2 | i18n | FHIRBadge | Labels et tooltips en anglais | "FHIR R4 Ready", tooltips | Meme probleme | Ajouter cles i18n | Oui |
| P2 | Performance | Landing | `dashboard-preview.jpg` charge eager | `loading="eager"` sur une image below-the-fold | LCP penalise | Changer en `loading="lazy"` | Oui |
| P2 | Accessibility | ErrorBoundary | Textes en anglais non traduits | "Something went wrong", "Refresh Page" | Non accessible aux users FR/DE | Ajouter i18n | Oui |
| P2 | Frontend | RiskCalculator | SCORE2 est une "approximation simplifiee" | Commentaire `// Simplified SCORE2 approximation` | Disclaimer present mais pourrait induire en erreur | Renforcer le disclaimer clinique | Oui |
| P2 | Security | contact-form | Pas de honeypot implementé | Commentaire `// Honeypot: reject if a hidden field is filled (client can add this later)` | Spam potentiel | Ajouter champ honeypot cote client | Oui |
| P3 | Frontend | React Router | V6 deprecation warnings | Console warnings `v7_startTransition`, `v7_relativeSplatPath` | Fonctionnel mais warnings en console | Ajouter future flags | Oui |
| P3 | Observability | Global | Pas de Sentry/monitoring | Aucun SDK error tracking | Erreurs prod invisibles | Ajouter error tracking | Non — necessite service externe |
| P3 | SEO | OG Image | URL pointe vers un CDN lovable temporaire | `pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/...` | URL pourrait expirer | Heberger sur domaine propre | Non — necessite domaine |

---

## 3. DETAIL PAR CATEGORIE

### A. Frontend & Rendu
**Fonctionne:** Landing, Auth, Dashboard, Settings, NotFound, Pricing, Legal, Support, Onboarding, toutes les pages app principales. Design coherent dark mode. Lazy loading des routes. ErrorBoundary global. CookieConsent present.

**Casse:** Warning `AnimatePresence` ref sur Landing.tsx (scroll-to-top button). Non bloquant mais visible en console.

**Douteux:** ContentGate rend les composants enfants meme sans auth (pour l'effet blur), ce qui declenche des queries Supabase inutiles qui echoueront.

### B. QA Fonctionnelle
**Fonctionne:** Auth flow (signup/signin/reset/OAuth Google), onboarding, patient CRUD, settings profile update, subscription check, cookie consent, notification bell avec realtime, command palette.

**Non confirme:** Checkout Stripe (necessite cle live), email verification flow complet, cleanup cron.

### C. Auth & Autorisations
**Fonctionne:** ProtectedRoute redirige vers /auth. PublicAppRoute redirige vers onboarding si non complete. Session refresh automatique. RLS sur toutes les tables.

**Risque:** Les routes semi-publiques (`/app/outcomes`, `/app/performance`, etc.) rendent les composants dans ContentGate qui executent des queries Supabase sans session — ces queries echoueront silencieusement grace aux RLS `RESTRICTIVE` mais c'est un gaspillage et pourrait causer des etats inattendus.

### D. APIs & Edge Functions
**Fonctionne:** Toutes les edge functions ont `verify_jwt = false` et font la validation manuellement dans le code (`getUser(token)`). C'est le pattern correct pour Lovable Cloud.

**Manquant:** `CRON_SECRET` pour cleanup-deleted-patients.

### E. Database & RLS
**Fonctionne:** RLS RESTRICTIVE sur toutes les tables. `has_role()` security definer avec `search_path = public`. Trigger `handle_new_user()` pour creation profil. Policies coherentes.

**Risque mineur:** Les queries frontend dans les nouveaux modules (ClinicalPerformance, PatientOutcomes, ResearchExport) ne filtrent pas par user_id cote client — elles dependent entierement de RLS. Fonctionnel mais defense-in-depth recommandee.

### F. Paiement & Billing
**Fonctionne:** SubscriptionSettingsCard, Pricing page, checkout flow, portal management, PremiumGate component. Webhook handler avec idempotence.

**Non confirme:** Stripe en mode live vs test.

### G. i18n
**Fonctionne:** 3 langues (EN/FR/DE) avec couverture quasi-complete sur les pages existantes.

**CASSE:** Les 3 nouveaux modules cliniques (PatientOutcomes, ClinicalPerformance, RiskCalculator) + FHIRBadge + ResearchExportButton + Sidebar labels sont 100% en anglais hardcode. C'est un P0 car le produit est presente comme trilingue.

### H. SEO
**Fonctionne:** SEOHead sur toutes les pages, canonical URLs, OG tags, JSON-LD FAQ, noindex sur pages app, sitemap.xml, robots.txt bien configure.

**Probleme:** Hreflang pointe vers `?lang=fr` mais l'app ne consomme pas ce parametre.

### I. Observabilite
**Absent:** Pas de Sentry, pas de health endpoint, pas d'analytics (hors audit_logs internes). Logs structures dans les edge functions — bon point.

---

## 4. PLAN D'ACTION PRIORISE

### Correctifs immediats P0 (implementables maintenant)
1. Ajouter toutes les cles i18n pour PatientOutcomes, ClinicalPerformance, RiskCalculator dans en.ts/fr.ts/de.ts
2. Utiliser `t()` dans les 3 modules + sidebar + FHIRBadge + ResearchExportButton
3. Fixer le warning AnimatePresence dans Landing.tsx
4. Conditionner le rendu des enfants dans ContentGate a `!!session` pour le contenu reel (montrer un placeholder au lieu du composant)

### Correctifs rapides P1
5. Ajouter filtres `created_by`/`user_id` explicites dans les queries des nouveaux modules
6. Retirer les hreflang non fonctionnels ou implementer lecture `?lang=` depuis URL
7. Ajouter future flags React Router pour supprimer les warnings

### Ameliorations P2
8. Ajouter honeypot dans le formulaire de contact
9. Changer `loading="eager"` en `loading="lazy"` pour dashboard-preview.jpg
10. Traduire ErrorBoundary

### Polish P3
11. Heberger OG image sur domaine propre
12. Ajouter Sentry ou equivalent
13. Ajouter health endpoint

### Dependances externes (non implementables sans decision humaine)
- `CRON_SECRET` secret a ajouter
- Domaine custom `vascular-atlas.com` a connecter
- Stripe live vs test a confirmer
- Monitoring externe (Sentry) a configurer

---

## 5. IMPLEMENTATION IMMEDIATE

Voici les corrections que je recommande d'implementer immediatement:

1. **i18n des 3 modules cliniques + sidebar** — Ajouter ~150 cles de traduction dans en/fr/de.ts et remplacer tous les textes hardcodes
2. **Fixer AnimatePresence warning** — Le `motion.button` dans Landing.tsx est deja correct; le warning vient d'un autre composant recevant un ref
3. **ContentGate** — Ne pas rendre les enfants quand pas de session (eviter les queries inutiles)
4. **Filtres user explicites** dans ClinicalPerformance et PatientOutcomes
5. **Retirer hreflang invalides** de SEOHead
6. **React Router future flags** pour supprimer les deprecation warnings
7. **Dashboard preview image** — `loading="lazy"`

**Estimation: ~8 modifications de fichiers, aucune dependance externe.**

Souhaitez-vous que je procede a l'implementation de ces corrections?

