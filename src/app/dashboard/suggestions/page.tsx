"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/admin-api";
import { 
  MessageSquare, 
  Phone, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Search,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SuggestionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["suggestions", page, status, search],
    queryFn: () => adminApi.getSuggestions({ page, limit: 10, status, search }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      adminApi.updateSuggestionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      toast.success("تم تحديث حالة الاقتراح بنجاح");
      setShowDetailDialog(false);
    },
    onError: () => toast.error("فشل في تحديث الحالة"),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> جديد</span>;
      case "REVIEWED":
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> قيد المراجعة</span>;
      case "CLOSED":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> مكتمل</span>;
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            الشكاوى والاقتراحات
          </h1>
          <p className="text-muted-foreground">عرض وإدارة الرسائل الواردة من المستخدمين</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث باسم المستخدم..."
              className="w-full pl-3 pr-10 py-2 border rounded-md text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              className="p-2 border rounded-md text-sm bg-white w-full sm:w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">جميع الحالات</option>
              <option value="OPEN">جديد</option>
              <option value="REVIEWED">قيد المراجعة</option>
              <option value="CLOSED">مكتمل</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">المستخدم</th>
              <th className="px-4 py-3 font-medium">نوع الحساب</th>
              <th className="px-4 py-3 font-medium">الرسالة</th>
              <th className="px-4 py-3 font-medium">التاريخ</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-4 py-4 h-12 bg-muted/20" />
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  لا توجد شكاوى أو اقتراحات حالياً
                </td>
              </tr>
            ) : (
              data?.data.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-medium">{item.user.fullName}</div>
                    <div className="text-xs text-muted-foreground">{item.user.business?.name || "بدون اسم عمل"}</div>
                  </td>
                  <td className="px-4 py-4">
                    {item.user.userType === "business" ? "تاجر" : "مستهلك"}
                  </td>
                  <td className="px-4 py-4 max-w-xs truncate">
                    {item.content}
                  </td>
                  <td className="px-4 py-4">
                    {format(new Date(item.createdAt), "yyyy-MM-dd HH:mm", { locale: ar })}
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-4 py-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedSuggestion(item);
                        setShowDetailDialog(true);
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.meta.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              السابق
            </Button>
            <span className="text-xs">صفحة {page} من {data.meta.totalPages}</span>
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === data.meta.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              التالي
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الشكوى/الاقتراح</DialogTitle>
            <DialogDescription>
              مرسل من: {selectedSuggestion?.user.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-right">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">نص الرسالة</label>
              <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {selectedSuggestion?.content}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">رقم الهاتف</label>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  {selectedSuggestion?.user.phoneNumber}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">رقم واتساب للتواصل</label>
                <div className="flex items-center gap-2 text-sm">
                  {selectedSuggestion?.whatsapp ? (
                    <a 
                      href={`https://wa.me/${selectedSuggestion.whatsapp.replace(/\+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:underline"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {selectedSuggestion.whatsapp}
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">غير متوفر</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs text-muted-foreground">تغيير الحالة</label>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={selectedSuggestion?.status === "OPEN" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => updateStatusMutation.mutate({ id: selectedSuggestion.id, status: "OPEN" })}
                >
                  جديد
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedSuggestion?.status === "REVIEWED" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => updateStatusMutation.mutate({ id: selectedSuggestion.id, status: "REVIEWED" })}
                >
                  قيد المراجعة
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedSuggestion?.status === "CLOSED" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => updateStatusMutation.mutate({ id: selectedSuggestion.id, status: "CLOSED" })}
                >
                  مكتمل
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
