// Define types
export interface Member {
  _id: string;
  name: string;
  image: string;
}

export interface Package {
  _id: string;
  category: string;
  description: string;
  duration: number;
  name: string;
  price: number;
}

export interface MomoPaymentInfo {
  requestId: String;
  payUrl: String; // optional, lúc callback có thể không có
  orderId: String;
  partnerCode: String;
  amount: Number;
  orderInfo: String;
  orderType: String;
  transId: Number;
  resultCode: Number;
  message: String;
  payType: String;
  responseTime: Number;
  extraData: String;
  signature: String;
}

export type PaymentInfo = MomoPaymentInfo | Record<string, never>;

export type PaymentMethod = "qr" | "credit" | "napas" | "undefined";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export interface Transaction {
  _id: string;
  member_id: Member;
  package_id: Package;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  packageName: string;
  amount: number;
  transactionId: string;
  paymentInfo: PaymentInfo;
  date: Date;
  updated_at: Date;
}

export interface TransactionDetail {
  _id: string;
  member_id: Member;
  package_id: Package;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentInfo: PaymentInfo;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionFilters {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export interface RecentTransactionDTO {
  amount: number;
  created_at: Date;
  packageName: string | null;
}
