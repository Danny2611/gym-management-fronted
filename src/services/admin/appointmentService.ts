//services/admin/appointmentService

import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "../api";
import {
  Appointment,
  AppointmentQueryParams,
  AppointmentStats,
  AppointmentStatus,
} from "~/types/appointment";

export const appointmentService = {
  /**
   * Lấy danh sách tất cả lịch hẹn (có phân trang, lọc và sắp xếp)
   */
  getAllAppointments: async (
    params: AppointmentQueryParams = {},
  ): Promise<
    ApiResponse<{
      appointments: Appointment[];
      totalAppointments: number;
      totalPages: number;
      currentPage: number;
    }>
  > => {
    try {
      const response = await apiClient.get("/api/admin/appointments", {
        params,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách lịch hẹn",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thông tin lịch hẹn theo ID
   */
  getAppointmentById: async (
    appointmentId: string,
  ): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await apiClient.get(
        `/api/admin/appointments/${appointmentId}`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thông tin lịch hẹn",
        errors: [error],
      };
    }
  },

  /**
   * Cập nhật trạng thái lịch hẹn
   */
  updateAppointmentStatus: async (
    appointmentId: string,
    status: AppointmentStatus,
  ): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await apiClient.patch(
        `/api/admin/appointments/${appointmentId}/status`,
        { status },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể cập nhật trạng thái lịch hẹn",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thống kê lịch hẹn
   */
  getAppointmentStats: async (): Promise<ApiResponse<AppointmentStats>> => {
    try {
      const response = await apiClient.get("/api/admin/appointments/stats");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê lịch hẹn",
        errors: [error],
      };
    }
  },
};
