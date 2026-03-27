import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Users,
  AlertTriangle,
  Heart,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LabelList,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * CommunityPulseDashboard - Real-time reporting view for church leaders
 * Shows outreach performance with stats, charts, and live feed
 */
export function CommunityPulseDashboard() {
  // Fetch statistics from Django backend
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["screening-stats"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/screenings/summary/`,
      );
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch recent screenings for live feed
  const { data: recentScreenings, isLoading: recentLoading } = useQuery({
    queryKey: ["recent-screenings"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/screenings/?limit=5`,
      );
      const data = await response.json();
      return data.results || [];
    },
    refetchInterval: 15000,
  });

  // Fetch analytics for charts
  const { data: analytics } = useQuery({
    queryKey: ["screening-analytics"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/screenings/analytics/`,
      );
      return response.json();
    },
    refetchInterval: 60000,
  });

  // Calculate total and BP values for charts
  const total = stats?.total_screened || 1;
  const normalBP = total - (stats?.high_bp_count || 0);
  const highBP = stats?.high_bp_count || 0;

  // Chart config for age distribution bar chart
  const ageChartConfig = {
    count: {
      label: "Count",
      color: "#3b82f6",
    },
  };

  // Transform age distribution data for bar chart
  const ageChartData = analytics?.age_distribution
    ? Object.entries(analytics.age_distribution).map(([ageGroup, count]) => ({
        ageGroup,
        count,
      }))
    : [];

  // Chart config for blood pressure pie chart
  const bpChartConfig = {
    normal: {
      label: "Normal",
      color: "#22c55e",
    },
    high: {
      label: "High",
      color: "#ef4444",
    },
  };

  const bpChartData = [
    { name: "Normal", value: normalBP, fill: "#22c55e" },
    { name: "High", value: highBP, fill: "#ef4444" },
  ];

  // Get status color for table
  const getStatusColor = (bp) => {
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

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title - minimal since layout has header with search */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Community Pulse
        </h2>
        <p className="text-muted-foreground">
          Real-time health outreach statistics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Screened */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Screened</p>
                <p className="text-3xl font-bold text-card-foreground">
                  {stats?.total_screened || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-white to-[#E8EDF2] rounded-full shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.today_count || 0} screened today
            </p>
          </CardContent>
        </Card>

        {/* High Risk (Hypertension) */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk (BP)</p>
                <p className="text-3xl font-bold text-destructive">
                  {stats?.high_bp_count || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-white to-[#E8EDF2] rounded-full shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.high_bp_count && stats?.total_screened
                ? `${Math.round((stats.high_bp_count / stats.total_screened) * 100)}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>

        {/* Follow-up Required */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Follow-up Required
                </p>
                <p className="text-3xl font-bold text-accent">
                  {stats?.pending_consultations || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-white to-[#E8EDF2] rounded-full shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]">
                <Heart className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Awaiting doctor consultation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution - Bar Chart using shadcn */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.age_distribution ? (
              <ChartContainer
                config={ageChartConfig}
                className="w-full h-[250px]"
              >
                <BarChart
                  data={ageChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="ageGroup"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={50}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={4}
                    barSize={30}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blood Pressure Status - Pie Chart using shadcn/Recharts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Blood Pressure Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={bpChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <Pie
                  data={bpChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  <LabelList
                    dataKey="name"
                    className="fill-foreground"
                    stroke="none"
                    fontSize={12}
                  />
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" />}
                />
              </PieChart>
            </ChartContainer>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Normal: {normalBP}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">High: {highBP}</span>
              </div>
            </div>

            {/* Progress Bar Version */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Normal BP</span>
                <span>
                  {total > 0 ? ((normalBP / total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="h-4 bg-gradient-to-br from-[#E8EDF2] to-white rounded-full overflow-hidden flex shadow-[inset_2px_2px_4px_rgba(176,190,197,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-600"
                  style={{
                    width: `${total > 0 ? (normalBP / total) * 100 : 0}%`,
                  }}
                />
                <div
                  className="h-full bg-gradient-to-r from-destructive to-destructive-600"
                  style={{
                    width: `${total > 0 ? (highBP / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Feed - Recent Screenings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Live Feed - Recent Screenings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading...
            </div>
          ) : recentScreenings?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>BP Status</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentScreenings.map((screening) => (
                    <TableRow key={screening.id}>
                      <TableCell className="font-medium">
                        {screening.full_name}
                      </TableCell>
                      <TableCell>{screening.age}</TableCell>
                      <TableCell className={getStatusColor(screening)}>
                        {screening.systolic_bp && screening.diastolic_bp
                          ? `${screening.systolic_bp}/${screening.diastolic_bp}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{screening.bmi_category || "N/A"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(screening.created_at).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No screenings yet. Start screening patients!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CommunityPulseDashboard;
