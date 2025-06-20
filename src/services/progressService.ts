// src/services/progressService.ts

import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "./api";
import {
  BodyMetricsChange,
  BodyMetricsComparison,
  BodyStats,
  BodyStatsProgress,
  FitnessRadarData,
  Progress,
  UpdateBodyMetricsParams,
} from "~/types/progress";

export const progressService = {
  // Lấy chỉ số cơ thể mới nhất
  getLatestBodyMetrics: async (): Promise<ApiResponse<Progress>> => {
    try {
      const response = await apiClient.get("/api/user/progress/metrics/latest");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy chỉ số cơ thể mới nhất",
        errors: [error],
      };
    }
  },

  // Lấy chỉ số cơ thể ban đầu
  getInitialBodyMetrics: async (): Promise<ApiResponse<Progress>> => {
    try {
      const response = await apiClient.get(
        "/api/user/progress/metrics/initial",
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy chỉ số cơ thể ban đầu",
        errors: [error],
      };
    }
  },

  // Lấy chỉ số cơ thể tháng trước
  getPreviousMonthBodyMetrics: async (): Promise<ApiResponse<Progress>> => {
    try {
      const response = await apiClient.get(
        "/api/user/progress/metrics/previous-month",
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy chỉ số cơ thể tháng trước",
        errors: [error],
      };
    }
  },

  // Lấy so sánh chỉ số cơ thể
  getBodyMetricsComparison: async (): Promise<
    ApiResponse<BodyMetricsComparison>
  > => {
    try {
      const response = await apiClient.get(
        "/api/user/progress/metrics/comparison",
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy so sánh chỉ số cơ thể",
        errors: [error],
      };
    }
  },

  // Cập nhật chỉ số cơ thể
  updateBodyMetrics: async (
    params: UpdateBodyMetricsParams,
  ): Promise<ApiResponse<BodyStats>> => {
    try {
      const response = await apiClient.post(
        "/api/user/progress/metrics",
        params,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể cập nhật chỉ số cơ thể",
        errors: [error],
      };
    }
  },

  // Lấy tiến độ chỉ số cơ thể theo tháng
  getBodyStatsProgressByMonth: async (
    months: number = 6,
  ): Promise<ApiResponse<BodyStatsProgress[]>> => {
    try {
      const response = await apiClient.get(
        `/api/user/progress/stats/monthly?months=${months}`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy tiến độ chỉ số cơ thể theo tháng",
        errors: [error],
      };
    }
  },

  // Lấy dữ liệu radar thể lực
  getFitnessRadarData: async (): Promise<ApiResponse<FitnessRadarData[]>> => {
    try {
      const response = await apiClient.get("/api/user/progress/radar");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy dữ liệu radar thể lực",
        errors: [error],
      };
    }
  },

  // Tính toán thay đổi chỉ số cơ thể
  calculateBodyMetricsChange: async (): Promise<
    ApiResponse<BodyMetricsChange>
  > => {
    try {
      const response = await apiClient.get(
        "/api/user/progress/metrics/changes",
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tính toán thay đổi chỉ số cơ thể",
        errors: [error],
      };
    }
  },

  // Tiện ích: Tính phần trăm thay đổi giữa hai giá trị
  calculatePercentChange: (current: number, previous: number): string => {
    if (previous === 0) return "0";
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  },

  getMonthlyBodyMetrics: async (): Promise<
    ApiResponse<BodyStatsProgress[]>
  > => {
    try {
      const response = await apiClient.get(
        "/api/user/progress/monthly-body-metrics",
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy tiến độ chỉ số cơ thể theo tháng",
        errors: [error],
      };
    }
  },
};
