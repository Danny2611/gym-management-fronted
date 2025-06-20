// # API liên quan đến hội viên
// src/services/admin/membershipService.ts

import { MembershipQueryOptions, MembershipResponse } from "~/types/membership";
import { apiClient } from "../api";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

// Define pagination structure specifically for members that matches the backend response
interface PaginatedMemberData {
  memberships: MembershipResponse[];
  totalMembers: number;
  totalPages: number;
  currentPage: number;
}

// Create a specific response type for members
interface MembershipApiResponse extends ApiResponse<PaginatedMemberData> {
  // No need to redefine data property here
}

export const membershipService = {
  // Lấy danh sách hội viên với phân trang và lọc
  getAllMemberships: async (
    filters: MembershipQueryOptions = {},
  ): Promise<MembershipApiResponse> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

      const url = `/api/admin/memberships${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      const response = await apiClient.get(url);

      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hội viên:", error);
      throw error;
    }
  },
  // Lấy thông tin chi tiết của một hội viên theo ID
  getMembershipById: async (
    membershipId: string,
  ): Promise<ApiResponse<MembershipResponse>> => {
    try {
      const response = await apiClient.get(
        `/api/admin/membership/${membershipId}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi lấy thông tin hội viên ID ${membershipId}:`,
        error,
      );
      throw error;
    }
  },

  // Phần service đúng cách để xử lý lỗi Axios
  deleteMembership: async (membershipId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.delete("/api/admin/membership/delete", {
        data: { id: membershipId },
      });

      return response.data;
    } catch (error: any) {
      console.error(`Lỗi khi xóa hội viên ID ${membershipId}:`, error);

      // Trích xuất thông báo lỗi từ response của server (lỗi 400, 404, v.v.)
      if (error.response && error.response.data) {
        // Trả về đúng định dạng ApiResponse mà component React mong đợi
        return {
          success: false,
          message: error.response.data.message || "Lỗi khi xóa hội viên",
        };
      }

      return {
        success: false,
        message: error.message || "Lỗi kết nối khi xóa hội viên",
      };
    }
  },

  // Lấy thống kê về hội viên
  getMemberStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get("/api/admin/memberships/stats");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê hội viên:", error);
      throw error;
    }
  },
};
