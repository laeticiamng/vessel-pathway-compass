import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";

type AppRole = "admin" | "physician" | "trainee" | "expert_reviewer" | "hospital_admin" | "research_lead";

const RESTORABLE_ROLES: AppRole[] = ["physician", "trainee", "expert_reviewer", "hospital_admin", "research_lead"];

interface Props {
  targetUserId: string;
  targetName: string;
  onReactivated?: () => void;
}

export function UnfreezeAccountButton({ targetUserId, targetName, onReactivated }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [role, setRole] = useState<AppRole>("physician");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (reason.trim().length < 10) {
      toast.error("Justification minimale : 10 caractères.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.rpc("reactivate_user_account" as never, {
      _target_user_id: targetUserId,
      _role: role,
      _reason: reason.trim(),
    } as never);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Compte de ${targetName} réactivé avec rôle « ${role} ».`);
    setOpen(false);
    setReason("");
    onReactivated?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserCheck className="h-3 w-3 mr-1" />
          Réactiver
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Réactiver le compte de {targetName}</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action attribuera un rôle de base à un compte gelé. L'événement sera tracé en sévérité <strong>warn</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="role">Rôle de base à restaurer</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger id="role"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESTORABLE_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Justification (≥ 10 caractères)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : enquête RH clôturée, accès rétabli après vérification…"
              rows={3}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); handle(); }} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Réactiver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
