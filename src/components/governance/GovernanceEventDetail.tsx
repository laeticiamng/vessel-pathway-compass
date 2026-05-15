import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export type GovernanceEvent = {
  id: string;
  event_category: string;
  event_action: string;
  severity: string;
  actor_id: string | null;
  institution_id: string | null;
  target_user_id?: string | null;
  target_entity_type: string | null;
  target_entity_id: string | null;
  context: Record<string, unknown> | null;
  created_at: string;
};

type Props = {
  event: GovernanceEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-3 gap-3 py-2 border-b border-border/50 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="col-span-2 break-words">{value || <span className="text-muted-foreground">—</span>}</dd>
  </div>
);

export function GovernanceEventDetail({ event, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>Governance event</SheetTitle>
          <SheetDescription>
            Full details for the selected event row, including the JSON context.
          </SheetDescription>
        </SheetHeader>
        {event && (
          <ScrollArea className="mt-4 -mx-6 px-6 flex-1">
            <dl>
              <Field label="When" value={new Date(event.created_at).toLocaleString()} />
              <Field
                label="Category"
                value={<Badge variant="outline">{event.event_category}</Badge>}
              />
              <Field label="Action" value={<code className="text-xs">{event.event_action}</code>} />
              <Field
                label="Severity"
                value={
                  <Badge
                    variant={
                      event.severity === "critical" || event.severity === "error"
                        ? "destructive"
                        : event.severity === "warn"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {event.severity}
                  </Badge>
                }
              />
              <Field label="Actor" value={event.actor_id ? <code className="text-xs">{event.actor_id}</code> : null} />
              <Field
                label="Institution"
                value={event.institution_id ? <code className="text-xs">{event.institution_id}</code> : null}
              />
              <Field label="Target type" value={event.target_entity_type} />
              <Field
                label="Target id"
                value={event.target_entity_id ? <code className="text-xs">{event.target_entity_id}</code> : null}
              />
              <Field label="Event id" value={<code className="text-xs">{event.id}</code>} />
            </dl>

            <h3 className="mt-6 text-sm font-medium">Context</h3>
            <pre className="mt-2 rounded-lg border border-border bg-muted/50 p-3 text-xs overflow-x-auto whitespace-pre-wrap">
              {event.context ? JSON.stringify(event.context, null, 2) : "—"}
            </pre>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
