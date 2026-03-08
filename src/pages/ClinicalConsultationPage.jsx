import { useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Activity,
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  FileText,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { screeningAPI } from "@/api";

// Helper to calculate health score (0-100)
const calculateHealthScore = (screening) => {
  let score = 100;
  const issues = [];

  // Blood Pressure (40 points max)
  if (screening.systolic_bp && screening.diastolic_bp) {
    const { systolic_bp, diastolic_bp } = screening;
    if (systolic_bp > 180 || diastolic_bp > 120) {
      score -= 40;
      issues.push("Hypertensive Crisis");
    } else if (systolic_bp >= 140 || diastolic_bp >= 90) {
      score -= 30;
      issues.push("High BP (Stage 2)");
    } else if (systolic_bp >= 130 || diastolic_bp >= 80) {
      score -= 20;
      issues.push("High BP (Stage 1)");
    } else if (systolic_bp >= 120 && diastolic_bp < 80) {
      score -= 10;
      issues.push("Elevated BP");
    }
  }

  // Glucose (30 points max)
  if (screening.glucose_level) {
    const glucose = parseFloat(screening.glucose_level);
    if (glucose > 400) {
      score -= 30;
      issues.push("Critical Glucose");
    } else if (glucose >= 200) {
      score -= 20;
      issues.push("High Glucose (Diabetes)");
    } else if (glucose >= 140) {
      score -= 10;
      issues.push("Prediabetes");
    }
  }

  // BMI (20 points max)
  if (screening.bmi) {
    const bmi = screening.bmi;
    if (bmi >= 35) {
      score -= 20;
      issues.push("Obese (BMI > 35)");
    } else if (bmi >= 30) {
      score -= 15;
      issues.push("Obese (BMI 30-35)");
    } else if (bmi >= 25) {
      score -= 10;
      issues.push("Overweight");
    } else if (bmi < 18.5) {
      score -= 10;
      issues.push("Underweight");
    }
  }

  // Heart Rate (10 points max)
  if (screening.heart_rate) {
    const hr = screening.heart_rate;
    if (hr > 120 || hr < 50) {
      score -= 10;
      issues.push("Abnormal Heart Rate");
    }
  }

  return { score: Math.max(0, score), issues };
};

// Get score color
const getScoreColor = (score) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

// Get score badge variant
const getScoreBadgeVariant = (score) => {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  if (score >= 40) return "outline";
  return "destructive";
};

export function ClinicalConsultationPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get patient from navigation state or fetch
  const initialPatient = location.state?.patient;
  const [doctorAdvice, setDoctorAdvice] = useState("");
  const [requiresSpecialist, setRequiresSpecialist] = useState(false);

  // Fetch patient data
  const { data: patientData, isLoading } = useQuery({
    queryKey: ["screening", id],
    queryFn: () => screeningAPI.getById(id),
    enabled: !!id,
  });

  const patient = patientData?.data || initialPatient;

  // Calculate health score
  const healthScore = useMemo(() => {
    if (!patient) return { score: 0, issues: [] };
    return calculateHealthScore(patient);
  }, [patient]);

  // Consultation mutation
  const consultationMutation = useMutation({
    mutationFn: (data) => screeningAPI.consult(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screenings"] });
      queryClient.invalidateQueries({ queryKey: ["screening", id] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Consultation saved successfully!");
      navigate("/");
    },
    onError: (error) => {
      toast.error("Failed to save consultation", {
        description: error.response?.data?.message || "Please try again",
      });
    },
  });

  // Handle save
  const handleSave = () => {
    consultationMutation.mutate({
      doctor_advice: doctorAdvice,
      requires_specialist_followup: requiresSpecialist,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p className="text-lg font-medium">Patient not found</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Triage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Clinical Consultation
              </h1>
              <p className="text-sm text-slate-500">Patient ID: {patient.id}</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={consultationMutation.isPending}
            className="gap-2"
          >
            {consultationMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Consultation
          </Button>
        </div>
      </div>

      {/* Split View */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL - Patient Vitals (ReadOnly) */}
          <div className="space-y-6">
            {/* Patient Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500">Full Name</Label>
                    <p className="font-semibold text-lg">{patient.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Age / Gender</Label>
                    <p className="font-semibold">
                      {patient.age} years / {patient.gender}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Phone</Label>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.phone_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Screened By</Label>
                    <p className="font-medium">
                      {patient.screened_by || "Unknown"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Score */}
            <Card className={healthScore.score < 60 ? "border-red-200" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div
                      className={`text-6xl font-bold ${getScoreColor(healthScore.score)}`}
                    >
                      {healthScore.score}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      out of 100
                    </div>
                    <Badge
                      variant={getScoreBadgeVariant(healthScore.score)}
                      className="mt-2"
                    >
                      {healthScore.score >= 80
                        ? "Good"
                        : healthScore.score >= 60
                          ? "Fair"
                          : healthScore.score >= 40
                            ? "Poor"
                            : "Critical"}
                    </Badge>
                  </div>
                </div>
                {healthScore.issues.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-slate-500 mb-2 block">
                      Health Concerns:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {healthScore.issues.map((issue, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-orange-600 border-orange-300 bg-orange-50"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vitals Grid */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Blood Pressure */}
                  <div className="p-4 rounded-lg bg-slate-50">
                    <Label className="text-slate-500 flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Blood Pressure
                    </Label>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        patient.blood_pressure_status?.includes("Crisis")
                          ? "text-red-600"
                          : patient.blood_pressure_status?.includes("Stage 2")
                            ? "text-orange-600"
                            : patient.blood_pressure_status?.includes("Stage 1")
                              ? "text-yellow-600"
                              : "text-green-600"
                      }`}
                    >
                      {patient.systolic_bp && patient.diastolic_bp
                        ? `${patient.systolic_bp}/${patient.diastolic_bp}`
                        : "N/A"}
                    </p>
                    <Badge
                      variant={
                        patient.blood_pressure_status?.includes("Crisis")
                          ? "destructive"
                          : patient.blood_pressure_status?.includes("Stage 2")
                            ? "destructive"
                            : patient.blood_pressure_status?.includes("Stage 1")
                              ? "outline"
                              : "default"
                      }
                      className="mt-1"
                    >
                      {patient.blood_pressure_status || "Unknown"}
                    </Badge>
                  </div>

                  {/* Glucose */}
                  <div className="p-4 rounded-lg bg-slate-50">
                    <Label className="text-slate-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Glucose Level
                    </Label>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        patient.glucose_status?.includes("Diabetes")
                          ? "text-orange-600"
                          : patient.glucose_status?.includes("Prediabetes")
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {patient.glucose_level
                        ? `${patient.glucose_level} mg/dL`
                        : "N/A"}
                    </p>
                    <Badge
                      variant={
                        patient.glucose_status?.includes("Diabetes")
                          ? "outline"
                          : patient.glucose_status?.includes("Prediabetes")
                            ? "secondary"
                            : "default"
                      }
                      className="mt-1"
                    >
                      {patient.glucose_status || "Unknown"}
                    </Badge>
                  </div>

                  {/* BMI */}
                  <div className="p-4 rounded-lg bg-slate-50">
                    <Label className="text-slate-500">BMI</Label>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        patient.bmi_category?.includes("Obese")
                          ? "text-orange-600"
                          : patient.bmi_category?.includes("Overweight")
                            ? "text-yellow-600"
                            : patient.bmi_category?.includes("Underweight")
                              ? "text-yellow-600"
                              : "text-green-600"
                      }`}
                    >
                      {patient.bmi || "N/A"}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {patient.bmi_category || "Unknown"}
                    </Badge>
                  </div>

                  {/* Heart Rate */}
                  <div className="p-4 rounded-lg bg-slate-50">
                    <Label className="text-slate-500">Heart Rate</Label>
                    <p className="text-2xl font-bold mt-1">
                      {patient.heart_rate ? `${patient.heart_rate} BPM` : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Known Conditions */}
            {(patient.known_conditions || patient.current_medications) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Medical History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.known_conditions && (
                    <div>
                      <Label className="text-slate-500">Known Conditions</Label>
                      <p className="text-sm">{patient.known_conditions}</p>
                    </div>
                  )}
                  {patient.current_medications && (
                    <div>
                      <Label className="text-slate-500">
                        Current Medications
                      </Label>
                      <p className="text-sm">{patient.current_medications}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT PANEL - Doctor's Notes (Interactive) */}
          <div className="space-y-6">
            {/* Clinical Impressions */}
            <Card className="min-h-[400px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Clinical Impressions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your clinical impressions, diagnosis, and recommendations..."
                  value={doctorAdvice}
                  onChange={(e) => setDoctorAdvice(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <div className="mt-2 text-xs text-slate-500">
                  {doctorAdvice.length} characters
                </div>
              </CardContent>
            </Card>

            {/* Specialist Follow-up Toggle */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Follow-up Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                  <div>
                    <Label className="text-base font-medium">
                      Requires Specialist Follow-up
                    </Label>
                    <p className="text-sm text-slate-500">
                      Mark this if the patient needs to see a specialist
                    </p>
                  </div>
                  <Switch
                    checked={requiresSpecialist}
                    onCheckedChange={setRequiresSpecialist}
                  />
                </div>
                {requiresSpecialist && (
                  <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <Badge
                      variant="outline"
                      className="text-orange-700 border-orange-300"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Specialist referral required
                    </Badge>
                    <p className="text-sm text-orange-700 mt-2">
                      Please include specialist recommendations in your clinical
                      impressions above.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Previous Consultation (if exists) */}
            {patient.has_consultation && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Previous Consultation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-slate-500">
                      Consulted on:{" "}
                      {new Date(patient.consultation_date).toLocaleString()}
                    </div>
                    {patient.doctor_info?.name && (
                      <div className="text-sm text-slate-500">
                        By: {patient.doctor_info.name}
                      </div>
                    )}
                    {patient.requires_specialist_followup && (
                      <Badge variant="outline" className="mt-2">
                        Specialist follow-up requested
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Consultation Summary</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>
                        Patient: {patient.full_name} ({patient.age}y,{" "}
                        {patient.gender})
                      </li>
                      <li>Health Score: {healthScore.score}/100</li>
                      <li>
                        BP:{" "}
                        {patient.systolic_bp && patient.diastolic_bp
                          ? `${patient.systolic_bp}/${patient.diastolic_bp}`
                          : "N/A"}{" "}
                        ({patient.blood_pressure_status})
                      </li>
                      <li>
                        Glucose:{" "}
                        {patient.glucose_level
                          ? `${patient.glucose_level} mg/dL`
                          : "N/A"}{" "}
                        ({patient.glucose_status})
                      </li>
                      <li>
                        BMI: {patient.bmi || "N/A"} ({patient.bmi_category})
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicalConsultationPage;
