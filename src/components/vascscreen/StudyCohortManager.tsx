import { useState } from "react";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface StudyCohort {
  id: string;
  name: string;
  description: string;
  principalInvestigator: string;
  ethicsApprovalNumber: string;
  status: "draft" | "recruiting" | "active" | "completed" | "archived";
  startDate: string;
  patientsEnrolled: number;
}

interface StudyCohortManagerProps {
  cohorts: StudyCohort[];
  onCreateCohort: (cohort: Omit<StudyCohort, "id" | "patientsEnrolled">) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  recruiting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function StudyCohortManager({ cohorts, onCreateCohort }: StudyCohortManagerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pi, setPI] = useState("");
  const [ethics, setEthics] = useState("");
  const [status, setStatus] = useState<StudyCohort["status"]>("draft");
  const [startDate, setStartDate] = useState("");

  const handleCreate = () => {
    onCreateCohort({
      name,
      description,
      principalInvestigator: pi,
      ethicsApprovalNumber: ethics,
      status,
      startDate,
    });
    setOpen(false);
    setName("");
    setDescription("");
    setPI("");
    setEthics("");
    setStatus("draft");
    setStartDate("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{t("vascscreen.studyModule.cohorts")}</CardTitle>
            <CardDescription>{t("vascscreen.studyModule.subtitle")}</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                {t("vascscreen.studyModule.newCohort")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("vascscreen.studyModule.newCohort")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("vascscreen.studyModule.cohortName")}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("vascscreen.studyModule.cohortDescription")}</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("vascscreen.studyModule.principalInvestigator")}</Label>
                  <Input value={pi} onChange={(e) => setPI(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("vascscreen.studyModule.ethicsApproval")}</Label>
                  <Input value={ethics} onChange={(e) => setEthics(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("vascscreen.studyModule.startDate")}</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("vascscreen.studyModule.status")}</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as StudyCohort["status"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t("vascscreen.studyModule.draft")}</SelectItem>
                        <SelectItem value="recruiting">{t("vascscreen.studyModule.recruiting")}</SelectItem>
                        <SelectItem value="active">{t("vascscreen.studyModule.active")}</SelectItem>
                        <SelectItem value="completed">{t("vascscreen.studyModule.completed")}</SelectItem>
                        <SelectItem value="archived">{t("vascscreen.studyModule.archived")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={!name}>
                  {t("common.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("vascscreen.studyModule.cohortName")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("vascscreen.studyModule.principalInvestigator")}</TableHead>
              <TableHead>{t("vascscreen.studyModule.status")}</TableHead>
              <TableHead className="text-right">{t("vascscreen.studyModule.patientsEnrolled")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No study cohorts yet
                </TableCell>
              </TableRow>
            ) : (
              cohorts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{c.principalInvestigator}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[c.status]}>{t(`vascscreen.studyModule.${c.status}`)}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{c.patientsEnrolled}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
