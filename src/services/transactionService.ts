// # API liên quan đến giao dịch
// src/services/transactionService.ts
import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "./api";
import {
  RecentTransactionDTO,
  Transaction,
  TransactionDetail,
  TransactionFilters,
} from "~/types/transaction";

export const transactionService = {
  /**
   * Lấy danh sách lịch sử giao dịch của hội viên
   * @param filters Các bộ lọc cho giao dịch
   * @returns Danh sách giao dịch đã lọc
   */
  getAllTransactions: async (
    filters: TransactionFilters = {},
  ): Promise<ApiResponse<Transaction[]>> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }

      if (filters.paymentMethod && filters.paymentMethod !== "all") {
        queryParams.append("paymentMethod", filters.paymentMethod);
      }

      if (filters.startDate) {
        queryParams.append("startDate", filters.startDate);
      }

      if (filters.endDate) {
        queryParams.append("endDate", filters.endDate);
      }

      const response = await apiClient.get(
        `/api/user/transactions?${queryParams.toString()}`,
      );

      // Process dates
      if (response.data.success && response.data.data) {
        const transactions = response.data.data.map((transaction: any) => ({
          ...transaction,
          created_at: new Date(transaction.created_at),
          updated_at: new Date(transaction.updated_at),
        }));

        return {
          ...response.data,
          data: transactions,
        };
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tải lịch sử giao dịch",
        errors: [error],
      };
    }
  },

  getRecentSuccessfulTransactions: async (): Promise<
    ApiResponse<RecentTransactionDTO[]>
  > => {
    try {
      const response = await apiClient.get("/api/user/transaction/success");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy lịch tập tuần sau",
        errors: [error],
      };
    }
  },

  /**
   * Lấy chi tiết của một giao dịch cụ thể
   * @param transactionId ID của giao dịch cần xem chi tiết
   * @returns Chi tiết giao dịch
   */
  getTransactionById: async (
    transactionId: string,
  ): Promise<ApiResponse<TransactionDetail>> => {
    try {
      const response = await apiClient.post("/api/user/transaction-details", {
        transactionId,
      });

      // Process dates
      if (response.data.success && response.data.data) {
        const transaction = response.data.data;

        return {
          ...response.data,
          data: {
            ...transaction,
            created_at: new Date(transaction.created_at),
            updated_at: new Date(transaction.updated_at),
          },
        };
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tải chi tiết giao dịch",
        errors: [error],
      };
    }
  },
};
