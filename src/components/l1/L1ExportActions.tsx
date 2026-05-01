import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, FileJson, FileSpreadsheet, Printer } from "lucide-react";

interface Props {
  onExportCsv: () => void;
  onExportJson: () => void;
  onExportPdf: () => void;
  disabled?: boolean;
}

export function L1ExportActions({ onExportCsv, onExportJson, onExportPdf, disabled }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileDown className="h-4 w-4 text-primary" />
          Research export
        </CardTitle>
        <CardDescription>
          Pseudonymized export — direct identifiers are blocked by validation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onExportCsv} disabled={disabled}>
          <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
          eCRF row (CSV)
        </Button>
        <Button variant="outline" size="sm" onClick={onExportJson} disabled={disabled}>
          <FileJson className="h-3.5 w-3.5 mr-1" />
          Research JSON
        </Button>
        <Button variant="outline" size="sm" onClick={onExportPdf} disabled={disabled}>
          <Printer className="h-3.5 w-3.5 mr-1" />
          One-page PDF
        </Button>
      </CardContent>
    </Card>
  );
}
