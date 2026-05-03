"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/admin-api";
import { StatsCard } from "@/components/stats-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Building2, ShoppingCart, CreditCard } from "lucide-react";
import type { DashboardStats } from "@/types/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardData, subscriptionData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getSubscriptionStats(),
        ]);
        setStats(dashboardData);
        setSubscriptionStats(subscriptionData);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على النظام</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي المستخدمين"
          value={stats?.totalUsers || 0}
          icon={Users}
          className="hover:shadow-md transition-shadow"
        />
        <StatsCard
          title="إجمالي الشركات"
          value={stats?.totalBusinesses || 0}
          icon={Building2}
          className="hover:shadow-md transition-shadow"
        />
        <StatsCard
          title="اشتراكات نشطة"
          value={subscriptionStats?.activeSubscriptions || 0}
          icon={CreditCard}
          className="hover:shadow-md transition-shadow"
        />
        <StatsCard
          title="طلبات معلقة"
          value={subscriptionStats?.pendingRequests || 0}
          icon={ShoppingCart}
          className="hover:shadow-md transition-shadow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">الطلبات الأخيرة</h2>
          <div className="space-y-3">
            {stats?.recentOrders?.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.sender.name} ← {order.receiver.name}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-medium">{formatCurrency(order.total)}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status === "PENDING"
                      ? "قيد الانتظار"
                      : order.status === "ACCEPTED"
                      ? "مقبول"
                      : order.status === "REJECTED"
                      ? "مرفوض"
                      : order.status === "COMPLETED"
                      ? "مكتمل"
                      : "ملغي"}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                لا توجد طلبات بعد
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">المعاملات الأخيرة</h2>
          <div className="space-y-3">
            {stats?.recentTransactions?.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <div>
                  <p className="font-medium">{tx.transactionType}</p>
                  <p className="text-sm text-muted-foreground">
                    {tx.sender.name} → {tx.receiver.name}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-medium text-green-600">
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {(!stats?.recentTransactions ||
              stats.recentTransactions.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                لا توجد معاملات بعد
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-4">حالة الطلبات</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats?.ordersByStatus?.map((item) => (
            <div key={item.status} className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{item._count}</p>
              <p className="text-sm text-muted-foreground">
                {item.status === "PENDING"
                  ? "قيد الانتظار"
                  : item.status === "ACCEPTED"
                  ? "مقبول"
                  : item.status === "REJECTED"
                  ? "مرفوض"
                  : item.status === "COMPLETED"
                  ? "مكتمل"
                  : "ملغي"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}