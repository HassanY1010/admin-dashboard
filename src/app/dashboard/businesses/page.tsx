"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/admin-api";
import { DataTable, Column } from "@/components/data-table";
import { formatDate } from "@/lib/utils";
import { 
  MoreVertical, 
  Building2, 
  Mail, 
  Phone,
  UserCheck,
  UserX,
  CalendarPlus,
  Send,
  BarChart3,
  Receipt,
  ShoppingCart,
  DollarSign,
  Briefcase
} from "lucide-react";
import type { Business } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<(Business & { user: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Actions Dialog States
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [showActionsDialog, setShowActionsDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);

  // Business statistics
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Extend Subscription
  const [extendDays, setExtendDays] = useState<number | "">("");

  // Notifications
  const [notificationTitle, setNotificationTitle] = useState("تنبيه من الإدارة");
  const [notificationBody, setNotificationBody] = useState("");

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
    fetchBusinesses(page, search);
  }, [page]);

  const handleToggleStatus = async (business: any) => {
    const nextActive = !business.user?.isActive;
    const confirmMsg = nextActive 
      ? `هل أنت متأكد من تفعيل حساب مالك الشركة: ${business.name}؟` 
      : `هل أنت متأكد من تعطيل حساب مالك الشركة: ${business.name}؟`;
    
    if (confirm(confirmMsg)) {
      try {
        await adminApi.toggleBusinessStatus(business.id, nextActive);
        toast.success("تم تحديث حالة الحساب بنجاح");
        fetchBusinesses(page, search);
        setShowActionsDialog(false);
      } catch (error) {
        toast.error("فشل في تحديث حالة الحساب");
      }
    }
  };

  const handleExtendSubscription = async () => {
    if (!selectedBusiness || !extendDays) return;
    try {
      await adminApi.extendSubscription(selectedBusiness.id, Number(extendDays));
      toast.success("تم تمديد الاشتراك بنجاح");
      setShowExtendDialog(false);
      setExtendDays("");
      fetchBusinesses(page, search);
    } catch (error) {
      toast.error("فشل في تمديد الاشتراك (تأكد من صلاحيات العملية)");
    }
  };

  const handleSendNotification = async () => {
    if (!selectedBusiness || !selectedBusiness.user?.id || !notificationBody) return;
    try {
      await adminApi.sendNotification(selectedBusiness.user.id, notificationTitle, notificationBody);
      toast.success("تم إرسال الإشعار بنجاح");
      setShowNotifyDialog(false);
      setNotificationBody("");
    } catch (error) {
      toast.error("فشل في إرسال الإشعار");
    }
  };

  const loadStats = async (businessId: string) => {
    setStatsLoading(true);
    setShowStatsDialog(true);
    try {
      const data = await adminApi.getBusinessStats(businessId);
      setStats(data);
    } catch (error) {
      toast.error("فشل في تحميل إحصائيات العمل");
      setShowStatsDialog(false);
    } finally {
      setStatsLoading(false);
    }
  };

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
      render: (row) => (
        <button 
          onClick={() => {
            setSelectedBusiness(row);
            setShowActionsDialog(true);
          }}
          className="p-2 rounded-md hover:bg-muted"
          title="إجراءات العمل"
        >
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

      {/* Main Actions Dialog */}
      <Dialog open={showActionsDialog} onOpenChange={setShowActionsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>إجراءات الشركة</DialogTitle>
            <DialogDescription>
              الشركة: <strong>{selectedBusiness?.name}</strong>
              <br />
              المالك: {selectedBusiness?.user?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 py-4">
            <Button 
              variant="outline" 
              className="justify-start gap-2 text-right"
              onClick={() => {
                setShowActionsDialog(false);
                loadStats(selectedBusiness.id);
              }}
            >
              <BarChart3 className="w-4 h-4" />
              إحصائيات الشركة المالية والنشاط
            </Button>

            <Button 
              variant="outline" 
              className="justify-start gap-2 text-right text-purple-600 hover:text-purple-700"
              onClick={() => {
                setShowActionsDialog(false);
                setExtendDays("");
                setShowExtendDialog(true);
              }}
            >
              <CalendarPlus className="w-4 h-4" />
              تمديد الاشتراك المخصص
            </Button>

            <Button 
              variant="outline" 
              className="justify-start gap-2 text-right text-blue-600 hover:text-blue-700"
              onClick={() => {
                setShowActionsDialog(false);
                setNotificationBody("");
                setShowNotifyDialog(true);
              }}
            >
              <Send className="w-4 h-4" />
              إرسال إشعار مباشر للمالك
            </Button>

            <Button 
              variant="outline" 
              className={`justify-start gap-2 text-right ${
                selectedBusiness?.user?.isActive 
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
              }`}
              onClick={() => handleToggleStatus(selectedBusiness)}
            >
              {selectedBusiness?.user?.isActive ? (
                <>
                  <UserX className="w-4 h-4" />
                  تعطيل حساب المالك
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  تفعيل حساب المالك
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setShowActionsDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إحصائيات النشاط للشركة</DialogTitle>
            <DialogDescription>
              عرض تقرير سريع للشركة: <strong>{selectedBusiness?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : stats ? (
            <div className="space-y-4 py-4 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-3 rounded-lg bg-muted/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>عدد الطلبات</span>
                  </div>
                  <p className="text-xl font-bold">{stats.orders}</p>
                </div>
                <div className="border p-3 rounded-lg bg-muted/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>عدد المعاملات</span>
                  </div>
                  <p className="text-xl font-bold">{stats.transactions}</p>
                </div>
              </div>

              <div className="border p-4 rounded-lg bg-muted/20 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> إجمالي المبيعات
                  </span>
                  <span className="font-bold text-green-600">
                    {Number(stats.totalSales).toLocaleString()} ريال
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> إجمالي المشتريات
                  </span>
                  <span className="font-bold text-orange-600">
                    {Number(stats.totalPurchases).toLocaleString()} ريال
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> رصيد الحساب المالي
                  </span>
                  <span className="font-bold">
                    {Number(stats.accountBalance).toLocaleString()} ريال
                  </span>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setShowStatsDialog(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Subscription Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تمديد الاشتراك المخصص</DialogTitle>
            <DialogDescription>
              أدخل عدد الأيام التي تريد إضافتها لاشتراك الشركة: <strong>{selectedBusiness?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-right">
            <div className="space-y-2">
              <label className="text-sm font-medium">عدد الأيام</label>
              <input
                type="number"
                min="1"
                placeholder="مثال: 30، 90، 365..."
                className="w-full p-2 border rounded-md bg-background text-foreground"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value ? Number(e.target.value) : "")}
              />
              <p className="text-xs text-muted-foreground">
                سيتم إضافة هذه الأيام لتاريخ صلاحية اشتراك الشركة الحالي.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>إلغاء</Button>
            <Button
              onClick={handleExtendSubscription}
              disabled={extendDays === ""}
            >
              تمديد الآن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Direct Notification Dialog */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>إرسال إشعار للمالك</DialogTitle>
            <DialogDescription>
              سيصل الإشعار مباشرة لتطبيق المستخدم: <strong>{selectedBusiness?.user?.fullName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-right">
            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان الإشعار</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-background text-foreground"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">محتوى الرسالة</label>
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
              onClick={handleSendNotification}
              disabled={!notificationBody.trim()}
            >
              إرسال الإشعار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}