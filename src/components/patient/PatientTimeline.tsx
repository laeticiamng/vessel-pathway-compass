import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Clock, HeartPulse, Activity, Ruler, Calendar, Trash2 } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import type { Tables } from "@/integrations/supabase/types";

interface PatientTimelineProps {
  events: Tables<"case_events">[] | undefined;
  eventsLoading: boolean;
  hasCases: boolean;
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
}

const eventTypeIcon: Record<string, typeof Activity> = {
  procedure: HeartPulse,
  imaging: Activity,
  note: Clock,
  lab: Ruler,
};

export default function PatientTimeline({ events, eventsLoading, hasCases, onAddEvent, onDeleteEvent }: PatientTimelineProps) {
  const { t } = useTranslation();

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return t("patientDetail.timeAgo.today");
    if (days === 1) return t("patientDetail.timeAgo.yesterday");
    return `${days}${t("patientDetail.timeAgo.daysAgo")}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t("patientDetail.caseTimeline")}</h2>
        <Button size="sm" onClick={onAddEvent} disabled={!hasCases}>
          <Plus className="h-4 w-4 mr-1" /> {t("patientDetail.addEvent")}
        </Button>
      </div>

      {eventsLoading && Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-64" /></div>
        </div>
      ))}

      {!eventsLoading && events && events.length > 0 ? (
        <div className="relative">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
          {events.map((ev) => {
            const Icon = eventTypeIcon[ev.event_type] ?? Clock;
            return (
              <div key={ev.id} className="flex gap-4 p-3 relative group">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 z-10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{ev.title}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">{ev.event_type}</Badge>
                  </div>
                  {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(ev.event_date).toLocaleDateString()}
                    <span className="ml-2">{timeAgo(ev.event_date)}</span>
                  </p>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDeleteEvent(ev.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : !eventsLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">{t("patientDetail.noEvents")}</p>
            {hasCases && (
              <Button variant="outline" className="mt-4" onClick={onAddEvent}>
                <Plus className="h-4 w-4 mr-2" /> {t("patientDetail.addFirstEvent")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
