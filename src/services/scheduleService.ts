// services/appointmentService.ts
import { apiClient } from "./api";
import { Appointment } from "~/types/appointment";
import { Trainer } from "~/types/trainer";

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: any[];
  isAvailable?: boolean;
}

export interface CreateAppointmentParams {
  trainer_id: string;
  membership_id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
}

export interface AppointmentFilter {
  status?: "upcoming" | "completed" | "missed"; // Frontend statuses
  startDate?: string;
  endDate?: string;
  trainerId?: string;
  timeSlot?: string;
}

export interface MemberSchedule {
  id: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  location: string;
  notes: string;
  package_name: string;
  trainer_name: string | null;
  trainer_id: string | null;
  trainer_image: string | null;
  status: "upcoming" | "completed" | "missed";
}

export const secheduleService = {
  /**
   * Lấy lịch tập của thành viên
   * @param filters - Các tùy chọn lọc kết quả
   * @returns Danh sách lịch tập
   */
  getMemberSchedule: async (
    filters: AppointmentFilter = {},
  ): Promise<ApiResponse<MemberSchedule[]>> => {
    try {
      // Xây dựng query parameters từ filters
      const params = new URLSearchParams();

      if (filters.status) {
        params.append("status", filters.status);
      }

      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }

      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      if (filters.trainerId) {
        params.append("trainerId", filters.trainerId);
      }

      if (filters.timeSlot) {
        params.append("timeSlot", filters.timeSlot);
      }

      const response = await apiClient.get(
        `/api/user/my-schedule?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy lịch tập",
        data: [],
        errors: [error],
      };
    }
  },
};
