// services/appoinmentService.ts
import { Schedule } from "~/types/schedule";
import { apiClient } from "./api";
import { Appointment, UpcomingAppointment } from "~/types/appointment";

interface ApiResponse<T> {
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
  status?: "confirmed" | "pending" | "cancelled";
  startDate?: string;
  endDate?: string;
}

export interface MemberScheduleFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  trainerId?: string;
  timeSlot?: string;
}

export interface AppointmentListFilter {
  status?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface AppointmentItem {
  id: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  status: "confirmed" | "pending" | "cancelled" | "completed" | "missed";
  trainer: {
    id: string;
    name: string;
    image: string;
    specialization: string;
  };
  package_name?: string;
}

// Interface cho thông tin đổi lịch
export interface RescheduleAppointmentParams {
  appointmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
}
export const appointmentService = {
  /**
   * Tạo lịch hẹn mới với PT
   * @param appointmentData - Thông tin lịch hẹn cần tạo
   * @returns Thông tin lịch hẹn đã tạo
   */
  createAppointment: async (
    appointmentData: CreateAppointmentParams,
  ): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await apiClient.post(
        "/api/user/appointments",
        appointmentData,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tạo lịch hẹn",
        errors: [error],
      };
    }
  },

  // Lấy danh sách lịch hẹn đã xác nhận
  getMemberSchedule: async (
    filters: MemberScheduleFilters = {},
  ): Promise<ApiResponse<Schedule[]>> => {
    try {
      // Tạo query params từ filters
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
        errors: [error],
      };
    }
  },

  getAllMemberAppointments: async (
    filters: AppointmentListFilter = {},
  ): Promise<ApiResponse<AppointmentItem[]>> => {
    try {
      // Build query params from filters
      const params = new URLSearchParams();

      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }

      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      if (filters.searchTerm) {
        params.append("searchTerm", filters.searchTerm);
      }

      const response = await apiClient.get(
        `/api/user/appointments?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách lịch hẹn",
        errors: [error],
      };
    }
  },

  cancelAppointment: async (
    appointmentId: string,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.delete(
        `/api/user/${appointmentId}/cancel`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể hủy lịch hẹn",
        errors: [error],
      };
    }
  },

  completeAppointment: async (
    appointmentId: string,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.put(
        `/api/user/${appointmentId}/complete`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể đánh dấu hoàn thành lịch hẹn",
        errors: [error],
      };
    }
  },

  getAppointmentById: async (
    appointmentId: string,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get(
        `/api/user/appointments/${appointmentId}`,
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

  rescheduleAppointment: async (
    rescheduleData: RescheduleAppointmentParams,
  ): Promise<ApiResponse<any>> => {
    try {
      const { appointmentId, ...updateData } = rescheduleData;
      const response = await apiClient.put(
        `/api/user/${appointmentId}/reschedule`,
        updateData,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể đổi lịch hẹn",
        errors: [error],
      };
    }
  },

  getUpcomingAppointment: async (): Promise<
    ApiResponse<UpcomingAppointment[]>
  > => {
    try {
      const response = await apiClient.get("/api/user/appointments/next-week");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy lịch tập tuần sau",
        errors: [error],
      };
    }
  },
};
