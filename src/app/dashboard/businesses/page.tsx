"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/admin-api";
import { DataTable, Column } from "@/components/data-table";
import { formatDate } from "@/lib/utils";
import { MoreVertical, Building2, Mail, Phone } from "lucide-react";
import type { Business } from "@/types/api";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<(Business & { user: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchBusinesses = async (pageNum: number = 1, searchQuery: string = "") => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      const data = await adminApi.getBusinesses(params);
      setBusinesses(data.data as (Business & { user: any })[]);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const columns: Column<Business & { user: any }>[] = [
    {
      key: "name",
      header: "اسم الشركة",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.businessType || "نوع تجاري"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "معلومات الاتصال",
      render: (row) => (
        <div className="space-y-1">
          <p className="text-sm flex items-center gap-1">
            <Phone className="w-3 h-3" /> {row.phoneNumber || "-"}
          </p>
          <p className="text-sm flex items-center gap-1 text-muted-foreground">
            <Mail className="w-3 h-3" /> {row.email || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "owner",
      header: "المالك",
      render: (row) => (
        <div>
          <p className="text-sm">{row.user?.fullName}</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              row.user?.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.user?.isActive ? "نشط" : "معطل"}
          </span>
        </div>
      ),
    },
    {
      key: "connections",
      header: "الروابط",
      render: (row) => (
        <div className="text-sm">
          <span className="text-muted-foreground">
            {row._count?.sentConnections || 0} مرسل /{" "}
            {row._count?.receivedConnections || 0} مستلم
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ التسجيل",
      render: (row) => <span className="text-sm">{formatDate(row.createdAt)}</span>,
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
          <h1 className="text-2xl font-bold">الشركات</h1>
          <p className="text-muted-foreground">إدارة الشركات المسجلة</p>
        </div>
      </div>

      <DataTable
        data={businesses}
        columns={columns}
        loading={loading}
        page={page}
        limit={10}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchBusinesses(p, search);
        }}
        searchPlaceholder="بحث..."
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
          fetchBusinesses(1, q);
        }}
      />
    </div>
  );
}