

# AUDIT DEFINITIF PRE-PRODUCTION — Vascular Atlas

---

## 1. RESUME EXECUTIF

**Verdict global** : La plateforme est un MVP fonctionnel impressionnant dans sa couverture modulaire, mais elle n'est **PAS prete pour une mise en production destinee a de vrais utilisateurs payants**. Les lacunes se concentrent sur 4 axes : absence totale de pages legales/CGU/support, boutons et fonctionnalites "fantomes" (configurables sans effet), securite pre-production insuffisante (edge functions sans JWT, RLS trop permissives sur certaines tables), et copywriting qui suppose que l'utilisateur connait deja le domaine. Le produit est solide techniquement mais reste a un stade "demo interne avancee", pas "SaaS publiable".

**Publiable aujourd'hui : NON**

**Note globale : 11/20**

**Niveau de confiance : Moyen-bas** — le squelette est la, l'execution n'est pas terminee.

**Top 5 risques avant production :**
1. Aucune page legale (CGU, politique de confidentialite, mentions legales) — bloquant RGPD
2. Edge functions `verify_jwt = false` — tout endpoint est accessible sans auth
3. Boutons "Configurer" (SSO, rate limiting) dans Settings ne font rien — erosion de confiance
4. Aucune page de contact, support, aide, FAQ — utilisateur abandonne en cas de probleme
5. Pricing "Contacter les ventes" pointe vers signup, pas vers un formulaire de contact

**Top 5 forces reelles :**
1. Architecture modulaire coherente avec 6 modules bien structures
2. i18n complete (EN/FR/DE) sur l'ensemble de la plateforme
3. Systeme d'audit trail (audit_logs) pour la tracabilite
4. ContentGate elegant pour l'acces semi-public (teaser a 35%)
5. RLS policies sur toutes les tables avec separation user/institution

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticite | Decision |
|---|---|---|---|---|
| Comprehension produit | 12 | Proposition de valeur presente mais trop abstraite pour un novice | Majeur | A retravailler |
| Landing / accueil | 13 | Structure correcte, manque preuves sociales et clarte immediate | Majeur | A ameliorer |
| Onboarding | 14 | Bien structure en 4 etapes, mais aucune validation des champs obligatoires inter-etapes | Mineur | A corriger |
| Navigation | 15 | Sidebar claire, command palette fonctionnel | Mineur | Acceptable |
| Clarte UX | 11 | Pages beta vides, boutons fantomes, jargon medical non explique | Critique | A corriger |
| Copywriting | 10 | Trop generique, trop de jargon, pas assez de benefices concrets | Critique | A retravailler |
| Credibilite / confiance | 8 | Zero page legale, zero preuve sociale, zero contact, boutons sans fonction | Bloquant | A corriger |
| Fonctionnalite principale (AI) | 14 | Streaming SSE fonctionne, disclaimer present, historique avec signoff | Mineur | Bon |
| Parcours utilisateur | 12 | Parcours signup→onboarding→dashboard fonctionnel mais friction a chaque transition | Majeur | A ameliorer |
| Bugs / QA | 12 | Pas de bugs majeurs observes, mais etats vides mal geres, filtres TOPICS non fonctionnels en tant que filtres reels | Majeur | A corriger |
| Securite preproduction | 9 | verify_jwt=false sur edge functions, RLS restrictives mais quelques lacunes | Bloquant | A corriger |
| Conformite / go-live | 6 | Aucune CGU, politique de confidentialite, mentions legales, DPO, consentement cookies | Bloquant | Bloquant |

---

## 3. AUDIT PAGE PAR PAGE

### Landing Page — 13/20
- **Objectif suppose** : Convertir le visiteur en inscription
- **Objectif percu** : On comprend que c'est un outil medical vasculaire, mais on ne comprend pas concretement ce qu'on peut FAIRE avec en 5 secondes
- **Clair** : Structure visuelle, modules presentes, CTA visible
- **Flou** : "L'OS d'intelligence pour la medecine vasculaire" — concept trop abstrait. Un medecin vasculaire se demandera "qu'est-ce que ca change concretement pour moi ?"
- **Manque** : Screenshots/demo du produit, temoignages, logos de partenaires/institutions, chiffres d'usage, video de 30s
- **Freine** : Pas de demo visible — l'utilisateur doit s'inscrire pour voir quoi que ce soit (le ContentGate a 35% n'est pas mentionne)
- **Nuit a la credibilite** : Footer minimaliste "Non un dispositif medical" sans lien vers aucune page legale
- **A corriger** : Ajouter social proof, screenshots, clarifier la valeur en 1 phrase concrete, lier vers pages legales

### Pricing — 11/20
- **Objectif suppose** : Convertir vers un plan payant
- **Objectif percu** : On voit les plans mais on ne peut pas payer
- **Flou** : "Sur devis / par utilisateur" pour Institution mais le CTA "Contacter les ventes" redirige vers signup — il n'y a aucun formulaire de contact
- **Manque** : Comparaison detaillee des features, FAQ pricing, garantie satisfaction, mention "essai gratuit X jours", lien support
- **Nuit a la credibilite** : Aucune integration paiement — les plans sont decoratifs. Un utilisateur qui clique "Essai gratuit" arrive sur signup standard sans aucune notion de plan
- **A corriger** : Soit integrer Stripe, soit indiquer clairement "Beta gratuite" et retirer les prix

### Auth (Login/Signup) — 15/20
- **Clair** : Formulaire standard, switch login/signup, forgot password
- **Manque** : Indicateur de force du mot de passe, OAuth social (Google), terms of service checkbox au signup
- **Flou** : Apres signup, message "verifiez votre email" — mais aucune indication de delai ou de quoi faire si le mail n'arrive pas
- **A corriger** : Ajouter lien "Renvoyer l'email", checkbox CGU obligatoire, OAuth Google

### Onboarding — 14/20
- **Clair** : 4 etapes bien structurees avec progress bar
- **Flou** : L'etape 2 (institution) est optionnelle mais l'utilisateur ne le sait pas — aucun indicateur "optionnel"
- **Manque** : Validation — on peut passer toutes les etapes sans rien remplir (role pre-selectionne mais institution vide acceptee)
- **A corriger** : Marquer les champs optionnels, empecher de skip sans role

### Dashboard — 13/20
- **Clair** : KPIs, actions rapides, modules
- **Flou** : Pour un nouvel utilisateur, tous les compteurs sont a 0 — aucun guidage "voici par ou commencer"
- **Manque** : Onboarding in-app (checklist premier usage), message d'accueil personnalise, indication du plan actuel
- **Nuit** : `timeAgo` en anglais meme en mode FR ("3h ago" au lieu de "il y a 3h")
- **A corriger** : Etat vide avec guidage, internationaliser timeAgo

### AI Assistant — 14/20
- **Forces** : Disclaimer clair, streaming, historique, signoff, audit trail
- **Flou** : 7 champs de saisie sans guidage — un novice ne sait pas lesquels sont obligatoires
- **Manque** : Indication champs obligatoires vs optionnels, exemples pre-remplis en un clic
- **A corriger** : Marquer champs requis, bouton "charger un exemple"

### Patients — 15/20
- **Clair** : Table bien structuree, filtres, recherche, dialog de creation
- **Manque** : Indication que c'est une page protegee (pas accessible via ContentGate)
- **Bien** : Trash/corbeille avec soft delete

### Digital Twin — 12/20
- **Flou** : Sans patient selectionne, la page est quasi vide — pas d'explication de ce qu'est un "jumeau numerique"
- **Manque** : Explication pedagogique, screenshot d'exemple
- **A corriger** : Etat vide explicatif avec illustration

### Registry — 11/20
- **Flou** : Les onglets Institution et Benchmarking affichent des placeholders textuels — on ne comprend pas si c'est une fonctionnalite reelle ou un placeholder
- **Nuit a la confiance** : "Necessite le role Admin Hospitalier" — mais comment obtient-on ce role ?
- **A corriger** : Clarifier ce qui est fonctionnel vs a venir

### Education — 14/20
- **Bien** : Courses avec progression, quiz, certificats PDF
- **Flou** : Un nouvel utilisateur voit une liste vide si aucun cours n'est publie — pas de contenu seed
- **A corriger** : Pre-seeder des cours de demo

### Simulation — 13/20
- **Meme probleme** : Sans simulations pre-creees, la page est vide
- **A corriger** : Seed data ou contenu d'exemple

### Network — 14/20
- **Bien** : Forum fonctionnel, votes, reponses, requetes expert
- **Flou** : Les badges de topic (PAD, Aorta...) ressemblent a des filtres mais ne filtrent rien — ils sont decoratifs
- **Manque** : Onglet Mentorship = "Coming soon" sans date ni explication
- **A corriger** : Rendre les badges fonctionnels ou les retirer

### Analytics — 14/20
- **Bien** : Graphiques recharts, filtres periode/categorie/institution, export PDF
- **Flou** : Sans donnees, 6 graphiques vides — intimidant pour un nouveau
- **A corriger** : Etat vide plus accueillant

### Research — 12/20
- **Fonctionnel** : CRUD etudes
- **Flou** : Export de donnees desidentifiees — le bouton existe mais la fonctionnalite reelle n'est pas claire
- **A corriger** : Clarifier le workflow export

### Compliance — 13/20
- **Bien** : Audit trail visible, stats
- **Flou** : Onglets Validation et Consent sont presents mais le contenu est peu exploitable sans guidage

### Team — 11/20
- **Probleme** : Sans membership institution, la page affiche "no members" — aucune explication de comment ajouter des membres
- **A corriger** : Call to action pour rejoindre/creer une institution

### Settings — 12/20
- **Probleme critique** : Boutons "Configurer" pour SSO et Rate Limiting ne font RIEN — clic sans effet
- **Nuit a la credibilite** : L'utilisateur pense que la feature est cassee
- **Plan "Free" affiche** mais aucun mecanisme de changement reel
- **A corriger** : Retirer les boutons non fonctionnels ou les transformer en "Bientot disponible"

### Pages Beta (5 pages) — 9/20
- **Probleme** : Ces 5 pages (AI Safety, Imaging, Wearables, AR Training, Federated Learning) sont des maquettes statiques sans aucune fonctionnalite
- **Nuit a la credibilite** : Un utilisateur qui navigue pense que la moitie du produit est vide
- **A corriger** : Regrouper en une seule page "Roadmap Beta" ou les masquer

### 404 Not Found — 15/20
- **Bien** : Message clair, lien retour

---

## 4. SECURITE / GO-LIVE READINESS

| Observe | Risque | Action avant prod |
|---|---|---|
| `verify_jwt = false` sur `ai-clinical-assistant` et `cleanup-deleted-patients` | **Critique** — n'importe qui peut appeler ces endpoints sans auth | Passer a `verify_jwt = true` ou ajouter verification manuelle du token dans la fonction |
| RLS sur `profiles` empeche SELECT d'autres profils — mais `Team.tsx` fait `.in("user_id", userIds)` sur profiles | Requete echouera silencieusement pour les profils d'autres users | Ajouter policy SELECT pour membres d'une meme institution |
| Pas de rate limiting sur auth (signup/login) | Brute force possible | Ajouter rate limiting cote serveur |
| Pas de CAPTCHA sur signup | Bot signup possible | Ajouter hCaptcha ou Turnstile |
| Supabase anon key expose dans le code client (.env, client.ts) | Risque bas si RLS bien configure — mais verifier | Audit RLS complet |
| Pas de Content Security Policy header | XSS possible | Ajouter CSP meta tag ou headers |
| `forum_posts` ne peut pas etre DELETE par RLS | Utilisateur ne peut pas supprimer ses propres posts | Risque faible mais friction UX |
| `cleanup-deleted-patients` utilise `SUPABASE_SERVICE_ROLE_KEY` sans auth | Si endpoint decouvert, suppression massive possible | **Bloquant** — ajouter un secret/token de verification |
| Aucune validation du format email cote serveur | Faible — Supabase Auth le gere | OK |
| Mot de passe minimum 6 caracteres seulement | Politique faible pour une app medicale | Augmenter a 8+ avec complexite |

**Signaux faibles :**
- Pas de session timeout configurable
- Pas de 2FA/MFA
- Pas de politique de retention des donnees documentee

**Non verifiable sans acces serveur :**
- Configuration CORS exacte de Supabase
- Logs d'acces et monitoring
- Backup/restore policy

---

## 5. LISTE DES PROBLEMES PRIORISES

### P0 — Bloquant production
1. **Aucune page legale (CGU, Confidentialite, Mentions legales)** — Illegal en UE/RGPD. Impact : poursuites potentielles. Creer `/legal/terms`, `/legal/privacy`, `/legal/notice`.
2. **Edge functions sans verification JWT** — Tout le monde peut appeler l'IA et le cleanup. Impact : abus, couts, suppression de donnees. Passer `verify_jwt = true` et ajouter auth check dans `cleanup-deleted-patients`.
3. **Aucune page support/contact/aide** — Utilisateur bloque sans recours. Impact : abandon immediat. Creer `/support` avec email + FAQ.
4. **Checkbox CGU absente au signup** — Consentement non obtenu. Impact : non-conformite RGPD. Ajouter checkbox obligatoire.

### P1 — Tres important
5. **Boutons "Configurer" sans fonction dans Settings** — Erosion de confiance. Remplacer par "Bientot disponible" desactive.
6. **Pricing sans paiement** — Plans affiches mais aucun mecanisme de souscription. Clarifier "Beta gratuite" ou integrer Stripe.
7. **5 pages Beta vides** — 30% de la sidebar mene a des pages placeholder. Masquer derriere un feature flag ou regrouper.
8. **timeAgo en anglais dur** — "3h ago" affiche en mode FR. Internationaliser.
9. **Topic badges dans Network non fonctionnels** — Ressemblent a des filtres mais ne filtrent pas.

### P2 — Amelioration forte valeur
10. **Etat vide sans guidage** — Dashboard, Digital Twin, Education, Simulation, Research : compteurs a 0 sans indication "voici par ou commencer". Ajouter onboarding in-app.
11. **Pas de social proof sur landing** — Ni temoignages, ni logos, ni chiffres. Ajouter section.
12. **Pas de OAuth social** — Seul email/password supporte. Ajouter Google au minimum.
13. **Pas de consentement cookies** — Banniere cookies absente. Requis RGPD.
14. **Seed data manquant** — Un nouveau compte voit un produit vide partout.

### P3 — Confort / finition
15. **Pas de dark mode toggle sur landing/pricing** — Disponible seulement dans Settings.
16. **Footer minimaliste** — Aucun lien utile (about, contact, legal, social).
17. **Pas d'indicateur de force mot de passe** au signup.
18. **Pas de lien "Renvoyer l'email de verification"**.
19. **Pas de favicon personnalise** (utilise le generique).

---

## 6. VERDICT FINAL

### La plateforme est-elle reellement prete ? **NON.**

Le produit est un MVP technique solide avec une architecture bien pensee (i18n, RLS, modular pages, audit trail). La couverture fonctionnelle est impressionnante pour un MVP. Mais il manque **tout ce qui transforme un prototype en produit publiable** :

- Zero infrastructure legale (CGU, confidentialite, cookies)
- Zero support utilisateur (pas de contact, pas de FAQ, pas d'aide)
- Zero preuve sociale (pas de temoignage, pas de logo, pas de chiffre)
- Des fonctionnalites "fantomes" qui font passer le produit pour inacheve (boutons sans effet, pages beta vides, badges decoratifs)
- Une securite pre-production incomplete (endpoints ouverts, pas de rate limiting)

### Ce qui empeche un expert d'autoriser le go-live :
1. Non-conformite RGPD (absence totale de pages legales et consentement)
2. Endpoints sans authentification
3. Absence de support/contact
4. Fonctionnalites decoratives qui erosent la confiance

### Ce qui donne confiance :
- Architecture technique propre et coherente
- RLS sur toutes les tables
- Audit trail integre
- i18n complete 3 langues
- ContentGate elegant pour la decouverte

### 3 corrections les plus rentables immediatement :
1. **Ajouter CGU + Politique de confidentialite + Mentions legales** — Debloque la conformite legale. Estimation : 1 session de travail.
2. **Passer `verify_jwt = true` sur les edge functions** — Debloque la securite minimale. Estimation : 15 minutes.
3. **Retirer ou desactiver les elements non fonctionnels** (boutons Configurer, pages beta, badges topic) — Debloque la perception de produit fini. Estimation : 1 heure.

### Si j'etais decideur externe : **Je ne publierais pas aujourd'hui.**
Le risque juridique (RGPD) et securitaire (endpoints ouverts) est trop eleve. Le produit peut etre rendu publiable en **2-3 jours de travail cible** sur les P0 et P1, ce qui le ferait passer de 11/20 a environ 15/20 — seuil acceptable pour un lancement beta controle.

