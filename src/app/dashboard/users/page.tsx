"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import MerchantsPage from "../merchants/page";
import ConsumersPage from "../consumers/page";
import { Building2, Users } from "lucide-react";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"merchants" | "consumers">("merchants");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">اختر نوع المستخدمين الذي تود إدارته</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab("merchants")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative border-b-2",
            activeTab === "merchants"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          <Building2 className="w-4 h-4" />
          إدارة التجار
        </button>
        <button
          onClick={() => setActiveTab("consumers")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative border-b-2",
            activeTab === "consumers"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          <Users className="w-4 h-4" />
          إدارة المستهلكين
        </button>
      </div>

      <div className="pt-4">
        {activeTab === "merchants" ? <MerchantsPage /> : <ConsumersPage />}
      </div>
    </div>
  );
}
