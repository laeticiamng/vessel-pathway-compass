import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const tracks = [
  { nameKey: "vascularUltrasound" as const, progress: 65, modules: 12, completed: 8, badge: "🔊" },
  { nameKey: "padLimb" as const, progress: 30, modules: 15, completed: 4, badge: "🦵" },
  { nameKey: "aorta" as const, progress: 0, modules: 10, completed: 0, badge: "❤️" },
  { nameKey: "venous" as const, progress: 45, modules: 11, completed: 5, badge: "🩸" },
  { nameKey: "thrombosis" as const, progress: 10, modules: 9, completed: 1, badge: "⚡" },
];

export default function Education() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            {t("education.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("education.subtitle")}</p>
        </div>
        <Badge variant="secondary" className="text-sm">18.5 {t("education.cmeCredits")}</Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">18</p>
              <p className="text-sm text-muted-foreground">{t("education.stats.modulesCompleted")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">{t("education.stats.badgesEarned")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">{t("education.stats.tracksInProgress")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("education.tracks")}</h2>
        {tracks.map((track) => (
          <Card key={track.nameKey} className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{track.badge}</span>
                  <div>
                    <h3 className="font-semibold">{t(`education.trackNames.${track.nameKey}`)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {track.completed}/{track.modules} {t("education.moduleDesc")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {track.progress > 0 ? t("common.continue") : t("common.start")}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={track.progress} className="flex-1" />
                <span className="text-sm font-medium w-12 text-right">{track.progress}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {t("education.digitalBadges")}
          </CardTitle>
          <CardDescription>{t("education.badgesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-success/5">
              <div className="h-14 w-14 rounded-full bg-success/20 flex items-center justify-center text-2xl">🔊</div>
              <div>
                <p className="font-semibold">{t("education.badgeDetails.ultrasoundLevel1")}</p>
                <p className="text-xs text-muted-foreground">{t("education.badgeDetails.completedDate")}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">{t("education.badges.verified")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50 opacity-60">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-2xl">🦵</div>
              <div>
                <p className="font-semibold">{t("education.badgeDetails.padInProgress")}</p>
                <p className="text-xs text-muted-foreground">{t("education.badgeDetails.padProgress")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
