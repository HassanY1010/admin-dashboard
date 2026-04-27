"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/admin-api";
import { DataTable, Column } from "@/components/data-table";
import { formatDate } from "@/lib/utils";
import type { Transaction } from "@/types/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTransactions = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getTransactions({ page: pageNum, limit: 10 });
      setTransactions(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const columns: Column<Transaction>[] = [
    {
      key: "id",
      header: "رقم المعاملة",
      render: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8)}</span>,
    },
    {
      key: "transactionType",
      header: "النوع",
      render: (row) => (
        <span className={cn("px-2 py-1 text-xs rounded-full", 
          row.transactionType === 'PAYMENT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
        )}>
          {row.transactionType === 'PAYMENT' ? 'دفع' : 'بيع/شراء'}
        </span>
      ),
    },
    {
      key: "amount",
      header: "المبلغ",
      render: (row) => <span className="font-bold">{row.amount.toLocaleString()} ر.ي</span>,
    },
    {
      key: "createdAt",
      header: "التاريخ",
      render: (row) => <span>{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المعاملات</h1>
        <p className="text-muted-foreground">إدارة وتتبع المعاملات المالية</p>
      </div>

      <DataTable
        data={transactions}
        columns={columns}
        loading={loading}
        page={page}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchTransactions(p);
        }}
      />
    </div>
  );
}

// Simple helper if cn is not imported correctly in this file
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
