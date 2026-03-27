import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bell, AlertCircle, AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { screeningAPI } from "@/api";
import { cn } from "@/lib/utils";

export function NotificationDropdown({ sidebarCollapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await screeningAPI.getNotifications();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark notification as read mutation
  const markReadMutation = useMutation({
    mutationFn: (patientId) => screeningAPI.markNotificationRead(patientId),
    onSuccess: (data) => {
      // Update the notifications cache with new unread count
      queryClient.setQueryData(["notifications"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          unread_count: data.data.unread_count,
        };
      });
      // Also trigger a full refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unread_count || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    if (!notification.read) {
      markReadMutation.mutate(notification.patient_id);
    }
    // Navigate to patient consultation
    navigate(`/consultation/${notification.patient_id}`);
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className={cn(
          "text-muted-foreground hover:text-card-foreground hover:bg-gradient-to-br hover:from-white hover:to-[#E8EDF2] hover:shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)] relative",
          sidebarCollapsed ? "w-10 h-10 p-0" : "w-auto h-10 px-3",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {!sidebarCollapsed && <span className="ml-2">Notifications</span>}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gradient-to-br from-white to-[#E8EDF2] rounded-2xl shadow-[8px_8px_16px_rgba(176,190,197,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] z-50 max-h-[500px] overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div
            className="overflow-y-auto"
            style={{ maxHeight: '400px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`
              .notification-scroll::-webkit-scrollbar {
                display: none !important;
              }
            `}</style>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 border-b border-border cursor-pointer hover:bg-gradient-to-br hover:from-white hover:to-[#E8EDF2] transition-all",
                    !notification.read && "bg-gradient-to-br from-blue-50 to-blue-100",
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-full bg-gradient-to-br from-white to-[#E8EDF2] shadow-[2px_2px_4px_rgba(176,190,197,0.4),-2px_-2px_4px_rgba(255,255,255,0.7)]",
                        notification.type === "critical"
                          ? "text-destructive"
                          : "text-accent",
                      )}
                    >
                      {notification.type === "critical" ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-card-foreground">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  navigate("/");
                  setIsOpen(false);
                }}
              >
                View All Patients
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
