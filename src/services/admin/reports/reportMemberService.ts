// src/services/admin/reports/reportService.ts
import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "~/services/api";
import {
  ComprehensiveMemberReport,
  MemberStatsOptions,
  MemberStatsResponse,
} from "~/types/memberReport";

export const reportMemberService = {
  /**
   * Lấy báo cáo doanh thu theo gói dịch vụ
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
        message: "Không thể  Lấy thống kê thành viên cơ bản",
        errors: [error],
      };
    }
  },

  getComprehensiveMemberReport: async (
    options: MemberStatsOptions = {},
  ): Promise<ApiResponse<ComprehensiveMemberReport>> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/members/comprehensive",
        {
          params: options,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể  Lấy thống kê thành viên cơ bản",
        errors: [error],
      };
    }
  },
  /**
   * Tải báo cáo thành viên dưới dạng Excel
   */
  exportToExcel: async (): Promise<Blob | null> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/members/export/excel",
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

  /**
   * Tải báo cáo thành viên dưới dạng PDF
   */
  exportToPDF: async (): Promise<Blob | null> => {
    try {
      const response = await apiClient.get(
        "/api/admin/reports/members/export/pdf",
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

export default reportMemberService;
