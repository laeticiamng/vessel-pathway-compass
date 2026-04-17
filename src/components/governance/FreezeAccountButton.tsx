import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Snowflake, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FreezeAccountButtonProps {
  targetUserId: string;
  targetName: string;
  onFrozen?: () => void;
}

export function FreezeAccountButton({ targetUserId, targetName, onFrozen }: FreezeAccountButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFreeze = async () => {
    if (reason.trim().length < 10) {
      toast.error("Le motif doit contenir au moins 10 caractères.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.rpc("freeze_user_account" as never, {
      _target_user_id: targetUserId,
      _reason: reason.trim(),
    } as never);
    setLoading(false);

    if (error) {
      toast.error(`Échec : ${error.message}`);
      return;
    }
    toast.success(`Compte de ${targetName} gelé. Tous les rôles ont été révoqués.`);
    setOpen(false);
    setReason("");
    onFrozen?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" className="gap-1">
          <Snowflake className="h-3 w-3" />
          Geler le compte
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-destructive" />
            Geler le compte de {targetName} ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action <strong>révoque immédiatement tous les rôles applicatifs</strong> de l'utilisateur (action critique tracée).
            Elle est utilisée pour les incidents RH ou de sécurité. L'utilisateur conservera son compte mais perdra l'accès à toutes les fonctionnalités protégées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="freeze-reason">Motif (obligatoire, min. 10 caractères)</Label>
          <Textarea
            id="freeze-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex : suspicion d'accès non autorisé suite à incident sécurité du…"
            rows={3}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleFreeze();
            }}
            disabled={loading || reason.trim().length < 10}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Snowflake className="h-4 w-4 mr-2" />}
            Confirmer le gel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
