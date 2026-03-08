import { Toaster } from "sonner";
import VolunteerScreeningPage from "./pages/VolunteerScreeningPage";

/**
 * VolunteerApp - Standalone app for volunteer screening
 * This app only shows the volunteer screening page
 */
function VolunteerApp() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <VolunteerScreeningPage />
    </>
  );
}

export default VolunteerApp;
