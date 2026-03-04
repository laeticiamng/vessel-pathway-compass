import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const members = [
  { name: "Dr. Smith", email: "smith@hospital.org", role: "Physician", status: "Active" },
  { name: "Dr. Jones", email: "jones@hospital.org", role: "Hospital Admin", status: "Active" },
  { name: "Dr. Brown", email: "brown@hospital.org", role: "Trainee", status: "Active" },
  { name: "Prof. Wilson", email: "wilson@university.edu", role: "Expert Reviewer", status: "Active" },
  { name: "Dr. Taylor", email: "taylor@hospital.org", role: "Research Lead", status: "Invited" },
];

export default function Team() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            {t("team.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("team.subtitle")}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("team.inviteMember")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("team.columns.name")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("team.columns.email")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("team.columns.role")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("team.columns.status")}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.email} className="border-b last:border-0">
                    <td className="p-4 font-medium">{m.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{m.email}</td>
                    <td className="p-4"><Badge variant="secondary">{m.role}</Badge></td>
                    <td className="p-4">
                      <Badge variant={m.status === "Active" ? "default" : "outline"}>{m.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
