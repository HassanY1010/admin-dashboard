"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/admin-api";
import { DataTable, Column } from "@/components/data-table";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  UserX, 
  UserCheck, 
  Key, 
  Send,
  RefreshCcw,
  Copy
} from "lucide-react";
import type { User } from "@/types/api";

export default function ConsumersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("تنبيه من الإدارة");
  
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["consumers", page, search],
    queryFn: () => adminApi.getUsers({ page, limit: 10, search, userType: "individual" }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (user: User) => 
      adminApi.toggleUserStatus(user.id, !user.isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumers"] });
      toast.success("تم تحديث حالة المستخدم بنجاح");
    },
    onError: () => toast.error("فشل في تحديث الحالة"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminApi.resetUserPassword(userId),
    onSuccess: (data) => {
      toast.success(data.message || "تم إعادة تعيين كلمة المرور بنجاح");
    },
    onError: () => toast.error("فشل في إعادة تعيين كلمة المرور"),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: () => 
      adminApi.sendNotification(selectedUser!.id, notificationTitle, notificationBody),
    onSuccess: () => {
      setShowNotifyDialog(false);
      setNotificationBody("");
      toast.success("تم إرسال الإشعار بنجاح");
    },
    onError: () => toast.error("فشل في إرسال الإشعار"),
  });

  const columns: Column<User>[] = [
    {
      key: "fullName",
      header: "المستهلك",
      render: (row) => (
        <div>
          <p className="font-medium">{row.fullName}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{row.email}</span>
            <span>•</span>
            <span className="font-mono text-[10px] bg-muted px-1 rounded">{row.id.substring(0, 8)}...</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(row.id);
                toast.success("تم نسخ معرّف المستخدم (User ID)");
              }}
              className="text-muted-foreground hover:text-foreground inline-flex items-center"
              title="نسخ معرّف المستخدم (User ID)"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      header: "رقم الهاتف",
      render: (row) => <span className="text-sm text-muted-foreground" dir="ltr">{row.phoneNumber}</span>,
    },
    {
      key: "isActive",
      header: "الحالة",
      render: (row) => (
        <Badge className={row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
          {row.isActive ? "نشط" : "معطل"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ الانضمام",
      render: (row) => <span className="text-sm">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "expiryDate",
      header: "تاريخ الانتهاء",
      render: () => (
        <Badge className="bg-blue-50 text-blue-700">
          مجاني دائم
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "الإجراءات",
      className: "w-fit",
      render: (row) => (
        <div className="flex gap-2">
          {/* Toggle Status */}
          <Button
            size="sm"
            variant="outline"
            className={row.isActive ? "text-red-600 border-red-200" : "text-green-600 border-green-200"}
            onClick={() => toggleStatusMutation.mutate(row)}
            disabled={toggleStatusMutation.isPending}
            title={row.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
          >
            {row.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </Button>

          {/* Reset Password */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm("هل أنت متأكد من إعادة تعيين كلمة المرور لهذا المستهلك؟")) {
                resetPasswordMutation.mutate(row.id);
              }
            }}
            disabled={resetPasswordMutation.isPending}
            title="إعادة تعيين كلمة المرور"
          >
            <Key className="h-4 w-4" />
          </Button>

          {/* Send Notification */}
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200"
            onClick={() => {
              setSelectedUser(row);
              setShowNotifyDialog(true);
            }}
            title="إرسال إشعار"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">قائمة المستهلكين</h2>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        page={page}
        limit={10}
        total={data?.meta?.total || 0}
        onPageChange={setPage}
        searchPlaceholder="بحث بالاسم، الهاتف، أو البريد..."
        onSearch={setSearch}
      />

      {/* Notification Dialog */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرسال إشعار للمستهلك</DialogTitle>
            <DialogDescription>
              سيصل هذا الإشعار مباشرة إلى تطبيق المستخدم: {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">العنوان</label>
              <input 
                className="w-full p-2 border rounded-md"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">محتوى الإشعار</label>
              <Textarea
                placeholder="اكتب رسالتك هنا..."
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifyDialog(false)}>إلغاء</Button>
            <Button 
              onClick={() => sendNotificationMutation.mutate()} 
              disabled={sendNotificationMutation.isPending || !notificationBody}
            >
              إرسال الآن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
