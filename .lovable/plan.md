

# Audit complet pre-production — Vascular Atlas

---

## A. SECURITE (Critique)

### A1. 2 vulneabilites PRIVILEGE ESCALATION detectees par scan

**`logbook_entries` — Auto-certification des procedures supervisees**
- La policy RLS ALL sur `logbook_entries` ne restreint pas les champs `supervisor_validated` et `validated_at`. Un utilisateur peut se valider lui-meme.
- **Correction** : Splitter en 2 policies UPDATE — une pour le owner (exclut `supervisor_validated`/`validated_at`), une pour le superviseur (`supervisor_id = auth.uid()`).

**`validations` — Auto-approbation des validations**
- La policy UPDATE permet au `user_id` de modifier `status` sur ses propres records. Un user peut passer `status = 'approved'` sans validateur.
- **Correction** : Restreindre les changements de `status` uniquement quand `validator_id = auth.uid()`.

### A2. Leaked Password Protection desactivee
- Le scan confirme que la protection HIBP est OFF.
- **Action manuelle requise** : Activer dans Settings > Auth > Email settings du backend.

### A3. `stripe_webhook_events` — RLS sans policy
- Table avec RLS active mais 0 policy. C'est correct (acces service_role uniquement), mais le linter le signale comme info.
- **Statut** : OK, pas d'action requise.

### A4. Edge Functions — Toutes correctement protegees
- `stripe-webhook` : Signature Stripe verifiee + idempotence
- `check-subscription` : Rate limit 30/min + auth token
- `create-checkout` : Rate limit 5/min + auth token
- `customer-portal` : Rate limit 10/min + auth token
- `ai-clinical-assistant` : Rate limit 20/min + auth token + gating server-side (3 free/day)
- `verify-checkout-session` : Auth token + email ownership check
- `cleanup-deleted-patients` : Cron secret ou super_admin role

### A5. Secrets
- Tous les secrets necessaires sont configures (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, LOVABLE_API_KEY, etc.)

---

## B. AUTHENTIFICATION & AUTORISATION

| Element | Statut | Note |
|---------|--------|------|
| Inscription email + mot de passe | OK | minLength=8, indicateur de force |
| Confirmation email | OK | Pas d'auto-confirm, ecran de confirmation + resend |
| Google OAuth | OK | Via lovable.auth |
| Forgot password / Reset | OK | Lien avec token recovery |
| Acceptation CGU obligatoire | OK | Checkbox + liens legal |
| Onboarding gate | OK | ProtectedRoute verifie `onboarding_completed` |
| Session management | OK | `onAuthStateChange` + `getSession` |
| Sign out | OK | Present dans sidebar + settings |
| User roles | OK | Table separee `user_roles` avec `has_role()` SECURITY DEFINER |
| ContentGate (semi-public) | OK | Blur + gate pour non-auth |
| PremiumGate | OK | Bloque features premium cote client |
| Server-side gating AI | OK | Verifie subscription en DB dans edge function |

**Probleme mineur** : `PremiumGate` affiche les children pendant `isLoading` (ligne 19). Si le check subscription est lent, le contenu premium flash brievement.

---

## C. STRIPE & MONETISATION

| Element | Statut | Detail |
|---------|--------|--------|
| Checkout flow | OK | `create-checkout` → Stripe hosted → success_url avec session_id |
| Verification server-side | OK | `verify-checkout-session` valide email ownership |
| Webhook signature | OK | `constructEvent` avec `STRIPE_WEBHOOK_SECRET` |
| Idempotence | OK | `stripe_webhook_events.event_id` UNIQUE |
| Sync DB | OK | Webhook sync `subscriptions` table |
| Fast path DB | OK | `check-subscription` lit la DB d'abord, fallback Stripe |
| Customer Portal | OK | Mapping `stripe_customer_id` correct |
| Cancel page | OK | Pas d'entitlement accorde |
| `useSubscription` double instance | BUG | `Pricing.tsx` appelle `useSubscription()` 2x (lignes 18 et 21), creant 2 polling intervals |

---

## D. SEO & PERFORMANCE

| Element | Statut | Detail |
|---------|--------|--------|
| `<SEOHead>` sur toutes les pages | OK | Avec OG, Twitter, canonical |
| `index.html` structured data | OK | Organization, WebSite, SoftwareApplication, FAQ |
| `robots.txt` | OK | Protected routes disallowed |
| `sitemap.xml` | OK | 17 URLs publiques et semi-publiques |
| `noindex` sur pages sensibles | OK | Auth, Settings, ResetPassword |
| Hreflang | OK | EN/FR/DE dans index.html |
| **Domaine canonical incorrect** | WARN | `BASE_URL = "https://vascular-atlas.com"` dans SEOHead mais le site est heberge sur `vessel-pathway-compass.lovable.app`. Les canonicals pointent vers un domaine qui n'existe peut-etre pas. |
| OG images | OK | Image auto-generee presente |
| React.StrictMode | ABSENT | Non utilise dans main.tsx |
| Bundle size | WARN | Framer Motion + Recharts + jspdf + html2canvas = bundle lourd. Pas de lazy loading des routes. |
| Console.error en production | OK | Seulement dans les catch blocks (acceptable) |

---

## E. ACCESSIBILITE

| Element | Statut | Note |
|---------|--------|------|
| `aria-label` sur nav | OK | Landing nav |
| `aria-hidden` sur preview blur | OK | ContentGate |
| Labels sur formulaires | OK | `<Label htmlFor>` systematique |
| Focus management | WARN | Pas de focus trap dans les modals custom (les composants Radix le gerent) |
| Contraste | WARN | Texte `text-primary-foreground/60` sur hero peut etre insuffisant |
| Mobile hamburger menu | OK | Sheet component |
| Keyboard navigation | OK | Via Radix primitives |

---

## F. i18n

| Element | Statut | Note |
|---------|--------|------|
| 3 langues (EN/FR/DE) | OK | Fichiers complets |
| Switching | OK | Persiste via contexte |
| Landing, Auth, Onboarding | OK | Tout traduit |
| `SubscriptionSettingsCard` | WARN | "Renews on" + "Professional" en dur (non traduit, lignes 47 et 70) |

---

## G. INFRASTRUCTURE & CODE QUALITY

| Element | Statut | Note |
|---------|--------|------|
| TypeScript strict | OK | Pas de `any` abuse (quelques `any` dans catch) |
| React Query | OK | Cache + invalidation correcte |
| Error boundaries | ABSENT | Aucun ErrorBoundary React — un crash composant = ecran blanc |
| 404 page | OK | Avec SEO noindex |
| Cookie consent RGPD | OK | Accept/decline + link privacy |
| Legal pages | OK | CGU, Privacy, Mentions legales |
| Tests unitaires | MINIMAL | 2 fichiers de test seulement (validation + example) |
| E2E tests | ABSENT | Aucun test Playwright/Cypress |

---

## H. PLAN DE CORRECTION PRE-PRODUCTION

### Priorite 0 (Bloquant)
1. **Corriger RLS `logbook_entries`** — Empecher auto-validation superviseur
2. **Corriger RLS `validations`** — Empecher auto-approbation status
3. **Activer Leaked Password Protection** — Action manuelle backend

### Priorite 1 (Important)
4. **Ajouter un ErrorBoundary React** global pour eviter les ecrans blancs
5. **Corriger `PremiumGate`** — Afficher loader au lieu des children pendant isLoading
6. **Corriger double `useSubscription()` dans Pricing.tsx** — Supprimer la 2e instance
7. **Mettre a jour `BASE_URL`** dans SEOHead pour correspondre au domaine reel

### Priorite 2 (Recommande)
8. **Lazy loading des routes** — `React.lazy()` pour reduire le bundle initial
9. **Traduire les strings en dur** dans SubscriptionSettingsCard
10. **Ajouter des tests e2e** pour les parcours critiques (auth, checkout, patient CRUD)

---

Approuve ce plan pour que je lance les corrections P0 et P1.

