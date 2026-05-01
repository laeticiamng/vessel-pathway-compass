# Hardcoded UI Strings — i18n Audit

_Generated: 2026-05-01T09:27:55.594Z_

**Methodology:** static scan of `.tsx` files for JSX text, prop strings (title/label/placeholder/description/aria-label/alt/tooltip), and toast messages that look like user-facing copy. Strings already wrapped in `t("…")`, code identifiers, technical tokens, units, and clinical instrument names (VascuQol-6, CIVIQ-14, WIQ, 6-MWT, ABI, …) are filtered out per project i18n rules.

**Coverage columns** (per language): `✓` = same literal already exists somewhere in the dictionary (likely just needs key-wiring), `✗` = the literal does not appear in that locale's dictionary (truly missing translation).

## Summary by wave

| Wave | Files w/ hits | Findings | FR ✗ | EN ✗ | DE ✗ |
|---|---:|---:|---:|---:|---:|
| Wave 1 — Public site (landing / pricing / legal / FAQ / support) | 8 | 46 | 40 | 46 | 46 |
| Wave 2 — Patient flow + L1 / VASCU-LINK / Power | 11 | 49 | 49 | 47 | 49 |
| Wave 3 — VascScreen + Digital Twin + Dashboard + Analytics | 20 | 54 | 54 | 50 | 54 |
| Wave 4 — Research / Education / Simulation / Governance / Admin | 36 | 294 | 290 | 288 | 294 |
| Wave 5 — Remaining VASCU-LINK scientific components | 14 | 52 | 52 | 51 | 52 |
| Wave 6 — Layout, navigation & misc | 1 | 1 | 1 | 1 | 1 |
| Unassigned | 2 | 2 | 2 | 2 | 2 |

**Total findings:** 498 across 147 scanned files.

## Wave 1 — Public site (landing / pricing / legal / FAQ / support)

### `src/pages/Landing.tsx` — 17 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 129 | prop:title | ✗ | ✗ | ✗ | AquaMR Flow \| Plateforme de workflow non ionisant pour la médecine vasculaire |
| 130 | prop:description | ✗ | ✗ | ✗ | AquaMR Flow est une plateforme de workflow non ionisant pour la médecine vasculaire : planification, imagerie, simulatio |
| 135 | prop:aria-label | ✗ | ✗ | ✗ | Main navigation |
| 233 | jsx-text | ✗ | ✗ | ✗ | Bêta ouverte — accès complet gratuit |
| 239 | jsx-text | ✗ | ✗ | ✗ | Plus de contrôle sur vos procédures vasculaires. |
| 243 | jsx-text | ✗ | ✗ | ✗ | AquaMR Flow centralise planification, imagerie multimodale, stratification CI-AKI et registre — pour les équipes vascula |
| 249 | jsx-text | ✓ | ✗ | ✗ | Créer un compte gratuit |
| 255 | jsx-text | ✗ | ✗ | ✗ | Voir comment ça marche |
| 260 | jsx-text | ✗ | ✗ | ✗ | Accès complet pendant la bêta |
| 261 | jsx-text | ✗ | ✗ | ✗ | Données pseudonymisées, RGPD |
| 263 | jsx-text | ✗ | ✗ | ✗ | Prototype de recherche — pas un dispositif médical. Toute aide à la décision nécessite la confirmation d'un clinicien. |
| 278 | prop:alt | ✗ | ✗ | ✗ | AquaMR Flow clinical dashboard showing patient statistics, risk distribution and module overview |
| 309 | jsx-text | ✗ | ✗ | ✗ | Three concentric circles · 4-zero angiographic function · proximity vascular medicine. Doctoral protocol of Dr Laëticia  |
| 493 | prop:aria-label | ✗ | ✗ | ✗ | Footer produit |
| 494 | jsx-text | ✓ | ✗ | ✗ | Fonctionnalités |
| 498 | jsx-text | ✓ | ✗ | ✗ | Sécurité et confidentialité |
| 503 | prop:aria-label | ✗ | ✗ | ✗ | Footer juridique |

### `src/components/landing/HomeSections.tsx` — 12 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 63 | jsx-text | ✗ | ✗ | ✗ | En bref |
| 66 | jsx-text | ✗ | ✗ | ✗ | Comprendre AquaMR Flow en quelques secondes. |
| 117 | jsx-text | ✗ | ✗ | ✗ | À qui s’adresse AquaMR Flow ? |
| 120 | jsx-text | ✗ | ✗ | ✗ | Une plateforme pensée pour les équipes vasculaires. |
| 171 | jsx-text | ✗ | ✗ | ✗ | Comment ça marche ? |
| 174 | jsx-text | ✗ | ✗ | ✗ | Un parcours en quatre étapes. |
| 227 | jsx-text | ✗ | ✗ | ✗ | Cas d’usage |
| 230 | jsx-text | ✗ | ✗ | ✗ | Trois manières concrètes d’utiliser AquaMR Flow. |
| 305 | jsx-text | ✓ | ✗ | ✗ | Questions fréquentes |
| 308 | jsx-text | ✗ | ✗ | ✗ | Les réponses essentielles, sans promesses. |
| 328 | jsx-text | ✗ | ✗ | ✗ | Consulter la FAQ complète |
| 332 | jsx-text | ✗ | ✗ | ✗ | contacter l’équipe |

### `src/pages/Contact.tsx` — 9 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 29 | toast | ✗ | ✗ | ✗ | Message envoyé. Nous reviendrons vers vous rapidement. |
| 35 | toast | ✗ | ✗ | ✗ | Une erreur est survenue. Réessayez plus tard. |
| 44 | prop:title | ✗ | ✗ | ✗ | Contact — Échanger avec l’équipe AquaMR Flow |
| 45 | prop:description | ✗ | ✗ | ✗ | Contactez l’équipe AquaMR Flow pour toute question sur la plateforme, son périmètre, ses cas d’usage ou un éventuel accè |
| 50 | prop:aria-label | ✗ | ✗ | ✗ | Navigation principale |
| 72 | jsx-text | ✗ | ✗ | ✗ | Une question sur AquaMR Flow ? Écrivez-nous, nous vous répondrons rapidement. |
| 96 | prop:placeholder | ✓ | ✗ | ✗ | Votre nom |
| 117 | prop:placeholder | ✗ | ✗ | ✗ | Décrivez votre question ou votre demande… |
| 141 | jsx-text | ✓ | ✗ | ✗ | Sécurité et confidentialité |

### `src/components/ErrorBoundary.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 42 | jsx-text | ✗ | ✗ | ✗ | An unexpected error occurred. Please try refreshing the page or return to the home page. |
| 44 | jsx-text | ✗ | ✗ | ✗ | Une erreur inattendue s'est produite. Veuillez rafraîchir la page ou retourner à l'accueil. |
| 46 | jsx-text | ✗ | ✗ | ✗ | Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu oder kehren Sie zur Startseite zurück. |

### `src/pages/Auth.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 276 | jsx-text | ✗ | ✗ | ✗ | = 8 ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(password) ? 1  |
| 291 | jsx-text | ✗ | ✗ | ✗ | = 8 ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(password) ? 1  |

### `src/components/ContentGate.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 16 | jsx-text | ✗ | ✗ | ✗ | ; const benefits = (t("contentGate.benefits") as any) as string[] \| undefined; return ( |

### `src/components/UsageLimitBanner.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 23 | jsx-text | ✗ | ✗ | ✗ | = limit; const nearLimit = current >= limit - 1; if (!nearLimit) return null; return ( |

### `src/pages/Pricing.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 164 | jsx-text | ✗ | ✗ | ✗ | pendant la bêta |

## Wave 2 — Patient flow + L1 / VASCU-LINK / Power

### `src/pages/app/L1DecisionBoard.tsx` — 24 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 84 | jsx-text | ✗ | ✗ | ✗ | (""); const [assessmentId, setAssessmentId] = useState |
| 85 | jsx-text | ✗ | ✗ | ✗ | (null); const [clinicalContext, setClinicalContext] = useState |
| 86 | jsx-text | ✗ | ✗ | ✗ | (EMPTY_CONTEXT); const [hemodynamics, setHemodynamics] = useState |
| 87 | jsx-text | ✗ | ✗ | ✗ | (EMPTY_HEMO); const [aquamrFindings, setAquamrFindings] = useState |
| 88 | jsx-text | ✗ | ✗ | ✗ | (EMPTY_AQUA); const [c4i, setC4i] = useState |
| 89 | jsx-text | ✗ | ✗ | ✗ | (EMPTY_C4I); const [proms, setProms] = useState |
| 90 | jsx-text | ✗ | ✗ | ✗ | (EMPTY_PROMS); const [decisionBefore, setDecisionBefore] = useState |
| 91 | jsx-text | ✗ | ✗ | ✗ | (null); const [decisionAfter, setDecisionAfter] = useState |
| 92 | jsx-text | ✗ | ✗ | ✗ | (null); const [clinicianSummary, setClinicianSummary] = useState |
| 93 | jsx-text | ✗ | ✗ | ✗ | (""); const [signoffStatus, setSignoffStatus] = useState |
| 94 | jsx-text | ✗ | ✗ | ✗ | ("draft"); const [signedAt, setSignedAt] = useState |
| 347 | jsx-text | ✗ | ✗ | ✗ | , hemodynamics: hemodynamics as Record |
| 348 | jsx-text | ✗ | ✗ | ✗ | , aquamr_findings: aquamrFindings as Record |
| 350 | jsx-text | ✗ | ✗ | ✗ | , proms_summary: proms as Record |
| 490 | prop:title | ✗ | ✗ | ✗ | L1 Decision Board — VASCU-LINK |
| 491 | prop:description | ✗ | ✗ | ✗ | L1 Pre-Revascularization Decision Board: AquaMR cartography, C4-i and decision impact. |
| 502 | jsx-text | ✗ | ✗ | ✗ | VASCU-LINK pre-revascularization decision support. L1 makes the AOMI patient legible, classable and routable — never aut |
| 509 | jsx-text | ✗ | ✓ | ✗ | Research prototype |
| 520 | jsx-text | ✗ | ✗ | ✗ | Outputs require qualified clinician review. If AquaMR quality is insufficient, standard-of-care imaging must be used. No |
| 536 | jsx-text | ✗ | ✗ | ✗ | Case selection |
| 537 | jsx-text | ✗ | ✗ | ✗ | Choose an existing case. The L1 assessment is anchored to that case and inherits its institution-level access controls. |
| 559 | jsx-text | ✗ | ✗ | ✗ | Patient ID (pseudonymized): |
| 564 | jsx-text | ✗ | ✗ | ✗ | No cases available. Create a patient case first from the Patients module. |
| 634 | jsx-text | ✗ | ✗ | ✗ | Research prototype — not a certified medical device. All clinical decisions remain the responsibility of the supervising |

### `src/components/patient/CaseReplayDialog.tsx` — 5 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 54 | jsx-text | ✗ | ✗ | ✗ | Voir à la date… |
| 61 | jsx-text | ✗ | ✗ | ✗ | Reconstitue l'état du dossier à un instant T à partir de l'historique versionné immuable. |
| 86 | jsx-text | ✗ | ✗ | ✗ | ) : date && !snapshot ? ( |
| 88 | jsx-text | ✗ | ✗ | ✗ | Aucune révision n'existait à cette date. |
| 88 | jsx-text | ✗ | ✗ | ✗ | ) : snapshot && current ? ( |

### `src/components/patient/MeasurementTrendChart.tsx` — 4 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 52 | jsx-text | ✗ | ✗ | ✗ | m.measurement_type))]; // Combined chart data (all types pivoted by date) const byDate = new Map |
| 64 | jsx-text | ✗ | ✗ | ✗ | (a._ts as number) - (b._ts as number) ); // Per-type chart data const perType = new Map |
| 283 | jsx-text | ✗ | ✗ | ✗ | = ref.min && val |
| 285 | jsx-text | ✗ | ✗ | ✗ | = ref.critical.above) \|\| (ref.critical.below && val |

### `src/components/patient/PatientDialogs.tsx` — 4 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 24 | jsx-text | ✗ | ✗ | ✗ | void; patient: Tables |
| 25 | jsx-text | ✗ | ✗ | ✗ | ; mutation: UseMutationResult |
| 94 | jsx-text | ✗ | ✗ | ✗ | void; mutation: UseMutationResult |
| 154 | jsx-text | ✗ | ✗ | ✗ | void; mutation: UseMutationResult |

### `src/components/patient/CaseRevisionsTimeline.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 62 | jsx-text | ✗ | ✗ | ✗ | Historique versionné (event sourcing) |
| 71 | jsx-text | ✗ | ✗ | ✗ | ) : !data \|\| data.length === 0 ? ( |
| 73 | jsx-text | ✗ | ✗ | ✗ | Aucune révision enregistrée. |

### `src/components/patient/PatientMeasurements.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 111 | prop:aria-label | ✗ | ✓ | ✗ | Select all |
| 129 | prop:aria-label | ✗ | ✗ | ✗ | Select ${m.measurement_type} |

### `src/components/patient/RiskFactorsEditor.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 68 | jsx-text | ✗ | ✗ | ✗ | = 4 ? "critical" : riskFactors.length >= 3 ? "high" : riskFactors.length >= 1 ? "moderate" : "low"; const riskColors: Re |
| 76 | jsx-text | ✗ | ✗ | ✗ | !riskFactors.includes(f)); return ( |

### `src/pages/app/PatientDetail.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 49 | jsx-text | ✗ | ✗ | ✗ | (null); const [deleteMeasId, setDeleteMeasId] = useState |
| 195 | toast.description | ✗ | ✗ | ✗ | ${patientName} ${t( |

### `src/components/l1/DecisionComparisonPanel.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 54 | jsx-text | ✗ | ✗ | ✗ | void; disabled?: boolean; decisionLabel: Record |

### `src/components/patient/PatientHeader.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 9 | jsx-text | ✗ | ✗ | ✗ | ; latestCase?: Tables |

### `src/components/patient/PatientTimeline.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 112 | prop:aria-label | ✗ | ✗ | ✗ | Select ${ev.title} |

## Wave 3 — VascScreen + Digital Twin + Dashboard + Analytics

### `src/pages/app/VascScreenAnalytics.tsx` — 7 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 69 | prop:label | ✗ | ✗ | ✗ | W${Math.ceil((weekStart.getDate() + weekStart.getDay()) / 7)} |
| 73 | jsx-text | ✗ | ✗ | ✗ | = weekStart && cd |
| 110 | jsx-text | ✗ | ✗ | ✗ | ; if (value |
| 164 | jsx-text | ✗ | ✗ | ✗ | Detection Rate |
| 188 | prop:name | ✗ | ✓ | ✗ | PAD Detected |
| 198 | jsx-text | ✗ | ✗ | ✗ | Age Distribution |
| 218 | jsx-text | ✗ | ✗ | ✗ | Gender Distribution |

### `src/components/vascscreen/StudyExport.tsx` — 6 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 62 | toast | ✗ | ✗ | ✗ | CSV exported |
| 89 | toast | ✗ | ✗ | ✗ | JSON exported |
| 93 | jsx-text | ✗ | ✗ | ✗ | p.screeningEligible).length; const padDetected = patients.filter((p) => p.padConfirmed).length; const referred = patient |
| 120 | jsx-text | ✗ | ✓ | ✗ | Total patients |
| 128 | jsx-text | ✗ | ✓ | ✗ | PAD confirmed |
| 132 | jsx-text | ✗ | ✗ | ✗ | Mean dx delay (d) |

### `src/pages/app/Analytics.tsx` — 6 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 70 | jsx-text | ✗ | ✗ | ✗ | ("all"); const [categoryFilter, setCategoryFilter] = useState |
| 71 | jsx-text | ✗ | ✗ | ✗ | ("all"); const [institutionFilter, setInstitutionFilter] = useState |
| 72 | jsx-text | ✗ | ✗ | ✗ | ("all"); const dashboardRef = useRef |
| 257 | jsx-text | ✗ | ✗ | ✗ | d.value > 0); // Gadolinium avoided by month const byMonth: Record |
| 716 | jsx-text | ✗ | ✗ | ✗ | ) : !recentEvents \|\| recentEvents.length === 0 ? ( |
| 839 | prop:name | ✗ | ✗ | ✗ | Gd avoided (mg) |

### `src/components/digital-twin/SegmentDetail.tsx` — 4 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 52 | jsx-text | ✗ | ✗ | ✗ | 5) return "up"; if (diff |
| 58 | jsx-text | ✗ | ✗ | ✗ | ; if (trend === "down") return |
| 148 | jsx-text | ✗ | ✗ | ✗ | x.value)); const min = Math.min(...values.map((x) => x.value)); const range = max - min \|\| 1; const height = ((v.value - |
| 157 | prop:title | ✗ | ✗ | ✗ | ${v.value} ${v.unit} — ${new Date(v.measured_at).toLocaleDateString()} |

### `src/components/dashboard/PatientRiskDistribution.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 95 | jsx-text | ✗ | ✗ | ✗ | 0 ? (dist[level] / total) * 100 : 0; if (pct === 0) return null; return ( |
| 106 | prop:title | ✗ | ✗ | ✗ | ${RISK_CONFIG[level].label}: ${dist[level]} (${Math.round(pct)}%) |
| 115 | jsx-text | ✗ | ✗ | ✗ | 0 ? Math.round((dist[level] / total) * 100) : 0; const config = RISK_CONFIG[level]; return ( |

### `src/components/digital-twin/VascularMap.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 96 | jsx-text | ✗ | ✗ | ✗ | void; segmentStatus?: Record |
| 223 | jsx-text | ✗ | ✗ | ✗ | s.id === hoveredSegment)!; const tx = seg.x + seg.width / 2; const ty = seg.y - 8; const feasibility = contrastFreeMode  |
| 250 | jsx-text | ✗ | ✗ | ✗ | Bio-contrast possible |

### `src/components/vascscreen/AngiologistDashboard.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 52 | jsx-text | ✗ | ✗ | ✗ | Pending Referrals |
| 66 | jsx-text | ✗ | ✓ | ✗ | PAD Confirmed |
| 73 | jsx-text | ✗ | ✗ | ✗ | Referred Patients |

### `src/components/vascscreen/StudyConsentForm.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 52 | jsx-text | ✗ | ✗ | ✗ | This study evaluates the impact of a digital PAD screening tool (VascScreen) on screening rates in Swiss primary care. Y |
| 57 | jsx-text | ✗ | ✗ | ✗ | Participation is voluntary. You may withdraw at any time without impact on your care. |
| 74 | jsx-text | ✗ | ✗ | ✗ | I understand that my data will be pseudonymized (no direct identifiers stored) |

### `src/pages/app/VascScreenStudy.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 117 | toast | ✗ | ✗ | ✗ | Cohort created |
| 137 | jsx-text | ✗ | ✗ | ✗ | 0 ? (outcomes.diagnosisTimes.reduce((a, b) => a + b, 0) / outcomes.diagnosisTimes.length).toFixed(1) : "N/A"; return ( |
| 195 | jsx-text | ✗ | ✗ | ✗ | Key study metrics for Dr. med. thesis |

### `src/components/vascscreen/RiskScoreCalculator.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 17 | jsx-text | ✗ | ✗ | ✗ | div]:bg-green-500"; if (score |
| 18 | jsx-text | ✗ | ✗ | ✗ | div]:bg-yellow-500"; if (score |

### `src/components/vascscreen/ScreeningTimeline.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 28 | jsx-text | ✗ | ✗ | ✗ | s.key === currentStep); return ( |
| 33 | jsx-text | ✗ | ✗ | ✗ | Screening Workflow |

### `src/pages/app/DigitalTwin.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 20 | jsx-text | ✗ | ✗ | ✗ | (null); const [selectedSegment, setSelectedSegment] = useState |
| 127 | jsx-text | ✗ | ✗ | ✗ | p.id === selectedPatientId); const eventIcons: Record |

### `src/pages/app/VascScreenDashboard.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 50 | jsx-text | ✗ | ✗ | ✗ | new Date(p.created_at) >= startOfMonth).length; const thisWeek = all.filter((p: any) => new Date(p.created_at) >= startO |
| 95 | jsx-text | ✗ | ✗ | ✗ | = d && cd |

### `src/pages/app/VascScreenPatientEntry.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 25 | jsx-text | ✗ | ✗ | ✗ | (null); const [riskScore, setRiskScore] = useState |
| 26 | jsx-text | ✗ | ✗ | ✗ | (0); const [patientData, setPatientData] = useState |

### `src/components/dashboard/OnboardingChecklist.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 28 | jsx-text | ✗ | ✗ | ✗ | s.done).length; if (completedCount >= 3) return null; return ( |

### `src/components/vascscreen/ABIInterpreter.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 20 | jsx-text | ✗ | ✗ | ✗ | ( defaultRight ? interpretABI(defaultRight) : null ); const [leftResult, setLeftResult] = useState |

### `src/components/vascscreen/PatientFlowChart.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 31 | jsx-text | ✗ | ✗ | ✗ | 1.0), Borderline (0.91-0.99), PAD ( |

### `src/components/vascscreen/PatientRiskForm.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 30 | jsx-text | ✗ | ✗ | ✗ | void; defaultValues?: Partial |

### `src/pages/app/VascScreenAssessment.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 39 | jsx-text | ✗ | ✗ | ✗ | No patient data found. Please start with patient entry. |

### `src/pages/app/VascScreenResults.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 97 | jsx-text | ✗ | ✗ | ✗ | No patient data found. Please start with patient entry. |

## Wave 4 — Research / Education / Simulation / Governance / Admin

### `src/pages/app/Governance.tsx` — 39 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 166 | toast | ✗ | ✗ | ✗ | Signoff co-signé |
| 175 | jsx-text | ✗ | ✗ | ✗ | e.severity === "critical" \|\| e.severity === "error").length ?? 0; const pendingSignoffs = signoffs?.filter((s) => s.stat |
| 181 | prop:description | ✗ | ✗ | ✗ | Tableau de bord gouvernance, conformité et audit |
| 185 | jsx-text | ✗ | ✗ | ✗ | Gouvernance & Conformité |
| 188 | jsx-text | ✗ | ✗ | ✗ | Audit transverse, signoffs cliniques, RGPD, cycle de vie des données. |
| 202 | jsx-text | ✗ | ✗ | ✗ | Événements critiques |
| 223 | jsx-text | ✗ | ✓ | ✗ | Hospital Admin |
| 224 | jsx-text | ✗ | ✓ | ✗ | Research Lead |
| 225 | jsx-text | ✗ | ✓ | ✗ | Expert Reviewer |
| 231 | jsx-text | ✗ | ✗ | ✗ | Réservé aux DPO (admin / super_admin). |
| 237 | jsx-text | ✗ | ✗ | ✗ | Recherche audit avancée |
| 249 | jsx-text | ✓ | ✗ | ✗ | Santé système |
| 255 | jsx-text | ✗ | ✗ | ✗ | DPIA (art. 35) |
| 261 | jsx-text | ✗ | ✗ | ✗ | Utilisateurs & rôles |
| 267 | jsx-text | ✗ | ✗ | ✗ | Score de conformité |
| 279 | jsx-text | ✗ | ✗ | ✗ | Audit exports (SHA-256) |
| 290 | jsx-text | ✗ | ✗ | ✗ | Journal de gouvernance (200 derniers) |
| 291 | jsx-text | ✗ | ✗ | ✗ | Tous les événements de sécurité, conformité, clinique et administration. |
| 310 | jsx-text | ✗ | ✗ | ✗ | Aucun événement. |
| 319 | jsx-text | ✗ | ✗ | ✗ | Demandes RGPD |
| 320 | jsx-text | ✗ | ✗ | ✗ | Délai légal de traitement : 30 jours. |
| 332 | jsx-text | ✗ | ✗ | ✗ | EN RETARD |
| 343 | jsx-text | ✗ | ✗ | ✗ | Aucune demande RGPD. |
| 352 | jsx-text | ✗ | ✗ | ✗ | Durées de conservation et actions automatiques (RGPD art. 5). |
| 378 | jsx-text | ✗ | ✗ | ✗ | Réservé aux Hospital Admin. |
| 382 | jsx-text | ✗ | ✗ | ✗ | Activité de l'institution |
| 383 | jsx-text | ✗ | ✗ | ✗ | Événements de gouvernance scoped à votre institution. |
| 388 | jsx-text | ✗ | ✗ | ✗ | e.event_category === "clinical" \|\| e.event_category === "administration").slice(0, 50).map((e) => ( |
| 394 | jsx-text | ✗ | ✗ | ✗ | Aucun événement institution. |
| 405 | jsx-text | ✗ | ✗ | ✗ | Réservé aux Research Lead. |
| 409 | jsx-text | ✗ | ✗ | ✗ | Événements recherche & exports |
| 410 | jsx-text | ✗ | ✗ | ✗ | Traçabilité des exports anonymisés et de l'éligibilité des cohortes. |
| 415 | jsx-text | ✗ | ✗ | ✗ | e.event_category === "research").slice(0, 50).map((e) => ( |
| 421 | jsx-text | ✗ | ✗ | ✗ | e.event_category === "research").length && ( |
| 422 | jsx-text | ✗ | ✗ | ✗ | Aucun événement recherche pour le moment. |
| 434 | jsx-text | ✗ | ✗ | ✗ | Réservé aux Expert Reviewer. |
| 438 | jsx-text | ✗ | ✗ | ✗ | Signoffs cliniques |
| 439 | jsx-text | ✗ | ✗ | ✗ | Validez (cosignez) les décisions cliniques en attente. |
| 459 | jsx-text | ✗ | ✗ | ✗ | Aucun signoff. |

### `src/pages/app/InstitutionAdmin.tsx` — 31 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 38 | jsx-text | ✗ | ✗ | ✗ | ([]); const [selectedId, setSelectedId] = useState |
| 39 | jsx-text | ✗ | ✗ | ✗ | (null); const [form, setForm] = useState |
| 113 | toast | ✗ | ✗ | ✗ | Paramètres enregistrés |
| 127 | jsx-text | ✗ | ✗ | ✗ | Accès refusé |
| 128 | jsx-text | ✗ | ✗ | ✗ | Réservé aux hospital admins et administrateurs. |
| 136 | prop:title | ✗ | ✗ | ✗ | Administration institution |
| 136 | prop:description | ✗ | ✗ | ✗ | Tableau de bord cloisonné par hôpital |
| 140 | jsx-text | ✗ | ✗ | ✗ | Administration institution |
| 143 | jsx-text | ✗ | ✗ | ✗ | Métriques cloisonnées par hôpital, paramètres de conformité et data residency. |
| 149 | jsx-text | ✗ | ✗ | ✗ | Aucune institution rattachée à votre compte. |
| 169 | jsx-text | ✗ | ✗ | ✗ | Activité opérationnelle |
| 170 | jsx-text | ✗ | ✗ | ✗ | Métriques scopées à cette institution uniquement. |
| 178 | jsx-text | ✗ | ✗ | ✗ | Patients actifs |
| 182 | jsx-text | ✗ | ✗ | ✗ | Cas cliniques |
| 190 | jsx-text | ✗ | ✗ | ✗ | Anomalies 7j |
| 198 | jsx-text | ✗ | ✗ | ✗ | Événements 30j |
| 209 | jsx-text | ✗ | ✗ | ✗ | Paramètres de conformité |
| 210 | jsx-text | ✗ | ✗ | ✗ | Data residency, classe de dispositif médical et contact DPO. |
| 215 | jsx-text | ✗ | ✗ | ✗ | Région de données |
| 219 | jsx-text | ✗ | ✗ | ✗ | EU West (Irlande) |
| 220 | jsx-text | ✗ | ✗ | ✗ | EU Central (Francfort) |
| 221 | jsx-text | ✗ | ✗ | ✗ | EU North (Stockholm) |
| 226 | jsx-text | ✗ | ✗ | ✗ | Classe MDR |
| 230 | jsx-text | ✗ | ✗ | ✗ | Classe I |
| 231 | jsx-text | ✗ | ✗ | ✗ | Classe IIa |
| 232 | jsx-text | ✗ | ✗ | ✗ | Classe IIb |
| 233 | jsx-text | ✗ | ✗ | ✗ | Classe III |
| 238 | jsx-text | ✗ | ✗ | ✗ | Contact DPO (email) |
| 242 | jsx-text | ✗ | ✗ | ✗ | Rétention spécifique (jours) |
| 243 | prop:placeholder | ✗ | ✗ | ✗ | laisse vide pour défaut |
| 250 | jsx-text | ✗ | ✗ | ✗ | ADR-013 — La sélection de région applique le routage de stockage au prochain provisioning. Les contrats SLA sont alignés |

### `src/pages/app/Dpia.tsx` — 21 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 90 | toast | ✗ | ✗ | ✗ | DPIA créée |
| 105 | toast | ✗ | ✗ | ✗ | Statut mis à jour |
| 137 | jsx-text | ✗ | ✗ | ✗ | Accès refusé |
| 138 | jsx-text | ✗ | ✗ | ✗ | Réservé aux DPO (admin / super_admin). |
| 146 | prop:description | ✗ | ✗ | ✗ | Analyses d |
| 151 | jsx-text | ✗ | ✗ | ✗ | DPIA — Analyses d'impact |
| 154 | jsx-text | ✗ | ✗ | ✗ | RGPD art. 35 · documentez les traitements à risque élevé. |
| 157 | jsx-text | ✗ | ✗ | ✗ | Nouvelle DPIA |
| 159 | jsx-text | ✗ | ✗ | ✗ | Créer une DPIA |
| 163 | prop:placeholder | ✗ | ✗ | ✗ | PHI, données de santé, identifiants |
| 163 | jsx-text | ✗ | ✗ | ✗ | Catégories de données (séparées par virgules) |
| 166 | jsx-text | ✗ | ✗ | ✗ | Base légale |
| 172 | jsx-text | ✗ | ✗ | ✗ | Obligation légale |
| 173 | jsx-text | ✗ | ✗ | ✗ | Intérêts vitaux |
| 174 | jsx-text | ✗ | ✗ | ✗ | Mission d'intérêt public |
| 175 | jsx-text | ✗ | ✗ | ✗ | Intérêts légitimes |
| 179 | jsx-text | ✗ | ✗ | ✗ | Risques identifiés (un par ligne) |
| 180 | jsx-text | ✗ | ✗ | ✗ | Mesures de mitigation (une par ligne) |
| 182 | jsx-text | ✗ | ✗ | ✗ | Niveau de risque résiduel |
| 187 | jsx-text | ✓ | ✗ | ✗ | Élevé |
| 202 | jsx-text | ✗ | ✗ | ✗ | Aucune DPIA. Créez la première pour documenter un traitement à risque. |

### `src/pages/app/LifecyclePolicies.tsx` — 20 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 39 | jsx-text | ✗ | ✗ | ✗ | (null); const [open, setOpen] = useState(false); const [form, setForm] = useState |
| 99 | toast | ✗ | ✗ | ✗ | Base légale requise |
| 128 | toast | ✗ | ✗ | ✗ | Politique supprimée |
| 137 | jsx-text | ✗ | ✗ | ✗ | Accès refusé |
| 138 | jsx-text | ✗ | ✗ | ✗ | Cette page est réservée aux DPO (admin / super_admin). |
| 146 | prop:description | ✗ | ✗ | ✗ | Gestion RGPD des durées de conservation |
| 154 | jsx-text | ✗ | ✗ | ✗ | Configurez les durées de conservation et les actions automatiques (RGPD art. 5 & 17). |
| 158 | jsx-text | ✗ | ✗ | ✗ | Nouvelle politique |
| 163 | jsx-text | ✗ | ✗ | ✗ | Politiques actives |
| 164 | jsx-text | ✗ | ✗ | ✗ | Exécutées quotidiennement par le job |
| 168 | jsx-text | ✗ | ✗ | ✗ | Aucune politique configurée. |
| 197 | jsx-text | ✗ | ✗ | ✗ | Une politique = un type d'entité + une durée + une action automatique. |
| 201 | jsx-text | ✗ | ✗ | ✗ | Type d'entité |
| 208 | jsx-text | ✗ | ✗ | ✗ | Action automatique |
| 215 | jsx-text | ✗ | ✗ | ✗ | Durée de rétention (jours) |
| 219 | jsx-text | ✗ | ✗ | ✗ | Base légale |
| 220 | prop:placeholder | ✗ | ✗ | ✗ | ex. RGPD art. 5.1.e – minimisation |
| 228 | jsx-text | ✗ | ✗ | ✗ | Impact estimé |
| 233 | jsx-text | ✗ | ✗ | ✗ | ligne(s) seraient affectées par |
| 233 | jsx-text | ✗ | ✗ | ✗ | dès la prochaine exécution. |

### `src/pages/app/SystemHealth.tsx` — 19 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 103 | jsx-text | ✗ | ✗ | ✗ | Accès refusé |
| 104 | jsx-text | ✗ | ✗ | ✗ | Réservé aux administrateurs (admin / super_admin). |
| 112 | prop:title | ✗ | ✗ | ✗ | Santé du système |
| 112 | prop:description | ✗ | ✗ | ✗ | Observabilité et métriques système |
| 116 | jsx-text | ✗ | ✗ | ✗ | Santé du système |
| 119 | jsx-text | ✗ | ✗ | ✗ | Métriques temps réel · rafraîchissement automatique toutes les 30s. |
| 130 | prop:label | ✗ | ✗ | ✗ | Événements critiques (7j) |
| 133 | prop:label | ✗ | ✗ | ✗ | Événements (24h) |
| 140 | jsx-text | ✗ | ✗ | ✗ | Volume de données |
| 143 | prop:label | ✗ | ✗ | ✗ | Patients actifs |
| 144 | prop:label | ✗ | ✗ | ✗ | Cas cliniques |
| 145 | prop:label | ✗ | ✗ | ✗ | Sorties IA |
| 146 | prop:label | ✗ | ✗ | ✗ | Utilisateurs actifs (30j) |
| 153 | jsx-text | ✗ | ✗ | ✗ | Conformité & cycle de vie |
| 168 | jsx-text | ✗ | ✗ | ✗ | Notifications non lues (toutes) |
| 172 | jsx-text | ✗ | ✗ | ✗ | Dernière exécution lifecycle |
| 184 | jsx-text | ✗ | ✗ | ✗ | Derniers événements critiques |
| 187 | jsx-text | ✗ | ✗ | ✗ | 10 derniers événements de sévérité critical/error. |
| 191 | jsx-text | ✗ | ✗ | ✗ | ✨ Aucun événement critique récent. |

### `src/components/admin/SLAWidget.tsx` — 16 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 94 | toast | ✗ | ✗ | ✗ | Incident SLA déclaré |
| 107 | jsx-text | ✗ | ✗ | ✗ | = 99.9 ? "ok" : metrics.uptime_pct >= 99 ? "warn" : "danger"; const uptimeClass = uptimeTone === "danger" ? "border-dest |
| 117 | jsx-text | ✗ | ✗ | ✗ | SLA & Observabilité (30j) |
| 120 | jsx-text | ✗ | ✗ | ✗ | Disponibilité, MTTR et incidents récents. |
| 126 | jsx-text | ✗ | ✗ | ✗ | Déclarer un incident |
| 131 | jsx-text | ✗ | ✗ | ✗ | Déclarer un incident SLA |
| 132 | jsx-text | ✗ | ✗ | ✗ | Sera tracé dans le journal de gouvernance. |
| 140 | jsx-text | ✗ | ✗ | ✗ | Sévérité |
| 144 | jsx-text | ✗ | ✗ | ✗ | Sev1 — Service indisponible |
| 145 | jsx-text | ✗ | ✗ | ✗ | Sev2 — Dégradation majeure |
| 146 | jsx-text | ✗ | ✗ | ✗ | Sev3 — Dégradation mineure |
| 147 | jsx-text | ✗ | ✗ | ✗ | Sev4 — Cosmétique |
| 152 | jsx-text | ✗ | ✗ | ✗ | Utilisateurs affectés |
| 161 | jsx-text | ✗ | ✗ | ✗ | Déjà résolu (calcul MTTR immédiat) |
| 188 | jsx-text | ✗ | ✗ | ✗ | MTTR moyen |
| 192 | jsx-text | ✗ | ✗ | ✗ | Incidents 30j |

### `src/pages/app/AuditSearch.tsx` — 16 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 101 | toast | ✗ | ✗ | ✗ | Aucun résultat à exporter |
| 131 | toast | ✗ | ✗ | ✗ | ${events?.length ?? 0} événements exportés (SHA-256 signé) |
| 139 | jsx-text | ✗ | ✗ | ✗ | Accès réservé aux DPO (admin / super_admin). |
| 147 | prop:title | ✗ | ✗ | ✗ | Recherche audit |
| 147 | prop:description | ✗ | ✗ | ✗ | Recherche avancée dans le journal de gouvernance |
| 151 | jsx-text | ✗ | ✗ | ✗ | Recherche audit avancée |
| 154 | jsx-text | ✗ | ✗ | ✗ | Filtrez le journal de gouvernance et exportez en CSV pour audit externe. |
| 162 | jsx-text | ✗ | ✗ | ✗ | 500 résultats max par requête. |
| 166 | jsx-text | ✓ | ✗ | ✗ | Catégorie |
| 175 | jsx-text | ✗ | ✗ | ✗ | Sévérité |
| 184 | jsx-text | ✗ | ✗ | ✗ | Action contient |
| 185 | prop:placeholder | ✗ | ✗ | ✗ | ex: patient.created |
| 188 | jsx-text | ✗ | ✗ | ✗ | Acteur (UUID) |
| 189 | prop:placeholder | ✗ | ✗ | ✗ | UUID utilisateur |
| 214 | jsx-text | ✓ | ✗ | ✗ | Résultats |
| 237 | jsx-text | ✗ | ✗ | ✗ | Aucun événement. |

### `src/pages/app/ComplianceScore.tsx` — 15 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 65 | jsx-text | ✗ | ✗ | ✗ | (query.state.error ? false : 60_000), retry: (failureCount, err) => !isForbiddenError(err) && failureCount |
| 73 | prop:title | ✗ | ✗ | ✗ | Score de conformité — Gouvernance |
| 73 | prop:description | ✗ | ✗ | ✗ | Score global de conformité RGPD/MDR de la plateforme. |
| 77 | jsx-text | ✗ | ✗ | ✗ | Score de conformité global |
| 78 | jsx-text | ✗ | ✗ | ✗ | Vision unifiée de la santé conformité (RGPD · MDR · ISO 14971). |
| 83 | jsx-text | ✗ | ✗ | ✗ | Historique 90j |
| 93 | jsx-text | ✗ | ✗ | ✗ | Accès refusé |
| 95 | jsx-text | ✗ | ✗ | ✗ | Le score de conformité est réservé aux rôles |
| 97 | jsx-text | ✗ | ✗ | ✗ | . Votre compte ne dispose pas des permissions nécessaires pour consulter cette page. |
| 103 | jsx-text | ✗ | ✗ | ✗ | Gérer les rôles utilisateurs |
| 124 | jsx-text | ✗ | ✗ | ✗ | ) : isLoading \|\| !data ? ( |
| 149 | prop:title | ✗ | ✗ | ✗ | DPIA approuvées |
| 155 | prop:title | ✗ | ✗ | ✗ | Demandes RGPD |
| 162 | prop:title | ✗ | ✗ | ✗ | Signoffs eIDAS |
| 175 | prop:title | ✗ | ✗ | ✗ | Cycle de vie données |

### `src/pages/app/IEC62304.tsx` — 15 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 77 | jsx-text | ✗ | ✗ | ✗ | Accès refusé |
| 78 | jsx-text | ✗ | ✗ | ✗ | Réservé aux administrateurs et hospital admins. |
| 86 | prop:description | ✗ | ✗ | ✗ | Technical file IEC 62304 — versions, SOUP, algorithmes |
| 91 | jsx-text | ✗ | ✗ | ✗ | IEC 62304 — Technical File |
| 94 | jsx-text | ✗ | ✗ | ✗ | Traçabilité du cycle de vie logiciel pour la certification dispositif médical. |
| 106 | jsx-text | ✗ | ✗ | ✗ | PhD Milestones |
| 114 | jsx-text | ✗ | ✗ | ✗ | Chaque release est associée à une classe de risque IEC 62304 (A/B/C). |
| 131 | jsx-text | ✗ | ✗ | ✗ | Aucune version enregistrée. |
| 140 | jsx-text | ✗ | ✗ | ✗ | Composants SOUP |
| 141 | jsx-text | ✗ | ✗ | ✗ | Inventaire des dépendances tierces et statut de vulnérabilités. |
| 145 | jsx-text | ✗ | ✗ | ✗ | Inventaire SOUP à compléter (ex : React, Vite, Tailwind, Supabase JS…). |
| 147 | jsx-text | ✗ | ✗ | ✗ | Action super admin requise. |
| 173 | jsx-text | ✗ | ✗ | ✗ | Algorithmes cliniques |
| 174 | jsx-text | ✗ | ✗ | ✗ | Aides à la décision soumises à validation et revue régulière. |
| 197 | jsx-text | ✗ | ✗ | ✗ | Aucun algorithme enregistré. |

### `src/pages/app/UsersAdmin.tsx` — 13 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 68 | toast | ✗ | ✗ | ✗ | Rôle attribué |
| 77 | toast | ✗ | ✗ | ✗ | Rôle révoqué |
| 86 | jsx-text | ✗ | ✗ | ✗ | Accès refusé |
| 87 | jsx-text | ✗ | ✗ | ✗ | Réservé aux administrateurs. |
| 93 | jsx-text | ✗ | ✗ | ✗ | !search \|\| (u.display_name ?? "").toLowerCase().includes(search.toLowerCase()) \|\| u.user_id.includes(search) ); return ( |
| 99 | prop:title | ✗ | ✗ | ✗ | Gestion utilisateurs |
| 99 | prop:description | ✗ | ✗ | ✗ | Administration des rôles et activité |
| 111 | prop:placeholder | ✗ | ✗ | ✗ | Rechercher (nom ou UUID)… |
| 133 | jsx-text | ✗ | ✗ | ✗ | Dernière activité |
| 136 | jsx-text | ✗ | ✗ | ✗ | Événements 30j |
| 144 | prop:placeholder | ✗ | ✗ | ✗ | Choisir un rôle… |
| 153 | jsx-text | ✗ | ✗ | ✗ | Révoquer |
| 174 | jsx-text | ✗ | ✗ | ✗ | Aucun utilisateur trouvé. |

### `src/pages/app/ComplianceHistory.tsx` — 9 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 61 | prop:title | ✗ | ✗ | ✗ | Historique conformité — 90 jours |
| 62 | prop:description | ✗ | ✗ | ✗ | Évolution quotidienne du score de conformité RGPD/MDR sur 90 jours. |
| 75 | jsx-text | ✗ | ✗ | ✗ | Historique de conformité |
| 77 | jsx-text | ✗ | ✗ | ✗ | Snapshot quotidien capturé à 03:00 UTC. Tendance sur les 90 derniers jours. |
| 86 | jsx-text | ✗ | ✗ | ✗ | ) : !snapshots \|\| snapshots.length === 0 ? ( |
| 90 | jsx-text | ✗ | ✗ | ✗ | Aucun snapshot enregistré pour le moment. |
| 91 | jsx-text | ✗ | ✗ | ✗ | Le premier snapshot sera capturé automatiquement lors du prochain cycle (03:00 UTC). |
| 102 | jsx-text | ✗ | ✗ | ✗ | Dernier score |
| 150 | jsx-text | ✗ | ✗ | ✗ | Snapshots récents |

### `src/components/governance/FreezeAccountButton.tsx` — 7 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 33 | toast | ✗ | ✗ | ✗ | Le motif doit contenir au moins 10 caractères. |
| 44 | toast | ✗ | ✗ | ✗ | Échec : ${error.message} |
| 47 | toast | ✗ | ✗ | ✗ | Compte de ${targetName} gelé. Tous les rôles ont été révoqués. |
| 67 | jsx-text | ✗ | ✗ | ✗ | Cette action |
| 68 | jsx-text | ✗ | ✗ | ✗ | révoque immédiatement tous les rôles applicatifs |
| 68 | jsx-text | ✗ | ✗ | ✗ | de l'utilisateur (action critique tracée). Elle est utilisée pour les incidents RH ou de sécurité. L'utilisateur conserv |
| 73 | jsx-text | ✗ | ✗ | ✗ | Motif (obligatoire, min. 10 caractères) |

### `src/components/governance/UnfreezeAccountButton.tsx` — 7 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 32 | toast | ✗ | ✗ | ✗ | Justification minimale : 10 caractères. |
| 47 | toast | ✗ | ✗ | ✗ | Compte de ${targetName} réactivé avec rôle « ${role} ». |
| 57 | jsx-text | ✗ | ✗ | ✗ | Réactiver |
| 64 | jsx-text | ✗ | ✗ | ✗ | Cette action attribuera un rôle de base à un compte gelé. L'événement sera tracé en sévérité |
| 70 | jsx-text | ✗ | ✗ | ✗ | Rôle de base à restaurer |
| 79 | jsx-text | ✗ | ✗ | ✗ | Justification (≥ 10 caractères) |
| 84 | prop:placeholder | ✗ | ✗ | ✗ | Ex : enquête RH clôturée, accès rétabli après vérification… |

### `src/components/governance/RgpdRequestCard.tsx` — 6 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 78 | toast | ✗ | ✗ | ✗ | Demande RGPD envoyée. Délai de traitement : 30 jours. |
| 91 | jsx-text | ✗ | ✗ | ✗ | Exercez vos droits prévus par le RGPD (accès, rectification, effacement…). Délai légal : 30 jours. |
| 108 | jsx-text | ✗ | ✗ | ✗ | Précisions (optionnel) |
| 112 | prop:placeholder | ✗ | ✗ | ✗ | Décrivez votre demande… |
| 127 | jsx-text | ✗ | ✗ | ✗ | Mes demandes |
| 132 | jsx-text | ✗ | ✗ | ✗ | Aucune demande pour le moment. |

### `src/components/governance/SignoffPanel.tsx` — 6 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 91 | toast | ✗ | ✗ | ✗ | Signoff enregistré. Un expert reviewer pourra cosigner. |
| 106 | toast | ✗ | ✗ | ✗ | Signature eIDAS appliquée (SHA-256 + horodatage). |
| 125 | jsx-text | ✗ | ✗ | ✗ | Justification (optionnelle) |
| 129 | prop:placeholder | ✗ | ✗ | ✗ | Indiquez le raisonnement clinique, les références et les éléments contributifs… |
| 144 | jsx-text | ✗ | ✗ | ✗ | Aucun signoff pour cette entité. |
| 178 | jsx-text | ✗ | ✗ | ✗ | Renforcer (eIDAS) |

### `src/pages/app/Admin.tsx` — 5 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 92 | toast | ✗ | ✗ | ✗ | Role added |
| 107 | prop:title | ✗ | ✓ | ✗ | Admin Panel |
| 107 | prop:description | ✗ | ✗ | ✗ | Administration panel |
| 139 | jsx-text | ✗ | ✗ | ✗ | No role |
| 144 | prop:placeholder | ✗ | ✗ | ✗ | Add role... |

### `src/pages/app/CIAKIEngine.tsx` — 5 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 54 | jsx-text | ✗ | ✗ | ✗ | = 75) score += 2; else if (age >= 65) score += 1; // Diabetes if (diabetes) score += 1; // LVEF if (lvef |
| 122 | jsx-text | ✗ | ✗ | ✗ | ("gbca"); const [result, setResult] = useState |
| 123 | jsx-text | ✗ | ✗ | ✗ | (null); const [savedAiOutputId, setSavedAiOutputId] = useState |
| 392 | prop:title | ✗ | ✗ | ✗ | Validation de la décision CI-AKI |
| 393 | prop:description | ✗ | ✗ | ✗ | Tracez votre validation médicale du calcul IA. Un expert reviewer pourra cosigner pour double validation. |

### `src/pages/app/Logbook.tsx` — 5 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 31 | jsx-text | ✗ | ✗ | ✗ | ("angioplasty"); const [track, setTrack] = useState |
| 75 | toast | ✗ | ✗ | ✗ | Entry deleted |
| 81 | jsx-text | ✗ | ✗ | ✗ | e.supervisor_validated).length ?? 0; return ( |
| 85 | prop:description | ✗ | ✓ | ✗ | Procedure logbook |
| 198 | prop:placeholder | ✗ | ✗ | ✗ | Brief description of the procedure... |

### `src/components/education/CourseDetail.tsx` — 4 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 52 | jsx-text | ✗ | ✗ | ✗ | (null); const [answers, setAnswers] = useState |
| 323 | jsx-text | ✗ | ✗ | ✗ | answers[i] != null); return ( |
| 380 | jsx-text | ✗ | ✗ | ✗ | bestAttempts.get(q.id)?.passed).length; const progress = quizzes.length > 0 ? Math.round((passedCount / quizzes.length)  |
| 473 | jsx-text | ✗ | ✗ | ✗ | q.module_id === mod.id); const attempt = quiz ? bestAttempts.get(quiz.id) : null; return ( |

### `src/pages/app/ExportsAudit.tsx` — 4 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 84 | jsx-text | ✗ | ✗ | ✗ | Manifests d'export |
| 85 | jsx-text | ✗ | ✗ | ✗ | Chaque export PDF/CSV est tracé avec un SHA-256 du contenu et un motif déclaré (ADR-014). |
| 91 | jsx-text | ✗ | ✗ | ✗ | Aucun export tracé. |
| 105 | jsx-text | ✗ | ✗ | ✗ | volume suspect |

### `src/pages/app/Network.tsx` — 4 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 27 | jsx-text | ✗ | ✗ | ✗ | (null); const [createOpen, setCreateOpen] = useState(false); const [title, setTitle] = useState(""); const [content, set |
| 114 | prop:title | ✗ | ✗ | ✗ | Network & Forum |
| 200 | prop:placeholder | ✗ | ✗ | ✗ | Post title... |
| 215 | prop:placeholder | ✗ | ✗ | ✗ | Write your post... |

### `src/pages/app/ProcedurePlanner.tsx` — 4 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 47 | jsx-text | ✗ | ✗ | ✗ | (null); const [currentOutputId, setCurrentOutputId] = useState |
| 48 | jsx-text | ✗ | ✗ | ✗ | (null); const [history, setHistory] = useState |
| 49 | jsx-text | ✗ | ✗ | ✗ | ([]); const [user, setUser] = useState |
| 258 | jsx-text | ✗ | ✓ | ✗ | Research Prototype |

### `src/components/governance/AnomalyPanel.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 49 | jsx-text | ✗ | ✗ | ✗ | Détection d'anomalies (7 jours) |
| 52 | jsx-text | ✗ | ✗ | ✗ | Seuils : &gt;100 accès PHI/jour, &gt;10 exports/jour, &gt;20 signoffs/jour, &gt;5 erreurs/jour. |
| 62 | jsx-text | ✗ | ✗ | ✗ | Aucune anomalie détectée. Comportement normal. |

### `src/components/governance/ProcessingRegisterButton.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 39 | jsx-text | ✗ | ✗ | ✗ | ; const events = (eventsRes.data ?? []) as Array |
| 44 | jsx-text | ✗ | ✗ | ✗ | ; // Aggregate events by category const byCat = events.reduce |
| 125 | toast | ✗ | ✗ | ✗ | Registre RGPD téléchargé |

### `src/pages/app/FusionViewer.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 54 | toast | ✗ | ✗ | ✗ | File deleted |
| 94 | jsx-text | ✗ | ✗ | ✗ | BoM target &lt; €15k |
| 94 | jsx-text | ✗ | ✗ | ✗ | . The Fusion Viewer renders multimodal correlation, while the L1 Decision Board consumes AquaMR cartography to support p |

### `src/components/governance/ComplianceTrendChart.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 38 | jsx-text | ✗ | ✗ | ✗ | Tendance du score (90 jours) |
| 48 | jsx-text | ✗ | ✗ | ✗ | Aucun snapshot disponible. Le premier sera capturé cette nuit (03:30 UTC). |

### `src/pages/app/Settings.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 70 | jsx-text | ✗ | ✗ | ✗ | (null); const [uploading, setUploading] = useState(false); const handleUpload = async (e: React.ChangeEvent |
| 77 | toast | ✗ | ✗ | ✗ | File too large (max 2MB) |

### `src/pages/app/Simulation.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 246 | jsx-text | ✗ | ✗ | ✗ | 0 ? Math.max(...runs.filter(r => r.score != null).map(r => r.score!)) : null; return ( |
| 297 | jsx-text | ✗ | ✗ | ✗ | s.id === run.simulation_id); return ( |

### `src/components/governance/CompliancePackButton.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 163 | toast | ✗ | ✗ | ✗ | Compliance Pack généré |

### `src/components/governance/IECTechnicalFileButton.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 119 | toast | ✗ | ✗ | ✗ | Technical File IEC 62304 généré |

### `src/components/governance/RgpdExportButton.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 41 | toast | ✗ | ✗ | ✗ | Export téléchargé. Conservez-le en lieu sûr. |

### `src/components/network/VoteButtons.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 92 | jsx-text | ✗ | ✗ | ✗ | 0 && "text-primary", score |

### `src/components/notifications/NotificationBell.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 154 | jsx-text | ✗ | ✗ | ✗ | !n.is_read).length ?? 0; return ( |

### `src/pages/app/Education.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 314 | jsx-text | ✗ | ✗ | ✗ | cs!.every((c) => getCourseProgress(c.id).progress === 100)) .map(([trackName]) => ( |

### `src/pages/app/Registry.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 28 | jsx-text | ✗ | ✗ | ✗ | [c.id, c.category])); // Group outcomes by category const grouped: Record |

### `src/pages/app/Research.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 122 | jsx-text | ✗ | ✗ | ✗ | DSMB Charter |

## Wave 5 — Remaining VASCU-LINK scientific components

### `src/components/vasculink/ProximityMedicineCard.tsx` — 11 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 14 | jsx-text | ✗ | ✗ | ✗ | Proximity vascular medicine & equity of access |
| 17 | jsx-text | ✗ | ✗ | ✗ | The 4-zero signature — and the BoM target &lt; €15k in particular — exists to transfer angiographic decision-making out  |
| 27 | jsx-text | ✗ | ✗ | ✗ | Angiographic mapping deployable in ambulatory vascular structures with hospital backup. |
| 33 | jsx-text | ✗ | ✗ | ✗ | LMIC pilot — post-PhD |
| 34 | jsx-text | ✗ | ✗ | ✗ | Letters of intent envisioned with Senegal · Morocco · Benin (WP5 deliverable). |
| 40 | jsx-text | ✗ | ✗ | ✗ | Photovoltaic site |
| 41 | jsx-text | ✗ | ✗ | ✗ | No helium · low-power Halbach magnet · solar-compatible BoM &lt; €15k. |
| 47 | jsx-text | ✗ | ✗ | ✗ | WP5 — equity & sustainability |
| 48 | jsx-text | ✗ | ✗ | ✗ | LCA · QALY · LMIC pilot are |
| 49 | jsx-text | ✗ | ✗ | ✗ | post-thesis deliverables |
| 49 | jsx-text | ✗ | ✗ | ✗ | ; the in-thesis scope remains the planned prospective validation cohort and the European regulatory pre-submission. |

### `src/components/vasculink/ADRTimeline.tsx` — 7 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 21 | jsx-text | ✗ | ✗ | ✗ | ("all"); const [status, setStatus] = useState |
| 45 | jsx-text | ✗ | ✗ | ✗ | Chronological view of architectural decisions. Filter by domain or status. |
| 53 | prop:aria-label | ✗ | ✗ | ✗ | Domain filter |
| 57 | jsx-text | ✗ | ✗ | ✗ | All domains |
| 64 | prop:aria-label | ✗ | ✗ | ✗ | Status filter |
| 68 | jsx-text | ✗ | ✓ | ✗ | All statuses |
| 85 | jsx-text | ✗ | ✗ | ✗ | No ADR matches the current filters. |

### `src/components/vasculink/ScientificSafetyBox.tsx` — 6 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 15 | jsx-text | ✗ | ✗ | ✗ | Strategic ambition |
| 20 | jsx-text | ✗ | ✗ | ✗ | , and a |
| 20 | jsx-text | ✗ | ✗ | ✗ | BoM target &lt; €15k |
| 20 | jsx-text | ✗ | ✗ | ✗ | — to enable proximity vascular medicine outside helium-bound hospital centers. |
| 27 | jsx-text | ✗ | ✗ | ✗ | Scientific boundary |
| 29 | jsx-text | ✗ | ✗ | ✗ | The thesis does not perform human revascularization. L1 validates mapping and decision-making. L2/L3 remain simulated or |

### `src/components/vasculink/DSMBCharter.tsx` — 5 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 26 | jsx-text | ✗ | ✗ | ✗ | DSMB charter · independent oversight model |
| 29 | jsx-text | ✗ | ✗ | ✗ | Data Safety Monitoring Board structure and stop/continue triggers for the planned prospective cohort. Acts in parallel w |
| 36 | jsx-text | ✗ | ✗ | ✗ | Composition (5 members, ≥3 voting rights) |
| 61 | jsx-text | ✗ | ✗ | ✗ | Cadence: every 6 months + on-trigger |
| 62 | jsx-text | ✗ | ✗ | ✗ | Reports to sponsor + CER-VD |

### `src/components/vasculink/ModalityPositioningMatrix.tsx` — 5 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 78 | jsx-text | ✗ | ✗ | ✗ | Where each modality fits in the pre-revascularization decision chain. |
| 89 | jsx-text | ✗ | ✗ | ✗ | VASCU-LINK L1 |
| 90 | jsx-text | ✗ | ✗ | ✗ | Conventional angiography |
| 109 | jsx-text | ✗ | ✗ | ✗ | VASCU-LINK is not a Doppler replacement. |
| 109 | jsx-text | ✗ | ✗ | ✗ | Doppler remains the first-line hemodynamic test. VASCU-LINK aims to address the next question: can a 4-zero angiographic |

### `src/components/vasculink/LCAQALYFramework.tsx` — 4 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 34 | jsx-text | ✗ | ✗ | ✗ | LCA + Cost-utility (QALY) framework |
| 37 | jsx-text | ✗ | ✗ | ✗ | Structural skeleton for environmental life-cycle assessment (ISO 14040/44) and cost-utility analysis. Quantitative value |
| 45 | jsx-text | ✗ | ✗ | ✗ | Life-cycle stages (cradle-to-grave) |
| 74 | jsx-text | ✗ | ✗ | ✗ | Reporting will follow CHEERS 2022 (cost-utility) and ISO 14044 (LCA) guidelines. Independent academic review planned bef |

### `src/components/vasculink/AngiographicFunctionTrajectory.tsx` — 3 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 74 | jsx-text | ✗ | ✗ | ✗ | Reconstructing selected angiographic functions in a 4-zero chain — 0 mSv, 0 g Gd / 0 mL iodine, 0 helium, BoM target &lt |
| 113 | jsx-text | ✗ | ✗ | ✗ | VASCU-LINK does not claim to replace conventional angiography during the thesis. It tests whether selected angiographic  |
| 116 | jsx-text | ✗ | ✗ | ✗ | 0 mSv · 0 Gd / 0 iodine · 0 helium · BoM target &lt; €15k |

### `src/components/vasculink/ADRRegistry.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 53 | prop:aria-label | ✗ | ✗ | ✗ | Evidence reachable |
| 54 | prop:aria-label | ✗ | ✗ | ✗ | Evidence unreachable |

### `src/components/vasculink/AuditDataExportButton.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 79 | toast | ✗ | ✗ | ✗ | CSV exported |
| 93 | toast | ✗ | ✗ | ✗ | JSON exported |

### `src/components/vasculink/TenCommandments.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 27 | jsx-text | ✗ | ✗ | ✗ | 10 Commandments for PAD — ESC alignment |
| 30 | jsx-text | ✗ | ✗ | ✗ | Mapping of the 10 platform gestures to Mazzolai / Lanzi / Rodriguez-Palomares (Eur Heart J 2025) and ESC 2024 PAD Guidel |

### `src/components/vasculink/ThesisMilestones.tsx` — 2 findings

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 25 | jsx-text | ✗ | ✗ | ✗ | 5 Go / No-Go milestones · 48-month PhD calendar |
| 28 | jsx-text | ✗ | ✗ | ✗ | Structuring decision points of the VASCU-LINK doctoral program (academic partnership in negotiation). |

### `src/components/vasculink/AuditPackButton.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 18 | jsx-text | ✗ | ✗ | ✗ | Audit-ready compliance pack (PDF) |

### `src/components/vasculink/DSMBExportButton.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 18 | jsx-text | ✗ | ✗ | ✗ | Export DSMB Charter (PDF) |

### `src/components/vasculink/FourZeroPillars.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 54 | jsx-text | ✗ | ✗ | ✗ | Four chiffrés pillars defining the AquaMR cockpit. To our knowledge, no routine clinical modality combines the four. |

## Wave 6 — Layout, navigation & misc

### `src/components/layout/AppSidebar.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 109 | jsx-text | ✗ | ✗ | ✗ | isActive(item.url)); const [platformOpen, setPlatformOpen] = useState(isOnPlatform); return ( |

## Unassigned

### `src/hooks/useAuth.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 14 | jsx-text | ✗ | ✗ | ✗ | (null); const [user, setUser] = useState |

### `src/i18n/context.tsx` — 1 finding

| Line | Kind | FR | EN | DE | String |
|---:|---|:---:|:---:|:---:|---|
| 48 | jsx-text | ✗ | ✗ | ✗ | getNestedValue(dictionaries[language], key), [language] ); return ( |
