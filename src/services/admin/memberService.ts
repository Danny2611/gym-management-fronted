// # API liên quan đến hội viên
// src/services/admin/memberService.ts
import {
  MemberQueryOptions,
  MemberResponse,
  MemberCreateInput,
  MemberUpdateInput,
} from "~/types/member";
import { apiClient } from "../api";
import { ApiResponse } from "~/types/ApiResponse";

// Define pagination structure specifically for members that matches the backend response
interface PaginatedMemberData {
  members: MemberResponse[];
  totalMembers: number;
  totalPages: number;
  currentPage: number;
}

// Create a specific response type for members
interface MemberApiResponse extends ApiResponse<PaginatedMemberData> {
  // No need to redefine data property here
}

export const memberService = {
  // Lấy danh sách hội viên với phân trang và lọc
  getAllMembers: async (
    filters: MemberQueryOptions = {},
  ): Promise<MemberApiResponse> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

      const url = `/api/admin/members${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      const response = await apiClient.get(url);

      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hội viên:", error);
      throw error;
    }
  },
  // Lấy thông tin chi tiết của một hội viên theo ID
  getMemberById: async (
    memberId: string,
  ): Promise<ApiResponse<MemberResponse>> => {
    try {
      const response = await apiClient.get(`/api/admin/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin hội viên ID ${memberId}:`, error);
      throw error;
    }
  },

  // Tạo hội viên mới
  createMember: async (
    memberData: MemberCreateInput,
  ): Promise<ApiResponse<MemberResponse>> => {
    try {
      console.log("memberData", memberData);
      const response = await apiClient.post("/api/admin/members", memberData);

      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo hội viên mới:", error);
      throw error;
    }
  },

  // Cập nhật thông tin hội viên
  updateMember: async (
    memberId: string,
    updateData: MemberUpdateInput,
  ): Promise<ApiResponse<MemberResponse>> => {
    try {
      const response = await apiClient.put(
        `/api/admin/members/${memberId}`,
        updateData,
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật hội viên ID ${memberId}:`, error);
      throw error;
    }
  },

  // Cập nhật trạng thái hội viên
  updateMemberStatus: async (
    memberId: string,
    status: "active" | "inactive" | "pending" | "banned",
  ): Promise<ApiResponse<MemberResponse>> => {
    try {
      const response = await apiClient.patch(
        `/api/admin/members/${memberId}/status`,
        { status },
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi cập nhật trạng thái hội viên ID ${memberId}:`,
        error,
      );
      throw error;
    }
  },

  // Xóa hội viên
  deleteMember: async (memberId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/api/admin/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa hội viên ID ${memberId}:`, error);
      throw error;
    }
  },

  // Lấy thống kê về hội viên
  getMemberStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get("/api/admin/members/stats");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê hội viên:", error);
      throw error;
    }
  },
};
