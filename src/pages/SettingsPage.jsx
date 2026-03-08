import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  User,
  Bell,
  Monitor,
  Shield,
  Database,
  Palette,
  Clock,
  Moon,
  Sun,
  Mail,
  Phone,
  Building,
  Save,
  RefreshCw,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  const queryClient = useQueryClient();

  // State for tracking last cache clear
  const [lastCacheClear, setLastCacheClear] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  // Profile Settings
  const [profile, setProfile] = useState({
    firstName: "Dr. Smith",
    lastName: "",
    email: "dr.smith@healthtrace.com",
    phone: "+1 (555) 123-4567",
    department: "General Practice",
    specialization: "Primary Care",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    criticalAlerts: true,
    dailySummary: true,
    newPatientAlerts: true,
    consultationReminders: true,
  });

  // Display Settings
  const [display, setDisplay] = useState({
    darkMode: false,
    compactView: false,
    showAnimations: true,
    sidebarCollapsed: false,
  });

  // System Settings
  const [system, setSystem] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    defaultPageSize: 20,
    enableAnalytics: true,
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    auditLogging: true,
  });

  const handleProfileSave = () => {
    toast.success("Profile updated successfully", {
      description: "Your profile changes have been saved.",
    });
  };

  const handleNotificationsSave = () => {
    toast.success("Notification preferences saved", {
      description: "Your notification settings have been updated.",
    });
  };

  const handleDisplaySave = () => {
    toast.success("Display preferences saved", {
      description: "Your display settings have been updated.",
    });
  };

  const handleSystemSave = () => {
    toast.success("System settings saved", {
      description: "Your system preferences have been updated.",
    });
  };

  const handleSecuritySave = () => {
    toast.success("Security settings saved", {
      description: "Your security settings have been updated.",
    });
  };

  // Data Management Functions
  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      // Clear React Query cache
      await queryClient.clear();

      // Clear local storage items related to app data
      const localStorageKeys = [
        "healthtrace_notifications",
        "healthtrace_user_preferences",
        "healthtrace_sidebar_state",
      ];

      localStorageKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      const now = new Date();
      setLastCacheClear(now);

      toast.success("Cache cleared successfully", {
        description: "All cached data has been cleared.",
      });
    } catch {
      toast.error("Failed to clear cache", {
        description: "An error occurred while clearing the cache.",
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      // Fetch all screenings data for export
      const response = await fetch(
        `${apiUrl}/api/screenings/?limit=1000`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      const screenings = data.results || [];

      if (screenings.length === 0) {
        toast.warning("No data to export", {
          description: "There are no screenings available to export.",
        });
        setIsExporting(false);
        return;
      }

      // Create CSV content
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
        "Heart Rate",
        "Temperature",
        "Symptoms",
        "Medications",
        "Has Consultation",
        "Critical",
        "Created At",
      ];

      const csvRows = [headers.join(",")];

      screenings.forEach((screening) => {
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
          screening.heart_rate || "",
          screening.temperature || "",
          `"${Array.isArray(screening.symptoms) ? screening.symptoms.join("; ") : String(screening.symptoms || "")}"`,
          `"${Array.isArray(screening.current_medications) ? screening.current_medications.join("; ") : String(screening.current_medications || "")}"`,
          screening.has_consultation ? "Yes" : "No",
          screening.is_critical ? "Yes" : "No",
          screening.created_at || "",
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `healthtrace_screenings_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully", {
        description: `Exported ${screenings.length} screening records.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed", {
        description: error.message || "An error occurred while exporting data.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-8 w-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-slate-600 mt-1">
          Manage your account preferences and application settings
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-10"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="department"
                  className="pl-10"
                  value={profile.department}
                  onChange={(e) =>
                    setProfile({ ...profile, department: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={profile.specialization}
                onChange={(e) =>
                  setProfile({ ...profile, specialization: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleProfileSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-900">
              Notification Channels
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-slate-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-slate-500">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      smsNotifications: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-900">Alert Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Critical Alerts</Label>
                  <p className="text-sm text-slate-500">
                    Get immediate alerts for critical patient cases
                  </p>
                </div>
                <Switch
                  checked={notifications.criticalAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      criticalAlerts: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Patient Alerts</Label>
                  <p className="text-sm text-slate-500">
                    Notify when new patients are added
                  </p>
                </div>
                <Switch
                  checked={notifications.newPatientAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      newPatientAlerts: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Summary</Label>
                  <p className="text-sm text-slate-500">
                    Receive a daily summary of activities
                  </p>
                </div>
                <Switch
                  checked={notifications.dailySummary}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      dailySummary: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Consultation Reminders</Label>
                  <p className="text-sm text-slate-500">
                    Get reminders for scheduled consultations
                  </p>
                </div>
                <Switch
                  checked={notifications.consultationReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      consultationReminders: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleNotificationsSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Customize how the application looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-900">Appearance</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-slate-500">
                    Use dark theme for the interface
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-slate-400" />
                  <Switch
                    checked={display.darkMode}
                    onCheckedChange={(checked) =>
                      setDisplay({ ...display, darkMode: checked })
                    }
                  />
                  <Moon className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-slate-500">
                    Show more content with reduced spacing
                  </p>
                </div>
                <Switch
                  checked={display.compactView}
                  onCheckedChange={(checked) =>
                    setDisplay({ ...display, compactView: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Animations</Label>
                  <p className="text-sm text-slate-500">
                    Enable animations and transitions
                  </p>
                </div>
                <Switch
                  checked={display.showAnimations}
                  onCheckedChange={(checked) =>
                    setDisplay({ ...display, showAnimations: checked })
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleDisplaySave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure application behavior and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Refresh</Label>
                  <p className="text-sm text-slate-500">
                    Automatically refresh patient data
                  </p>
                </div>
                <Switch
                  checked={system.autoRefresh}
                  onCheckedChange={(checked) =>
                    setSystem({ ...system, autoRefresh: checked })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refreshInterval">
                Refresh Interval (seconds)
              </Label>
              <Input
                id="refreshInterval"
                type="number"
                min={10}
                max={300}
                value={system.refreshInterval}
                onChange={(e) =>
                  setSystem({
                    ...system,
                    refreshInterval: parseInt(e.target.value),
                  })
                }
                disabled={!system.autoRefresh}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultPageSize">Default Page Size</Label>
              <Input
                id="defaultPageSize"
                type="number"
                min={5}
                max={100}
                value={system.defaultPageSize}
                onChange={(e) =>
                  setSystem({
                    ...system,
                    defaultPageSize: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between h-full">
                <div className="space-y-0.5">
                  <Label>Enable Analytics</Label>
                  <p className="text-sm text-slate-500">
                    Collect usage analytics
                  </p>
                </div>
                <Switch
                  checked={system.enableAnalytics}
                  onCheckedChange={(checked) =>
                    setSystem({ ...system, enableAnalytics: checked })
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSystemSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and privacy options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-slate-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={security.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, twoFactorAuth: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audit Logging</Label>
                <p className="text-sm text-slate-500">
                  Track all account activities and changes
                </p>
              </div>
              <Switch
                checked={security.auditLogging}
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, auditLogging: checked })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min={5}
                max={120}
                value={security.sessionTimeout}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    sessionTimeout: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSecuritySave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Manage application data and cache</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-3">
                Cache Management
              </h4>
              <p className="text-sm text-slate-500 mb-3">
                Clear cached data to free up storage and refresh application
                data.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleClearCache}
                disabled={isClearingCache}
              >
                {isClearingCache ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isClearingCache ? "Clearing..." : "Clear Cache"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-3">
                Data Export
              </h4>
              <p className="text-sm text-slate-500 mb-3">
                Export all screening data as a CSV file for external analysis or
                backup.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isExporting ? "Exporting..." : "Export Screenings Data"}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-slate-500">
              {lastCacheClear
                ? `Last cache cleared: ${lastCacheClear.toLocaleString()}`
                : "Cache has never been cleared"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
