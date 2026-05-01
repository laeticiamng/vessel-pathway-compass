import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/context";

interface RowDef {
  key: string;
  rowKey: string;
  doppler: string;
  vasculink: string;
  angiography: string;
}

const ROWS: RowDef[] = [
  { key: "hemodynamic",        rowKey: "hemodynamic",        doppler: "strong",            vasculink: "integrated",      angiography: "limitedDirect" },
  { key: "global-lesion",      rowKey: "globalLesion",       doppler: "variableOperator",  vasculink: "coreObjective",   angiography: "strong" },
  { key: "pre-revasc",         rowKey: "preRevasc",          doppler: "partial",           vasculink: "coreObjective",   angiography: "strong" },
  { key: "procedural-guidance",rowKey: "proceduralGuidance", doppler: "no",                vasculink: "l2l3NonHuman",    angiography: "yes" },
  { key: "human-revasc",       rowKey: "humanRevasc",        doppler: "no",                vasculink: "notDuringThesis", angiography: "yes" },
  { key: "radiation",          rowKey: "radiation",          doppler: "no",                vasculink: "no",              angiography: "usuallyYes" },
  { key: "contrast",           rowKey: "contrast",           doppler: "no",                vasculink: "no",              angiography: "usuallyYes" },
  { key: "proximity",          rowKey: "proximity",          doppler: "strong",            vasculink: "target",          angiography: "limitedHeavy" },
  { key: "ecological",         rowKey: "ecological",         doppler: "low",               vasculink: "coreDesign",      angiography: "higherBurden" },
];

interface Props {
  className?: string;
}

export function ModalityPositioningMatrix({ className }: Props) {
  const { t } = useTranslation();
  const tr = (k: string) => t(`vasculink.matrix.${k}`) as string;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{tr("title")}</CardTitle>
        <CardDescription>{tr("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">{tr("headers.function")}</TableHead>
                <TableHead>{tr("headers.doppler")}</TableHead>
                <TableHead>{tr("headers.vasculink")}</TableHead>
                <TableHead>{tr("headers.angiography")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.key} data-testid={`matrix-row-${row.key}`}>
                  <TableCell className="font-medium text-sm">{tr(`rows.${row.rowKey}`)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tr(`values.${row.doppler}`)}</TableCell>
                  <TableCell className="text-sm">{tr(`values.${row.vasculink}`)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tr(`values.${row.angiography}`)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
          <Badge variant="default" className="text-[10px]">{tr("footer.badge")}</Badge>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: tr("footer.body") }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
