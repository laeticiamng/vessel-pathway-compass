import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCode2 } from "lucide-react";

interface ADR {
  id: string;
  title: string;
  status: "Accepted" | "Superseded" | "Proposed";
  domain: string;
  rationale: string;
}

const ADRS: ADR[] = [
  { id: "ADR-001", title: "Halbach NdFeB recycled magnet (no helium)", status: "Accepted", domain: "Hardware",
    rationale: "Removes cryogenic dependency · WEEE-sourced rare earths · proximity deployment." },
  { id: "ADR-002", title: "Non-contrast angiographic function (no Gd / iodine)", status: "Accepted", domain: "Imaging",
    rationale: "Eliminates CI-AKI risk · removes Gd environmental release · CKD-safe." },
  { id: "ADR-003", title: "C4-i v11.1 framework (clinico-physiological discordance)", status: "Accepted", domain: "Clinical",
    rationale: "Recalibrated on external validation cohort · replaces v10 binary concordance." },
  { id: "ADR-004", title: "PROMs in English (WIQ · VascuQol-6 · 6-MWT)", status: "Accepted", domain: "Clinical",
    rationale: "Preserves validated psychometrics · UI may be FR/EN/DE but instruments stay English." },
  { id: "ADR-005", title: "Soft-delete patients with 30-day grace period", status: "Accepted", domain: "Data",
    rationale: "GDPR Art. 17 + clinical safety net · automated cleanup job." },
  { id: "ADR-006", title: "Server-side case_id filtering on PROMs (defense-in-depth)", status: "Accepted", domain: "Security",
    rationale: "Beyond RLS · prevents IDOR if a policy regression ships." },
  { id: "ADR-007", title: "Edge Functions: verify_jwt = true + role check + esm.sh imports", status: "Accepted", domain: "Security",
    rationale: "No anonymous invocation · supply-chain pinning." },
  { id: "ADR-008", title: "Supabase / Lovable Cloud as managed backend", status: "Accepted", domain: "Infra",
    rationale: "Migration planned to clinical HDS hosting (EU/CH) before any human L2/L3 study." },
  { id: "ADR-009", title: "i18n FR/EN/DE with build-time key check", status: "Accepted", domain: "UX",
    rationale: "scripts/check-i18n.mjs fails the build on missing keys · no silent fallback." },
  { id: "ADR-010", title: "L1 mandatory · L2 conditional · L3 preclinical only", status: "Accepted", domain: "Scientific",
    rationale: "Boundary protects thesis scope · no human revascularization performed in PhD." },
  { id: "ADR-011", title: "Doppler-first principle (AquaMR does not replace it)", status: "Accepted", domain: "Clinical",
    rationale: "ESC 2024 PAD alignment · hemodynamics remain reference." },
  { id: "ADR-012", title: "Documented fallback to standard imaging if quality insufficient", status: "Accepted", domain: "Safety",
    rationale: "Patient safety > 4-zero ambition · auditable in case timeline." },
  { id: "ADR-013", title: "Independent DSMB + Data Access Committee", status: "Accepted", domain: "Governance",
    rationale: "Required before any L2 phantom-to-human transition · external oversight." },
  { id: "ADR-014", title: "BoM target < €15k as 4th pillar (not vendor-quoted)", status: "Proposed", domain: "Economic",
    rationale: "Engineering estimate · formal vendor quotes pending M06 milestone (J1)." },
  { id: "ADR-015", title: "AquaMR Registry · cohort n ≈ 250 analysable (CHUV)", status: "Accepted", domain: "Scientific",
    rationale: "Powered for primary concordance endpoint · see Power calculation." },
];

const statusVariant: Record<ADR["status"], "default" | "secondary" | "outline"> = {
  Accepted: "default",
  Proposed: "secondary",
  Superseded: "outline",
};

export function ADRRegistry({ className }: { className?: string }) {
  return (
    <Card className={className} data-testid="adr-registry">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-primary" />
          Architecture Decision Records (15)
        </CardTitle>
        <CardDescription>
          Documented architectural decisions traceable to MDR / IEC 62304 technical file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {ADRS.map((a) => (
            <li key={a.id} className="rounded-lg border p-3 bg-muted/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{a.id}</span>
                  <span className="text-sm font-semibold">{a.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{a.domain}</Badge>
                  <Badge variant={statusVariant[a.status]} className="text-[10px]">{a.status}</Badge>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{a.rationale}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
