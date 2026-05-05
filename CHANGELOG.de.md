# Änderungsverlauf

## v2.2.0 — Methodischer Rahmen & Anti-Überversprechen-Schutz (2026-05-05)

Stärkt die akademische Klarheit für die CHUV-Einreichung: VASCU-LINK / AquaMR Flow wird als diagnostische Konkordanzstudie mit pragmatischer Nicht-Unterlegenheits-Rationale positioniert, nicht als Überlegenheitsanspruch gegenüber MRT / CTA / Katheter-Angiographie im Krankenhaus.

### Methodischer Rahmen
- Diagnostische Konkordanz mit pragmatischer Nicht-Unterlegenheits-Rationale — kein Überlegenheitsanspruch gegenüber Krankenhaus-MRT / CTA / Katheter-Angiographie.
- Doppler-First-Regel bleibt explizit: Duplex-Sonographie bleibt erste hämodynamische Untersuchung.
- Verpflichtender Sicherheitsrückfall: Ist die AquaMR-Kartographie nicht interpretierbar, empfiehlt das L1-Board Standardbildgebung.
- L1-Umfang beschränkt auf *See & Decide* (prä-revaskularisations-Kartographie); keine autonome humane Revaskularisation.

### Hinzugefügt
- NonInferioritySection auf Landing und Protokoll (EN/FR/DE).
- AboveHeroFramingLine — Forschungsprototyp-Banner über dem Home-Hero.
- ProtocolNonSuperiorityFAQ — 4 Q&A auf /protocol.
- Vorstellungsvideo (30 s Remotion-Teaser) via HomeIntroVideoSection.
- AI Audit Card — versionierte Evidenz, Kliniker-Bestätigungshistorie, PDF-Export.
- PROBAST-Badge auf dem Digital Twin (EN/FR/DE) + visuelle Regression.
- Öffentliche T12-Seiten mit validiertem ResearchProject JSON-LD.

### Geändert
- Öffentliche Preisgestaltung entfernt — nur institutioneller/Forschungszugang.
- Regulatorischer Disclaimer global eingebunden.

### Schutzmaßnahmen
- npm run check:overpromise — markiert marketinglastige Überlegenheits-/Ersatzformulierungen.
- npm run check:release — prüft, dass CHANGELOG, README und appVersion.ts in Version + Datum übereinstimmen.
- npm run check:prepublish verkettet overpromise + i18n + Versionskonsistenz.
- Rollenbasierte Evidenzbestätigung (Kliniker/Reviewer) mit Audit-Log-Abdeckung.

### Sicherheit
- EXECUTE auf der SECURITY DEFINER Trigger-Funktion eingeschränkt; nicht authentifizierter Aufruf blockiert (Supabase-Linter sauber).

## v2.0.0 — AquaMR Flow Rebrand (2026-03-20)

Vollständiges Rebranding von Vascular Atlas zu AquaMR Flow — nicht-ionisierende, kontrastmittelsparende vaskuläre Workflow-Plattform.

### Hinzugefügt
- Procedure Planner (IVUS-first, OCT-saline, kontrastfreie MRA).
- Fusion Viewer (MRT / IVUS / OCT / Ultraschall) DICOM-fähig.
- CI-AKI Prevention Engine (eGFR-basierte Stratifizierung).
- Premium-Dark-First-Medtech-Designsystem.
- „Forschungsprototyp"-Badges auf allen klinischen Modulen.

### Geändert
- Navigation neu strukturiert: flacher klinischer Workflow + zusammenklappbarer Plattform-Bereich.
- Branding / SEO / i18n auf AquaMR Flow aktualisiert.
