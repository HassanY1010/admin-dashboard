import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useRealtimeNotifications } from "@/lib/use-realtime-notifications";
import apiClient from "@/lib/api-client";
import { Link } from "react-router-dom";

import { Bell, Search, User, ChevronDown, Moon, Sun, Menu } from "lucide-react";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { notifications, unreadCount, markAsRead } = useRealtimeNotifications();

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } finally {
      logout();
      window.location.href = "/login";
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-card border-b border-border transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-muted"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث..."
            className="w-64 h-9 pl-9 pr-3 text-sm bg-muted rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) {
                markAsRead();
              }
            }}
            className="relative p-2 rounded-md hover:bg-muted"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-4 px-1 text-xs font-bold text-white bg-destructive rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-1 w-80 bg-popover rounded-md shadow-lg border border-border py-1 z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b border-border font-semibold text-sm">
                الإشعارات الأخيرة
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  لا توجد إشعارات حالياً
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.slice(0, 15).map((n: any, idx: number) => {
                    let path = "/dashboard/notifications";
                    let title = n.title || "إشعار جديد";
                    let body = n.body || "";

                    if (n.wallet) {
                      path = "/dashboard/subscriptions";
                      title = "طلب تفعيل اشتراك معلق";
                      body = `المستخدم: ${n.user?.fullName} | المبلغ: ${Number(n.amount).toLocaleString()} ريال (${n.wallet})`;
                    } else if (n.content) {
                      path = "/dashboard/suggestions";
                      title = "شكوى/اقتراح جديد";
                      body = `من: ${n.user?.fullName} | ${n.content}`;
                    }

                    return (
                      <Link
                        key={n.id || idx}
                        to={path}
                        onClick={() => setShowNotifications(false)}
                        className="block px-4 py-3 hover:bg-muted text-right transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{body}</p>
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md hover:bg-muted"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:block text-sm font-medium">
              {user?.fullName || "مدير"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showUserMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-popover rounded-md shadow-lg border border-border py-1 z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary/10 rounded-full">
                  {user?.role === "SUPER_ADMIN"
                    ? "مدير عام"
                    : user?.role === "ADMIN"
                    ? "مدير"
                    : "دعم"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm text-right text-destructive hover:bg-destructive/10"
              >
                تسجيل خروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
