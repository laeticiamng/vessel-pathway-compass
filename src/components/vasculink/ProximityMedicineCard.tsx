import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe2, Sun, Building2 } from "lucide-react";

/**
 * Pilier WP5 — équité d'accès & médecine vasculaire de proximité.
 * Reflète le 1-pager VASCU-LINK v7 (LOI envisagées Sénégal/Maroc/Bénin).
 */
export function ProximityMedicineCard({ className }: { className?: string }) {
  return (
    <Card className={className} data-testid="proximity-medicine">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          Proximity vascular medicine & equity of access
        </CardTitle>
        <CardDescription>
          The 4-zero signature — and the BoM target &lt; €15k in particular — exists to
          transfer angiographic decision-making out of helium-bound hospital centers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4 space-y-2 bg-muted/30">
            <Building2 className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Private vascular practice</p>
            <p className="text-xs text-muted-foreground">
              Angiographic mapping deployable in ambulatory vascular structures with hospital backup.
            </p>
          </div>
          <div className="rounded-xl border p-4 space-y-2 bg-muted/30">
            <Globe2 className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">LMIC pilot — post-PhD</p>
            <p className="text-xs text-muted-foreground">
              Letters of intent envisioned with Senegal · Morocco · Benin (WP5 deliverable).
            </p>
          </div>
          <div className="rounded-xl border p-4 space-y-2 bg-muted/30">
            <Sun className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Photovoltaic site</p>
            <p className="text-xs text-muted-foreground">
              No helium · low-power Halbach magnet · solar-compatible BoM &lt; €15k.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <Badge variant="default" className="text-[10px] mb-2">WP5 — equity & sustainability</Badge>
          <p className="text-xs">
            LCA · QALY · LMIC pilot are <strong>post-thesis deliverables</strong>; the in-thesis
            scope remains the CHUV/Lausanne main cohort and the European regulatory pre-submission.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
