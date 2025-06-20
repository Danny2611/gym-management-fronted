export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";
export type PaymentMethod = "momo" | "cash" | "bank_transfer";

export interface Payment {
  _id?: string;
  member_id: string; // ObjectId dưới dạng string
  package_id: string; // ObjectId dưới dạng string
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentInfo?: any; // có thể khai báo kỹ hơn nếu biết rõ cấu trúc
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface PaymentResponse {
  _id: string;
  member: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  package: {
    _id: string;
    name: string;
    price: number;
    category: string;
    training_sessions: number;
  };
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod: "qr" | "credit" | "napas" | "undefined";
  transactionId?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod?: "qr" | "credit" | "napas" | "undefined";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export interface PaymentUpdateStatusData {
  status: "pending" | "completed" | "failed" | "cancelled";
  transactionId?: string;
}
export interface MonthlyRevenueData {
  count: number;
  month: Date;
  revenue: number;
}
export interface PaginatedPaymentData {
  payments: Payment[];
  totalPayments: number;
  totalPages: number;
  currentPage: number;
}

export interface PaymentStats {
  completedRevenue: number;
  totalRevenue: number;
  total: number;
  cancelled: number;
  completed: number;
  failed: number;
  pending: number;
  paymentMethods: ["credit", "napas", "qr", "undefined"];
  monthlyRevenue: MonthlyRevenueData[];
}
