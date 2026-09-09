import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { DoctorLayout } from "./components/doctor/DoctorLayout";
import { AdminLayout } from "./features/admin/components/AdminLayout";
import { AdminRolesPage } from "./features/admin/pages/AdminRolesPage";
import { AdminStationsPage } from "./features/admin/pages/AdminStationsPage";
import { CommunityPulseDashboard } from "./components/doctor/CommunityPulseDashboard";
import ConsultationPage from "./components/doctor/ConsultationPage";
import { DoctorTriagePage } from "./pages/DoctorTriagePage";
import ClinicalConsultationPage from "./pages/ClinicalConsultationPage";
import PatientReport from "./components/doctor/PatientReport";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";

/**
 * DoctorApp - Standalone app for doctor portal
 * This app includes triage, consultations, reports, and dashboard
 */
function DoctorApp() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<DoctorLayout />}>
          <Route path="/" element={<DoctorTriagePage />} />
          <Route path="/dashboard" element={<CommunityPulseDashboard />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* These routes are outside the layout (full screen) */}
        <Route
          path="/consultation/:id"
          element={<ClinicalConsultationPage />}
        />
        <Route path="/report/:id" element={<PatientReport />} />

        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/roles" element={<AdminRolesPage />} />
          <Route path="/admin/stations" element={<AdminStationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default DoctorApp;
