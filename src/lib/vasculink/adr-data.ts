/**
 * Pure data layer for Architecture Decision Records.
 *
 * Single source of truth consumed by:
 *  - src/components/vasculink/ADRRegistry.tsx (UI list)
 *  - src/components/vasculink/ADRTimeline.tsx (compliance timeline)
 *  - src/components/vasculink/AuditPackButton.tsx (PDF export)
 *  - src/components/vasculink/AuditDataExportButton.tsx (CSV/JSON export)
 *  - src/components/vasculink/__tests__/* (tests)
 */

export type ADRStatus = "Accepted" | "Proposed" | "Superseded";
export type ADRDomain =
  | "Hardware" | "Imaging" | "Clinical" | "Data" | "Security" | "Infra"
  | "UX" | "Scientific" | "Safety" | "Governance" | "Economic";

export interface ADR {
  id: string;
  status: ADRStatus;
  domain: ADRDomain;
  /** ISO date when the architectural decision was approved. */
  decidedAt: string;
  /** In-app evidence (relative route + label). */
  evidence?: { route: string; label: string };
  /** External evidence URL (PDF, doc, ClinicalTrials.gov, etc.). */
  evidenceUrl?: string;
}

export const ADRS: ADR[] = [
  { id: "ADR-001", status: "Accepted",  domain: "Hardware",   decidedAt: "2025-09-01",
    evidence: { route: "/app/governance/iec62304?tab=adr", label: "Technical file" },
    evidenceUrl: "https://www.iso.org/standard/63174.html" },
  { id: "ADR-002", status: "Accepted",  domain: "Imaging",    decidedAt: "2025-09-01",
    evidence: { route: "/app/ci-aki-engine", label: "CI-AKI engine" },
    evidenceUrl: "https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/2024-ESC-Guidelines-for-the-management-of-peripheral-arterial-and-aortic-diseases" },
  { id: "ADR-003", status: "Accepted",  domain: "Clinical",   decidedAt: "2025-10-15",
    evidence: { route: "/app/l1", label: "L1 Decision Board" } },
  { id: "ADR-004", status: "Accepted",  domain: "Clinical",   decidedAt: "2025-09-12",
    evidence: { route: "/app/l1", label: "PROMs panel (EN)" } },
  { id: "ADR-005", status: "Accepted",  domain: "Data",       decidedAt: "2025-08-20",
    evidence: { route: "/app/patients?tab=trash", label: "Patient trash (30d)" },
    evidenceUrl: "https://gdpr-info.eu/art-17-gdpr/" },
  { id: "ADR-006", status: "Accepted",  domain: "Security",   decidedAt: "2025-10-02",
    evidence: { route: "/app/governance", label: "Governance audit" } },
  { id: "ADR-007", status: "Accepted",  domain: "Security",   decidedAt: "2025-08-10",
    evidence: { route: "/app/governance/iec62304", label: "Edge Fn policy" } },
  { id: "ADR-008", status: "Accepted",  domain: "Infra",      decidedAt: "2025-07-05" },
  { id: "ADR-009", status: "Accepted",  domain: "UX",         decidedAt: "2025-10-20",
    evidence: { route: "/app/settings", label: "Language switcher" } },
  { id: "ADR-010", status: "Accepted",  domain: "Scientific", decidedAt: "2025-09-01",
    evidence: { route: "/app/research", label: "Scientific Safety Box" } },
  { id: "ADR-011", status: "Accepted",  domain: "Clinical",   decidedAt: "2025-09-15",
    evidence: { route: "/app/vascscreen", label: "VascScreen / Doppler" } },
  { id: "ADR-012", status: "Accepted",  domain: "Safety",     decidedAt: "2025-10-01",
    evidence: { route: "/app/fusion-viewer", label: "Fusion Viewer fallback" } },
  { id: "ADR-013", status: "Accepted",  domain: "Governance", decidedAt: "2025-11-10",
    evidence: { route: "/app/research?tab=dsmb", label: "DSMB Charter tab" } },
  { id: "ADR-014", status: "Proposed",  domain: "Economic",   decidedAt: "2025-11-20",
    evidence: { route: "/app/governance/iec62304?tab=milestones", label: "Milestone J1" } },
  { id: "ADR-015", status: "Accepted",  domain: "Scientific", decidedAt: "2025-11-15",
    evidence: { route: "/app/research?tab=power", label: "Power calculation" },
    evidenceUrl: "https://clinicaltrials.gov/" },
];

export const ADR_DOMAINS: ADRDomain[] = [
  "Hardware", "Imaging", "Clinical", "Data", "Security", "Infra",
  "UX", "Scientific", "Safety", "Governance", "Economic",
];
export const ADR_STATUSES: ADRStatus[] = ["Accepted", "Proposed", "Superseded"];

/** Default Power calculation parameters (kept in sync with PowerCalculation.tsx). */
export const POWER_DEFAULTS = {
  pi0: 0.80, delta: 0.10, alpha: 0.05, power: 0.80, dropout: 0.20,
  nAnalysable: 196, nEnrolment: 250,
};

/** DSMB charter snapshot for exports. */
export const DSMB_MEMBERS = [
  { role: "Independent vascular physician (chair)", affiliation: "External EU center, no AquaMR conflict" },
  { role: "Independent biostatistician", affiliation: "Access to unblinded data, SAP custodian" },
  { role: "Independent radiologist / MRI physicist", affiliation: "Image-quality and safety oversight" },
  { role: "Patient representative", affiliation: "Voting on benefit/risk and acceptability" },
  { role: "Ethics observer (non-voting)", affiliation: "CER-VD liaison" },
];
export const DSMB_TRIGGERS = [
  "Serious adverse event potentially related to AquaMR workflow",
  "Image-quality failure rate > 15% over a rolling 50-patient window",
  "Unanticipated safety signal raised by investigator or sponsor",
  "Pre-planned interim review at M24 (before J3 milestone)",
  "Any deviation from frozen Statistical Analysis Plan (SAP)",
];

/** LCA + QALY snapshot for exports. */
export const LCA_STAGES = [
  { stage: "Raw materials", scope: "NdFeB recycled magnets (WEEE), copper coils, FR-4 PCB" },
  { stage: "Manufacturing", scope: "Halbach assembly, EU site assumed" },
  { stage: "Use phase",     scope: "0 He · 0 Gd / iodine · electricity per exam" },
  { stage: "Maintenance",   scope: "No cryogen refill · modular spare parts" },
  { stage: "End-of-life",   scope: "WEEE recycling target > 90% by mass" },
];
export const QALY_PARAMS = [
  { p: "Comparator",     v: "Doppler + angio-CT or contrast MRA" },
  { p: "Time horizon",   v: "Lifetime" },
  { p: "Perspective",    v: "Healthcare payer (CH) + societal sensitivity" },
  { p: "Discount rate",  v: "3% costs and effects" },
  { p: "Health outcomes", v: "QALYs from VascuQol-6 utility mapping (planned)" },
  { p: "ICER threshold", v: "CHF 100k / QALY" },
  { p: "Sensitivity",    v: "PSA Monte-Carlo 10000 it. + tornado on BoM" },
];
