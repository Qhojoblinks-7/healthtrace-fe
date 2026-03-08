import { useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Printer,
  ArrowLeft,
  Activity,
  Heart,
  TrendingUp,
  User,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle,
  Stethoscope,
  Calendar,
  Building2,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { screeningAPI } from "@/api";

// Helper to calculate health score
const calculateHealthScore = (screening) => {
  let score = 100;
  const issues = [];

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

  if (screening.bmi) {
    const bmi = screening.bmi;
    if (bmi >= 35) score -= 20;
    else if (bmi >= 30) score -= 15;
    else if (bmi >= 25) score -= 10;
    else if (bmi < 18.5) score -= 10;
  }

  return { score: Math.max(0, score), issues };
};

export function PatientReport() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef();

  const initialPatient = location.state?.patient;

  const { data: patientData, isLoading } = useQuery({
    queryKey: ["screening", id],
    queryFn: () => screeningAPI.getById(id),
    enabled: !!id,
    initialData: initialPatient ? { data: initialPatient } : undefined,
  });

  const patient = patientData?.data;
  const healthScore = patient
    ? calculateHealthScore(patient)
    : { score: 0, issues: [] };

  const handlePrint = () => {
    window.print();
  };

  // Generate PDF and send via WhatsApp
  const handleSendToWhatsApp = async () => {
    if (!patient.phone_number) {
      alert("No phone number available for this patient");
      return;
    }

    // Format phone number
    let phone = patient.phone_number.replace(/\D/g, "");
    if (phone.length === 10) {
      phone = "233" + phone.substring(1);
    }

    // Show loading state
    const btn = document.activeElement;
    if (btn) btn.textContent = "Generating PDF...";

    try {
      // Dynamically import html2pdf.js
      const html2pdf = (await import("html2pdf.js")).default;

      // Get the report content element
      const element = reportRef.current;
      if (!element) {
        alert("Unable to generate report");
        return;
      }

      // Generate PDF
      const opt = {
        margin: 10,
        filename: `HealthTrace_Report_${patient.full_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Generate PDF blob
      const pdfBlob = await html2pdf()
        .set(opt)
        .from(element)
        .outputPdf("blob");

      // Try to use Web Share API on mobile (supports file sharing)
      if (navigator.share && navigator.canShare) {
        const file = new File([pdfBlob], opt.filename, { type: "application/pdf" });
        const shareData = {
          title: `Health Report - ${patient.full_name}`,
          text: `Health screening report for ${patient.full_name}`,
          files: [file],
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      // Fallback: Download PDF and open WhatsApp for manual sharing
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = opt.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Open WhatsApp with a message
      const message = encodeURIComponent(
        `Hello ${patient.full_name}, please find attached your health report from the Community Health Screening.`
      );
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Unable to generate PDF. Please try using the Print button instead.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Patient not found</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - hidden in print */}
      <div className="bg-slate-900 text-white px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Patient Report</h1>
              <p className="text-sm text-slate-400">Printable health summary</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSendToWhatsApp}
              variant="outline"
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Send to WhatsApp
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="max-w-4xl mx-auto p-8 print:p-0">
        {/* Header with Church Logo */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Building2 className="h-10 w-10 text-slate-800" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Community Health Screening
              </h1>
              <p className="text-slate-600">Medical Report</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Generated on{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Patient Info Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </h2>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <Label className="text-slate-500 text-xs">Full Name</Label>
              <p className="font-semibold text-lg">{patient.full_name}</p>
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Age / Gender</Label>
              <p className="font-medium">
                {patient.age} years / {patient.gender}
              </p>
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Phone</Label>
              <p className="font-medium">{patient.phone_number || "N/A"}</p>
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Screening Date</Label>
              <p className="font-medium">
                {new Date(patient.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Health Score */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Assessment
          </h2>
          <div className="bg-slate-50 p-6 rounded-lg">
            <div className="text-center mb-4">
              <div
                className={`text-5xl font-bold ${
                  healthScore.score >= 80
                    ? "text-green-600"
                    : healthScore.score >= 60
                      ? "text-yellow-600"
                      : healthScore.score >= 40
                        ? "text-orange-600"
                        : "text-red-600"
                }`}
              >
                {healthScore.score}
                <span className="text-xl text-slate-500">/100</span>
              </div>
              <p className="text-slate-600 mt-1">Overall Health Score</p>
            </div>
            {healthScore.issues.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Health Concerns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {healthScore.issues.map((issue, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-300"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {issue}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Vital Signs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <Label className="text-slate-500 text-xs">Blood Pressure</Label>
              <p
                className={`text-2xl font-bold mt-1 ${
                  patient.blood_pressure_status?.includes("Crisis")
                    ? "text-red-600"
                    : patient.blood_pressure_status?.includes("Stage")
                      ? "text-orange-600"
                      : "text-green-600"
                }`}
              >
                {patient.systolic_bp && patient.diastolic_bp
                  ? `${patient.systolic_bp}/${patient.diastolic_bp}`
                  : "N/A"}
              </p>
              <p className="text-xs text-slate-500">mmHg</p>
              <Badge
                variant={
                  patient.blood_pressure_status?.includes("Crisis")
                    ? "destructive"
                    : patient.blood_pressure_status?.includes("Stage")
                      ? "outline"
                      : "default"
                }
                className="mt-1 text-xs"
              >
                {patient.blood_pressure_status || "Unknown"}
              </Badge>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <Label className="text-slate-500 text-xs">Glucose Level</Label>
              <p
                className={`text-2xl font-bold mt-1 ${
                  patient.glucose_status?.includes("Diabetes")
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {patient.glucose_level || "N/A"}
              </p>
              <p className="text-xs text-slate-500">mg/dL</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {patient.glucose_status || "Unknown"}
              </Badge>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <Label className="text-slate-500 text-xs">BMI</Label>
              <p className="text-2xl font-bold mt-1 text-slate-900">
                {patient.bmi || "N/A"}
              </p>
              <p className="text-xs text-slate-500">kg/m²</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {patient.bmi_category || "Unknown"}
              </Badge>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <Label className="text-slate-500 text-xs">Heart Rate</Label>
              <p className="text-2xl font-bold mt-1 text-slate-900">
                {patient.heart_rate || "N/A"}
              </p>
              <p className="text-xs text-slate-500">BPM</p>
            </div>
          </div>
        </div>

        {/* Medical History */}
        {(patient.known_conditions || patient.current_medications) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Medical History
            </h2>
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              {patient.known_conditions && (
                <div>
                  <Label className="text-slate-500 text-xs">
                    Known Conditions
                  </Label>
                  <p className="text-sm">{patient.known_conditions}</p>
                </div>
              )}
              {patient.current_medications && (
                <div>
                  <Label className="text-slate-500 text-xs">
                    Current Medications
                  </Label>
                  <p className="text-sm">{patient.current_medications}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Doctor's Advice */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Doctor's Recommendations
          </h2>
          <div className="border-2 border-slate-800 p-6 rounded-lg min-h-[150px]">
            {patient.doctor_advice ? (
              <div className="whitespace-pre-wrap text-slate-800">
                {patient.doctor_advice}
              </div>
            ) : (
              <p className="text-slate-400 italic">
                No recommendations provided.
              </p>
            )}
          </div>
        </div>

        {/* Specialist Follow-up */}
        {patient.requires_specialist_followup && (
          <div className="mb-8">
            <div className="bg-orange-50 border border-orange-300 p-4 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-800">
                  Specialist Follow-up Required
                </p>
                <p className="text-sm text-orange-700">
                  This patient has been referred for specialist care.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Consultation Info */}
        {patient.has_consultation && (
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>
                Consulted on{" "}
                {new Date(patient.consultation_date).toLocaleString()}
              </span>
              {patient.doctor_info?.name && (
                <span>by {patient.doctor_info.name}</span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-slate-800 pt-6 mt-8">
          <div className="text-center text-sm text-slate-500">
            <p>
              This report is for informational purposes only and does not
              constitute a formal medical diagnosis.
            </p>
            <p className="mt-1">
              Please consult a healthcare professional for proper medical
              advice.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PatientReport;
