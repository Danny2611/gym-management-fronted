// services/workoutService.ts
import { apiClient } from "./api";
import {
  MonthComparison,
  RecentWorkoutLog,
  TrainingLocationsResponse,
  WeeklyWorkout,
  WorkoutSchedule,
  WorkoutScheduleNextWeek,
  WorkoutSuggestion,
} from "~/types/workout";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: any[];
}

export interface WorkoutSuggestionParams {
  muscleGroup: string;
  goal:
    | "weight_loss"
    | "muscle_gain"
    | "endurance"
    | "strength"
    | "flexibility";
  level: "beginner" | "intermediate" | "advanced";
  equipment: "bodyweight" | "dumbbell" | "barbell" | "machine" | "mixed";
}

export interface CreateWorkoutScheduleParams {
  date: string;
  timeStart: string;
  duration: number;
  muscle_groups: string[];
  location: string;
  notes?: string;
  exercises?: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }>;
  workout_suggestion_id?: string;
}

export interface WorkoutScheduleFilters {
  startDate?: string;
  endDate?: string;
  status?: "upcoming" | "completed" | "missed";
}

export const workoutService = {
  getMemberTrainingLocations: async (): Promise<TrainingLocationsResponse> => {
    try {
      const response = await apiClient.get(`/api/user/training-locations`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách địa điểm tập luyện",
        count: 0,
        data: [],
        errors: [error],
      };
    }
  },

  //Lấy gợi ý bài tập dựa trên thông số
  getWorkoutSuggestions: async (
    params: WorkoutSuggestionParams,
  ): Promise<ApiResponse<WorkoutSuggestion>> => {
    try {
      const response = await apiClient.post(
        "/api/user/workout/suggestions",
        params,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy gợi ý bài tập",
        errors: [error],
      };
    }
  },

  //Tạo lịch tập cá nhân mới
  createWorkoutSchedule: async (
    scheduleData: CreateWorkoutScheduleParams,
  ): Promise<ApiResponse<WorkoutSchedule>> => {
    try {
      const response = await apiClient.post(
        "/api/user/workout/schedules",
        scheduleData,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tạo lịch tập cá nhân",
        errors: [error],
      };
    }
  },

  //Lấy danh sách lịch tập của member
  getMemberWorkoutSchedules: async (
    filters: WorkoutScheduleFilters = {},
  ): Promise<ApiResponse<WorkoutSchedule[]>> => {
    try {
      // Tạo query params từ filters
      const params = new URLSearchParams();

      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }

      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      if (filters.status) {
        params.append("status", filters.status);
      }

      const response = await apiClient.get(
        `/api/user/workout/schedules?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách lịch tập",
        errors: [error],
      };
    }
  },

  //Lấy chi tiết một lịch tập
  getWorkoutScheduleById: async (
    scheduleId: string,
  ): Promise<ApiResponse<WorkoutSchedule>> => {
    try {
      const response = await apiClient.get(
        `/api/user/workout/schedules/${scheduleId}`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy chi tiết lịch tập",
        errors: [error],
      };
    }
  },

  //Cập nhật trạng thái lịch tập
  updateWorkoutScheduleStatus: async (
    scheduleId: string,
    status: "completed" | "missed",
  ): Promise<ApiResponse<WorkoutSchedule>> => {
    try {
      const response = await apiClient.patch(
        `/api/user/workout/schedules/${scheduleId}/status`,
        { status },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể cập nhật trạng thái lịch tập",
        errors: [error],
      };
    }
  },
  getWeeklyWorkoutStats: async (): Promise<ApiResponse<WeeklyWorkout[]>> => {
    try {
      const response = await apiClient.get("/api/user/workout/weekly");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê tập luyện tuần",
        errors: [error],
      };
    }
  },

  getMonthComparisonStats: async (): Promise<ApiResponse<MonthComparison>> => {
    try {
      const response = await apiClient.get(
        "/api/user/workout/monthly-comparison",
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê so sánh tháng",
        errors: [error],
      };
    }
  },
  getLast7DaysWorkouts: async (): Promise<ApiResponse<RecentWorkoutLog[]>> => {
    try {
      const response = await apiClient.get("/api/user/workout/last-7-days");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê so sánh tháng",
        errors: [error],
      };
    }
  },

  getUpcomingWorkouts: async (): Promise<
    ApiResponse<WorkoutScheduleNextWeek[]>
  > => {
    try {
      const response = await apiClient.get("/api/user/workout/next-week");
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
