import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/context";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X, ShieldAlert } from "lucide-react";

const COMMON_RISK_FACTORS = [
  "diabetes",
  "smoking",
  "hypertension",
  "hyperlipidemia",
  "obesity",
  "chronic_kidney_disease",
  "coronary_artery_disease",
  "atrial_fibrillation",
  "family_history",
  "sedentary_lifestyle",
] as const;

interface Props {
  patientId: string;
  riskFactors: string[];
}

export default function RiskFactorsEditor({ patientId, riskFactors }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customFactor, setCustomFactor] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (newFactors: string[]) => {
      const { error } = await supabase
        .from("patients")
        .update({ risk_factors: newFactors })
        .eq("id", patientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (err: Error) => {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    },
  });

  function addFactor(factor: string) {
    const normalized = factor.trim().toLowerCase().replace(/\s+/g, "_");
    if (!normalized || riskFactors.includes(normalized)) return;
    updateMutation.mutate([...riskFactors, normalized]);
    setCustomFactor("");
  }

  function removeFactor(factor: string) {
    updateMutation.mutate(riskFactors.filter((f) => f !== factor));
  }

  function formatLabel(factor: string) {
    return factor.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const riskLevel = riskFactors.length >= 4 ? "critical" : riskFactors.length >= 3 ? "high" : riskFactors.length >= 1 ? "moderate" : "low";
  const riskColors: Record<string, string> = {
    low: "text-success",
    moderate: "text-warning",
    high: "text-destructive",
    critical: "text-destructive",
  };

  const suggestions = COMMON_RISK_FACTORS.filter((f) => !riskFactors.includes(f));

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className={`h-4 w-4 ${riskColors[riskLevel]}`} />
            <h3 className="text-sm font-medium">{t("patientDetail.riskFactors.title")}</h3>
          </div>
          <span className={`text-xs font-medium capitalize ${riskColors[riskLevel]}`}>
            {t(`patientDetail.riskFactors.${riskLevel}`)}
          </span>
        </div>

        {/* Current risk factors */}
        <div className="flex flex-wrap gap-2">
          {riskFactors.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("patientDetail.riskFactors.none")}</p>
          )}
          {riskFactors.map((factor) => (
            <Badge key={factor} variant="secondary" className="gap-1 pr-1">
              {formatLabel(factor)}
              <button
                onClick={() => removeFactor(factor)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                disabled={updateMutation.isPending}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {/* Quick-add suggestions */}
        {suggestions.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">{t("patientDetail.riskFactors.quickAdd")}</p>
            <div className="flex flex-wrap gap-2 sm:gap-1.5">
              {suggestions.map((factor) => (
                <button
                  key={factor}
                  onClick={() => addFactor(factor)}
                  disabled={updateMutation.isPending}
                  className="text-xs px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors active:bg-primary/10"
                >
                  + {formatLabel(factor)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom factor input */}
        <div className="flex gap-2">
          <Input
            placeholder={t("patientDetail.riskFactors.customPlaceholder")}
            value={customFactor}
            onChange={(e) => setCustomFactor(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFactor(customFactor)}
            className="text-sm h-8"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 shrink-0"
            onClick={() => addFactor(customFactor)}
            disabled={!customFactor.trim() || updateMutation.isPending}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("common.add")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
