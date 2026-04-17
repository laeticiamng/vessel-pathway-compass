import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, History, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  caseId: string;
}

const FIELDS = ["title", "summary", "category", "status"] as const;

export function CaseReplayDialog({ caseId }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  const { data: snapshot, isFetching } = useQuery({
    queryKey: ["case-replay", caseId, date?.toISOString()],
    enabled: !!date,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("replay_case_at" as never, {
        _case_id: caseId,
        _at: date!.toISOString(),
      } as never);
      if (error) throw error;
      return data as Record<string, unknown> | null;
    },
  });

  const { data: current } = useQuery({
    queryKey: ["case-current", caseId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.from("cases").select("*").eq("id", caseId).single();
      if (error) throw error;
      return data as Record<string, unknown>;
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <History className="h-3 w-3 mr-1" />
          Voir à la date…
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Replay temporel du dossier</DialogTitle>
          <DialogDescription>
            Reconstitue l'état du dossier à un instant T à partir de l'historique versionné immuable.
          </DialogDescription>
        </DialogHeader>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[280px] justify-start text-left", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP 'à' HH:mm", { locale: fr }) : <span>Choisir une date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(new Date(d.setHours(23, 59, 59, 999)))}
              disabled={(d) => d > new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {isFetching ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : date && !snapshot ? (
          <p className="text-sm text-muted-foreground py-4">Aucune révision n'existait à cette date.</p>
        ) : snapshot && current ? (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">État au {date && format(date, "PPP", { locale: fr })}</Badge>
                <Badge variant="outline">vs version actuelle</Badge>
              </div>
              <div className="space-y-2 text-sm">
                {FIELDS.map((f) => {
                  const past = snapshot[f];
                  const now = current[f];
                  const changed = JSON.stringify(past) !== JSON.stringify(now);
                  return (
                    <div key={f} className={cn("rounded border p-2 font-mono text-xs", changed && "border-primary/40 bg-primary/5")}>
                      <div className="font-semibold text-foreground mb-1">{f} {changed && <span className="text-primary">●</span>}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Alors :</span>{" "}
                          <span className={cn(changed && "line-through opacity-70")}>{String(past ?? "∅")}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Aujourd'hui :</span>{" "}
                          <span className={cn(changed && "font-semibold")}>{String(now ?? "∅")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
