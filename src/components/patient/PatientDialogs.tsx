import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n/context";
import type { Tables } from "@/integrations/supabase/types";
import type { UseMutationResult } from "@tanstack/react-query";

const AGE_RANGES = ["18-30", "31-40", "41-50", "51-60", "61-70", "71-80", "80+"] as const;

// --- Edit Patient Dialog ---
interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Tables<"patients">;
  mutation: UseMutationResult<void, Error, { pseudonym: string; age_range: string; sex: string }>;
}

export function EditPatientDialog({ open, onOpenChange, patient, mutation }: EditDialogProps) {
  const { t } = useTranslation();
  const [pseudonym, setPseudonym] = useState(patient.pseudonym);
  const [ageRange, setAgeRange] = useState(patient.age_range ?? "");
  const [sex, setSex] = useState(patient.sex ?? "");

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setPseudonym(patient.pseudonym);
      setAgeRange(patient.age_range ?? "");
      setSex(patient.sex ?? "");
    }
    onOpenChange(isOpen);
  };

  const handleSave = () => {
    mutation.mutate({ pseudonym, age_range: ageRange, sex }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("patientDetail.editDialog.title")}</DialogTitle>
          <DialogDescription>{t("patientDetail.editDialog.desc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("patientDetail.editDialog.pseudonym")}</Label>
            <Input value={pseudonym} onChange={(e) => setPseudonym(e.target.value)} maxLength={100} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("patientDetail.editDialog.ageRange")}</Label>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger><SelectValue placeholder={t("patientDetail.editDialog.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>{AGE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("patientDetail.editDialog.sex")}</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger><SelectValue placeholder={t("patientDetail.editDialog.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("patientDetail.editDialog.male")}</SelectItem>
                  <SelectItem value="female">{t("patientDetail.editDialog.female")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSave} disabled={!pseudonym || mutation.isPending}>
            {mutation.isPending ? t("common.loading") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Add Event Dialog ---
interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutation: UseMutationResult<void, Error, { title: string; event_type: string; description: string }>;
}

export function AddEventDialog({ open, onOpenChange, mutation }: AddEventDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = () => {
    mutation.mutate({ title, event_type: eventType, description: desc }, {
      onSuccess: () => { onOpenChange(false); setTitle(""); setEventType(""); setDesc(""); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("patientDetail.eventDialog.title")}</DialogTitle>
          <DialogDescription>{t("patientDetail.eventDialog.desc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("patientDetail.eventDialog.titleLabel")}</Label>
            <Input placeholder={t("patientDetail.eventDialog.titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>{t("patientDetail.eventDialog.eventType")}</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger><SelectValue placeholder={t("patientDetail.eventDialog.selectType")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="procedure">{t("patientDetail.eventDialog.procedure")}</SelectItem>
                <SelectItem value="imaging">{t("patientDetail.eventDialog.imaging")}</SelectItem>
                <SelectItem value="lab">{t("patientDetail.eventDialog.lab")}</SelectItem>
                <SelectItem value="note">{t("patientDetail.eventDialog.note")}</SelectItem>
                <SelectItem value="medication">{t("patientDetail.eventDialog.medication")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("patientDetail.eventDialog.description")}</Label>
            <Input placeholder={t("patientDetail.eventDialog.descPlaceholder")} value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={1000} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={!title || mutation.isPending}>
            {mutation.isPending ? t("common.loading") : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Add Measurement Dialog ---
interface AddMeasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutation: UseMutationResult<void, Error, { type: string; value: number; unit: string; site: string }>;
}

export function AddMeasurementDialog({ open, onOpenChange, mutation }: AddMeasDialogProps) {
  const { t } = useTranslation();
  const [measType, setMeasType] = useState("");
  const [measValue, setMeasValue] = useState("");
  const [measUnit, setMeasUnit] = useState("");
  const [measSite, setMeasSite] = useState("");

  const handleSubmit = () => {
    mutation.mutate({ type: measType, value: parseFloat(measValue), unit: measUnit, site: measSite }, {
      onSuccess: () => { onOpenChange(false); setMeasType(""); setMeasValue(""); setMeasUnit(""); setMeasSite(""); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("patientDetail.measDialog.title")}</DialogTitle>
          <DialogDescription>{t("patientDetail.measDialog.desc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("patientDetail.measDialog.type")}</Label>
            <Select value={measType} onValueChange={setMeasType}>
              <SelectTrigger><SelectValue placeholder={t("patientDetail.measDialog.selectType")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ABI">{t("patientDetail.measDialog.abi")}</SelectItem>
                <SelectItem value="TBI">{t("patientDetail.measDialog.tbi")}</SelectItem>
                <SelectItem value="Diameter">{t("patientDetail.measDialog.diameter")}</SelectItem>
                <SelectItem value="Stenosis">{t("patientDetail.measDialog.stenosis")}</SelectItem>
                <SelectItem value="PSV">{t("patientDetail.measDialog.velocity")}</SelectItem>
                <SelectItem value="Walking Distance">{t("patientDetail.measDialog.walkingDistance")}</SelectItem>
                <SelectItem value="Blood Pressure">{t("patientDetail.measDialog.bloodPressure") ?? "Blood Pressure"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("patientDetail.measDialog.value")}</Label>
              <Input type="number" step="any" placeholder={t("patientDetail.measDialog.valuePlaceholder")} value={measValue} onChange={(e) => setMeasValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("patientDetail.measDialog.unit")}</Label>
              <Input placeholder={t("patientDetail.measDialog.unitPlaceholder")} value={measUnit} onChange={(e) => setMeasUnit(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("patientDetail.measDialog.site")}</Label>
            <Input placeholder={t("patientDetail.measDialog.sitePlaceholder")} value={measSite} onChange={(e) => setMeasSite(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={!measType || !measValue || !measUnit || mutation.isPending}>
            {mutation.isPending ? t("common.loading") : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Delete Confirmation Dialog ---
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  isPending: boolean;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, onOpenChange, title, description, confirmLabel, isPending, onConfirm }: DeleteConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? t("common.loading") : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
