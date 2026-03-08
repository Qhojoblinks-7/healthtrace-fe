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
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Header - spans full width */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b h-16">
        <div className="flex items-center justify-center h-full px-4">
          {/* Search Bar - Center */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients by name or phone number..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          "fixed top-0 left-0 z-30 h-[calc(100vh-4rem)] bg-slate-900 text-white transition-all duration-300 border-r h-screen",
          sidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Toggle Button on Right Border */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-8 w-8 bg-slate-800 hover:bg-slate-700 border border-slate-700",
            sidebarCollapsed ? "-right-4" : "-right-4",
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-white" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white" />
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
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white",
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
          <div className="p-4 border-t border-slate-800 space-y-2">
            {!sidebarCollapsed && (
              <p className="text-xs text-slate-500 uppercase font-medium px-3">
                Settings
              </p>
            )}

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                  sidebarCollapsed && "justify-center",
                )
              }
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </NavLink>
          </div>

          {/* Footer - Doctor Profile */}
          <div className="p-4 border-t border-slate-800">
            <div
              className={cn(
                "flex items-center gap-3",
                sidebarCollapsed && "justify-center",
              )}
            >
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold shrink-0">
                DR
              </div>
              {!sidebarCollapsed && (
                <div>
                  <p className="font-medium text-sm">Dr. Smith</p>
                  <p className="text-xs text-slate-400">General Practitioner</p>
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
