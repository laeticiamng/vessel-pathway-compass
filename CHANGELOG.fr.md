# Journal des évolutions

## v2.2.0 — Cadrage méthodologique et garde-fous anti-survente (2026-05-05)

Renforce la clarté académique pour la soumission académique : VASCU-LINK / AquaMR Flow est positionné comme une étude de concordance diagnostique avec rationnel pragmatique de non-infériorité, et non comme une revendication de supériorité face à l'IRM / angio-CT / artériographie hospitalière.

### Cadrage méthodologique
- Concordance diagnostique avec rationnel pragmatique de non-infériorité — aucune revendication de supériorité face à l'IRM / angio-CT / artériographie hospitalière.
- Règle Doppler-first explicite : l'écho-Doppler reste l'examen hémodynamique de première ligne.
- Filet de sécurité obligatoire : si la cartographie AquaMR n'est pas interprétable, le board L1 recommande l'imagerie standard.
- Le périmètre L1 est restreint au *See & Decide* (cartographie pré-revascularisation) ; aucune revascularisation humaine autonome.

### Ajouté
- NonInferioritySection sur la landing et le protocole (EN/FR/DE).
- AboveHeroFramingLine — bandeau prototype de recherche au-dessus du hero d'accueil.
- ProtocolNonSuperiorityFAQ — 4 questions/réponses sur /protocol.
- Vidéo de présentation (teaser Remotion 30 s) via HomeIntroVideoSection.
- AI Audit Card — preuves versionnées, historique de confirmation cliniciens, export PDF.
- Badge PROBAST sur le Digital Twin (EN/FR/DE) + régression visuelle.
- Pages publiques T12 avec JSON-LD ResearchProject validé.

### Modifié
- Tarification publique retirée — accès institutionnel/recherche uniquement.
- Disclaimer réglementaire monté globalement.

### Garde-fous
- npm run check:overpromise — détecte les formulations marketing de supériorité/remplacement.
- npm run check:release — vérifie que CHANGELOG, README et appVersion.ts s'accordent sur la version + la date.
- npm run check:prepublish enchaîne overpromise + i18n + cohérence de version.
- Confirmation des preuves restreinte aux rôles clinicien/relecteur avec couverture audit-log.

### Sécurité
- EXECUTE restreint sur la fonction trigger SECURITY DEFINER ; invocation non authentifiée bloquée (linter Supabase au vert).

## v2.0.0 — Rebrand AquaMR Flow (2026-03-20)

Rebrand complet de Vascular Atlas vers AquaMR Flow — plateforme de workflow vasculaire non ionisante et économe en produit de contraste.

### Ajouté
- Procedure Planner (IVUS-first, OCT-saline, ARM sans contraste).
- Fusion Viewer (IRM / IVUS / OCT / Échographie) prêt pour DICOM.
- CI-AKI Prevention Engine (stratification basée DFG).
- Design system premium dark-first medtech.
- Badges « Prototype de recherche » sur tous les modules cliniques.

### Modifié
- Navigation restructurée : workflow clinique à plat + section plateforme repliable.
- Branding / SEO / i18n mis à jour pour AquaMR Flow.
