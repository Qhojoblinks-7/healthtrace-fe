import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * ReportsPage - Shows list of all patient screenings with filtering
 * Allows viewing individual patient reports and exporting data
 */
export function ReportsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch all screenings with pagination
  const { data: screeningsData, isLoading, refetch } = useQuery({
    queryKey: ["screenings", page, pageSize],
    queryFn: async () => {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/api/screenings/?page=${page}&page_size=${pageSize}`,
      );
      const data = await response.json();
      return data;
    },
  });

  const screenings = screeningsData?.results || [];
  const totalCount = screeningsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Filter screenings based on search and filters
  const filteredScreenings = screenings.filter((screening) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        screening.full_name?.toLowerCase().includes(query) ||
        screening.phone_number?.includes(query) ||
        screening.id?.toString().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "critical" && !screening.is_critical) return false;
      if (
        statusFilter === "high_bp" &&
        !screening.blood_pressure_status?.includes("High")
      )
        return false;
      if (
        statusFilter === "consulted" &&
        !screening.has_consultation
      )
        return false;
      if (
        statusFilter === "pending" &&
        screening.has_consultation
      )
        return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const screeningDate = new Date(screening.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === "today") {
        const screeningDay = new Date(
          screeningDate.getFullYear(),
          screeningDate.getMonth(),
          screeningDate.getDate(),
        );
        if (screeningDay.getTime() !== today.getTime()) return false;
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (screeningDate < weekAgo) return false;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (screeningDate < monthAgo) return false;
      }
    }

    return true;
  });

  // Get status color for blood pressure
  const getBPStatusColor = (bp) => {
    if (!bp) return "text-gray-500";
    const systolic = bp.systolic_bp;
    const diastolic = bp.diastolic_bp;
    if (!systolic || !diastolic) return "text-gray-500";
    if (systolic > 180 || diastolic > 120) return "text-red-600 font-bold";
    if (systolic >= 140 || diastolic >= 90) return "text-red-500";
    if (systolic >= 130 || diastolic >= 80) return "text-orange-500";
    if (systolic >= 120 && diastolic < 80) return "text-yellow-500";
    return "text-green-500";
  };

  // Handle view report
  const handleViewReport = (screening) => {
    navigate(`/report/${screening.id}`, { state: { patient: screening } });
  };

  // Handle export CSV
  const handleExport = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/api/screenings/?limit=1000`,
      );
      const data = await response.json();
      const results = data.results || [];

      if (results.length === 0) {
        toast.warning("No data to export");
        return;
      }

      const headers = [
        "ID",
        "Full Name",
        "Age",
        "Gender",
        "Phone",
        "Systolic BP",
        "Diastolic BP",
        "BP Status",
        "Glucose Level",
        "BMI",
        "BMI Category",
        "Heart Rate",
        "Temperature",
        "Has Consultation",
        "Critical",
        "Created At",
      ];

      const csvRows = [headers.join(",")];

      results.forEach((screening) => {
        const row = [
          screening.id,
          `"${screening.full_name || ""}"`,
          screening.age || "",
          screening.gender || "",
          `"${screening.phone_number || ""}"`,
          screening.systolic_bp || "",
          screening.diastolic_bp || "",
          `"${screening.blood_pressure_status || ""}"`,
          screening.glucose_level || "",
          screening.bmi || "",
          `"${screening.bmi_category || ""}"`,
          screening.heart_rate || "",
          screening.temperature || "",
          screening.has_consultation ? "Yes" : "No",
          screening.is_critical ? "Yes" : "No",
          screening.created_at || "",
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `healthtrace_reports_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Export successful", {
        description: `Exported ${results.length} records`,
      });
    } catch {
      toast.error("Export failed", {
        description: "An error occurred while exporting data",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-card-foreground">
            <FileText className="h-6 w-6 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground">
            View and manage patient screening reports
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high_bp">High BP</SelectItem>
                <SelectItem value="consulted">Consulted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredScreenings.length} of {totalCount} records
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Screenings Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading reports...</p>
              </div>
            </div>
          ) : filteredScreenings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-card-foreground">No reports found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>BP Status</TableHead>
                  <TableHead>Glucose</TableHead>
                  <TableHead>BMI</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScreenings.map((screening) => (
                  <TableRow key={screening.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{screening.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {screening.phone_number || "No phone"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {screening.age} / {screening.gender}
                    </TableCell>
                    <TableCell className={getBPStatusColor(screening)}>
                      {screening.systolic_bp && screening.diastolic_bp
                        ? `${screening.systolic_bp}/${screening.diastolic_bp}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {screening.glucose_level ? (
                        <span
                          className={
                            screening.glucose_status?.includes("Diabetes")
                              ? "text-orange-500"
                              : ""
                          }
                        >
                          {screening.glucose_level} mg/dL
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {screening.bmi ? (
                        <span>
                          {screening.bmi} ({screening.bmi_category})
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(screening.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {screening.is_critical && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Critical
                          </Badge>
                        )}
                        {screening.has_consultation ? (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-300"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Consulted
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReport(screening)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
