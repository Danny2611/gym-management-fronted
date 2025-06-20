// src/services/admin/promotionService.ts
import { apiClient } from "../api";
import { ApiResponse } from "~/types/ApiResponse";
import {
  CreatePromotionData,
  PromotionEffectiveness,
  PromotionQueryOptions,
  PromotionResponse,
  PromotionStat,
  UpdatePromotionData,
} from "~/types/promotion";

export const promotionService = {
  /**
   * Lấy danh sách chương trình khuyến mãi (có phân trang, lọc, sắp xếp)
   */
  getAllPromotions: async (
    params: PromotionQueryOptions = {},
  ): Promise<
    ApiResponse<{
      promotions: PromotionResponse[];
      totalPromotions: number;
      totalPages: number;
      currentPage: number;
    }>
  > => {
    try {
      const response = await apiClient.get("/api/admin/promotions", { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách chương trình khuyến mãi",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thông tin chi tiết một chương trình khuyến mãi theo ID
   */
  getPromotionById: async (
    id: string,
  ): Promise<ApiResponse<PromotionResponse>> => {
    try {
      const response = await apiClient.get(`/api/admin/promotions/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thông tin chương trình khuyến mãi",
        errors: [error],
      };
    }
  },

  /**
   * Tạo mới một chương trình khuyến mãi
   */
  createPromotion: async (
    data: CreatePromotionData,
  ): Promise<ApiResponse<PromotionResponse>> => {
    try {
      const response = await apiClient.post("/api/admin/promotions", data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tạo chương trình khuyến mãi",
        errors: [error],
      };
    }
  },

  /**
   * Cập nhật một chương trình khuyến mãi theo ID
   */
  updatePromotion: async (
    id: string,
    data: Partial<UpdatePromotionData>,
  ): Promise<ApiResponse<PromotionResponse>> => {
    try {
      const response = await apiClient.put(`/api/admin/promotions/${id}`, data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể cập nhật chương trình khuyến mãi",
        errors: [error],
      };
    }
  },

  /**
   * Xóa một chương trình khuyến mãi theo ID
   */
  deletePromotion: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/api/admin/promotions/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể xóa chương trình khuyến mãi",
        errors: [error],
      };
    }
  },

  /**
   * Lấy hiệu quả của một chương trình khuyến mãi
   */
  getPromotionEffectiveness: async (
    id: string,
  ): Promise<ApiResponse<PromotionEffectiveness>> => {
    try {
      const response = await apiClient.get(
        `/api/admin/promotions/${id}/effectiveness`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy hiệu quả khuyến mãi",
        errors: [error],
      };
    }
  },

  /**
   * Lấy danh sách khuyến mãi đang hoạt động theo gói
   */
  getActivePromotionsForPackage: async (
    packageId: string,
  ): Promise<ApiResponse<PromotionResponse[]>> => {
    try {
      const response = await apiClient.get(
        `/api/admin/promotions/package/${packageId}`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy khuyến mãi đang hoạt động cho gói",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thống kê chương trình khuyến mãi
   */
  getPromotionStats: async (): Promise<ApiResponse<PromotionStat>> => {
    try {
      const response = await apiClient.get("/api/admin/promotions/stats");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê chương trình khuyến mãi",
        errors: [error],
      };
    }
  },

  /**
   * Cập nhật trạng thái chương trình khuyến mãi (cho cron job)
   */
  updatePromotionStatuses: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.patch(
        "/api/admin/promotions/update-statuses",
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể cập nhật trạng thái chương trình khuyến mãi",
        errors: [error],
      };
    }
  },
};
