import apiClient from "./api-client";
import type {
  User,
  Business,
  Order,
  Transaction,
  Connection,
  Account,
  Expense,
  Notification,
  AuditLog,
  DashboardStats,
  PaginatedResponse,
  FinancialReport,
  Suggestion,
} from "@/types/api";

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}

const adminApi = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get("/admin/dashboard/stats");
    return data;
  },

  async getOperationsSummary(): Promise<any> {
    const { data } = await apiClient.get("/admin/operations/summary");
    return data;
  },

  // Users
  async getUsers(params: QueryParams = {}): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get("/admin/users", { params });
    return data;
  },

  async getUserById(id: string): Promise<User & { expenses: Expense[] }> {
    const { data } = await apiClient.get(`/admin/users/${id}`);
    return data;
  },

  async changeUserRole(userId: string, role: string): Promise<User> {
    const { data } = await apiClient.put("/admin/users/change-role", { userId, role });
    return data;
  },

  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    const { data } = await apiClient.put("/admin/users/toggle-status", { userId, isActive });
    return data;
  },

  async resetUserPassword(userId: string): Promise<any> {
    const { data } = await apiClient.put(`/admin/users/${userId}/reset-password`);
    return data;
  },

  // Businesses
  async getBusinesses(params: QueryParams = {}): Promise<PaginatedResponse<Business>> {
    const { data } = await apiClient.get("/admin/businesses", { params });
    return data;
  },

  async getBusinessById(id: string): Promise<Business> {
    const { data } = await apiClient.get(`/admin/businesses/${id}`);
    return data;
  },

  async toggleBusinessStatus(businessId: string, isActive: boolean): Promise<Business> {
    const { data } = await apiClient.put("/admin/businesses/toggle-status", { businessId, isActive });
    return data;
  },

  async getBusinessStats(businessId: string, params: { startDate?: string; endDate?: string } = {}): Promise<any> {
    const { data } = await apiClient.get(`/admin/businesses/${businessId}/stats`, { params });
    return data;
  },

  // Orders
  async getOrders(params: QueryParams = {}): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get("/admin/orders", { params });
    return data;
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await apiClient.get(`/admin/orders/${id}`);
    return data;
  },

  // Transactions
  async getTransactions(params: QueryParams = {}): Promise<PaginatedResponse<Transaction>> {
    const { data } = await apiClient.get("/admin/transactions", { params });
    return data;
  },

  // Connections
  async getConnections(params: QueryParams = {}): Promise<PaginatedResponse<Connection>> {
    const { data } = await apiClient.get("/admin/connections", { params });
    return data;
  },

  // Accounts
  async getAccounts(params: QueryParams = {}): Promise<PaginatedResponse<Account>> {
    const { data } = await apiClient.get("/admin/accounts", { params });
    return data;
  },

  async getAccountById(id: string): Promise<Account> {
    const { data } = await apiClient.get(`/admin/accounts/${id}`);
    return data;
  },

  async getDueAccounts(params: QueryParams = {}): Promise<PaginatedResponse<any>> {
    const { data } = await apiClient.get("/admin/due-accounts", { params });
    return data;
  },

  async getAdjustmentRequests(params: QueryParams = {}): Promise<PaginatedResponse<any>> {
    const { data } = await apiClient.get("/admin/adjustment-requests", { params });
    return data;
  },

  async rejectAdjustmentRequest(id: string, rejectionReason: string): Promise<any> {
    const { data } = await apiClient.put(`/admin/adjustment-requests/${id}/reject`, { rejectionReason });
    return data;
  },

  // Expenses
  async getExpenses(params: QueryParams = {}): Promise<PaginatedResponse<Expense>> {
    const { data } = await apiClient.get("/admin/expenses", { params });
    return data;
  },

  // Notifications
  async getNotifications(params: QueryParams = {}): Promise<PaginatedResponse<Notification>> {
    const { data } = await apiClient.get("/admin/notifications", { params });
    return data;
  },

  async sendNotification(userId: string, title: string, body: string, type?: string): Promise<Notification> {
    const { data } = await apiClient.post("/admin/notifications/send", { userId, title, body, type });
    return data;
  },

  async sendBulkNotification(userIds: string[], title: string, body: string, type?: string): Promise<any> {
    const { data } = await apiClient.post("/admin/notifications/send-bulk", { userIds, title, body, type });
    return data;
  },

  // Audit Logs
  async getAuditLogs(params: QueryParams = {}): Promise<PaginatedResponse<AuditLog>> {
    const { data } = await apiClient.get("/admin/audit-logs", { params });
    return data;
  },

  // Reports
  async getFinancialReport(params: { startDate?: string; endDate?: string } = {}): Promise<FinancialReport> {
    const { data } = await apiClient.get("/admin/reports/financial", { params });
    return data;
  },

  // Subscriptions
  async getPendingSubscriptions(params: QueryParams = {}): Promise<PaginatedResponse<any>> {
    const { data } = await apiClient.get("/subscriptions/pending-requests", { params });
    return data;
  },

  async approveSubscription(requestId: string, notes?: string): Promise<any> {
    const { data } = await apiClient.put("/subscriptions/approve", { requestId, notes });
    return data;
  },

  async rejectSubscription(requestId: string, reason?: string): Promise<any> {
    const { data } = await apiClient.put("/subscriptions/reject", { requestId, reason });
    return data;
  },

  async extendSubscription(businessId: string, days?: number): Promise<any> {
    const { data } = await apiClient.post(`/subscriptions/extend/${businessId}`, { days });
    return data;
  },

  async getSubscriptionStats(): Promise<any> {
    const { data } = await apiClient.get("/subscriptions/stats");
    return data;
  },

  // Suggestions
  async getSuggestions(params: QueryParams = {}): Promise<PaginatedResponse<Suggestion>> {
    const { data } = await apiClient.get("/admin/suggestions", { params });
    return data;
  },

  async updateSuggestionStatus(id: string, status: string): Promise<Suggestion> {
    const { data } = await apiClient.put(`/admin/suggestions/${id}/status`, { status });
    return data;
  },


  // Notifications Count
  async getNotificationsCount(params: { isRead?: boolean } = {}): Promise<{ count: number }> {
    const { data } = await apiClient.get("/admin/notifications/count", { params });
    return data;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await apiClient.put(`/admin/notifications/${id}/read`);
  },
};

export default adminApi;
