export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SUPPORT";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  userType: "individual" | "business";
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  business?: {
    id: string;
    subscriptionStatus: string;
    subscriptionExpiry?: string;
  };
}

export interface Business {
  id: string;
  name: string;
  businessType?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  userId: string;
  user?: User;
  createdAt: string;
  _count?: {
    sentConnections: number;
    receivedConnections: number;
    sentOrders: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  isCash: boolean;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  notes?: string;
  sender: Pick<Business, "id" | "name">;
  receiver: Pick<Business, "id" | "name">;
  items?: OrderItem[];
  transactions?: Transaction[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: string;
  total: string;
  unit?: string;
}

export interface Transaction {
  id: string;
  transactionType: "PAYMENT" | "SALE" | "PURCHASE" | "ADJUSTMENT";
  amount: string;
  senderId: string;
  receiverId: string;
  orderId?: string;
  note?: string;
  sender: Pick<Business, "id" | "name">;
  receiver: Pick<Business, "id" | "name">;
  order?: Pick<Order, "id" | "orderNumber">;
  createdAt: string;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  connectionType: "CUSTOMER" | "SUPPLIER";
  requester: Pick<Business, "id" | "name">;
  receiver: Pick<Business, "id" | "name">;
  account?: Account;
  createdAt: string;
}

export interface Account {
  id: string;
  connectionId: string;
  balance: string;
  totalCredit: string;
  totalDebit: string;
  creditLimit: string;
  billingCycle?: string;
  currency: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  user?: Pick<User, "id" | "fullName" | "email">;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: string;
  description: string;
  date: string;
  userId: string;
  user: Pick<User, "id" | "fullName" | "phoneNumber">;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  userId: string;
  content: string;
  whatsapp?: string;
  status: "OPEN" | "REVIEWED" | "CLOSED";
  createdAt: string;
  user: Pick<User, "id" | "fullName" | "email" | "phoneNumber" | "userType"> & {
    business?: { name: string };
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  totalOrders: number;
  totalRevenue: string;
  ordersByStatus: { status: string; _count: number }[];
  monthlyRevenue: { month: string; total: string }[];
  recentOrders: Order[];
  recentTransactions: Transaction[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FinancialReport {
  totalRevenue: string;
  totalOrderValue: string;
  totalReceivable: string;
  totalPayable: string;
  netBalance: string;
}