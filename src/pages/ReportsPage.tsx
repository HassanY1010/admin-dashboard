"use client";

import { useEffect, useState } from "react";
import adminApi from "../lib/admin-api";
import { formatCurrency } from "../lib/utils";
import { FileText, Download, TrendingUp, TrendingDown } from "lucide-react";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await adminApi.getFinancialReport();
        setReport(data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          <Download className="w-4 h-4" />
          تصدير PDF
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-bold">التقارير المالية</h1>
          <p className="text-muted-foreground">ملخص الأداء المالي للنظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">قيمة الطلبيات الإجمالية</span>
          </div>
          <h3 className="text-2xl font-bold">{formatCurrency(report?.totalOrderValue)}</h3>
        </div>

        <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">إجمالي المبالغ الدائنة (علينا)</span>
          </div>
          <h3 className="text-2xl font-bold">{formatCurrency(report?.totalPayable)}</h3>
        </div>

        <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">صافي المديونية (الميزانية)</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-600">{formatCurrency(report?.netBalance)}</h3>
        </div>
      </div>
    </div>
  );
}
