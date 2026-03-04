

## Plan: Aperçu gratuit à 35% + connexion obligatoire pour le contenu complet

### Concept

Actuellement, toutes les pages `/app/*` sont protégées par `ProtectedRoute` qui redirige vers `/auth` si non connecté. L'objectif est de rendre chaque page visible à 35% sans connexion, avec un overlay/blur qui bloque le reste et invite à se connecter/s'abonner.

### Architecture

1. **Créer un composant `<ContentGate>`** — wrapper réutilisable qui :
   - Reçoit `children` (le contenu de la page)
   - Vérifie l'état d'authentification via `useAuth()`
   - Si connecté : affiche 100% du contenu sans restriction
   - Si non connecté : affiche le contenu dans un conteneur avec `max-height: 35vh`, `overflow: hidden`, un gradient-mask CSS en bas, et un overlay CTA par-dessus invitant à se connecter ou s'abonner

2. **Modifier le routing dans `App.tsx`** :
   - Sortir les pages de contenu du `<ProtectedRoute>` et les rendre accessibles publiquement via un nouveau layout "semi-public" (`<AppLayout>` sans redirection)
   - Garder `ProtectedRoute` uniquement pour les pages sensibles (Settings, Patients avec données personnelles)
   - Pages en aperçu public : Dashboard, AI Assistant, Digital Twin, Registry, Education, Simulation, Network, Research, Compliance, Team, et les pages beta

3. **Créer un `<PublicAppRoute>`** — variante de `ProtectedRoute` qui :
   - Affiche `<AppLayout>` sans vérification de session
   - Wrap chaque page enfant dans `<ContentGate>`

4. **Composant overlay CTA** :
   - Dégradé blanc/noir (selon le thème) masquant le bas du contenu
   - Icône de cadenas + texte traduit ("Connectez-vous pour accéder à l'intégralité du contenu")
   - Deux boutons : "Se connecter" → `/auth` et "Voir les plans" → `/pricing`
   - Traduit en EN/FR/DE

5. **Traductions** : Ajouter les clés `contentGate.title`, `contentGate.subtitle`, `contentGate.signIn`, `contentGate.viewPlans` dans les 3 fichiers i18n.

### Fichiers à modifier/créer

| Fichier | Action |
|---|---|
| `src/components/ContentGate.tsx` | Créer — composant wrapper avec logique 35%/100% |
| `src/components/PublicAppRoute.tsx` | Créer — layout public avec sidebar visible |
| `src/App.tsx` | Modifier — séparer routes publiques/protégées |
| `src/i18n/en.ts` | Ajouter clés `contentGate.*` |
| `src/i18n/fr.ts` | Ajouter clés `contentGate.*` |
| `src/i18n/de.ts` | Ajouter clés `contentGate.*` |

### Détail technique du ContentGate

```text
┌─────────────────────────────┐
│  Page content (35% visible) │
│  ...                        │
│▓▓▓▓▓ gradient fade ▓▓▓▓▓▓▓▓│
├─────────────────────────────┤
│  🔒 Overlay CTA             │
│  "Sign in for full access"  │
│  [Sign In]  [View Plans]    │
└─────────────────────────────┘
```

- CSS: `max-h-[50vh]` + `overflow-hidden` + pseudo-élément gradient
- L'overlay est positionné en `sticky bottom-0` ou `absolute` en bas du conteneur
- Pages sensibles (patients/:id, settings) restent 100% protégées via `ProtectedRoute`

