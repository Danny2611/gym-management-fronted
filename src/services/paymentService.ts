// src/services/paymentService.ts
import { apiClient } from "./api";

interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    paymentId: string;
    payUrl: string;
    amount: number;
    transactionId: string;
    expireTime: number;
  };
  errors?: any[];
}

interface PaymentStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    status: "pending" | "completed" | "failed";
    paymentMethod: string;
    amount: number;
    transactionId: string;
    created_at: string;
    membership?: any;
  };
  errors?: any[];
}

interface RegisterPackageResponse {
  success: boolean;
  message?: string;
  data?: {
    packageId: string;
    packageName: string;
    price: number;
    duration: number;
    category: string;
  };
  errors?: any[];
}

export const paymentService = {
  /**
   * Đăng ký gói tập
   * @param packageId - ID của gói tập
   */
  registerPackage: async (
    packageId: string,
    // userId: string,
  ): Promise<RegisterPackageResponse> => {
    try {
      const response = await apiClient.post("/api/user/packages/register", {
        packageId,
        //  userId,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi đăng ký gói tập",
        errors: [error],
      };
    }
  },

  /**
   * Tạo yêu cầu thanh toán qua MoMo
   * @param packageId - ID của gói tập
   */
  createMoMoPayment: async (packageId: string): Promise<PaymentResponse> => {
    try {
      const response = await apiClient.post("/api/user/momo/create", {
        packageId,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi tạo thanh toán",
        errors: [error],
      };
    }
  },

  /**
   * Kiểm tra trạng thái thanh toán
   * @param paymentId - ID của thanh toán
   */
  getPaymentStatus: async (
    paymentId: string,
  ): Promise<PaymentStatusResponse> => {
    try {
      const response = await apiClient.get(
        `/api/user/payments/${paymentId}/status`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Lỗi khi kiểm tra trạng thái thanh toán",
        errors: [error],
      };
    }
  },
};
