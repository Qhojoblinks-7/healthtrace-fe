import { useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Printer,
  ArrowLeft,
  Activity,
  Heart,
  User,
  Building2,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Stethoscope,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { screeningAPI } from "@/api";

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

const VITAL_RANGES = {
  blood_pressure: { normal: "90-120 / 60-80", unit: "mmHg" },
  glucose: { normal: "70-99", unit: "mg/dL" },
  bmi: { normal: "18.5-24.9", unit: "kg/m²" },
  heart_rate: { normal: "60-100", unit: "BPM" },
};

const getRiskLevel = (score) => {
  if (score >= 80) return { label: "Low Risk", color: "text-green-700", bg: "bg-green-50" };
  if (score >= 60) return { label: "Moderate Risk", color: "text-yellow-700", bg: "bg-yellow-50" };
  if (score >= 40) return { label: "High Risk", color: "text-orange-700", bg: "bg-orange-50" };
  return { label: "Critical Risk", color: "text-red-700", bg: "bg-red-50" };
};

const STATUS_BADGE = {
  Crisis: { className: "bg-red-100 text-red-800 border-red-300" },
  Elevated: { className: "bg-orange-50 text-orange-800 border-orange-300" },
  Normal: { className: "bg-green-50 text-green-800 border-green-300" },
  Diabetes: { className: "bg-red-100 text-red-800 border-red-300" },
  Prediabetes: { className: "bg-orange-50 text-orange-800 border-orange-300" },
  Obese: { className: "bg-red-100 text-red-800 border-red-300" },
  Overweight: { className: "bg-orange-50 text-orange-800 border-orange-300" },
  High: { className: "bg-red-100 text-red-800 border-red-300" },
  Low: { className: "bg-orange-50 text-orange-800 border-orange-300" },
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
  const risk = getRiskLevel(healthScore.score);

  const handlePrint = () => {
    window.print();
  };

  const handleSendToWhatsApp = async () => {
    if (!patient.phone_number) {
      alert("No phone number available for this patient");
      return;
    }

    let phone = patient.phone_number.replace(/\D/g, "");
    if (phone.length === 10) {
      phone = "233" + phone.substring(1);
    }

    const btn = document.activeElement;
    if (btn) btn.textContent = "Generating PDF...";

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = reportRef.current;
      if (!element) {
        alert("Unable to generate report");
        return;
      }

      const opt = {
        margin: 10,
        filename: `HealthTrace_Report_${patient.full_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      const pdfBlob = await html2pdf()
        .set(opt)
        .from(element)
        .outputPdf("blob");

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

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = opt.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

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

  const getStatusBadge = (status, type) => {
    if (!status) return null;
    const statusKey = Object.keys(STATUS_BADGE).find(key => status.includes(key));
    if (!statusKey) return null;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[statusKey].className}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="no-print bg-slate-900 text-white px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Patient Report</h1>
              <p className="text-sm text-slate-400">
                {patient.full_name} - {patient.token_id || patient.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSendToWhatsApp}
              variant="outline"
              className="gap-2 border-slate-600 text-white hover:bg-slate-800"
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

      <div ref={reportRef} className="max-w-5xl mx-auto bg-white shadow-lg print:shadow-none">
        <div className="p-6 print:p-8">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Community Health Screening
                  </h1>
                  <p className="text-sm text-slate-600">
                    Patient Health Assessment Report
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p className="font-medium">Report Generated</p>
                <p>
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p>
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                Patient Information
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-xs font-medium text-slate-500 uppercase">Full Name</Label>
                <p className="font-semibold text-slate-900 mt-1">{patient.full_name}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-500 uppercase">Age / Gender</Label>
                <p className="font-semibold text-slate-900 mt-1">
                  {patient.age} years / {patient.gender}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-500 uppercase">Phone</Label>
                <p className="font-semibold text-slate-900 mt-1">
                  {patient.phone_number || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-500 uppercase">Token ID</Label>
                <p className="font-semibold text-slate-900 mt-1 font-mono">
                  {patient.token_id || `#${patient.id}`}
                </p>
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                Health Assessment
              </h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${risk.color}`}>
                    {healthScore.score}
                  </span>
                  <span className="text-base text-slate-500">/100</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">Health Score</p>
              </div>
              <div className={`px-3 py-1.5 rounded ${risk.bg}`}>
                <p className={`text-sm font-semibold ${risk.color}`}>
                  {risk.label}
                </p>
              </div>
            </div>
            {healthScore.issues.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-700 mb-1.5">Identified Concerns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {healthScore.issues.map((issue, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-800 border border-orange-200"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vital Signs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                Vital Signs & Measurements
              </h2>
            </div>
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                    Measurement
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 uppercase">
                    Result
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 uppercase">
                    Status
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-right text-xs font-semibold text-slate-700 uppercase">
                    Reference Range
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border border-slate-300 px-3 py-2.5">
                    <p className="font-medium text-slate-900">Blood Pressure</p>
                    <p className="text-xs text-slate-500">Systolic / Diastolic</p>
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    <span className="font-bold text-slate-900">
                      {patient.systolic_bp && patient.diastolic_bp
                        ? `${patient.systolic_bp}/${patient.diastolic_bp}`
                        : "N/A"}
                    </span>
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    {getStatusBadge(patient.blood_pressure_status)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-right text-xs text-slate-600">
                    {VITAL_RANGES.blood_pressure.normal} <span className="text-slate-400">{VITAL_RANGES.blood_pressure.unit}</span>
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-3 py-2.5">
                    <p className="font-medium text-slate-900">Glucose Level</p>
                    <p className="text-xs text-slate-500">Fasting blood sugar</p>
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    <span className="font-bold text-slate-900">
                      {patient.glucose_level || "N/A"}
                    </span>
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    {getStatusBadge(patient.glucose_status)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-right text-xs text-slate-600">
                    {VITAL_RANGES.glucose.normal} <span className="text-slate-400">{VITAL_RANGES.glucose.unit}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-3 py-2.5">
                    <p className="font-medium text-slate-900">Body Mass Index</p>
                    <p className="text-xs text-slate-500">BMI</p>
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    <span className="font-bold text-slate-900">
                      {patient.bmi || "N/A"}
                    </span>
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    {getStatusBadge(patient.bmi_category)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-right text-xs text-slate-600">
                    {VITAL_RANGES.bmi.normal} <span className="text-slate-400">{VITAL_RANGES.bmi.unit}</span>
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-3 py-2.5">
                    <p className="font-medium text-slate-900">Heart Rate</p>
                    <p className="text-xs text-slate-500">Pulse rate</p>
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    <span className="font-bold text-slate-900">
                      {patient.heart_rate || "N/A"}
                    </span>
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    {getStatusBadge(patient.heart_rate_status)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-right text-xs text-slate-600">
                    {VITAL_RANGES.heart_rate.normal} <span className="text-slate-400">{VITAL_RANGES.heart_rate.unit}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Clinical Recommendations */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="h-4 w-4 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                Clinical Recommendations
              </h2>
            </div>
            <div className="border border-slate-300 p-3 bg-white">
              {patient.doctor_advice ? (
                <div className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">
                  {patient.doctor_advice}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No recommendations provided at this time.
                </p>
              )}
            </div>
          </div>

          {/* Specialist Follow-up */}
          {patient.requires_specialist_followup && (
            <div className="mb-6">
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 text-sm">
                    Specialist Referral Required
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    This patient requires follow-up with a specialist. Please ensure the patient is referred to the appropriate specialty department.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Consultation Status */}
          {patient.has_consultation && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-700 bg-green-50 border border-green-200 p-2.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  Consultation completed on{" "}
                  {new Date(patient.consultation_date).toLocaleString()}
                  {patient.doctor_info?.name && (
                    <span className="font-medium">
                      {" "}by {patient.doctor_info.name}
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Medical History */}
          {(patient.known_conditions || patient.current_medications) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  Medical History
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {patient.known_conditions && (
                  <div>
                    <Label className="text-xs font-medium text-slate-500 uppercase">Known Conditions</Label>
                    <p className="text-sm text-slate-900 mt-1">{patient.known_conditions}</p>
                  </div>
                )}
                {patient.current_medications && (
                  <div>
                    <Label className="text-xs font-medium text-slate-500 uppercase">Current Medications</Label>
                    <p className="text-sm text-slate-900 mt-1">{patient.current_medications}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signature & Footer */}
          <div className="border-t-2 border-slate-300 pt-4 mt-6">
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-8">Healthcare Provider Signature</p>
                <div className="border-b border-slate-400 w-40 mb-2"></div>
                <p className="text-xs text-slate-500">Authorized Medical Personnel</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-8">Date & Time</p>
                <div className="border-b border-slate-400 w-40 mb-2"></div>
                <p className="text-xs text-slate-500">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="text-center border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-600 font-medium">
                This report is computer-generated and does not constitute a formal medical diagnosis.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Please consult a qualified healthcare professional for proper medical advice.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                HealthTrace - Community Health Screening System
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.6cm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PatientReport;
