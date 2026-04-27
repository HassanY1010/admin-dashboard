"use client";

import { useEffect, useState } from "react";
import adminApi from "../lib/admin-api";
import { DataTable, Column } from "../components/data-table";
import { formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAccounts = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getAccounts({ page: pageNum, limit: 10 });
      setAccounts(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "الحساب",
      render: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8)}</span>,
    },
    {
      key: "balance",
      header: "الرصيد",
      render: (row) => (
        <span className={cn("font-bold", Number(row.balance) >= 0 ? "text-green-600" : "text-red-600")}>
          {Number(row.balance).toLocaleString()} {row.currency}
        </span>
      ),
    },
    {
      key: "creditLimit",
      header: "سقف المديونية",
      render: (row) => <span>{Number(row.creditLimit).toLocaleString()} {row.currency}</span>,
    },
    {
      key: "updatedAt",
      header: "آخر تحديث",
      render: (row) => <span>{formatDate(row.updatedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-right">الحسابات</h1>
        <p className="text-muted-foreground text-right">إدارة الحسابات المالية للشركات</p>
      </div>

      <DataTable
        data={accounts}
        columns={columns}
        loading={loading}
        page={page}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchAccounts(p);
        }}
      />
    </div>
  );
}
