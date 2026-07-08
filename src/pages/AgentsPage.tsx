"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsApi, regionsApi } from "@/lib/referral-api";
import { DataTable } from "@/components/data-table";
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
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { toast } from "sonner";
import { UserPlus, Edit, ToggleLeft, ToggleRight, Copy, Building2, MapPin, Plus } from "lucide-react";
import adminApi from "@/lib/admin-api";

const statusLabels: Record<string, { label: string; class: string }> = {
  ACTIVE:    { label: "نشط",     class: "bg-green-100 text-green-800" },
  INACTIVE:  { label: "موقوف",   class: "bg-red-100 text-red-800"  },
  BLOCKED:   { label: "محظور",   class: "bg-gray-100 text-gray-700"    },
};

export default function AgentsPage() {
  const queryClient = useQueryClient();

  // ── Filters ──
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ── Create Agent Dialog ──
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: "",
    referralCode: "",
    commissionType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    commissionValue: "",
    regionId: "",
  });

  // ── Region Dialog State ──
  const [showRegions, setShowRegions] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");

  // ── Edit Commission Dialog ──
  const [editAgent, setEditAgent] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    commissionType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    commissionValue: "",
  });

  // ── Queries ──
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents", statusFilter],
    queryFn: () =>
      agentsApi.getAll(statusFilter !== "all" ? { status: statusFilter } : undefined),
  });

  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: () => regionsApi.getAll(),
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers({ limit: 100 }),
  });
  const users = usersData?.data || [];

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: () =>
      agentsApi.create({
        userId: createForm.userId.trim(),
        referralCode: createForm.referralCode.trim().toUpperCase(),
        commissionType: createForm.commissionType,
        commissionValue: Number(createForm.commissionValue),
        regionId: createForm.regionId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setShowCreate(false);
      setCreateForm({ userId: "", referralCode: "", commissionType: "PERCENTAGE", commissionValue: "", regionId: "" });
      toast.success("تم إنشاء حساب المندوب بنجاح");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "فشل في إنشاء المندوب");
    },
  });

  const createRegionMutation = useMutation({
    mutationFn: (name: string) => regionsApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      setNewRegionName("");
      toast.success("تم إنشاء المنطقة بنجاح");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "فشل في إنشاء المنطقة");
    },
  });

  const editMutation = useMutation({
    mutationFn: () =>
      agentsApi.updateCommission(editAgent.id, {
        commissionType: editForm.commissionType,
        commissionValue: Number(editForm.commissionValue),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setEditAgent(null);
      toast.success("تم تحديث نسبة العمولة");
    },
    onError: () => toast.error("فشل في تحديث العمولة"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" | "BLOCKED" }) =>
      agentsApi.setStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("تم تغيير حالة المندوب");
    },
    onError: () => toast.error("فشل في تغيير الحالة"),
  });

  // ── Columns ──
  const columns = [
    {
      key: "user.fullName",
      header: "المندوب",
      render: (row: any) => (
        <div>
          <div className="font-semibold">{row.user?.fullName}</div>
          <div className="text-sm text-muted-foreground">{row.user?.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: "referralCode",
      header: "كود الإحالة",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono font-bold">
            {row.referralCode}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(row.referralCode);
              toast.success("تم نسخ الكود");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: "commission",
      header: "العمولة",
      render: (row: any) => (
        <span className="font-medium">
          {Number(row.commissionValue).toLocaleString()}
          {row.commissionType === "PERCENTAGE" ? "%" : " ريال"}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      render: (row: any) => {
        const s = statusLabels[row.status] || { label: row.status, class: "" };
        return <Badge className={s.class}>{s.label}</Badge>;
      },
    },
    {
      key: "region",
      header: "المنطقة",
      render: (row: any) => row.region?.name || "-",
    },
    {
      key: "createdAt",
      header: "تاريخ الانضمام",
      render: (row: any) =>
        format(new Date(row.createdAt), "dd MMM yyyy", { locale: arSA }),
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (row: any) => (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditAgent(row);
              setEditForm({
                commissionType: row.commissionType,
                commissionValue: String(Number(row.commissionValue)),
              });
            }}
          >
            <Edit className="w-3.5 h-3.5 ml-1" />
            تعديل العمولة
          </Button>

          {row.status === "ACTIVE" ? (
            <Button
              size="sm"
              variant="outline"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
              onClick={() => statusMutation.mutate({ id: row.id, status: "INACTIVE" })}
            >
              <ToggleLeft className="w-3.5 h-3.5 ml-1" />
              إيقاف
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-300 hover:bg-green-50"
              onClick={() => statusMutation.mutate({ id: row.id, status: "ACTIVE" })}
            >
              <ToggleRight className="w-3.5 h-3.5 ml-1" />
              تفعيل
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">إدارة المناديب</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إنشاء وإدارة حسابات المناديب وعمولاتهم
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRegions(true)}>
            <Building2 className="w-4 h-4 ml-2" />
            إدارة المناطق
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <UserPlus className="w-4 h-4 ml-2" />
            إضافة مندوب جديد
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">كل الحالات</option>
          <option value="ACTIVE">نشط</option>
          <option value="INACTIVE">غير نشط</option>
          <option value="SUSPENDED">موقوف</option>
        </select>
      </div>

      <DataTable columns={columns} data={agents} loading={isLoading} />

      {/* ── Create Agent Dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مندوب جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المندوب وحدد نوع ونسبة العمولة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">اختر المستخدم</label>
              <select
                value={createForm.userId}
                onChange={(e: any) => setCreateForm((f) => ({ ...f, userId: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">اختر مستخدماً...</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.phoneNumber}) - {u.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">كود الإحالة</label>
              <input
                placeholder="مثال: HASSAN2024"
                value={createForm.referralCode}
                onChange={(e: any) => setCreateForm((f) => ({ ...f, referralCode: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">نوع العمولة</label>
              <select
                value={createForm.commissionType}
                onChange={(e: any) =>
                  setCreateForm((f) => ({ ...f, commissionType: e.target.value as any }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="PERCENTAGE">نسبة مئوية (%)</option>
                <option value="FIXED">مبلغ ثابت (ريال)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                قيمة العمولة{" "}
                {createForm.commissionType === "PERCENTAGE" ? "(%)" : "(ريال)"}
              </label>
              <input
                type="number"
                min={0}
                placeholder={createForm.commissionType === "PERCENTAGE" ? "مثال: 10" : "مثال: 500"}
                value={createForm.commissionValue}
                onChange={(e: any) => setCreateForm((f) => ({ ...f, commissionValue: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {regions.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">المنطقة (اختياري)</label>
                <select
                  value={createForm.regionId}
                  onChange={(e: any) => setCreateForm((f) => ({ ...f, regionId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">اختر منطقة</option>
                  {regions.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending ||
                !createForm.userId ||
                !createForm.referralCode ||
                !createForm.commissionValue
              }
            >
              {createMutation.isPending ? "جاري الحفظ..." : "إضافة المندوب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Commission Dialog ── */}
      <Dialog open={!!editAgent} onOpenChange={() => setEditAgent(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تعديل عمولة المندوب</DialogTitle>
            <DialogDescription>
              {editAgent?.user?.fullName} — كود: {editAgent?.referralCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">نوع العمولة</label>
              <select
                value={editForm.commissionType}
                onChange={(e: any) =>
                  setEditForm((f) => ({ ...f, commissionType: e.target.value as any }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="PERCENTAGE">نسبة مئوية (%)</option>
                <option value="FIXED">مبلغ ثابت (ريال)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                القيمة {editForm.commissionType === "PERCENTAGE" ? "(%)" : "(ريال)"}
              </label>
              <input
                type="number"
                min={0}
                value={editForm.commissionValue}
                onChange={(e: any) =>
                  setEditForm((f) => ({ ...f, commissionValue: e.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAgent(null)}>
              إلغاء
            </Button>
            <Button
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending || !editForm.commissionValue}
            >
              {editMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Manage Regions Dialog ── */}
      <Dialog open={showRegions} onOpenChange={setShowRegions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إدارة المناطق الجغرافية</DialogTitle>
            <DialogDescription>
              عرض المناطق المتاحة للنظام وإضافة مناطق عمل جديدة للمناديب
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Add new region form */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">اسم المنطقة الجديدة</label>
                <input
                  placeholder="مثال: صنعاء، تعز، عدن..."
                  value={newRegionName}
                  onChange={(e: any) => setNewRegionName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button
                onClick={() => createRegionMutation.mutate(newRegionName.trim())}
                disabled={createRegionMutation.isPending || !newRegionName.trim()}
              >
                <Plus className="w-4 h-4 ml-1" />
                إضافة
              </Button>
            </div>

            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {regions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  لا توجد مناطق مضافة حالياً.
                </div>
              ) : (
                regions.map((r: any) => (
                  <div key={r.id} className="p-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{r.name}</span>
                    </div>
                    <Badge className="border text-muted-foreground">
                      {r._count?.agents || 0} مناديب
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowRegions(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
