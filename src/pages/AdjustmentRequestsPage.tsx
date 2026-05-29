import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import adminApi from "../lib/admin-api";
import { DataTable, Column } from "../components/data-table";
import { formatDate } from "../lib/utils";

export default function AdjustmentRequestsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRows = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getAdjustmentRequests({ page: pageNum, limit: 10 });
      setRows(data.data);
      setTotal(data.meta.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const reject = async (id: string) => {
    const reason = window.prompt("سبب رفض طلب التعديل");
    if (!reason || reason.trim().length < 5) return;
    await adminApi.rejectAdjustmentRequest(id, reason.trim());
    await fetchRows(page);
  };

  const columns: Column<any>[] = [
    {
      key: "targetType",
      header: "النوع",
      render: (row) => row.targetType === "TRANSACTION" ? "سند/معاملة" : "فاتورة",
    },
    {
      key: "parties",
      header: "الأطراف",
      render: (row) => `${row.requesterBusiness?.name || "-"} ← ${row.receiverBusiness?.name || "-"}`,
    },
    {
      key: "requestedAmount",
      header: "المبلغ المقترح",
      render: (row) => row.requestedAmount || "-",
    },
    {
      key: "status",
      header: "الحالة",
      render: (row) => (
        <span className="inline-flex items-center gap-1">
          {row.status === "APPROVED" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : row.status === "REJECTED" ? <XCircle className="w-4 h-4 text-red-600" /> : null}
          {row.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "التاريخ",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "إجراء",
      render: (row) => row.status === "PENDING" ? (
        <button
          onClick={() => reject(row.id)}
          className="px-3 py-1 text-xs rounded-md bg-destructive text-destructive-foreground"
        >
          رفض إداري
        </button>
      ) : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-right">طلبات تعديل الفواتير والسندات</h1>
        <p className="text-muted-foreground text-right">متابعة طلبات الاعتراض والتعديل بين الأطراف</p>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        loading={loading}
        page={page}
        total={total}
        onPageChange={(p) => {
          setPage(p);
          fetchRows(p);
        }}
      />
    </div>
  );
}
