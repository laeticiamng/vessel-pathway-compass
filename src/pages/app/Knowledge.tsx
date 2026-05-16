import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const RESOURCES = {
  papers: [
    { title: "CKD-EPI 2021 equation", ref: "PMID 34554658", url: "https://pubmed.ncbi.nlm.nih.gov/34554658/" },
    { title: "QISS non-contrast MRA (Edelman)", ref: "PMID 28109932", url: "https://pubmed.ncbi.nlm.nih.gov/28109932/" },
    { title: "Mazzolai ESC PAD guidelines 2024", ref: "PMID 39210722", url: "https://pubmed.ncbi.nlm.nih.gov/39210722/" },
    { title: "Hennig low-field MRI review", ref: "PMID 37289275", url: "https://pubmed.ncbi.nlm.nih.gov/37289275/" },
    { title: "Compressed Sensing MRI (Lustig)", ref: "PMID 17969013", url: "https://pubmed.ncbi.nlm.nih.gov/17969013/" },
    { title: "MoDL model-based DL", ref: "PMID 30106719", url: "https://pubmed.ncbi.nlm.nih.gov/30106719/" },
    { title: "VascuQoL-6 validation", ref: "PMID 19782537", url: "https://pubmed.ncbi.nlm.nih.gov/19782537/" },
  ],
  guidelines: [
    { title: "ESC PAD 2024", ref: "EHJ", url: "https://academic.oup.com/eurheartj" },
    { title: "AHA/ACC Lower Extremity PAD 2024", ref: "JACC", url: "https://www.acc.org/" },
    { title: "ESVS Carotid 2023", ref: "EJVES", url: "https://www.ejves.com/" },
  ],
  opensource: [
    { title: "OSI²ONE — open MRI hardware", ref: "github.com/osi2one", url: "https://github.com/" },
    { title: "MaRCoS — open MRI console", ref: "Negnevitsky 2022", url: "https://github.com/vnegnev/marcos_extras" },
    { title: "Pulseq — sequence interchange", ref: "MRM 2017", url: "https://pulseq.github.io/" },
  ],
  datasets: [
    { title: "fastMRI knee/brain", ref: "NYU/FAIR", url: "https://fastmri.org/" },
  ],
};

export default function Knowledge() {
  const [tab, setTab] = useState("papers");
  return (
    <>
      <SEOHead title="Knowledge Hub — VASCU-LINK" description="Curated open-access references for vascular MRI research." />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Knowledge Hub</h1>
            <Badge variant="outline">Curated open access</Badge>
          </div>
          <p className="text-muted-foreground">Peer-reviewed references and open-source tooling.</p>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="papers">Papers ({RESOURCES.papers.length})</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines ({RESOURCES.guidelines.length})</TabsTrigger>
            <TabsTrigger value="opensource">Open source ({RESOURCES.opensource.length})</TabsTrigger>
            <TabsTrigger value="datasets">Datasets ({RESOURCES.datasets.length})</TabsTrigger>
          </TabsList>
          {Object.entries(RESOURCES).map(([key, items]) => (
            <TabsContent key={key} value={key} className="space-y-3">
              {items.map((r) => (
                <Card key={r.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                    <div>
                      <CardTitle className="text-base">{r.title}</CardTitle>
                      <CardDescription>{r.ref}</CardDescription>
                    </div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
