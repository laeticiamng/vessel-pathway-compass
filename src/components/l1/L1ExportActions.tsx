import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, FileJson, FileSpreadsheet, Printer } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface Props {
  onExportCsv: () => void;
  onExportJson: () => void;
  onExportPdf: () => void;
  disabled?: boolean;
}

export function L1ExportActions({ onExportCsv, onExportJson, onExportPdf, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileDown className="h-4 w-4 text-primary" />
          {t("l1.exports.title")}
        </CardTitle>
        <CardDescription>{t("l1.exports.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onExportCsv} disabled={disabled}>
          <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
          {t("l1.exports.csv")}
        </Button>
        <Button variant="outline" size="sm" onClick={onExportJson} disabled={disabled}>
          <FileJson className="h-3.5 w-3.5 mr-1" />
          {t("l1.exports.json")}
        </Button>
        <Button variant="outline" size="sm" onClick={onExportPdf} disabled={disabled}>
          <Printer className="h-3.5 w-3.5 mr-1" />
          {t("l1.exports.pdf")}
        </Button>
      </CardContent>
    </Card>
  );
}
