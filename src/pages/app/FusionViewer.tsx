import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Upload, Ruler, Pencil, AlertTriangle, Shield, Leaf } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";

export default function FusionViewer() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-5xl">
      <SEOHead title={t("seo.fusionViewer.title") as string} description={t("seo.fusionViewer.description") as string} path="/app/fusion-viewer" noindex />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Image className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            {t("fusionViewer.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("fusionViewer.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            {t("fusionViewer.prototypeLabel")}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {t("fusionViewer.researchWorkflow")}
          </Badge>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">{t("fusionViewer.disclaimer.title")}</p>
          <p className="text-muted-foreground mt-1">{t("fusionViewer.disclaimer.body")}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">{t("fusionViewer.upload")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("fusionViewer.uploadDesc")}</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Ruler className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">{t("fusionViewer.measurements")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("fusionViewer.measurementsDesc")}</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Pencil className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">{t("fusionViewer.annotation")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("fusionViewer.annotationDesc")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mri" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="mri">{t("fusionViewer.tabs.mri")}</TabsTrigger>
          <TabsTrigger value="ivus">{t("fusionViewer.tabs.ivus")}</TabsTrigger>
          <TabsTrigger value="oct">{t("fusionViewer.tabs.oct")}</TabsTrigger>
          <TabsTrigger value="ultrasound">{t("fusionViewer.tabs.ultrasound")}</TabsTrigger>
          <TabsTrigger value="bio-mra" className="text-emerald-500 data-[state=active]:text-emerald-400">
            <Leaf className="h-3.5 w-3.5 mr-1" />
            {t("fusionViewer.tabs.bioMra")}
          </TabsTrigger>
        </TabsList>

        {(["mri", "ivus", "oct", "ultrasound"] as const).map((modality) => (
          <TabsContent key={modality} value={modality} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t(`fusionViewer.modalities.${modality}.title`)}</CardTitle>
                <CardDescription>{t(`fusionViewer.modalities.${modality}.desc`)}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <Image className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">{t("fusionViewer.viewerPlaceholder")}</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">{t("fusionViewer.dicomReady")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="bio-mra" className="mt-6">
          <Card className="border-emerald-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-500" />
                <CardTitle>{t("fusionViewer.modalities.bioMra.title")}</CardTitle>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
                  {t("fusionViewer.modalities.bioMra.badge")}
                </Badge>
              </div>
              <CardDescription>{t("fusionViewer.modalities.bioMra.desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">{t("fusionViewer.modalities.bioMra.agent")}</p>
                  <p className="text-xs text-muted-foreground">{t("fusionViewer.modalities.bioMra.agentDesc")}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">{t("fusionViewer.modalities.bioMra.sequences")}</p>
                  <p className="text-xs text-muted-foreground">{t("fusionViewer.modalities.bioMra.sequencesDesc")}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">{t("fusionViewer.modalities.bioMra.safety")}</p>
                  <p className="text-xs text-muted-foreground">{t("fusionViewer.modalities.bioMra.safetyDesc")}</p>
                </div>
              </div>
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed border-emerald-500/20">
                <div className="text-center">
                  <Leaf className="h-12 w-12 mx-auto mb-3 text-emerald-500/30" />
                  <p className="text-muted-foreground text-sm">{t("fusionViewer.modalities.bioMra.placeholder")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{t("fusionViewer.syncPanel.title")}</CardTitle>
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {t("fusionViewer.syncPanel.badge")}
            </Badge>
          </div>
          <CardDescription>{t("fusionViewer.syncPanel.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground text-sm">{t("fusionViewer.syncPanel.placeholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
