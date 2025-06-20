// src/services/admin/reports/reportService.ts
import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "~/services/api";
import {
  AdvancedAnalyticsResponse,
  ComprehensiveRevenueReport,
  ReportDateRange,
  RevenueByPackageResponse,
  RevenueReportOptions,
  RevenueTimeSeriesResponse,
} from "~/types/revenueReport";

export const revenueReportService = {
  /**
   * Lấy báo cáo doanh thu theo gói dịch vụ
   */
  getRevenueByPackages: async (
    options: RevenueReportOptions = {},
  ): Promise<ApiResponse<RevenueByPackageResponse[]>> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/revenue/packages",
        {
          params: options,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể  Lấy thống kê doanh thu theo gói",
        errors: [error],
      };
    }
  },

  getRevenueTimeSeries: async (
    options: RevenueReportOptions = {},
  ): Promise<ApiResponse<RevenueTimeSeriesResponse[]>> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/revenue/time-series",
        {
          params: options,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể  Lấy thống kê doanh thu theo thời gian",
        errors: [error],
      };
    }
  },

  getAdvancedAnalytics: async (
    dateRange: ReportDateRange = {},
  ): Promise<ApiResponse<AdvancedAnalyticsResponse>> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/revenue/analytics",
        {
          params: dateRange,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể  lấy phân tích doanh thu",
        errors: [error],
      };
    }
  },

  getComprehensiveRevenueReport: async (
    options: RevenueReportOptions = {},
  ): Promise<ApiResponse<ComprehensiveRevenueReport>> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/revenue/comprehensive",
        {
          params: options,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể  lấy Báo cáo tổng hợp",
        errors: [error],
      };
    }
  },

  exportRevenueReportToExcel: async (): Promise<Blob | null> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/revenue/export/excel",
        {
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tải Excel:", error);
      return null;
    }
  },

  exportRevenueReportToPDF: async (): Promise<Blob | null> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/revenue/export/pdf",
        {
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tải PDF:", error);
      return null;
    }
  },
};
