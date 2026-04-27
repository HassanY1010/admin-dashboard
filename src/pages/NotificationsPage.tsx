"use client";

import { useEffect, useState } from "react";
import adminApi from "../lib/admin-api";
import { DataTable, Column } from "../components/data-table";
import { formatDate } from "../lib/utils";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotifications = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getNotifications({ page: pageNum, limit: 10 });
      setNotifications(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "العنوان",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${row.isRead ? 'bg-muted' : 'bg-primary/10'}`}>
            <Bell className={`w-4 h-4 ${row.isRead ? 'text-muted-foreground' : 'text-primary'}`} />
          </div>
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.body}</p>
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "الوقت",
      render: (row) => <span className="text-sm">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          إرسال إشعار جديد
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          <p className="text-muted-foreground">إدارة وتنبيهات النظام</p>
        </div>
      </div>

      <DataTable
        data={notifications}
        columns={columns}
        loading={loading}
        page={page}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchNotifications(p);
        }}
      />
    </div>
  );
}
