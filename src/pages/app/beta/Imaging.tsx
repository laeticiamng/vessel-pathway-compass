import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, Upload, Ruler, Pencil } from "lucide-react";

export default function Imaging() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Image className="h-8 w-8 text-primary" />
          Imaging Pipeline
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Beta Preview</Badge>
      </div>
      <p className="text-muted-foreground">Upload imaging summaries, structured measurements, and annotation tools. DICOM-ready architecture.</p>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">Upload Summary</h3>
            <p className="text-xs text-muted-foreground mt-1">Upload imaging report summaries</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Ruler className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">Measurements</h3>
            <p className="text-xs text-muted-foreground mt-1">Aneurysm diameters, stenosis grading</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Pencil className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">Annotation Tool</h3>
            <p className="text-xs text-muted-foreground mt-1">Mark & annotate imaging findings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DICOM Architecture</CardTitle>
          <CardDescription>Future: Direct DICOM ingest pipeline — architecture placeholder</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">DICOM integration — architecture ready</p>
        </CardContent>
      </Card>
    </div>
  );
}
