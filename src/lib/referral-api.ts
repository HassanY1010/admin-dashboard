import apiClient from "./api-client";

// ===================== AGENTS =====================
export const agentsApi = {
  getAll: (params?: { status?: string; regionId?: string }) =>
    apiClient.get("/agents", { params }).then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get(`/agents/${id}`).then((r) => r.data),

  create: (data: {
    userId: string;
    referralCode: string;
    commissionType: "PERCENTAGE" | "FIXED";
    commissionValue: number;
    regionId?: string;
  }) => apiClient.post("/agents", data).then((r) => r.data),

  updateCommission: (
    id: string,
    data: {
      commissionType: "PERCENTAGE" | "FIXED";
      commissionValue: number;
    }
  ) => apiClient.patch(`/agents/${id}/commission`, data).then((r) => r.data),

  setStatus: (id: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") =>
    apiClient.patch(`/agents/${id}/status`, { status }).then((r) => r.data),
};

// ===================== COMMISSIONS =====================
export const commissionsApi = {
  getAll: (params?: { agentId?: string; status?: string }) =>
    apiClient.get("/commissions", { params }).then((r) => r.data),

  updateStatus: (
    id: string,
    data: { status: "PENDING" | "APPROVED" | "REJECTED"; notes?: string }
  ) => apiClient.patch(`/commissions/${id}/status`, data).then((r) => r.data),
};

// ===================== PAYOUTS =====================
export const payoutsApi = {
  getAll: (params?: { agentId?: string; status?: string }) =>
    apiClient.get("/payouts", { params }).then((r) => r.data),

  create: (agentId: string, notes?: string) =>
    apiClient.post("/payouts", { agentId, notes }).then((r) => r.data),
};

// ===================== REGIONS =====================
export const regionsApi = {
  getAll: () => apiClient.get("/regions").then((r) => r.data),
};
