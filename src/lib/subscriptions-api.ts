import apiClient from "./api-client";

export interface PaymentRequest {
  id: string;
  userId: string;
  businessId?: string;
  amount: string;
  wallet: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  business?: {
    id: string;
    name: string;
  };
}

export interface SubscriptionStats {
  activeSubscriptions: number;
  expiredSubscriptions: number;
  pendingRequests: number;
  totalUsers: number;
}

export const subscriptionsApi = {
  // Get pending payment requests
  getPendingRequests: async (page = 1, limit = 20) => {
    const response = await apiClient.get(`/subscriptions/pending-requests?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Approve a payment request
  approvePayment: async (requestId: string, notes?: string) => {
    const response = await apiClient.put('/subscriptions/approve', { requestId, notes });
    return response.data;
  },

  // Reject a payment request
  rejectPayment: async (requestId: string, reason?: string) => {
    const response = await apiClient.put('/subscriptions/reject', { requestId, reason });
    return response.data;
  },

  // Extend subscription
  extendSubscription: async (businessId: string) => {
    const response = await apiClient.post(`/subscriptions/extend/${businessId}`);
    return response.data;
  },

  // Get subscription stats
  getStats: async (): Promise<SubscriptionStats> => {
    const response = await apiClient.get('/subscriptions/stats');
    return response.data;
  },
};