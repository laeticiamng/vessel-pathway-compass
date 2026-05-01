import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Row {
  fn: string;
  doppler: string;
  vasculink: string;
  angiography: string;
}

const ROWS: Row[] = [
  {
    fn: "Hemodynamic flow assessment",
    doppler: "Strong",
    vasculink: "Integrated",
    angiography: "Limited / direct procedural",
  },
  {
    fn: "Global lesion mapping",
    doppler: "Variable / operator-dependent",
    vasculink: "Core objective",
    angiography: "Strong",
  },
  {
    fn: "Pre-revascularization decision",
    doppler: "Partial",
    vasculink: "Core objective",
    angiography: "Strong",
  },
  {
    fn: "Procedural guidance",
    doppler: "No",
    vasculink: "L2 / L3 only — non-human",
    angiography: "Yes",
  },
  {
    fn: "Human revascularization",
    doppler: "No",
    vasculink: "Not during thesis",
    angiography: "Yes",
  },
  {
    fn: "Ionizing radiation",
    doppler: "No",
    vasculink: "No",
    angiography: "Usually yes",
  },
  {
    fn: "Injected contrast",
    doppler: "No",
    vasculink: "No",
    angiography: "Usually yes",
  },
  {
    fn: "Deployment in proximity",
    doppler: "Strong",
    vasculink: "Target",
    angiography: "Limited / heavy infrastructure",
  },
  {
    fn: "Ecological footprint",
    doppler: "Low",
    vasculink: "Core design principle",
    angiography: "Higher infrastructure burden",
  },
];

interface Props {
  className?: string;
}

export function ModalityPositioningMatrix({ className }: Props) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Doppler vs VASCU-LINK L1 vs conventional angiography</CardTitle>
        <CardDescription>
          Where each modality fits in the pre-revascularization decision chain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Function</TableHead>
                <TableHead>Doppler</TableHead>
                <TableHead>VASCU-LINK L1</TableHead>
                <TableHead>Conventional angiography</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.fn} data-testid={`matrix-row-${row.fn.replace(/\s+/g, "-").toLowerCase()}`}>
                  <TableCell className="font-medium text-sm">{row.fn}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.doppler}</TableCell>
                  <TableCell className="text-sm">{row.vasculink}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.angiography}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
          <Badge variant="default" className="text-[10px]">Why not Doppler / why not angiography</Badge>
          <p className="text-sm">
            <strong>VASCU-LINK is not a Doppler replacement.</strong> Doppler remains the
            first-line hemodynamic test. VASCU-LINK aims to address the next question:
            can a 4-zero angiographic map support pre-revascularization decision-making
            without immediate use of heavy injected or irradiating imaging?
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
