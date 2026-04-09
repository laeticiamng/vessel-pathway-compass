import { useState } from "react";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { interpretABI, type ABIInterpretation } from "@/lib/vascscreen/esc2024-criteria";

interface ABIInterpreterProps {
  onResult?: (right: number, left: number, interpretation: ABIInterpretation) => void;
  defaultRight?: number;
  defaultLeft?: number;
}

export function ABIInterpreter({ onResult, defaultRight, defaultLeft }: ABIInterpreterProps) {
  const { t } = useTranslation();
  const [rightABI, setRightABI] = useState(defaultRight?.toString() ?? "");
  const [leftABI, setLeftABI] = useState(defaultLeft?.toString() ?? "");
  const [rightResult, setRightResult] = useState<ABIInterpretation | null>(
    defaultRight ? interpretABI(defaultRight) : null
  );
  const [leftResult, setLeftResult] = useState<ABIInterpretation | null>(
    defaultLeft ? interpretABI(defaultLeft) : null
  );

  const handleInterpret = () => {
    const r = parseFloat(rightABI);
    const l = parseFloat(leftABI);
    if (!isNaN(r)) setRightResult(interpretABI(r));
    if (!isNaN(l)) setLeftResult(interpretABI(l));

    // Use the lower ABI for the main interpretation
    const lowestABI = Math.min(
      !isNaN(r) ? r : Infinity,
      !isNaN(l) ? l : Infinity
    );
    if (lowestABI !== Infinity && onResult) {
      onResult(r || 0, l || 0, interpretABI(lowestABI));
    }
  };

  const renderResult = (label: string, result: ABIInterpretation | null) => {
    if (!result) return null;
    return (
      <div className="p-3 rounded-lg border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <Badge
            style={{ backgroundColor: result.color === "darkred" ? "#991b1b" : result.color, color: "white" }}
          >
            {result.interpretation}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{result.action}</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("vascscreen.abi.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rightABI">{t("vascscreen.abi.rightABI")}</Label>
            <Input
              id="rightABI"
              type="number"
              step="0.01"
              min="0"
              max="2"
              placeholder="e.g. 1.05"
              value={rightABI}
              onChange={(e) => setRightABI(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leftABI">{t("vascscreen.abi.leftABI")}</Label>
            <Input
              id="leftABI"
              type="number"
              step="0.01"
              min="0"
              max="2"
              placeholder="e.g. 0.85"
              value={leftABI}
              onChange={(e) => setLeftABI(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleInterpret} className="w-full">
          {t("vascscreen.abi.interpret")}
        </Button>

        {(rightResult || leftResult) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t("vascscreen.abi.interpretation")}</h4>
            {rightResult && renderResult(t("vascscreen.abi.rightABI"), rightResult)}
            {leftResult && renderResult(t("vascscreen.abi.leftABI"), leftResult)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
