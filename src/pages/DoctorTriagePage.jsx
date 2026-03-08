import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Phone,
  AlertCircle,
  Stethoscope,
  Activity,
  Clock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { screeningAPI } from "@/api";

// Helper function to determine BP badge variant
const getBPBadgeVariant = (status) => {
  if (!status) return "secondary";
  const statusLower = status.toLowerCase();

  if (statusLower.includes("crisis")) return "destructive";
  if (statusLower.includes("stage 2")) return "destructive";
  if (statusLower.includes("stage 1")) return "outline";
  if (statusLower.includes("elevated")) return "secondary";
  if (statusLower.includes("normal")) return "default";

  return "secondary";
};

// Helper function to determine if patient is in crisis
const isInCrisis = (screening) => {
  if (screening.is_critical) return true;
  if (screening.systolic_bp > 180 || screening.diastolic_bp > 120) return true;
  if (screening.glucose_level > 400) return true;
  return false;
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function DoctorTriagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch screenings with pagination
  const {
    data: screeningsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["screenings", currentPage, searchQuery],
    queryFn: async () => {
      const params = {
        page: currentPage,
        page_size: 20,
      };
      // If there's a search query, pass it to the backend
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await screeningAPI.getAll(params);
      return response.data;
    },
  });

  // Get pagination info from response
  const paginationInfo = useMemo(() => {
    if (!screeningsData) {
      return { count: 0, next: null, previous: null, totalPages: 1 };
    }
    return {
      count: screeningsData.count || 0,
      next: screeningsData.next,
      previous: screeningsData.previous,
      totalPages: Math.ceil((screeningsData.count || 0) / 20),
    };
  }, [screeningsData]);

  // Get today's date string for filtering
  const today = new Date().toISOString().split("T")[0];

  // Filter to today's patients and sort by critical status
  // For paginated API, we don't filter by date on client side when using backend search
  const todaysPatients = useMemo(() => {
    if (!screeningsData) return [];

    const results = screeningsData.results || screeningsData;

    // If there's a search query, don't filter by date - show all matching results
    if (searchQuery) return results;

    // Otherwise filter to today's patients
    return results
      .filter((s) => {
        const screeningDate = new Date(s.created_at)
          .toISOString()
          .split("T")[0];
        return screeningDate === today;
      })
      .sort((a, b) => {
        // Sort critical patients first
        if (isInCrisis(a) && !isInCrisis(b)) return -1;
        if (!isInCrisis(a) && isInCrisis(b)) return 1;
        // Then by consultation status (pending first)
        if (a.has_consultation && !b.has_consultation) return 1;
        if (!a.has_consultation && b.has_consultation) return -1;
        // Then by creation time (newest first)
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [screeningsData, today, searchQuery]);

  // Filter patients based on search query from header
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return todaysPatients;
    // Already filtered by backend when search is present
    return todaysPatients;
  }, [todaysPatients, searchQuery]);

  // Handle starting consultation
  const handleStartConsultation = (patient) => {
    toast.success(`Starting consultation for ${patient.full_name}`, {
      description: `Patient ID: ${patient.id}`,
    });
    navigate(`/consultation/${patient.id}`, { state: { patient } });
  };

  // Stats for today's patients
  const stats = useMemo(() => {
    const patients = searchQuery ? filteredPatients : todaysPatients;
    if (!patients.length)
      return { total: 0, critical: 0, pending: 0, completed: 0 };

    return {
      total: patients.length,
      critical: patients.filter((p) => isInCrisis(p)).length,
      pending: patients.filter((p) => !p.has_consultation).length,
      completed: patients.filter((p) => p.has_consultation).length,
    };
  }, [filteredPatients, todaysPatients, searchQuery]);

  const displayPatients = searchQuery ? filteredPatients : todaysPatients;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header - no search button, using header search */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          Patient Triage
        </h1>
        <p className="text-slate-600 mt-1">
          {searchQuery
            ? `Found ${paginationInfo.count} patient(s) matching "${searchQuery}"`
            : "Find and manage today's patients for consultation"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={stats.critical > 0 ? "border-red-500 bg-red-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {searchQuery ? "Found" : "Today's Patients"}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <User className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.critical > 0 ? "border-red-500 bg-red-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Critical Cases</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.critical}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Triage Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {searchQuery ? "Search Results" : "Today's Patient Triage"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading patients. Please try again.</p>
            </div>
          ) : displayPatients.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>
                {searchQuery
                  ? "No patients found matching your search."
                  : "No patients found for today."}
              </p>
              {searchQuery && (
                <Button
                  variant="link"
                  onClick={() => navigate("/")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>BP Status</TableHead>
                  <TableHead>BP Reading</TableHead>
                  <TableHead>Glucose</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className={
                      isInCrisis(patient) ? "bg-red-50 hover:bg-red-100" : ""
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isInCrisis(patient) && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <div className="font-semibold">
                            {patient.full_name}
                          </div>
                          {patient.phone_number && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.age}y / {patient.gender}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getBPBadgeVariant(
                          patient.blood_pressure_status,
                        )}
                      >
                        {patient.blood_pressure_status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {patient.systolic_bp && patient.diastolic_bp ? (
                        <span
                          className={
                            isInCrisis(patient) ? "text-red-600 font-bold" : ""
                          }
                        >
                          {patient.systolic_bp}/{patient.diastolic_bp}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.glucose_level ? (
                        <span
                          className={
                            patient.glucose_level > 200 ? "text-orange-600" : ""
                          }
                        >
                          {patient.glucose_level} mg/dL
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {formatDate(patient.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {patient.has_consultation ? (
                        <Badge variant="default" className="bg-green-500">
                          Consulted
                        </Badge>
                      ) : isInCrisis(patient) ? (
                        <Badge variant="destructive">Crisis</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={
                          patient.has_consultation ? "outline" : "default"
                        }
                        onClick={() => handleStartConsultation(patient)}
                        className="gap-1"
                      >
                        {patient.has_consultation ? "View" : "Start"}
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {paginationInfo.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!paginationInfo.previous}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {currentPage} of {paginationInfo.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!paginationInfo.next}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default DoctorTriagePage;
