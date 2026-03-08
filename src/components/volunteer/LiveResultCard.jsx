import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Activity, AlertTriangle } from "lucide-react"
import { useScreeningStore } from "@/store"

/**
 * LiveResultCard - Real-time visual feedback component
 * Displays BMI and Blood Pressure category with color-coded badges
 * Updates instantly from Zustand store
 */
export function LiveResultCard() {
  const { screeningFormData } = useScreeningStore()
  
  // Get vitals from store
  const weightKg = screeningFormData.weight_kg
  const heightCm = screeningFormData.height_cm
  const systolicBp = screeningFormData.systolic_bp
  const diastolicBp = screeningFormData.diastolic_bp
  const glucoseLevel = screeningFormData.glucose_level

  // Calculate BMI
  const bmi = calculateBMI(weightKg, heightCm)
  const bmiCategory = getBMICategory(bmi)
  
  // Get Blood Pressure Status
  const bpStatus = getBloodPressureStatus(systolicBp, diastolicBp)
  const isBPCritical = bpStatus.includes('Crisis') || bpStatus.includes('Stage 2')
  
  // Get Glucose Status
  const glucoseStatus = getGlucoseStatus(glucoseLevel)
  const isGlucoseCritical = glucoseStatus === 'Diabetes Indication'
  
  const isCritical = isBPCritical || isGlucoseCritical

  return (
    <Card className="sticky top-4 shadow-md border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Activity className="h-5 w-5" />
          Live Results
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Critical Alert */}
        {isCritical && (
          <Alert variant="destructive" className="bg-red-50 border-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Critical values detected! Verify before submitting.
            </AlertDescription>
          </Alert>
        )}
        
        {/* BMI Display */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Body Mass Index</div>
          <div className="text-4xl font-bold text-primary">
            {bmi?.toFixed(1) || '--'}
          </div>
          <Badge className={`mt-2 ${getBMIBadgeColor(bmiCategory)}`}>
            {bmiCategory || 'Enter values'}
          </Badge>
        </div>
        
        {/* Blood Pressure Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Heart className="h-4 w-4 text-red-500" />
            Blood Pressure
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              {systolicBp && diastolicBp 
                ? `${systolicBp}/${diastolicBp} mmHg`
                : '--/-- mmHg'
              }
            </span>
            <Badge className={getBPBadgeColor(bpStatus)}>
              {bpStatus || 'Normal'}
            </Badge>
          </div>
        </div>
        
        {/* Glucose Display */}
        {glucoseLevel && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Blood Glucose</div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {glucoseLevel} mg/dL
              </span>
              <Badge className={getGlucoseBadgeColor(glucoseStatus)}>
                {glucoseStatus}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper functions
function calculateBMI(weight, height) {
  if (!weight || !height) return null
  const heightM = height / 100
  return weight / (heightM * heightM)
}

function getBMICategory(bmi) {
  if (!bmi) return null
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

function getBMIBadgeColor(category) {
  switch (category) {
    case 'Underweight': return 'bg-blue-500'
    case 'Normal': return 'bg-green-500'
    case 'Overweight': return 'bg-yellow-500'
    case 'Obese': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

function getBloodPressureStatus(systolic, diastolic) {
  if (!systolic || !diastolic) return 'Normal'
  
  if (systolic > 180 || diastolic > 120) return 'Crisis'
  if (systolic >= 140 || diastolic >= 90) return 'Stage 2'
  if (systolic >= 130 || diastolic >= 80) return 'Stage 1'
  if (systolic >= 120 && diastolic < 80) return 'Elevated'
  return 'Normal'
}

function getBPBadgeColor(status) {
  switch (status) {
    case 'Crisis': return 'bg-red-600 text-white animate-pulse'
    case 'Stage 2': return 'bg-red-500'
    case 'Stage 1': return 'bg-orange-500'
    case 'Elevated': return 'bg-yellow-500'
    default: return 'bg-green-500'
  }
}

function getGlucoseStatus(glucose) {
  if (!glucose) return 'Normal'
  if (glucose >= 200) return 'Diabetes'
  if (glucose >= 140) return 'Prediabetes'
  return 'Normal'
}

function getGlucoseBadgeColor(status) {
  switch (status) {
    case 'Diabetes': return 'bg-red-500'
    case 'Prediabetes': return 'bg-yellow-500'
    default: return 'bg-green-500'
  }
}

export default LiveResultCard
