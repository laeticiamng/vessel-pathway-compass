import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Upload, Ruler, Pencil } from "lucide-react";
import { useTranslation } from "@/i18n/context";

export default function Imaging() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Image className="h-8 w-8 text-primary" />
          {t("imaging.title")}
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">{t("common.betaPreview")}</Badge>
      </div>
      <p className="text-muted-foreground">{t("imaging.subtitle")}</p>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">{t("imaging.uploadSummary")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("imaging.uploadDesc")}</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Ruler className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">{t("imaging.measurements")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("imaging.measurementsDesc")}</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Pencil className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">{t("imaging.annotation")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("imaging.annotationDesc")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("imaging.dicom.title")}</CardTitle>
          <CardDescription>{t("imaging.dicom.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">{t("imaging.dicom.placeholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
