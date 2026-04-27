"use client";

import { useEffect, useState } from "react";

import adminApi from "@/lib/admin-api";
import { DataTable, Column } from "@/components/data-table";
import { formatDate } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import type { User } from "@/types/api";

export default function UsersPage() {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchUsers = async (pageNum: number = 1, searchQuery: string = "") => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      const data = await adminApi.getUsers(params);
      setUsers(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: Column<User>[] = [
    {
      key: "fullName",
      header: "الاسم",
      render: (row) => (
        <div>
          <p className="font-medium">{row.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      header: "رقم الهاتف",
    },
    {
      key: "userType",
      header: "النوع",
      render: (row) => (
        <span className="text-sm">
          {row.userType === "business" ? "شركة" : "فردي"}
        </span>
      ),
    },
    {
      key: "role",
      header: "الدور",
      render: (row) => (
        <span className="px-2 py-1 text-xs rounded-full bg-primary/10">
          {row.role === "SUPER_ADMIN"
            ? "مدير عام"
            : row.role === "ADMIN"
            ? "مدير"
            : "دعم"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "الحالة",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.isActive ? "نشط" : "معطل"}
        </span>
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
          <h1 className="text-2xl font-bold">المستخدمين</h1>
          <p className="text-muted-foreground">إدارة مستخدمي النظام</p>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        page={page}
        limit={10}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchUsers(p, search);
        }}
        searchPlaceholder="بحث بالاسم أو البريد..."
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
          fetchUsers(1, q);
        }}
      />
    </div>
  );
}