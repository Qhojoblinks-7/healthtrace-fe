import { useState, useEffect, useCallback } from "react";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useScreeningStore } from "@/store";

// Clinical validation ranges (medical safe ranges)
const VITAL_RANGES = {
  height_cm: { min: 50, max: 300, unit: "cm", label: "Height" },
  weight_kg: { min: 10, max: 500, unit: "kg", label: "Weight" },
  systolic_bp: { min: 60, max: 250, unit: "mmHg", label: "Systolic BP" },
  diastolic_bp: { min: 40, max: 150, unit: "mmHg", label: "Diastolic BP" },
  glucose_level: { min: 20, max: 1000, unit: "mg/dL", label: "Glucose" },
};

// Warning thresholds for pre-validation
const WARNING_THRESHOLDS = {
  systolic_bp: { warning: 140, critical: 180 },
  diastolic_bp: { warning: 90, critical: 120 },
  glucose_level: { warning: 200, critical: 400 },
};

/**
 * VitalsGrid - Clinical measurements component
 * Responsive 2x3 grid: Height, Weight, Systolic, Diastolic, Glucose
 * Real-time pre-validation with TanStack Query pattern
 */
export function VitalsGrid() {
  const { screeningFormData, updateFormData } = useScreeningStore();
  const [warnings, setWarnings] = useState({});

  // Local state for form fields
  const [heightCm, setHeightCm] = useState(screeningFormData.height_cm || "");
  const [weightKg, setWeightKg] = useState(screeningFormData.weight_kg || "");
  const [systolicBp, setSystolicBp] = useState(
    screeningFormData.systolic_bp || "",
  );
  const [diastolicBp, setDiastolicBp] = useState(
    screeningFormData.diastolic_bp || "",
  );
  const [glucoseLevel, setGlucoseLevel] = useState(
    screeningFormData.glucose_level || "",
  );

  // Update store when fields change
  useEffect(() => {
    updateFormData({ height_cm: heightCm ? parseFloat(heightCm) : null });
  }, [heightCm, updateFormData]);

  useEffect(() => {
    updateFormData({ weight_kg: weightKg ? parseFloat(weightKg) : null });
  }, [weightKg, updateFormData]);

  useEffect(() => {
    updateFormData({ systolic_bp: systolicBp ? parseInt(systolicBp) : null });
  }, [systolicBp, updateFormData]);

  useEffect(() => {
    updateFormData({
      diastolic_bp: diastolicBp ? parseInt(diastolicBp) : null,
    });
  }, [diastolicBp, updateFormData]);

  useEffect(() => {
    updateFormData({
      glucose_level: glucoseLevel ? parseFloat(glucoseLevel) : null,
    });
  }, [glucoseLevel, updateFormData]);

  // Pre-validation function - checks if values are in safe range
  const validateVital = useCallback((field, value) => {
    if (!value) return null;

    const numValue = parseFloat(value);
    const range = VITAL_RANGES[field];
    const thresholds = WARNING_THRESHOLDS[field];

    // Check basic range
    if (numValue < range.min || numValue > range.max) {
      return {
        type: "error",
        message: `${range.label} must be ${range.min}-${range.max} ${range.unit}`,
      };
    }

    // Check warning thresholds for BP and Glucose
    if (thresholds) {
      if (numValue >= thresholds.critical) {
        return {
          type: "critical",
          message: `CRITICAL: ${range.label} is dangerously high!`,
        };
      }
      if (numValue >= thresholds.warning) {
        return {
          type: "warning",
          message: `Warning: ${range.label} is elevated`,
        };
      }
    }

    return null;
  }, []);

  // Handle field changes with pre-validation
  const handleFieldChange = (setter) => (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  // Check for warnings on each change
  useEffect(() => {
    const newWarnings = {};

    if (systolicBp) {
      const result = validateVital("systolic_bp", systolicBp);
      if (result) newWarnings.systolic_bp = result;
    }
    if (diastolicBp) {
      const result = validateVital("diastolic_bp", diastolicBp);
      if (result) newWarnings.diastolic_bp = result;
    }
    if (glucoseLevel) {
      const result = validateVital("glucose_level", glucoseLevel);
      if (result) newWarnings.glucose_level = result;
    }

    setWarnings(newWarnings);
  }, [systolicBp, diastolicBp, glucoseLevel, validateVital]);

  // Get status color for field
  const getFieldStatus = (field, value) => {
    if (!value) return "default";
    const validation = validateVital(field, value);
    if (!validation) return "success";
    if (validation.type === "critical") return "critical";
    if (validation.type === "warning") return "warning";
    return "error";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Vitals & Measurements
        </CardTitle>
        <CardDescription>
          Enter clinical measurements (optional but recommended)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Warnings Display */}
        {Object.keys(warnings).length > 0 && (
          <div className="space-y-2">
            {Object.entries(warnings).map(([field, warning]) => (
              <Alert
                key={field}
                variant={
                  warning.type === "critical"
                    ? "destructive"
                    : warning.type === "warning"
                      ? "info"
                      : "default"
                }
                className={
                  warning.type === "warning"
                    ? "bg-yellow-50 border-yellow-300"
                    : ""
                }
              >
                {warning.type === "critical" && (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription className="flex items-center gap-2">
                  {warning.type === "critical" && (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  {warning.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Responsive 2x3 Grid for Vitals */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="text"
              inputMode="decimal"
              placeholder="175"
              value={heightCm}
              onChange={handleFieldChange(setHeightCm)}
              className={
                getFieldStatus("height_cm", heightCm) === "success"
                  ? "border-green-500"
                  : getFieldStatus("height_cm", heightCm) === "error"
                    ? "border-red-500"
                    : ""
              }
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="text"
              inputMode="decimal"
              placeholder="70"
              value={weightKg}
              onChange={handleFieldChange(setWeightKg)}
              className={
                getFieldStatus("weight_kg", weightKg) === "success"
                  ? "border-green-500"
                  : getFieldStatus("weight_kg", weightKg) === "error"
                    ? "border-red-500"
                    : ""
              }
            />
          </div>

          {/* Systolic BP */}
          <div className="space-y-2">
            <Label htmlFor="systolic">Systolic (mmHg)</Label>
            <Input
              id="systolic"
              type="text"
              inputMode="numeric"
              placeholder="120"
              value={systolicBp}
              onChange={handleFieldChange(setSystolicBp)}
              className={
                getFieldStatus("systolic_bp", systolicBp) === "critical"
                  ? "border-red-600 animate-pulse"
                  : getFieldStatus("systolic_bp", systolicBp) === "warning"
                    ? "border-yellow-500"
                    : getFieldStatus("systolic_bp", systolicBp) === "success"
                      ? "border-green-500"
                      : ""
              }
            />
          </div>

          {/* Diastolic BP */}
          <div className="space-y-2">
            <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
            <Input
              id="diastolic"
              type="text"
              inputMode="numeric"
              placeholder="80"
              value={diastolicBp}
              onChange={handleFieldChange(setDiastolicBp)}
              className={
                getFieldStatus("diastolic_bp", diastolicBp) === "critical"
                  ? "border-red-600 animate-pulse"
                  : getFieldStatus("diastolic_bp", diastolicBp) === "warning"
                    ? "border-yellow-500"
                    : getFieldStatus("diastolic_bp", diastolicBp) === "success"
                      ? "border-green-500"
                      : ""
              }
            />
          </div>

          {/* Glucose - spans 2 cols on mobile */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <Label htmlFor="glucose">Glucose (mg/dL)</Label>
            <Input
              id="glucose"
              type="text"
              inputMode="decimal"
              placeholder="100"
              value={glucoseLevel}
              onChange={handleFieldChange(setGlucoseLevel)}
              className={
                getFieldStatus("glucose_level", glucoseLevel) === "critical"
                  ? "border-red-600 animate-pulse"
                  : getFieldStatus("glucose_level", glucoseLevel) === "warning"
                    ? "border-yellow-500"
                    : getFieldStatus("glucose_level", glucoseLevel) ===
                        "success"
                      ? "border-green-500"
                      : ""
              }
            />
          </div>
        </div>

        {/* Quick Reference - Responsive */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium">Quick Reference:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs">
            <div>
              <span className="text-green-600">BP Normal:</span> {"<120/80"}
            </div>
            <div>
              <span className="text-yellow-600">BP Elevated:</span> 120-129/
              {"<80"}
            </div>
            <div>
              <span className="text-red-600">Glucose:</span> {"<140 normal"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VitalsGrid;
