

## Plan: Créer des patients de test avec différents niveaux de risque

### Objectif
Insérer 4 patients de test dans la base de données, chacun avec un nombre différent de facteurs de risque pour couvrir les 4 niveaux (low, moderate, high, critical), puis vérifier que le filtre par risque fonctionne.

### Données à insérer

| Pseudonym | Risk Factors | Niveau attendu |
|---|---|---|
| TEST-LOW-001 | `[]` (0 facteurs) | Low |
| TEST-MOD-001 | `["smoking", "hypertension"]` (2 facteurs) | Moderate |
| TEST-HIGH-001 | `["smoking", "hypertension", "diabetes"]` (3 facteurs) | High |
| TEST-CRIT-001 | `["smoking", "hypertension", "diabetes", "obesity"]` (4 facteurs) | Critical |

### Étapes

1. **Récupérer l'ID utilisateur** connecté via une requête sur `profiles`
2. **Insérer 4 patients** avec `created_by` = user ID et des `risk_factors` variés
3. **Créer un case** pour chaque patient (nécessaire pour qu'ils apparaissent dans la liste filtrée)
4. **Tester** le filtre par risque sur la page Patients dans le navigateur

### Détails techniques
- Les insertions se feront via l'outil d'insertion SQL (pas de migration, c'est de la donnée)
- Chaque patient aura un `age_range` et `sex` pour simuler des données réalistes
- Un case "active" sera associé à chaque patient pour qu'ils soient visibles dans le tableau

