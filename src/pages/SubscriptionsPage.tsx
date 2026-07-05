"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/admin-api";
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
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function SubscriptionsPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pending-subscriptions"],
    queryFn: () => adminApi.getPendingSubscriptions({ page: 1, limit: 50 }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const approveMutation = useMutation({
    mutationFn: (data: { requestId: string; notes?: string }) =>
      adminApi.approveSubscription(data.requestId, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-subscriptions"] });
      setShowApproveDialog(false);
      setSelectedRequest(null);
      setAdminNotes("");
      toast.success("تم تفعيل الاشتراك بنجاح");
    },
    onError: () => {
      toast.error("فشل في تفعيل الاشتراك");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { requestId: string; reason?: string }) =>
      adminApi.rejectSubscription(data.requestId, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-subscriptions"] });
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setAdminNotes("");
      toast.success("تم رفض طلب الدفع");
    },
    onError: () => {
      toast.error("فشل في رفض طلب الدفع");
    },
  });

  const columns = [
    {
      key: "user.fullName",
      header: "اسم المستخدم",
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.user?.fullName}</div>
          <div className="text-sm text-muted-foreground">{row.user?.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "المبلغ",
      render: (row: any) => (
        <span className="font-medium">{Number(row.amount).toLocaleString()} ريال</span>
      ),
    },
    {
      key: "wallet",
      header: "المحفظة",
      render: (row: any) => <Badge className="bg-blue-100 text-blue-800">{row.wallet}</Badge>,
    },
    {
      key: "business.name",
      header: "العمل",
      render: (row: any) => row.business?.name || "-",
    },
    {
      key: "createdAt",
      header: "تاريخ الطلب",
      render: (row: any) =>
        format(new Date(row.createdAt), "dd MMM yyyy - HH:mm", { locale: arSA }),
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedRequest(row);
              setShowApproveDialog(true);
            }}
          >
            <Check className="h-4 w-4 ml-1" />
            تفعيل
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              setSelectedRequest(row);
              setShowRejectDialog(true);
            }}
          >
            <X className="h-4 w-4 ml-1" />
            رفض
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">طلبات التفعيل المعلقة</h1>
        <p className="text-muted-foreground">
          طلبات الدفع التي بانتظار التفعيل
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
      />

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفعيل الاشتراك</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من تفعيل اشتراك هذا المستخدم؟ سيتم تمديد الاشتراك لمدة سنة.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="ملاحظات (اختياري)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={() =>
              approveMutation.mutate({
                requestId: selectedRequest?.id,
                notes: adminNotes,
              })
            } disabled={approveMutation.isPending}>
              تفعيل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض طلب الدفع</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رفض طلب الدفع هذا؟ سيتم إبلاغ المستخدم برفض الطلب.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="سبب الرفض"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              إلغاء
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() =>
              rejectMutation.mutate({
                requestId: selectedRequest?.id,
                reason: adminNotes,
              })
            } disabled={rejectMutation.isPending}>
              رفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
