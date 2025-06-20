// services/trainerServices.ts
import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "./api";
import { Trainer } from "~/types/trainer";

export const trainerService = {
  /**
   * Lấy danh sách tất cả huấn luyện viên
   */
  getAllTrainers: async (): Promise<ApiResponse<Trainer[]>> => {
    try {
      const response = await apiClient.get("/api/public/trainers");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách huấn luyện viên",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thông tin chi tiết của huấn luyện viên theo ID
   * @param trainerId - ID của huấn luyện viên
   */
  getTrainerById: async (trainerId: string): Promise<ApiResponse<Trainer>> => {
    try {
      const response = await apiClient.get(`/api/public/trainers/${trainerId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thông tin huấn luyện viên",
        errors: [error],
      };
    }
  },

  /**
   * Lấy danh sách huấn luyện viên theo chuyên môn
   * @param specialization - Chuyên môn của huấn luyện viên
   */
  getTrainersBySpecialization: async (
    specialization: string,
  ): Promise<ApiResponse<Trainer[]>> => {
    try {
      const response = await apiClient.get("/api/public/trainers", {
        params: { specialization },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách huấn luyện viên theo chuyên môn",
        errors: [error],
      };
    }
  },

  /**
   * Kiểm tra lịch làm việc của huấn luyện viên
   * @param trainerId - ID của huấn luyện viên
   */
  getTrainerSchedule: async (
    trainerId: string,
  ): Promise<ApiResponse<Trainer["schedule"]>> => {
    try {
      const response = await apiClient.get(
        `/api/public/trainers/${trainerId}/schedule`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy lịch làm việc của huấn luyện viên",
        errors: [error],
      };
    }
  },
};
