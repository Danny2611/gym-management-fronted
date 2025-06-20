// src/services/admin/reportService.ts
import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "../api";

// Types for report data
export interface ReportDateRange {
  startDate?: string;
  endDate?: string;
}

export interface RevenueReportOptions extends ReportDateRange {
  groupBy?: "day" | "week" | "month" | "year";
  packageId?: string;
  category?: "basic" | "fitness" | "premium" | "platinum" | "vip";
}

export interface MemberStatsOptions extends ReportDateRange {
  groupBy?: "day" | "week" | "month" | "year";
  status?: "active" | "inactive" | "pending" | "banned";
}

export interface RevenueByPackageResponse {
  packageId: string;
  packageName: string;
  category: string;
  totalRevenue: number;
  totalSales: number;
  averageRevenue: number;
}

export interface RevenueTimeSeriesResponse {
  period: string;
  totalRevenue: number;
  totalSales: number;
  packages: {
    packageId: string;
    packageName: string;
    revenue: number;
    sales: number;
  }[];
}

export interface MemberStatsResponse {
  period: string;
  totalMembers: number;
  newMembers: number;
  expiredMembers: number;
  activeMembers: number;
  inactiveMembers: number;
}

export interface DashboardStatsResponse {
  totalRevenue: number;
  totalMembers: number;
  activeMembers: number;
  expiredMemberships: number;
  revenueGrowth: number;
  memberGrowth: number;
  topPackages: {
    packageId: string;
    packageName: string;
    revenue: number;
    memberCount: number;
  }[];
  recentPayments: {
    paymentId: string;
    memberName: string;
    packageName: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
}

export interface AdvancedAnalyticsResponse {
  memberRetentionRate: number;
  averageLifetimeValue: number;
  churnRate: number;
  packagePopularity: {
    packageName: string;
    percentage: number;
    memberCount: number;
  }[];
  revenueByPaymentMethod: {
    method: string;
    revenue: number;
    percentage: number;
  }[];
}

export const reportService = {
  /**
   * Lấy báo cáo doanh thu theo gói dịch vụ
   */
  getRevenueByPackages: async (
    options: RevenueReportOptions = {},
  ): Promise<ApiResponse<RevenueByPackageResponse[]>> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/revenue/by-packages",
        {
          params: options,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy báo cáo doanh thu theo gói dịch vụ",
        errors: [error],
      };
    }
  },

  /**
   * Lấy báo cáo doanh thu theo thời gian
   */
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
        message: "Không thể lấy báo cáo doanh thu theo thời gian",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thống kê thành viên
   */
  getMemberStats: async (
    options: MemberStatsOptions = {},
  ): Promise<ApiResponse<MemberStatsResponse[]>> => {
    try {
      const response = await apiClient.get("/api/admin/reports/members/stats", {
        params: options,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê thành viên",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thống kê tổng hợp cho dashboard
   */
  getDashboardStats: async (
    dateRange?: ReportDateRange,
  ): Promise<ApiResponse<DashboardStatsResponse>> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/dashboard/stats",
        {
          params: dateRange,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê dashboard",
        errors: [error],
      };
    }
  },

  /**
   * Lấy phân tích nâng cao
   */
  getAdvancedAnalytics: async (
    dateRange?: ReportDateRange,
  ): Promise<ApiResponse<AdvancedAnalyticsResponse>> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/advanced-analytics",
        {
          params: dateRange,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy phân tích nâng cao",
        errors: [error],
      };
    }
  },

  /**
   * Xuất báo cáo doanh thu ra Excel
   */
  exportRevenueToExcel: async (
    options: RevenueReportOptions = {},
  ): Promise<{ success: boolean; blob?: Blob; message?: string }> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/revenue/export/excel",
        {
          params: options,
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      return {
        success: true,
        blob,
      };
    } catch (error) {
      return {
        success: false,
        message: "Không thể xuất báo cáo doanh thu ra Excel",
      };
    }
  },

  /**
   * Xuất thống kê thành viên ra Excel
   */
  exportMemberStatsToExcel: async (
    options: MemberStatsOptions = {},
  ): Promise<{ success: boolean; blob?: Blob; message?: string }> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/members/export/excel",
        {
          params: options,
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      return {
        success: true,
        blob,
      };
    } catch (error) {
      return {
        success: false,
        message: "Không thể xuất thống kê thành viên ra Excel",
      };
    }
  },

  /**
   * Xuất báo cáo doanh thu ra PDF
   */
  exportRevenueToPDF: async (
    options: RevenueReportOptions = {},
  ): Promise<{ success: boolean; blob?: Blob; message?: string }> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/revenue/export/pdf",
        {
          params: options,
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      return {
        success: true,
        blob,
      };
    } catch (error) {
      return {
        success: false,
        message: "Không thể xuất báo cáo doanh thu ra PDF",
      };
    }
  },

  /**
   * Xuất thống kê thành viên ra PDF
   */
  exportMemberStatsToPDF: async (
    options: MemberStatsOptions = {},
  ): Promise<{ success: boolean; blob?: Blob; message?: string }> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/members/export/pdf",
        {
          params: options,
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      return {
        success: true,
        blob,
      };
    } catch (error) {
      return {
        success: false,
        message: "Không thể xuất thống kê thành viên ra PDF",
      };
    }
  },

  /**
   * Tải file xuất về
   */
  downloadFile: (blob: Blob, filename: string, fileType: "excel" | "pdf") => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const extension = fileType === "excel" ? ".xlsx" : ".pdf";
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `${filename}_${timestamp}${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Xuất và tải báo cáo doanh thu Excel
   */
  downloadRevenueExcel: async (options: RevenueReportOptions = {}) => {
    const result = await reportService.exportRevenueToExcel(options);
    if (result.success && result.blob) {
      reportService.downloadFile(result.blob, "bao_cao_doanh_thu", "excel");
      return { success: true, message: "Đã tải xuống báo cáo doanh thu Excel" };
    }
    return { success: false, message: result.message };
  },

  /**
   * Xuất và tải thống kê thành viên Excel
   */
  downloadMemberStatsExcel: async (options: MemberStatsOptions = {}) => {
    const result = await reportService.exportMemberStatsToExcel(options);
    if (result.success && result.blob) {
      reportService.downloadFile(result.blob, "thong_ke_thanh_vien", "excel");
      return {
        success: true,
        message: "Đã tải xuống thống kê thành viên Excel",
      };
    }
    return { success: false, message: result.message };
  },

  /**
   * Xuất và tải báo cáo doanh thu PDF
   */
  downloadRevenuePDF: async (options: RevenueReportOptions = {}) => {
    const result = await reportService.exportRevenueToPDF(options);
    if (result.success && result.blob) {
      reportService.downloadFile(result.blob, "bao_cao_doanh_thu", "pdf");
      return { success: true, message: "Đã tải xuống báo cáo doanh thu PDF" };
    }
    return { success: false, message: result.message };
  },

  /**
   * Xuất và tải thống kê thành viên PDF
   */
  downloadMemberStatsPDF: async (options: MemberStatsOptions = {}) => {
    const result = await reportService.exportMemberStatsToPDF(options);
    if (result.success && result.blob) {
      reportService.downloadFile(result.blob, "thong_ke_thanh_vien", "pdf");
      return { success: true, message: "Đã tải xuống thống kê thành viên PDF" };
    }
    return { success: false, message: result.message };
  },
};

export default reportService;
