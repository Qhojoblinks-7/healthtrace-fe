import {
  NavLink,
  Outlet,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  Search,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./NotificationDropdown";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Patient Triage",
    href: "/",
    icon: Users,
  },
  {
    title: "Consultation",
    href: "/consultation",
    icon: Stethoscope,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
];

export function DoctorLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get search query directly from URL - this stays in sync with the URL
  const searchQuery = searchParams.get("search") || "";

  // Handle search on input change (no need to press Enter)
  const handleSearchChange = (e) => {
    const query = e.target.value;

    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E4EBF5]">
      {/* Fixed Header - spans full width */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-br from-white to-[#E8EDF2] shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)] h-16">
        <div className="flex items-center justify-center h-full px-4">
          {/* Search Bar - Center */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patients by name or phone number..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-10 pl-10 pr-4 rounded-xl border-0 bg-gradient-to-br from-[#E8EDF2] to-white shadow-[inset_2px_2px_4px_rgba(176,190,197,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] focus:shadow-[inset_2px_2px_4px_rgba(176,190,197,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5),0_0_0_2px_rgba(76,175,80,0.3)] focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Notifications - Right side */}
          <div className="ml-4">
            <NotificationDropdown sidebarCollapsed={false} />
          </div>
        </div>
      </header>

      {/* Sidebar - Fixed on LEFT side */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-[calc(100vh-4rem)] bg-gradient-to-br from-[#E8EDF2] to-white text-card-foreground transition-all duration-300 shadow-[8px_8px_16px_rgba(176,190,197,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] h-screen",
          sidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Toggle Button on Right Border */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-8 w-8 bg-gradient-to-br from-white to-[#E8EDF2] shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)] hover:shadow-[8px_8px_16px_rgba(176,190,197,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)]",
            sidebarCollapsed ? "-right-4" : "-right-4",
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-primary" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-primary" />
          )}
        </Button>

        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                    isActive
                      ? "bg-gradient-to-br from-white to-[#E8EDF2] text-primary shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]"
                      : "text-muted-foreground hover:bg-gradient-to-br hover:from-white hover:to-[#E8EDF2] hover:text-card-foreground hover:shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]",
                    sidebarCollapsed && "justify-center",
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Settings & Notifications */}
          <div className="p-4 border-t border-border space-y-2">
            {!sidebarCollapsed && (
              <p className="text-xs text-muted-foreground uppercase font-medium px-3">
                Settings
              </p>
            )}

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-gradient-to-br from-white to-[#E8EDF2] text-primary shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]"
                    : "text-muted-foreground hover:bg-gradient-to-br hover:from-white hover:to-[#E8EDF2] hover:text-card-foreground hover:shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]",
                  sidebarCollapsed && "justify-center",
                )
              }
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </NavLink>
          </div>

          {/* Footer - Doctor Profile */}
          <div className="p-4 border-t border-border">
            <div
              className={cn(
                "flex items-center gap-3",
                sidebarCollapsed && "justify-center",
              )}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center font-bold shrink-0 shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]">
                DR
              </div>
              {!sidebarCollapsed && (
                <div>
                  <p className="font-medium text-sm text-card-foreground">Dr. Smith</p>
                  <p className="text-xs text-muted-foreground">General Practitioner</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - on the RIGHT side */}
      <main
        className={cn(
          "relative z-10 pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "ml-20" : "ml-64",
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DoctorLayout;
