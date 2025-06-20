import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "../api";
import {
  PaymentResponse,
  PaymentQueryParams,
  PaymentUpdateStatusData,
  PaginatedPaymentData,
  PaymentStats,
} from "~/types/payment";

export const paymentService = {
  /**
   * Lấy danh sách tất cả thanh toán (có phân trang, lọc, sắp xếp)
   */
  getAllPayments: async (
    params: PaymentQueryParams = {},
  ): Promise<ApiResponse<PaginatedPaymentData>> => {
    try {
      const response = await apiClient.get("/api/admin/payments", { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách thanh toán",
        errors: [error],
      };
    }
  },

  /**
   * Lấy chi tiết một thanh toán theo ID
   */
  getPaymentById: async (
    paymentId: string,
  ): Promise<ApiResponse<PaymentResponse>> => {
    try {
      const response = await apiClient.get(`/api/admin/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thông tin thanh toán",
        errors: [error],
      };
    }
  },

  /**
   * Cập nhật trạng thái thanh toán
   */
  updatePaymentStatus: async (
    paymentId: string,
    updateData: PaymentUpdateStatusData,
  ): Promise<ApiResponse<PaymentResponse>> => {
    try {
      const response = await apiClient.patch(
        `/api/admin/payments/${paymentId}/status`,
        updateData,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể cập nhật trạng thái thanh toán",
        errors: [error],
      };
    }
  },

  /**
   * Lấy danh sách thanh toán theo ID thành viên
   */
  getPaymentsByMemberId: async (
    memberId: string,
    params: PaymentQueryParams = {},
  ): Promise<ApiResponse<PaginatedPaymentData>> => {
    try {
      const response = await apiClient.get(
        `/api/admin/members/${memberId}/payments`,
        { params },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách thanh toán của hội viên",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thống kê thanh toán
   */
  getPaymentStats: async (): Promise<ApiResponse<PaymentStats>> => {
    try {
      const response = await apiClient.get("/api/admin/payments/statistics");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê thanh toán",
        errors: [error],
      };
    }
  },
};

export default paymentService;
