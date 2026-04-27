"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";

import { Bell, Search, User, ChevronDown, Moon, Sun, Menu } from "lucide-react";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-border">
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
            className="w-64 h-9 pl-9 pr-3 text-sm bg-muted rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-md hover:bg-muted">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
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