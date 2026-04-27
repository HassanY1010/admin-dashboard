"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useAuthStore, getStoredToken, verifyToken } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const { isAuthenticated, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const valid = await verifyToken(token);
      if (!valid) {
        navigate("/login");
        return;
      }

      try {
        const storedUser = localStorage.getItem("auth-storage");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.state?.user) {
            setAuth(parsed.state.user, token);
          }
        }
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
    <div className="flex min-h-screen">
      <Sidebar className={cn("fixed inset-y-0 right-0 z-40 w-64 transform transition-transform lg:static lg:transform-none", sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0")} />
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 bg-muted/30">{children}</main>
      </div>
    </div>
  );
}