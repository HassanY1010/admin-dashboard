"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payoutsApi, agentsApi } from "@/lib/referral-api";
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
import { Banknote, AlertTriangle } from "lucide-react";

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING:   { label: "قيد التنفيذ", class: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "مكتمل",       class: "bg-green-100 text-green-800"  },
  FAILED:    { label: "فشل",         class: "bg-red-100 text-red-800"      },
};

export default function PayoutsPage() {
  const queryClient = useQueryClient();

  const [agentFilter, setAgentFilter] = useState("all");
  const [showPayDialog, setShowPayDialog]   = useState(false);
  const [selectedAgent, setSelectedAgent]   = useState<any>(null);
  const [notes, setNotes] = useState("");

  // ── Queries ──
  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["payouts", agentFilter],
    queryFn: () =>
      payoutsApi.getAll(agentFilter !== "all" ? { agentId: agentFilter } : undefined),
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", "ACTIVE"],
    queryFn: () => agentsApi.getAll({ status: "ACTIVE" }),
  });

  // ── Payout mutation ──
  const payMutation = useMutation({
    mutationFn: () => payoutsApi.create(selectedAgent!.id, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      setShowPayDialog(false);
      setSelectedAgent(null);
      setNotes("");
      const total = Number(data?.totalAmount || 0).toLocaleString();
      toast.success(`تم صرف عمولات بإجمالي ${total} ريال بنجاح`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "فشل في تنفيذ عملية الصرف"),
  });

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
      key: "totalAmount",
      header: "إجمالي المبلغ المصروف",
      render: (row: any) => (
        <span className="font-bold text-green-700 text-base">
          {Number(row.totalAmount).toLocaleString()} ريال
        </span>
      ),
    },
    {
      key: "commissionsCount",
      header: "عدد العمولات",
      render: (row: any) => (
        <Badge className="bg-muted text-foreground">
          {row.commissionsCount ?? row._count?.commissions ?? "-"} عمولة
        </Badge>
      ),
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
      key: "processedBy",
      header: "المعالج",
      render: (row: any) => row.processedBy?.fullName || "-",
    },
    {
      key: "notes",
      header: "ملاحظات",
      render: (row: any) =>
        row.notes ? (
          <span className="text-sm text-muted-foreground">{row.notes}</span>
        ) : (
          "-"
        ),
    },
    {
      key: "createdAt",
      header: "التاريخ",
      render: (row: any) =>
        format(new Date(row.createdAt), "dd MMM yyyy - HH:mm", { locale: arSA }),
    },
  ];

  return (
    <div className="p-3 sm:p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">صرف العمولات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تنفيذ عمليات صرف العمولات المعتمدة للمناديب
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowPayDialog(true)}
        >
          <Banknote className="w-4 h-4 ml-2" />
          صرف عمولات مندوب
        </Button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="flex h-10 w-52 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">كل المناديب</option>
          {agents.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.user?.fullName} ({a.referralCode})
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={payouts} loading={isLoading} />

      {/* ── Pay Dialog ── */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-600" />
              صرف عمولات مندوب
            </DialogTitle>
            <DialogDescription>
              سيتم صرف جميع العمولات ذات الحالة "معتمدة" للمندوب المحدد دفعةً
              واحدة. العملية لا يمكن التراجع عنها.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Warning */}
            <div className="flex gap-2 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-800">
                تأكد من أن المبلغ تم تحويله للمندوب فعلياً قبل الضغط على "تأكيد الصرف".
              </p>
            </div>

            {/* Agent selector */}
            <div>
              <label className="text-sm font-medium mb-1 block">المندوب</label>
              <select
                value={selectedAgent?.id || ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedAgent(agents.find((a: any) => a.id === v) || null);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">اختر المندوب...</option>
                {agents.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.user?.fullName} — {a.referralCode}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-1 block">ملاحظات (اختياري)</label>
              <Textarea
                placeholder="مثال: تم التحويل عبر كاش"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPayDialog(false); setSelectedAgent(null); setNotes(""); }}>
              إلغاء
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => payMutation.mutate()}
              disabled={payMutation.isPending || !selectedAgent}
            >
              {payMutation.isPending ? "جاري التنفيذ..." : "تأكيد الصرف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
