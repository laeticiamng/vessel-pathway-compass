

# AUDIT BETA-TESTEUR NON TECHNIQUE — VASCULAR ATLAS

---

## 1. RESUME EXECUTIF

### Ce qu'un novice comprend en arrivant
- C'est une plateforme pour la medecine vasculaire, avec de l'IA. Le hero est assez clair sur le "quoi".
- Le site semble professionnel et serieux visuellement.
- C'est en beta gratuite, sans carte bancaire.

### Ce qu'un novice NE comprend PAS
- **A quoi ca ressemble concretement** : le screenshot du dashboard est une image statique. Aucune video, aucune demo interactive, aucun GIF anime montrant un workflow reel.
- **Qui est derriere** : "EMOTIONSCARE SASU" dans le footer — un nom qui ne dit rien, voire qui cree de la mefiance pour un produit medical. Pas de visage, pas de nom, pas de photo d'equipe, pas de LinkedIn, pas de fondateur visible.
- **Combien de vrais utilisateurs** : "Used by vascular specialists across 12+ countries" est invérifiable. Les temoignages sont anonymes avec un disclaimer disant que les identites sont confidentielles. C'est honnete mais ca affaiblit considerablement la preuve sociale.
- **Difference reelle entre les plans** : sur la page pricing, le plan "Individual" dit "5 patient cases" mais pendant la beta tout est gratuit. C'est confus.

### 5 PLUS GROS FREINS

1. **Aucune preuve sociale verifiable** — pas de vrais noms, pas de logos d'hopitaux, pas de chiffres verifiables. Le "12+ countries" semble inventé pour un produit en beta.
2. **Le CTA FR "Essayer gratuitement"** manque la mention "sans carte bancaire" presente en EN et DE — c'est une perte de reassurance majeure en francais.
3. **11 modules sur la landing page** = surcharge cognitive enorme pour un novice. On ne sait pas par ou commencer, tout semble equivalent. Pas de hierarchie, pas de "le plus utilise", pas de parcours guide.
4. **Les pages app sans authentification** montrent un placeholder flou + un mur d'inscription. Le visiteur ne voit RIEN du produit reel avant de s'inscrire. Aucune raison de creer un compte.
5. **Le nom "EMOTIONSCARE"** dans le footer d'un produit medical vasculaire cree un decalage de credibilite important.

### 5 PRIORITES ABSOLUES

1. Ajouter "sans carte bancaire" au CTA francais
2. Reduire la grille modules a 6 principaux + "et plus" pour eviter la surcharge
3. Ajouter au moins une capture d'ecran ou video montrant le produit en action
4. Renforcer la section "Qui sommes-nous" avec des elements concrets (ville, expertise, mission courte)
5. Revoir la preuve sociale : remplacer "12+ countries" par un chiffre honnete ou le retirer

---

## 2. TABLEAU D'AUDIT COMPLET

| Priorite | Page / Zone | Probleme observe | Ressenti novice | Impact | Recommandation | Faisable maintenant ? |
|----------|-------------|------------------|-----------------|--------|----------------|-----------------------|
| P0 | Landing / Hero CTA FR | "Essayer gratuitement" sans mention "sans carte bancaire" | Le novice hesite a cliquer — peur de devoir payer | Conversion -20% | Changer en "Essayer gratuitement — sans carte bancaire" | Oui |
| P0 | Landing / Social proof | "12+ countries" invérifiable, temoignages anonymes | "Ca sent le fake" | Confiance | Retirer "12+" ou mettre un chiffre reel. Ajouter "Beta ouverte depuis [date]" | Oui (copy) |
| P1 | Landing / Modules | 11 cartes identiques, aucune hierarchie | Surcharge, on ne sait pas quoi lire | Abandon | Montrer 6 modules principaux, puis un lien "Decouvrir tous les modules" | Oui |
| P1 | Landing / About | "EMOTIONSCARE SASU" sans explication + aucun visage | "C'est qui ces gens ?" | Confiance | Ajouter une phrase sur l'entreprise, ville, fondateur | Oui (copy) |
| P1 | App pages sans auth | ContentGate montre un bloc flou + lock | "Je ne vois rien, pourquoi m'inscrire ?" | Conversion | Ajouter des screenshots ou descriptions des modules dans le gate | Non (design decision) |
| P1 | Pricing | "Free forever" + "$99/month" + "Custom" — mais tout est gratuit en beta | Confusion : "est-ce que je vais payer un jour ?" | Confiance | Renforcer visuellement le message beta, mettre les vrais prix en plus petit | Oui (copy) |
| P2 | Landing / Hero | Subtitle longue, enumere trop de features | Difficulte a retenir la proposition de valeur | Comprehension | Raccourcir a une phrase benefice-centree | Oui |
| P2 | Nav / Landing | "Features" comme lien de nav → scroll vers modules | Un novice s'attend a une page dediee | UX friction legere | OK mais renommer en "Modules" pour plus de clarte | Oui |
| P2 | Auth / Signup | Checkbox "I accept the Terms & Privacy" obligatoire mais sans resume | Le novice ne lira pas 2 pages juridiques | Friction inscription | Ajouter un resume en 1 ligne sous la checkbox | Oui (copy) |
| P2 | Footer | "SIREN 944 505 445" — jargon administratif francais visible dans toutes les langues | Confusion pour un non-francais | Credibilite | Garder uniquement en version FR, ou mettre dans une page "Legal entity" | Oui |
| P2 | Cookie banner | Apparait en bas, peut chevaucher le CTA mobile | Le novice doit fermer le bandeau avant d'agir | Friction | Verifier le z-index et le placement mobile | A tester |
| P3 | Landing / Testimonials | Les 3 temoignages se ressemblent beaucoup en ton | "On dirait du copier-coller" | Credibilite | Varier les formulations, ajouter des cas d'usage differents | Oui (copy) |
| P3 | Hero / Dashboard preview | Image statique, pas de contexte | "C'est quoi ce screenshot ?" | Engagement | Ajouter une legende sous l'image | Oui |
| P3 | Pricing / Professional | "$99" en EN, "99 €" en FR — OK mais pas de devise explicite en EN | Le novice US/non-EU ne sait pas si c'est USD | Clarte | Ajouter "$99 USD" | Oui |
| P3 | Onboarding step 4 | "Pseudonym" pour un patient — jargon | "C'est quoi un pseudonyme patient ?" | Friction | Ajouter un hint : "e.g. PAT-001 — a code name, not the real name" | Oui |

---

## 3. AMELIORATIONS PRIORITAIRES A IMPLEMENTER IMMEDIATEMENT

### Copy a reecrire

1. **CTA Hero FR** : "Essayer gratuitement" → "Essayer gratuitement — sans carte bancaire"
2. **Social proof EN** : "Used by vascular specialists across 12+ countries" → "Free beta — open to vascular specialists worldwide"  
   **FR** : "Utilisé par des spécialistes vasculaires dans plus de 12 pays" → "Bêta gratuite — ouverte aux spécialistes vasculaires du monde entier"  
   **DE** : "Genutzt von Gefäßspezialisten in über 12 Ländern" → "Kostenlose Beta — offen für Gefäßspezialisten weltweit"
3. **Hero subtitle EN** : trop long, raccourcir → "Manage patients, generate AI reports, track outcomes and collaborate with experts — one secure platform for vascular medicine."
4. **Modules section** : garder les 6 modules principaux visibles, regrouper les 5 derniers sous un bloc "More Capabilities" avec un style plus compact (pas des cartes pleine taille).
5. **Dashboard preview** : ajouter une legende sous l'image.

### CTA a renommer
- Aucun CTA n'est mal nomme a proprement parler, mais le CTA FR manque la reassurance "sans carte bancaire".

### Sections a reorganiser
- Les 11 modules doivent etre hierarchises : 6 principaux en cartes + 5 secondaires en liste compacte.

### Elements de confiance a ajouter
- Ajouter la date de lancement de la beta dans le hero badge ou sous le CTA.

---

## 4. PLAN D'IMPLEMENTATION

### Modifications a effectuer

**A. i18n — 3 fichiers (en.ts, fr.ts, de.ts)**

1. FR hero CTA : ajouter "— sans carte bancaire"
2. Social proof : remplacer le claim "12+ countries" par un message beta honnete dans les 3 langues
3. Ajouter une legende pour le dashboard preview dans les 3 langues
4. Hero subtitle EN : legerement raccourci pour plus de clarte

**B. Landing.tsx**

1. Separer les modules en 2 groupes : 6 principaux (cartes) + 5 secondaires (plus compacts, sous un sous-titre "More Capabilities")
2. Ajouter un `<p>` de legende sous l'image du dashboard preview
3. Ajouter la date de beta dans le badge ou social proof line

**C. Aucune modification backend/DB necessaire**

Toutes les modifications sont du copy et de la structure de la landing page.

