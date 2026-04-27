"use client";

import { useEffect, useState } from "react";
import adminApi from "../lib/admin-api";
import { DataTable, Column } from "../components/data-table";
import { formatDate } from "../lib/utils";


export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchExpenses = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getExpenses({ page: pageNum, limit: 10 });
      setExpenses(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "description",
      header: "الوصف",
      render: (row) => <span className="font-medium">{row.description}</span>,
    },
    {
      key: "amount",
      header: "المبلغ",
      render: (row) => <span className="font-bold text-red-600">{Number(row.amount).toLocaleString()} ر.ي</span>,
    },
    {
      key: "date",
      header: "التاريخ",
      render: (row) => <span>{formatDate(row.date)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-right">المصاريف</h1>
        <p className="text-muted-foreground text-right">تتبع المصاريف التشغيلية</p>
      </div>

      <DataTable
        data={expenses}
        columns={columns}
        loading={loading}
        page={page}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchExpenses(p);
        }}
      />
    </div>
  );
}
