"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/admin-api";
import { DataTable, Column } from "@/components/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MoreVertical, ShoppingCart, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import type { Order } from "@/types/api";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  PENDING: { label: "قيد الانتظار", class: "bg-yellow-100 text-yellow-700", icon: Clock },
  ACCEPTED: { label: "مقبول", class: "bg-blue-100 text-blue-700", icon: CheckCircle },
  REJECTED: { label: "مرفوض", class: "bg-red-100 text-red-700", icon: XCircle },
  COMPLETED: { label: "مكتمل", class: "bg-green-100 text-green-700", icon: CheckCircle },
  CANCELLED: { label: "ملغي", class: "bg-gray-100 text-gray-700", icon: AlertCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchOrders = async (pageNum: number = 1, searchQuery: string = "", statusFilter: string = "") => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      const data = await adminApi.getOrders(params);
      setOrders(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      header: "رقم الطلب",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{row.orderNumber}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(row.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "parties",
      header: "بين",
      render: (row) => (
        <div>
          <p className="text-sm">
            <span className="font-medium">{row.sender.name}</span>
          </p>
          <p className="text-xs text-muted-foreground">→ {row.receiver.name}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "النوع",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.isCash
              ? "bg-green-100 text-green-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {row.isCash ? "نقدي" : "آجل"}
        </span>
      ),
    },
    {
      key: "total",
      header: "المبلغ",
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.total)}</span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      render: (row) => {
        const config = statusConfig[row.status] || statusConfig.PENDING;
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${config.class}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: () => (
        <button className="p-2 rounded-md hover:bg-muted">
          <MoreVertical className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الطلبات</h1>
          <p className="text-muted-foreground">إدارة طلبات الشراء والبيع</p>
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
            fetchOrders(1, search, e.target.value);
          }}
          className="h-9 px-3 text-sm bg-white border border-border rounded-md"
        >
          <option value="">كل الحالات</option>
          <option value="PENDING">قيد الانتظار</option>
          <option value="ACCEPTED">مقبول</option>
          <option value="REJECTED">مرفوض</option>
          <option value="COMPLETED">مكتمل</option>
          <option value="CANCELLED">ملغي</option>
        </select>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        page={page}
        limit={10}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchOrders(p, search, status);
        }}
        searchPlaceholder="بحث برقم الطلب..."
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
          fetchOrders(1, q, status);
        }}
      />
    </div>
  );
}