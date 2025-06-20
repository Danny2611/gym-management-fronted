// services/trainerServices.ts
import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "./api";
import { PromotionResponse } from "~/types/promotion";

export const promotionService = {
  /**
   * Lấy danh sách tất cả huấn luyện viên
   */
  getAllActivePromotions: async (): Promise<
    ApiResponse<PromotionResponse[]>
  > => {
    try {
      const response = await apiClient.get("/api/public/promotions");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách huấn luyện viên",
        errors: [error],
      };
    }
  },
};
