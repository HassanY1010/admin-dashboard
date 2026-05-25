"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import adminApi from "../lib/admin-api";
import { StatsCard } from "../components/stats-card";

export default function OperationsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["operations-summary"],
    queryFn: () => adminApi.getOperationsSummary(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <div className="p-8 text-center">جاري تحميل حالة التشغيل...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-md">
        فشل تحميل حالة التشغيل
      </div>
    );
  }

  const security = data?.security || {};
  const workload = data?.workload || {};
  const warnings = [
    !security.corsConfigured ? "CORS_ORIGINS غير مضبوط في البيئة الحالية" : null,
    !security.jwtSecretConfigured ? "JWT_SECRET غير مضبوط أو أقصر من 32 حرفا" : null,
    workload.pendingOrders > 0 ? `${workload.pendingOrders} طلب بانتظار المعالجة` : null,
    workload.pendingConnections > 0 ? `${workload.pendingConnections} طلب ربط بانتظار القرار` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التشغيل والجاهزية</h1>
          <p className="text-muted-foreground">مراقبة الإنتاج، الأمان، الجلسات، والأعمال المعلقة</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
        >
          تحديث
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="حالة النظام" value={data?.health?.status || "unknown"} icon={CheckCircle2} />
        <StatsCard title="قاعدة البيانات" value={data?.health?.database || "unknown"} icon={Database} />
        <StatsCard title="الجلسات النشطة" value={security.activeSessions || 0} icon={ShieldCheck} />
        <StatsCard title="تنبيهات التشغيل" value={warnings.length} icon={AlertTriangle} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white border border-border rounded-md p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            جاهزية الأمان
          </h2>
          <div className="space-y-3">
            <StatusRow label="CORS allowlist" ok={security.corsConfigured} />
            <StatusRow label="JWT secret قوي" ok={security.jwtSecretConfigured} />
            <StatusRow label="Refresh token rotation" ok={security.refreshTokensEnabled} />
            <StatusRow label="جلسات فعالة" value={`${security.activeSessions || 0} / ${security.totalRefreshTokens || 0}`} />
          </div>
        </div>

        <div className="bg-white border border-border rounded-md p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            الأعمال المعلقة
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="مستخدمون" value={workload.users} />
            <Metric label="مستخدمون موقوفون" value={workload.inactiveUsers} />
            <Metric label="طلبات معلقة" value={workload.pendingOrders} />
            <Metric label="طلبات مرفوضة" value={workload.rejectedOrders} />
            <Metric label="روابط معلقة" value={workload.pendingConnections} />
            <Metric label="إشعارات غير مقروءة" value={workload.unreadNotifications} />
          </div>
        </div>
      </section>

      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <h2 className="font-semibold text-amber-900 mb-2">تنبيهات يجب معالجتها</h2>
          <ul className="space-y-1 text-sm text-amber-800">
            {warnings.map((warning) => (
              <li key={warning as string}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-border rounded-md p-4">
        <h2 className="font-semibold mb-4">آخر عمليات Audit</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-right py-2">الإجراء</th>
                <th className="text-right py-2">المورد</th>
                <th className="text-right py-2">المستخدم</th>
                <th className="text-right py-2">الوقت</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentAuditLogs || []).map((log: any) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="py-2">{log.action}</td>
                  <td className="py-2">{log.resource}</td>
                  <td className="py-2">{log.user?.fullName || log.userId || "-"}</td>
                  <td className="py-2">{new Date(log.createdAt).toLocaleString("ar")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, ok, value }: { label: string; ok?: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <span>{label}</span>
      <span className={ok === false ? "text-destructive font-medium" : "text-emerald-700 font-medium"}>
        {value || (ok ? "جاهز" : "غير جاهز")}
      </span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold mt-1">{value ?? 0}</div>
    </div>
  );
}
