import { ResearchPreviewBanner } from "@/components/ResearchPreviewBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const PIPELINES = [
  { name: "Compressed Sensing", desc: "L1-wavelet reconstruction from undersampled k-space.", ref: "Lustig MRM 2007 (PMID 17969013)", maturity: "TRL 6" },
  { name: "U-Net Denoising", desc: "Patch-based CNN for low-SNR datasets.", ref: "Ronneberger MICCAI 2015", maturity: "TRL 5" },
  { name: "MoDL (Model-based DL)", desc: "Unrolled iterative network with data consistency.", ref: "Aggarwal TMI 2019 (PMID 30106719)", maturity: "TRL 4" },
  { name: "Score-based Diffusion", desc: "Posterior sampling for accelerated MRA.", ref: "Chung MedIA 2022", maturity: "TRL 3" },
];

export default function AIRecon() {
  return (
    <>
      <SEOHead title="AI Reconstruction — VASCU-LINK" description="Research overview of AI MRI reconstruction pipelines." />
      <ResearchPreviewBanner />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Brain className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">AI Reconstruction Lab</h1>
            <Badge variant="outline">4 pipelines</Badge>
          </div>
          <p className="text-muted-foreground">
            Comparative overview of open-source reconstruction methods. Educational reference only — no inference runs in-browser.
          </p>
        </header>

        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex gap-3 pt-6 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <p>
              These pipelines are <strong>not clinically validated</strong> in the VASCU-LINK context.
              Performance figures cited come from public literature and may not transfer to low-field acquisitions.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {PIPELINES.map((p) => (
            <Card key={p.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {p.name}
                  <Badge variant="secondary">{p.maturity}</Badge>
                </CardTitle>
                <CardDescription>{p.ref}</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm">{p.desc}</p></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
