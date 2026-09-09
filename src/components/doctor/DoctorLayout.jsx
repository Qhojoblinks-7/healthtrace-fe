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
  Shield,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUIStore } from "@/store";

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
  const sidebarCollapsed = useUIStore((state) => state.sidebarOpen);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarOpen);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";

  const handleSearchChange = (e) => {
    const query = e.target.value;

    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-card shadow-neu-outer h-16">
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
                className="neu-input w-full h-10 pl-10 pr-4 text-sm"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="ml-4 flex items-center gap-2">
            <ThemeToggle />
            <NotificationDropdown sidebarCollapsed={false} />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 bg-card shadow-neu-outer text-card-foreground transition-all duration-300",
          "h-screen",
          sidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-8 w-8 bg-card shadow-neu-outer-sm hover:shadow-neu-outer",
            sidebarCollapsed ? "-right-4" : "-right-4",
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-primary" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-primary" />
          )}
        </Button>

        <div className="flex flex-col h-full pt-16">
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
                      ? "bg-card shadow-neu-outer-sm text-primary"
                      : "text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-neu-outer-sm",
                    sidebarCollapsed && "justify-center",
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Settings */}
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
                    ? "bg-card shadow-neu-outer-sm text-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-neu-outer-sm",
                  sidebarCollapsed && "justify-center",
                )
              }
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </NavLink>

            <NavLink
              to="/admin/roles"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-card shadow-neu-outer-sm text-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-neu-outer-sm",
                  sidebarCollapsed && "justify-center",
                )
              }
            >
              <Shield className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>Admin</span>}
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
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold shrink-0 shadow-neu-outer-sm text-primary-foreground">
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

      {/* Main Content */}
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
