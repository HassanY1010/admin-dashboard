"use client";

import { useEffect, useState } from "react";
import adminApi from "../lib/admin-api";
import { DataTable, Column } from "../components/data-table";
import { formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchConnections = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getConnections({ page: pageNum, limit: 10 });
      setConnections(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "الرابط",
      render: (row) => (
        <div>
          <p className="font-medium">{row.requester?.name} ↔ {row.receiver?.name}</p>
          <p className="text-xs text-muted-foreground">{row.connectionType}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      render: (row) => (
        <span className={cn("px-2 py-1 text-xs rounded-full", 
          row.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        )}>
          {row.status === 'ACCEPTED' ? 'مقبول' : 'معلق'}
        </span>
      ),
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
        <h1 className="text-2xl font-bold text-right">الروابط</h1>
        <p className="text-muted-foreground text-right">إدارة الروابط بين الشركات</p>
      </div>

      <DataTable
        data={connections}
        columns={columns}
        loading={loading}
        page={page}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchConnections(p);
        }}
      />
    </div>
  );
}
