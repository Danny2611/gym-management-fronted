//services/admin/trainerServices
import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "../api";
import {
  ISchedule,
  IWorkingHours,
  Trainer,
  TrainerAvailability,
  TrainerCreateUpdateData,
  TrainerQueryParams,
  TrainerStats,
} from "~/types/trainer";

export const trainerService = {
  /**
   * Lấy danh sách tất cả huấn luyện viên (có phân trang, lọc và sắp xếp)
   */
  getAllTrainers: async (
    params: TrainerQueryParams = {},
  ): Promise<
    ApiResponse<{
      trainers: Trainer[];
      totalTrainers: number;
      totalPages: number;
      currentPage: number;
    }>
  > => {
    try {
      const response = await apiClient.get("/api/admin/trainers", { params });
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
   * Lấy thông tin huấn luyện viên theo ID
   */
  getTrainerById: async (id: string): Promise<ApiResponse<Trainer>> => {
    try {
      const response = await apiClient.get(`/api/admin/trainers/${id}`);
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
   * Tạo huấn luyện viên mới
   */
  createTrainer: async (
    data: TrainerCreateUpdateData,
  ): Promise<ApiResponse<Trainer>> => {
    try {
      const response = await apiClient.post("/api/admin/trainers", data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tạo huấn luyện viên mới",
        errors: [error],
      };
    }
  },

  /**
   * Cập nhật thông tin huấn luyện viên
   */
  updateTrainer: async (
    id: string,
    data: Partial<TrainerCreateUpdateData>,
  ): Promise<ApiResponse<Trainer>> => {
    try {
      const response = await apiClient.put(`/api/admin/trainers/${id}`, data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể cập nhật thông tin huấn luyện viên",
        errors: [error],
      };
    }
  },

  /**
   * Xoá huấn luyện viên
   */
  deleteTrainer: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await apiClient.delete(`/api/admin/trainers/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể xoá huấn luyện viên",
        errors: [error],
      };
    }
  },

  toggleTrainerStatus: async (id: string): Promise<ApiResponse<Trainer>> => {
    try {
      const response = await apiClient.patch(
        `/api/admin/trainers/${id}/status`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể thay đổi trạng thái trainer",
        errors: [error],
      };
    }
  },
  /**
   * Cập nhật lịch làm việc của huấn luyện viên
   */
  updateTrainerSchedule: async (
    id: string,
    schedule: ISchedule[],
  ): Promise<ApiResponse<Trainer>> => {
    try {
      const response = await apiClient.patch(
        `/api/admin/trainers/${id}/schedule`,
        { schedule },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể cập nhật lịch làm việc",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thông tin về khả dụng của huấn luyện viên trong khoảng thời gian
   */
  getTrainerAvailability: async (
    id: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    ApiResponse<{
      trainer: Trainer;
      availableDates: TrainerAvailability[];
    }>
  > => {
    try {
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      const response = await apiClient.get(
        `/api/admin/trainers/${id}/availability`,
        { params },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thông tin lịch trống của huấn luyện viên",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thống kê về huấn luyện viên
   */
  getTrainerStats: async (): Promise<ApiResponse<TrainerStats>> => {
    try {
      const response = await apiClient.get("/api/admin/trainers/stats");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê huấn luyện viên",
        errors: [error],
      };
    }
  },
};
