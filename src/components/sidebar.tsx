"use client";

import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  ShoppingCart,
  Receipt,
  Wallet,
  Link2,
  FileText,
  Bell,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  CreditCard,
  MessageSquare,
  Activity,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/dashboard/merchants", label: "إدارة التجار", icon: Building2 },
  { href: "/dashboard/consumers", label: "إدارة المستهلكين", icon: Users },
  { href: "/dashboard/subscriptions", label: "الاشتراكات", icon: CreditCard },
  { href: "/dashboard/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/dashboard/transactions", label: "المعاملات", icon: Receipt },
  { href: "/dashboard/connections", label: "الروابط", icon: Link2 },
  { href: "/dashboard/accounts", label: "الحسابات", icon: Wallet },
  { href: "/dashboard/expenses", label: "المصاريف", icon: FileText },
  { href: "/dashboard/reports", label: "التقارير", icon: Shield },
  { href: "/dashboard/suggestions", label: "الشكاوى والاقتراحات", icon: MessageSquare },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
  { href: "/dashboard/audit-logs", label: "سجل العمليات", icon: Settings },
  { href: "/dashboard/operations", label: "التشغيل والجاهزية", icon: Activity },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = useLocation().pathname;

  return (
    <aside className={cn("flex flex-col h-screen bg-white border-l border-border", className)}>
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-primary">حسابك في جيبك</h1>
        <p className="text-sm text-muted-foreground">لوحة تحكم الإدارة</p>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_refresh_token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
}
