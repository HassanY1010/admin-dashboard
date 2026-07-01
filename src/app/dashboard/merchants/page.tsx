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
  CalendarPlus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  Copy,
} from "lucide-react";
import type { User } from "@/types/api";

const ROLE_OPTIONS = [
  { value: "USER", label: "مستخدم عادي" },
  { value: "SUPPORT", label: "دعم فني" },
  { value: "ADMIN", label: "مدير" },
  { value: "SUPER_ADMIN", label: "مدير عام" },
];

export default function MerchantsPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("تنبيه من الإدارة");

  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extendDays, setExtendDays] = useState<number | "">("");

  // FIX ADMIN-05: Change Role UI
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("USER");

  // Delete User
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["merchants", page, search],
    queryFn: () => adminApi.getUsers({ page, limit: 10, search, userType: "business" }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (user: User) =>
      adminApi.toggleUserStatus(user.id, !user.isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      toast.success("تم تحديث حالة المستخدم بنجاح");
    },
    onError: () => toast.error("فشل في تحديث الحالة"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminApi.resetUserPassword(userId),
    onSuccess: (data) => {
      toast.success(
        `تم إعادة تعيين كلمة المرور. كلمة المرور المؤقتة: ${data.temporaryPassword || "تحقق من البريد"}`,
        { duration: 8000 },
      );
    },
    onError: () => toast.error("فشل في إعادة تعيين كلمة المرور"),
  });

  const extendSubscriptionMutation = useMutation({
    mutationFn: ({ businessId, days }: { businessId: string; days?: number }) =>
      adminApi.extendSubscription(businessId, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      setShowExtendDialog(false);
      setExtendDays("");
      toast.success("تم تمديد الاشتراك بنجاح");
    },
    onError: () => toast.error("فشل في تمديد الاشتراك (قد لا يملك المستخدم شركة)"),
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

  // FIX ADMIN-05: Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      setShowChangeRoleDialog(false);
      toast.success("تم تغيير صلاحية المستخدم بنجاح");
    },
    onError: () => toast.error("فشل في تغيير الصلاحية"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      setShowDeleteDialog(false);
      setUserToDelete(null);
      toast.success("تم حذف المستخدم نهائياً");
    },
    onError: () => toast.error("فشل في حذف المستخدم"),
  });

  const columns: Column<User>[] = [
    {
      key: "fullName",
      header: "التاجر",
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
      key: "role",
      header: "الصلاحية",
      render: (row) => (
        <Badge
          className={
            row.role === "SUPER_ADMIN"
              ? "bg-red-100 text-red-700"
              : row.role === "ADMIN"
              ? "bg-orange-100 text-orange-700"
              : row.role === "SUPPORT"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }
        >
          {ROLE_OPTIONS.find((r) => r.value === row.role)?.label || row.role}
        </Badge>
      ),
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
      render: (row) => {
        let expiryDate = new Date(row.createdAt);
        expiryDate.setDate(expiryDate.getDate() + 90);

        if (row.business?.subscriptionExpiry) {
          const businessExpiry = new Date(row.business.subscriptionExpiry);
          if (businessExpiry > expiryDate) {
            expiryDate = businessExpiry;
          }
        }

        const isExpired = new Date() > expiryDate;

        return (
          <Badge className={isExpired ? "bg-red-50 text-red-700" : "bg-purple-50 text-purple-700"}>
            {formatDate(expiryDate.toISOString())}
          </Badge>
        );
      },
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
              if (confirm("هل أنت متأكد من إعادة تعيين كلمة المرور لهذا التاجر؟")) {
                resetPasswordMutation.mutate(row.id);
              }
            }}
            disabled={resetPasswordMutation.isPending}
            title="إعادة تعيين كلمة المرور"
          >
            <Key className="h-4 w-4" />
          </Button>

          {/* Change Role — FIX ADMIN-05 */}
          <Button
            size="sm"
            variant="outline"
            className="text-amber-600 border-amber-200"
            onClick={() => {
              setSelectedUser(row);
              setSelectedRole(row.role || "USER");
              setShowChangeRoleDialog(true);
            }}
            title="تغيير الصلاحية"
          >
            <ShieldCheck className="h-4 w-4" />
          </Button>

          {/* Extend Subscription */}
          <Button
            size="sm"
            variant="outline"
            className="text-purple-600 border-purple-200"
            onClick={() => {
              if (row.business?.id) {
                setSelectedUser(row);
                setShowExtendDialog(true);
              } else {
                toast.error("هذا المستخدم ليس لديه شركة مرتبطة");
              }
            }}
            title="تمديد الاشتراك"
          >
            <CalendarPlus className="h-4 w-4" />
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

          {/* Delete User — SUPER_ADMIN only */}
          <Button
            size="sm"
            variant="outline"
            className="text-red-700 border-red-300 hover:bg-red-50"
            onClick={() => {
              setUserToDelete(row);
              setShowDeleteDialog(true);
            }}
            title="حذف المستخدم نهائياً"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">قائمة التجار</h2>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["merchants"] })}>
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

      {/* Change Role Dialog — FIX ADMIN-05 */}
      <Dialog open={showChangeRoleDialog} onOpenChange={setShowChangeRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير صلاحية المستخدم</DialogTitle>
            <DialogDescription>
              اختر الصلاحية الجديدة للمستخدم: <strong>{selectedUser?.fullName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`w-full text-right px-4 py-3 rounded-md border transition-colors ${
                  selectedRole === role.value
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border hover:bg-muted"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeRoleDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  changeRoleMutation.mutate({ userId: selectedUser.id, role: selectedRole });
                }
              }}
              disabled={changeRoleMutation.isPending || selectedRole === selectedUser?.role}
            >
              حفظ التغيير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرسال إشعار للتاجر</DialogTitle>
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

      {/* Extend Subscription Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تمديد الاشتراك المخصص</DialogTitle>
            <DialogDescription>
              أدخل عدد الأيام التي تريد إضافتها لاشتراك التاجر: {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">عدد الأيام</label>
              <input
                type="number"
                min="1"
                placeholder="مثال: 10, 30, 365..."
                className="w-full p-2 border rounded-md"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value ? Number(e.target.value) : "")}
              />
              <p className="text-xs text-muted-foreground">
                سيتم إضافة هذه الأيام إلى تاريخ انتهاء الاشتراك الحالي.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>إلغاء</Button>
            <Button
              onClick={() => {
                if (selectedUser?.business?.id && extendDays !== "") {
                  extendSubscriptionMutation.mutate({
                    businessId: selectedUser.business.id,
                    days: Number(extendDays),
                  });
                }
              }}
              disabled={extendSubscriptionMutation.isPending || extendDays === ""}
            >
              تمديد الآن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-700">⚠️ حذف مستخدم نهائياً</DialogTitle>
            <DialogDescription>
              أنت على وشك حذف المستخدم <strong>{userToDelete?.fullName}</strong> ({userToDelete?.email}) بشكل نهائي.
              <br />
              <span className="text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
            <Button
              className="bg-red-700 hover:bg-red-800"
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "جاري الحذف..." : "حذف نهائياً"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
