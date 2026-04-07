

# Analyse complete du repo AquaMR Flow

## Etat actuel

La plateforme est fonctionnelle avec 36 tables, RLS correctement configuree, triggers de notifications, realtime active, seed data (15 cours, 9 simulations), et toutes les Edge Functions corrigees.

## Problemes identifies

### 1. Bugs actifs
- **Triggers dupliques** : chaque table de notifications (case_events, expert_responses, forum_posts) a 3 triggers identiques au lieu d'1 (ex: `on_case_event`, `trg_case_event_notification`, `trg_notify_case_event`). Cela genere 3 notifications au lieu d'1 pour chaque evenement.
- **HIBP desactive** : la protection contre les mots de passe compromis n'est pas activee.

### 2. Fonctionnalites manquantes dans le code

| Module | Etat | Manque |
|--------|------|--------|
| **Support/Contact** | OK | - |
| **Notifications realtime** | OK | - |
| **Education** | OK, seed data present | - |
| **Simulation** | OK, seed data present | - |
| **Fusion Viewer** | Prototype statique | Pas d'upload DICOM reel (bucket storage manquant) |
| **Digital Twin** | Fonctionnel avec patients | - |
| **CI-AKI Engine** | Fonctionnel (calcul local) | Pas de sauvegarde des resultats en base |
| **Admin** | Fonctionnel | Pas de vue des utilisateurs inscrits, seulement roles + messages |
| **Research** | Fonctionnel | Boutons "Analytics" et "Export" sur les etudes affichent "Coming Soon" |
| **Network/Forum** | Navigation vers `/app/research` au clic notif au lieu de `/app/network` | |
| **Settings/Avatar** | Fonctionnel | - |
| **Logbook** | Fonctionnel | - |

### 3. Elements manquants a ajouter

1. **Migration DB** : Supprimer les 6 triggers dupliques (garder un seul par table)
2. **CI-AKI Engine** : Sauvegarder les resultats de calcul de risque en base (table `eco_metrics` existante) pour alimenter le dashboard eco
3. **Fusion Viewer** : Creer un bucket `dicom-uploads` et ajouter un vrai upload de fichiers
4. **Notification navigation** : Corriger les liens de navigation (`forum_post` → `/app/network`, pas `/app/research`)
5. **Admin** : Ajouter un onglet listant les utilisateurs inscrits (lecture de `profiles`)
6. **HIBP** : Activer via l'outil configure_auth
7. **Research** : Implementer le bouton Export (telecharger CSV des donnees d'etude)

## Plan d'implementation

### Etape 1 — Migration DB : nettoyage triggers dupliques
Supprimer les triggers `on_case_event`, `on_expert_response`, `on_forum_reply`, `trg_case_event_notification`, `trg_expert_response_notification`, `trg_forum_reply_notification` (garder uniquement les `trg_notify_*`).

### Etape 2 — CI-AKI Engine : sauvegarde des resultats
Ajouter un bouton "Sauvegarder" dans `CIAKIEngine.tsx` qui insere le resultat dans `eco_metrics` pour que le dashboard eco affiche des donnees reelles.

### Etape 3 — Fusion Viewer : upload reel
Creer un bucket `dicom-uploads` (prive, RLS par user). Ajouter un composant d'upload dans `FusionViewer.tsx` pour stocker des fichiers DICOM/images.

### Etape 4 — Notification navigation fix
Dans `NotificationBell.tsx`, corriger `forum_post` → `/app/network` au lieu de `/app/research`.

### Etape 5 — Admin : liste des utilisateurs
Ajouter un onglet "Users" dans `Admin.tsx` qui affiche les profils inscrits (lecture `profiles` avec politique RLS pour admin).

### Etape 6 — Research Export
Remplacer le bouton "Coming Soon" par un export CSV reel des donnees d'etude.

### Etape 7 — HIBP
Activer la protection HIBP via configure_auth.

## Sections techniques

- Les triggers dupliques causent des insertions multiples dans `notifications` — priorite haute
- Le bucket `dicom-uploads` necessite une RLS policy `(bucket_id = 'dicom-uploads' AND auth.uid()::text = (storage.foldername(name))[1])`
- Pour l'admin users list, il faut ajouter une RLS policy SELECT sur `profiles` pour les admins/super_admins
- L'export CSV Research utilisera les donnees de `studies` + `outcomes` jointes cote client

