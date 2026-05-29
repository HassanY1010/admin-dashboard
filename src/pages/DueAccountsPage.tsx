import { useEffect, useState } from "react";
import adminApi from "../lib/admin-api";
import { DataTable, Column } from "../components/data-table";
import { formatDate } from "../lib/utils";

export default function DueAccountsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [includeFuture, setIncludeFuture] = useState(false);

  const fetchRows = async (pageNum = 1, future = includeFuture) => {
    setLoading(true);
    try {
      const data = await adminApi.getDueAccounts({ page: pageNum, limit: 10, includeFuture: future });
      setRows(data.data);
      setTotal(data.meta.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "debtor",
      header: "المدين",
      render: (row) => row.debtor?.name || "-",
    },
    {
      key: "creditor",
      header: "الدائن",
      render: (row) => row.creditor?.name || "-",
    },
    {
      key: "amount",
      header: "المبلغ",
      render: (row) => <span className="font-bold">{row.amount}</span>,
    },
    {
      key: "dueDate",
      header: "تاريخ السداد",
      render: (row) => row.dueDate ? formatDate(row.dueDate) : "-",
    },
    {
      key: "isOverdue",
      header: "الحالة",
      render: (row) => row.isOverdue ? (
        <span className="text-red-600 font-medium">متأخر</span>
      ) : (
        <span className="text-green-600 font-medium">قادم</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeFuture}
            onChange={(e) => {
              setIncludeFuture(e.target.checked);
              fetchRows(1, e.target.checked);
              setPage(1);
            }}
          />
          عرض المواعيد القادمة
        </label>
        <div className="text-right">
          <h1 className="text-2xl font-bold">مواعيد السداد</h1>
          <p className="text-muted-foreground">متابعة الحسابات المستحقة والمتأخرة</p>
        </div>
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
