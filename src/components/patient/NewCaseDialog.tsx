import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { newPatientCaseSchema } from "@/lib/validation";
import { useAuditLog } from "@/hooks/useAuditLog";

const CATEGORIES = ["PAD", "Aortic", "Venous", "Carotid", "DVT/PE"] as const;
const AGE_RANGES = ["18-30", "31-40", "41-50", "51-60", "61-70", "71-80", "80+"] as const;

interface NewCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewCaseDialog({ open, onOpenChange }: NewCaseDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  const [pseudonym, setPseudonym] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [category, setCategory] = useState("");
  const [caseTitle, setCaseTitle] = useState("");

  function resetForm() {
    setPseudonym("");
    setAgeRange("");
    setSex("");
    setCategory("");
    setCaseTitle("");
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const parsed = newPatientCaseSchema.safeParse({ pseudonym, ageRange, sex, category, caseTitle });
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { data: patient, error: pErr } = await supabase
        .from("patients")
        .insert({
          pseudonym,
          age_range: ageRange || null,
          sex: sex || null,
          created_by: user.id,
        })
        .select()
        .single();
      if (pErr) throw pErr;

      const { data: caseRow, error: cErr } = await supabase.from("cases").insert({
        patient_id: patient.id,
        category: category || "pad",
        title: caseTitle || pseudonym,
        created_by: user.id,
      }).select("id").single();
      if (cErr) throw cErr;

      // Audit transverse (ADR-001)
      await log({
        category: "clinical",
        action: "patient.created",
        severity: "info",
        targetEntityType: "patient",
        targetEntityId: patient.id,
        context: { ageRange, sex, hasCase: true },
      });
      await log({
        category: "clinical",
        action: "case.created",
        severity: "info",
        targetEntityType: "case",
        targetEntityId: caseRow?.id,
        context: { category: category || "pad", patientId: patient.id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onOpenChange(false);
      resetForm();
      toast({ title: t("common.create"), description: t("patients.newCase") });
    },
    onError: (err: Error) => {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("patients.newCase")}</DialogTitle>
          <DialogDescription>{t("patients.form.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("patients.form.pseudonym")}</Label>
            <Input
              placeholder={t("patients.form.pseudonymPlaceholder")}
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("patients.form.ageRange")}</Label>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger><SelectValue placeholder={t("patients.form.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {AGE_RANGES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("patients.form.sex")}</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger><SelectValue placeholder={t("patients.form.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("patients.form.male")}</SelectItem>
                  <SelectItem value="female">{t("patients.form.female")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("patients.form.category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder={t("patients.form.selectPlaceholder")} /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c.toLowerCase()}>{t(`medicalCategories.${c.toLowerCase()}`) as string || c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("patients.form.caseTitle")}</Label>
            <Input
              placeholder={t("patients.form.caseTitlePlaceholder")}
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!pseudonym || createMutation.isPending}
          >
            {createMutation.isPending ? t("common.loading") : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
