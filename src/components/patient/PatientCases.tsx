import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/context";
import type { Tables } from "@/integrations/supabase/types";

interface PatientCasesProps {
  cases: Tables<"cases">[] | undefined;
}

export default function PatientCases({ cases }: PatientCasesProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("patientDetail.associatedCases")}</h2>
      {cases?.map((c) => (
        <Card key={c.id}>
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{c.title}</h3>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                <Badge variant="outline" className="text-xs capitalize">{c.status}</Badge>
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              {c.summary && <p className="text-sm text-muted-foreground mt-2">{c.summary}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
      {(!cases || cases.length === 0) && (
        <p className="text-muted-foreground text-center py-8">{t("patientDetail.noCases")}</p>
      )}
    </div>
  );
}
