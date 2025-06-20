// # API liên quan đến hội viên
// src/services/memberService.ts
import { MemberProfile, ProfileUpdateData } from "~/types/member";
import { apiClient } from "./api";




interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  // _id: string;
}

export const memberService = {
  /**
   * Lấy thông tin profile của hội viên hiện tại
   */
  getCurrentProfile: async (): Promise<ApiResponse<MemberProfile>> => {
    const response = await apiClient.get("/api/user/profile");
    return response.data;
  },

  /**
   * Cập nhật thông tin profile của hội viên
   */
  updateProfile: async (
    data: ProfileUpdateData,
  ): Promise<ApiResponse<MemberProfile>> => {
    const response = await apiClient.put("/api/user/profile", data);
    return response.data;
  },

  /**
   * Cập nhật avatar của hội viên
   */
  updateAvatar: async (
    file: File,
  ): Promise<ApiResponse<{ avatar: string }>> => {
    const formData = new FormData();
    formData.append("avatar", file); // Thay đổi từ "file" thành "avatar"

    const response = await apiClient.put("/api/user/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Cập nhật email của hội viên
   */
  updateEmail: async (
    email: string,
  ): Promise<ApiResponse<{ email: string }>> => {
    const response = await apiClient.put("/api/user/profile/email", { email });
    return response.data;
  },

  /**
   * Lấy thông tin hội viên theo ID
   */
  getMemberById: async (
    memberId: string,
  ): Promise<ApiResponse<{ id: string; name: string; avatar?: string }>> => {
    const response = await apiClient.get(`/api/user/members/${memberId}`);
    return response.data;
  },

  /**
   * Lấy thông tin về các gói tập đã đăng ký
   */
  getMembershipData: async (): Promise<ApiResponse<MemberProfile>> => {
    const response = await apiClient.get("/api/user/memberships");
    return response.data;
  },

  /**
   * Vô hiệu hóa tài khoản
   */
  deactivateAccount: async (password: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post("/api/user/deactivate", { password });
    return response.data;
  },

  /**
   * Kiểm tra trạng thái xác thực của hội viên
   */
  checkAuthStatus: async (): Promise<boolean> => {
    try {
      await apiClient.get("/api/user/profile");
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Đăng xuất (xóa token khỏi localStorage)
   */
  logout: (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Có thể chuyển hướng đến trang đăng nhập
    window.location.href = "/login";
  },
};
