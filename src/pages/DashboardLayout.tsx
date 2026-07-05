"use client";

import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Sidebar } from "../components/sidebar";
import { Topbar } from "../components/topbar";
import { useAuthStore } from "../lib/auth-store";
import apiClient from "../lib/api-client";
import { cn } from "../lib/utils";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: user } = await apiClient.get("/users/me");
        if (!["SUPER_ADMIN", "ADMIN", "SUPPORT"].includes(user?.role)) {
          navigate("/login");
          return;
        }
        setAuth(user);
      } catch {
        navigate("/login");
        return;
      }

      setLoading(false);
    };

    initAuth();
  }, [navigate, setAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: fixed drawer on mobile, static on desktop */}
      <Sidebar
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-64 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shrink-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area — full width on mobile */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-3 sm:p-4 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
