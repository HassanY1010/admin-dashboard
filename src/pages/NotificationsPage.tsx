"use client";

import { useEffect, useState } from "react";
import adminApi from "../lib/admin-api";
import { DataTable, Column } from "../components/data-table";
import { formatDate } from "../lib/utils";
import { Bell, Send } from "lucide-react";
import { io } from "socket.io-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Send Notification States
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [title, setTitle] = useState("تنبيه من الإدارة");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<"all" | "individual" | "business" | "specific">("all");
  const [specificUserId, setSpecificUserId] = useState("");

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
    fetchNotifications(page);
  }, [page]);

  // Real-time updates via Socket
  useEffect(() => {
    const socket = io(
      (import.meta as any).env.VITE_SOCKET_URL ||
        (import.meta as any).env.VITE_API_URL ||
        "https://sales-app-backend-jhxe.onrender.com",
      {
        withCredentials: true,
        transports: ["websocket"],
      }
    );

    const handleNewNotification = () => {
      fetchNotifications(page);
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("admin-payment-request", handleNewNotification);
    socket.on("admin-suggestion-created", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("admin-payment-request", handleNewNotification);
      socket.off("admin-suggestion-created", handleNewNotification);
      socket.disconnect();
    };
  }, [page]);

  // Send Notification Mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      if (targetType === "specific") {
        if (!specificUserId.trim()) throw new Error("يرجى إدخال معرف المستخدم");
        return adminApi.sendNotification(specificUserId.trim(), title, body);
      } else {
        const params: any = { limit: 10000 };
        if (targetType === "individual") params.userType = "individual";
        if (targetType === "business") params.userType = "business";

        const usersRes = await adminApi.getUsers(params);
        const userIds = (usersRes.data || []).map((u: any) => u.id);

        if (userIds.length === 0) {
          throw new Error("لا يوجد مستخدمون لإرسال الإشعار إليهم");
        }

        return adminApi.sendBulkNotification(userIds, title, body);
      }
    },
    onSuccess: () => {
      toast.success("تم إرسال الإشعار بنجاح");
      setShowSendDialog(false);
      setBody("");
      setSpecificUserId("");
      fetchNotifications(page);
    },
    onError: (err: any) => {
      toast.error(err.message || "فشل في إرسال الإشعار");
    },
  });

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
        <Button onClick={() => setShowSendDialog(true)}>
          <Send className="w-4 h-4 ml-2" />
          إرسال إشعار جديد
        </Button>
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
        }}
      />

      {/* Send Notification Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرسال إشعار جديد</DialogTitle>
            <DialogDescription>
              يمكنك إرسال إشعار لمستخدم معين أو لمجموعة محددة من المستخدمين.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-right">
            <div className="space-y-2">
              <label className="text-sm font-medium">الجهة المستهدفة</label>
              <select
                className="w-full p-2 border rounded-md bg-background text-foreground"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
              >
                <option value="all">جميع المستخدمين</option>
                <option value="individual">جميع المستهلكين</option>
                <option value="business">جميع التجار</option>
                <option value="specific">مستخدم محدد بموجب معرف الحساب (User ID)</option>
              </select>
            </div>

            {targetType === "specific" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">معرف المستخدم (User ID)</label>
                <input
                  type="text"
                  placeholder="أدخل معرف المستخدم هنا..."
                  className="w-full p-2 border rounded-md bg-background text-foreground"
                  value={specificUserId}
                  onChange={(e) => setSpecificUserId(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان الإشعار</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-background text-foreground"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">محتوى الإشعار</label>
              <Textarea
                placeholder="اكتب تفاصيل الإشعار هنا..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => sendNotificationMutation.mutate()}
              disabled={sendNotificationMutation.isPending || !body.trim()}
            >
              {sendNotificationMutation.isPending ? "جاري الإرسال..." : "إرسال الآن"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
