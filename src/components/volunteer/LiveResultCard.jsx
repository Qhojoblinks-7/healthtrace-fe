import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Activity, AlertTriangle } from "lucide-react";
import { useScreeningStore } from "@/store";
import {
  calculateBMI,
  getBMICategory,
  getBloodPressureStatus,
  getGlucoseStatus,
  evaluateClinicalUrgency,
} from "@/lib/health-calculations";

export function LiveResultCard() {
  const { formFields } = useScreeningStore();

  const weightKg = formFields.weight_kg;
  const heightCm = formFields.height_cm;
  const systolicBp = formFields.systolic_bp;
  const diastolicBp = formFields.diastolic_bp;
  const glucoseLevel = formFields.glucose_level;

  const bmi = useMemo(() => calculateBMI(weightKg, heightCm), [weightKg, heightCm]);
  const bmiCategory = useMemo(() => getBMICategory(bmi), [bmi]);
  const bpStatus = useMemo(
    () => getBloodPressureStatus(systolicBp, diastolicBp),
    [systolicBp, diastolicBp],
  );
  const isBPCritical = useMemo(
    () => bpStatus === "Crisis" || bpStatus === "Stage 2",
    [bpStatus],
  );
  const glucoseStatus = useMemo(() => getGlucoseStatus(glucoseLevel), [glucoseLevel]);
  const isGlucoseCritical = useMemo(() => glucoseStatus === "Diabetes", [glucoseStatus]);

  const isCritical = useMemo(
    () => isBPCritical || isGlucoseCritical || evaluateClinicalUrgency(formFields),
    [isBPCritical, isGlucoseCritical, formFields],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Live Results
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isCritical && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Critical values detected! Verify before submitting.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Body Mass Index</div>
          <div className="text-4xl font-bold text-primary">
            {bmi?.toFixed(1) || "--"}
          </div>
          <Badge className={`mt-2 ${getBMIBadgeColor(bmiCategory)}`}>
            {bmiCategory || "Enter values"}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Heart className="h-4 w-4 text-red-500" />
            Blood Pressure
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              {systolicBp && diastolicBp
                ? `${systolicBp}/${diastolicBp} mmHg`
                : "--/-- mmHg"}
            </span>
            <Badge className={getBPBadgeColor(bpStatus)}>
              {bpStatus || "Normal"}
            </Badge>
          </div>
        </div>

        {glucoseLevel && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Blood Glucose</div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{glucoseLevel} mg/dL</span>
              <Badge className={getGlucoseBadgeColor(glucoseStatus)}>
                {glucoseStatus}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getBMIBadgeColor(category) {
  switch (category) {
    case "Underweight":
      return "bg-blue-500";
    case "Normal":
      return "bg-green-500";
    case "Overweight":
      return "bg-yellow-500";
    case "Obese":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getBPBadgeColor(status) {
  switch (status) {
    case "Crisis":
      return "bg-red-600 text-white animate-pulse";
    case "Stage 2":
      return "bg-red-500";
    case "Stage 1":
      return "bg-orange-500";
    case "Elevated":
      return "bg-yellow-500";
    default:
      return "bg-green-500";
  }
}

function getGlucoseBadgeColor(status) {
  switch (status) {
    case "Diabetes":
      return "bg-red-500";
    case "Prediabetes":
      return "bg-yellow-500";
    default:
      return "bg-green-500";
  }
}

export default LiveResultCard;
