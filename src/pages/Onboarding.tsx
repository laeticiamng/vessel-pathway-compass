import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/context";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Stethoscope,
  Building2,
  HeartPulse,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Check,
  SkipForward,
} from "lucide-react";

const ROLES = ["physician", "trainee", "expert_reviewer", "hospital_admin", "research_lead"] as const;
const SPECIALTIES = [
  "vascular_surgery",
  "interventional_radiology",
  "cardiology",
  "angiology",
  "general_surgery",
  "other",
] as const;
const AGE_RANGES = ["18-30", "31-40", "41-50", "51-60", "61-70", "71-80", "80+"] as const;
const CATEGORIES = ["PAD", "Aortic", "Venous", "Carotid", "DVT/PE"] as const;

const STEP_COUNT = 4;

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [role, setRole] = useState("physician");
  // Step 2
  const [institution, setInstitution] = useState("");
  // Step 3
  const [specialty, setSpecialty] = useState("vascular_surgery");
  const [displayName, setDisplayName] = useState("");
  // Step 4
  const [pseudonym, setPseudonym] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientSex, setPatientSex] = useState("");
  const [patientCategory, setPatientCategory] = useState("");

  const progress = ((step + 1) / STEP_COUNT) * 100;

  const stepIcons = [
    <Stethoscope key="r" className="h-5 w-5" />,
    <Building2 key="i" className="h-5 w-5" />,
    <HeartPulse key="s" className="h-5 w-5" />,
    <UserPlus key="p" className="h-5 w-5" />,
  ];

  const stepTitles = [
    t("onboarding.roleTitle"),
    t("onboarding.institutionTitle"),
    t("onboarding.specialtyTitle"),
    t("onboarding.patientTitle"),
  ];

  const stepDescs = [
    t("onboarding.roleDesc"),
    t("onboarding.institutionDesc"),
    t("onboarding.specialtyDesc"),
    t("onboarding.patientDesc"),
  ];

  async function finish(skipPatient = false) {
    if (!user) return;
    setSaving(true);
    try {
      // Update profile
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          role,
          institution,
          specialty,
          display_name: displayName || undefined,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (profileErr) throw profileErr;

      // Optionally create first patient
      if (!skipPatient && pseudonym.trim()) {
        const { data: patient, error: patientErr } = await supabase
          .from("patients")
          .insert({
            pseudonym: pseudonym.trim(),
            age_range: patientAge || null,
            sex: patientSex || null,
            created_by: user.id,
          })
          .select()
          .single();

        if (patientErr) throw patientErr;

        if (patient && patientCategory) {
          await supabase.from("cases").insert({
            patient_id: patient.id,
            title: `${patientCategory} – ${pseudonym}`,
            category: patientCategory.toLowerCase(),
            created_by: user.id,
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["profile-onboarding"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(t("onboarding.complete"));
      navigate("/app");
    } catch {
      toast.error(t("onboarding.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Link to="/" className="flex items-center gap-2 mb-6">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
          <HeartPulse className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">Vascular Atlas</span>
      </Link>
      <div className="w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{`${step + 1} / ${STEP_COUNT}`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {stepIcons.map((icon, i) => (
              <div
                key={i}
                className={`rounded-full p-2 transition-colors ${
                  i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stepIcons[step]}
              {stepTitles[step]}
            </CardTitle>
            <CardDescription>{stepDescs[step]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Role */}
            {step === 0 && (
              <RadioGroup value={role} onValueChange={setRole} className="grid gap-3">
                {ROLES.map((r) => (
                  <Label
                    key={r}
                    htmlFor={r}
                    className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      role === r ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value={r} id={r} />
                    <span className="font-medium">{t(`onboarding.roles.${r}`)}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {/* Step 2: Institution */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("onboarding.institutionName")} <span className="text-xs text-muted-foreground">({t("onboarding.optional")})</span></Label>
                  <Input
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder={t("onboarding.institutionPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("onboarding.displayName")} <span className="text-xs text-muted-foreground">({t("onboarding.optional")})</span></Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("onboarding.displayNamePlaceholder")}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Specialty */}
            {step === 2 && (
              <RadioGroup value={specialty} onValueChange={setSpecialty} className="grid gap-3">
                {SPECIALTIES.map((s) => (
                  <Label
                    key={s}
                    htmlFor={s}
                    className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      specialty === s ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value={s} id={s} />
                    <span className="font-medium">{t(`onboarding.specialties.${s}`)}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {/* Step 4: First patient */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("onboarding.pseudonym")}</Label>
                  <Input
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    placeholder={t("onboarding.pseudonymPlaceholder") as string || "PAT-001"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("onboarding.ageRange")}</Label>
                    <Select value={patientAge} onValueChange={setPatientAge}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        {AGE_RANGES.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("onboarding.sex")}</Label>
                    <Select value={patientSex} onValueChange={setPatientSex}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t("onboarding.male")}</SelectItem>
                        <SelectItem value="female">{t("onboarding.female")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("onboarding.category")}</Label>
                  <Select value={patientCategory} onValueChange={setPatientCategory}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nav buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </Button>

          <div className="flex gap-2">
            {step === 3 && (
              <Button variant="ghost" onClick={() => finish(true)} disabled={saving}>
                <SkipForward className="h-4 w-4 mr-1" />
                {t("onboarding.skip")}
              </Button>
            )}
            {step < STEP_COUNT - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                {t("common.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => finish(false)} disabled={saving}>
                <Check className="h-4 w-4 mr-1" />
                {t("onboarding.finish")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
