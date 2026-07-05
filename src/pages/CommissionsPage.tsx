"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commissionsApi, agentsApi } from "@/lib/referral-api";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { CheckCircle, XCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING:  { label: "بانتظار المراجعة", class: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "معتمدة",           class: "bg-blue-100 text-blue-800"    },
  REJECTED: { label: "مرفوضة",           class: "bg-red-100 text-red-800"      },
  PAID:     { label: "مدفوعة",           class: "bg-green-100 text-green-800"  },
};

export default function CommissionsPage() {
  const queryClient = useQueryClient();

  const [agentFilter, setAgentFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected]         = useState<any>(null);
  const [action, setAction]             = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes]               = useState("");

  // ── Queries ──
  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["commissions", agentFilter, statusFilter],
    queryFn: () =>
      commissionsApi.getAll({
        ...(agentFilter !== "all"  && { agentId: agentFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      }),
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => agentsApi.getAll(),
  });

  // ── Mutations ──
  const updateMutation = useMutation({
    mutationFn: () =>
      commissionsApi.updateStatus(selected!.id, {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      setSelected(null);
      setAction(null);
      setNotes("");
      toast.success(action === "approve" ? "تم اعتماد العمولة" : "تم رفض العمولة");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "فشلت العملية"),
  });

  // ── Summary totals ──
  const totalPending = commissions
    .filter((c: any) => c.status === "PENDING")
    .reduce((s: number, c: any) => s + Number(c.amount), 0);

  const totalApproved = commissions
    .filter((c: any) => c.status === "APPROVED")
    .reduce((s: number, c: any) => s + Number(c.amount), 0);

  // ── Columns ──
  const columns = [
    {
      key: "agent",
      header: "المندوب",
      render: (row: any) => (
        <div>
          <div className="font-semibold">{row.agent?.user?.fullName}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {row.agent?.referralCode}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "العميل",
      render: (row: any) => (
        <div>
          <div>{row.customer?.fullName}</div>
          <div className="text-xs text-muted-foreground">{row.customer?.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "مبلغ العمولة",
      render: (row: any) => (
        <span className="font-bold text-primary">
          {Number(row.amount).toLocaleString()} ريال
        </span>
      ),
    },
    {
      key: "subscription",
      header: "الخطة",
      render: (row: any) => row.subscription?.plan?.name || "-",
    },
    {
      key: "status",
      header: "الحالة",
      render: (row: any) => {
        const s = statusConfig[row.status] || { label: row.status, class: "" };
        return <Badge className={s.class}>{s.label}</Badge>;
      },
    },
    {
      key: "createdAt",
      header: "التاريخ",
      render: (row: any) =>
        format(new Date(row.createdAt), "dd MMM yyyy", { locale: arSA }),
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (row: any) =>
        row.status === "PENDING" ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => { setSelected(row); setAction("approve"); }}
            >
              <CheckCircle className="w-3.5 h-3.5 ml-1" />
              اعتماد
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => { setSelected(row); setAction("reject"); }}
            >
              <XCircle className="w-3.5 h-3.5 ml-1" />
              رفض
            </Button>
          </div>
        ) : (
          <Badge className={statusConfig[row.status]?.class || ""}>
            {statusConfig[row.status]?.label || row.status}
          </Badge>
        ),
    },
  ];

  return (
    <div className="p-3 sm:p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">سجل العمولات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          مراجعة واعتماد عمولات المناديب
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي السجلات", value: commissions.length, color: "text-foreground" },
          { label: "بانتظار المراجعة", value: commissions.filter((c: any) => c.status === "PENDING").length, color: "text-yellow-600" },
          { label: "مجموع المعلّقة (ريال)", value: totalPending.toLocaleString(), color: "text-yellow-700" },
          { label: "مجموع المعتمدة (ريال)", value: totalApproved.toLocaleString(), color: "text-blue-700" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">كل الحالات</option>
          <option value="PENDING">بانتظار المراجعة</option>
          <option value="APPROVED">معتمدة</option>
          <option value="REJECTED">مرفوضة</option>
          <option value="PAID">مدفوعة</option>
        </select>

        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">كل المناديب</option>
          {agents.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.user?.fullName} ({a.referralCode})
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={commissions} loading={isLoading} />

      {/* ── Action Dialog (approve / reject) ── */}
      <Dialog open={!!selected && !!action} onOpenChange={() => { setSelected(null); setAction(null); setNotes(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "اعتماد العمولة" : "رفض العمولة"}
            </DialogTitle>
            <DialogDescription>
              {selected?.agent?.user?.fullName} —{" "}
              <span className="font-bold">{Number(selected?.amount).toLocaleString()} ريال</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              placeholder="ملاحظات (اختياري)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelected(null); setAction(null); setNotes(""); }}>
              إلغاء
            </Button>
            <Button
              className={action === "approve" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending
                ? "جاري المعالجة..."
                : action === "approve"
                ? "اعتماد"
                : "رفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
