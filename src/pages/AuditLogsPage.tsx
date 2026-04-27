"use client";

import { useEffect, useState } from "react";
import adminApi from "../lib/admin-api";
import { DataTable, Column } from "../components/data-table";
import { formatDate } from "../lib/utils";
import { Shield } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs({ page: pageNum, limit: 15 });
      setLogs(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "action",
      header: "العملية",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{row.action}</span>
        </div>
      ),
    },
    {
      key: "resource",
      header: "المورد",
      render: (row) => <span className="text-sm">{row.resource}</span>,
    },
    {
      key: "user",
      header: "بواسطة",
      render: (row) => <span className="text-sm">{row.user?.fullName || "نظام"}</span>,
    },
    {
      key: "createdAt",
      header: "التاريخ",
      render: (row) => <span className="text-sm">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-right">سجل العمليات</h1>
        <p className="text-muted-foreground text-right">مراقبة وتتبع العمليات الإدارية</p>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        loading={loading}
        page={page}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchLogs(p);
        }}
      />
    </div>
  );
}
