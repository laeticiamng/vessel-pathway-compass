import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BookOpen, Cpu, Database, FlaskConical, ShieldAlert } from "lucide-react";
import type { ModelEntry } from "@/lib/aiRecon/modelRegistry";

/**
 * Standardized scientific card for an AI model entry.
 * Sections: Provenance / Training / Validation / Published metrics /
 * Limitations / Domain shift / Status / TRL.
 *
 * Designed for honesty over hype — every claim is sourced or labeled
 * "Not loaded — placeholder".
 */
export function ModelCard({ entry }: { entry: ModelEntry }) {
  return (
    <article className="space-y-5 rounded-lg border bg-card p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight">{entry.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{entry.shortDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">{entry.family.replace("-", " ")}</Badge>
          <Badge variant="outline">TRL {entry.trl}</Badge>
          <Badge
            variant={entry.currentStatus.startsWith("Simulated") ? "secondary" : "default"}
            className="whitespace-nowrap"
          >
            {entry.currentStatus}
          </Badge>
        </div>
      </header>

      <Section icon={<BookOpen className="h-4 w-4" />} title="Provenance">
        <Row label="Paper" value={entry.provenance.paperRef} />
        <Row label="Code" value={entry.provenance.codeRef} />
        <Row label="Weights" value={entry.provenance.weightsOrigin} />
        <Row label="License" value={entry.provenance.license} />
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section icon={<Database className="h-4 w-4" />} title="Training data">
          <Row label="Dataset" value={entry.trainingData.dataset} />
          <Row label="N subjects" value={String(entry.trainingData.nSubjects)} />
          <Row label="Region" value={entry.trainingData.bodyRegion} />
          <Row label="Field" value={entry.trainingData.fieldStrength} />
          <Row label="Acquisition" value={entry.trainingData.acquisitionType} />
        </Section>
        <Section icon={<FlaskConical className="h-4 w-4" />} title="Validation data">
          <Row label="Dataset" value={entry.validationData.dataset} />
          <Row label="N subjects" value={String(entry.validationData.nSubjects)} />
          <Row label="Metrics" value={entry.validationData.metricsReported.join(", ")} />
        </Section>
      </div>

      <Section icon={<Cpu className="h-4 w-4" />} title="Published metrics (reference, not VASCU-LINK measurements)">
        <ul className="space-y-2 text-sm">
          {entry.publishedMetrics.map((m, i) => (
            <li key={i} className="rounded border border-border/60 bg-muted/20 p-2">
              <p className="font-mono text-xs">
                <span className="text-muted-foreground">{m.metric}:</span>{" "}
                <span className="font-semibold">{m.value}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.conditions}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} title="Domain shift">
        <p className="text-sm text-muted-foreground">{entry.domainShift}</p>
      </Section>

      <Section icon={<ShieldAlert className="h-4 w-4 text-destructive" />} title="Limitations">
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {entry.limitations.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </Section>
    </article>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="text-xs uppercase text-muted-foreground mr-2">{label}</span>
      <span>{value}</span>
    </p>
  );
}
