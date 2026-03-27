import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Stethoscope, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { screeningAPI } from "@/api";

export function ConsultationPage() {
  const navigate = useNavigate();

  // Fetch all screenings from the database
  const { data: screeningsData, isLoading } = useQuery({
    queryKey: ["screenings"],
    queryFn: async () => {
      const response = await screeningAPI.getAll();
      return response.data;
    },
  });

  // Get today's date string for filtering
  const today = new Date().toISOString().split("T")[0];

  // Filter to today's patients - handle paginated response
  const todaysPatients = (() => {
    if (!screeningsData) return [];
    const results = screeningsData.results || screeningsData;
    if (!Array.isArray(results)) return [];
    return results.filter((s) => {
      const screeningDate = new Date(s.created_at).toISOString().split("T")[0];
      return screeningDate === today;
    });
  })();

  // Get status badge color
  const getStatusBadge = (patient) => {
    if (patient.has_consultation) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Completed
        </span>
      );
    }
    if (
      patient.is_critical ||
      patient.systolic_bp > 180 ||
      patient.diastolic_bp > 120
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Crisis
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        Pending
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            Consultation
          </h1>
          <p className="text-muted-foreground mt-1">
            Select a patient to begin or view consultation
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-primary" />
          Consultation
        </h1>
        <p className="text-muted-foreground mt-1">
          Select a patient to begin or view consultation (
          {todaysPatients.length} patients today)
        </p>
      </div>

      {todaysPatients.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No patients found for today.
            </p>
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="mt-2"
            >
              Go to Triage
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {todaysPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() =>
                navigate(`/consultation/${patient.id}`, { state: { patient } })
              }
              className="flex items-center justify-between p-4 bg-gradient-to-br from-white to-[#E8EDF2] rounded-2xl shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)] hover:shadow-[8px_8px_16px_rgba(176,190,197,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-primary-foreground font-bold shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]">
                  {patient.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">
                    {patient.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {patient.age} years / {patient.gender}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-card-foreground">
                    {patient.systolic_bp && patient.diastolic_bp
                      ? `${patient.systolic_bp}/${patient.diastolic_bp}`
                      : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">mmHg</p>
                </div>
                {getStatusBadge(patient)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConsultationPage;
