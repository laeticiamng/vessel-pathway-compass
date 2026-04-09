import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface ReferredPatient {
  id: string;
  pseudonym: string;
  age: number;
  abiLowest: number;
  abiInterpretation: string;
  urgency: "routine" | "priority" | "urgent";
  referralDate: string;
  status: "pending" | "seen" | "confirmed";
}

interface AngiologistDashboardProps {
  referredPatients: ReferredPatient[];
  pendingCount: number;
  seenThisWeek: number;
  padConfirmedCount: number;
}

const urgencyColors = {
  routine: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  priority: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusIcons = {
  pending: Clock,
  seen: CheckCircle2,
  confirmed: AlertTriangle,
};

export function AngiologistDashboard({
  referredPatients,
  pendingCount,
  seenThisWeek,
  padConfirmedCount,
}: AngiologistDashboardProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{seenThisWeek}</p>
            <p className="text-sm text-muted-foreground">Seen This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold">{padConfirmedCount}</p>
            <p className="text-sm text-muted-foreground">PAD Confirmed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referred Patients</CardTitle>
          <CardDescription>Patients referred from primary care screening</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead className="hidden sm:table-cell">{t("vascscreen.form.age")}</TableHead>
                <TableHead>ABI</TableHead>
                <TableHead className="hidden md:table-cell">{t("vascscreen.assessment.urgency")}</TableHead>
                <TableHead>{t("vascscreen.studyModule.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No referred patients yet
                  </TableCell>
                </TableRow>
              ) : (
                referredPatients.map((p) => {
                  const StatusIcon = statusIcons[p.status];
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.pseudonym}</TableCell>
                      <TableCell className="hidden sm:table-cell">{p.age}</TableCell>
                      <TableCell className="font-mono">{p.abiLowest.toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={urgencyColors[p.urgency]}>{p.urgency}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusIcon className="h-4 w-4" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
