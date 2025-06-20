// src/services/membershipService.ts
import { apiClient } from "./api";
import { calculateMembershipRemaining } from "../utils/membershipUtils"; // Import hàm tính ngày đã tạo ở trên
import { Membership, MembershipDetailsResponse, MembershipWithRemainingData } from "~/types/membership";



interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: any[];
}

export const membershipService = {
  /**
   * Lấy danh sách gói tập đã đăng ký của hội viên
   * @returns Danh sách gói tập đã đăng ký
   */
  getMemberships: async (): Promise<
    ApiResponse<MembershipWithRemainingData[]>
  > => {
    try {
      const response = await apiClient.get("/api/user/my-package");

      if (response.data.success && response.data.data) {
        const membershipsWithRemainingData = response.data.data.map(
          (membership: Membership) => {
            // Sử dụng hàm tính toán thời gian còn lại
            const { remaining_days, remaining_percent } =
              calculateMembershipRemaining(membership);

            return {
              ...membership,
              remaining_days,
              remaining_percent,
            };
          },
        );

        return {
          ...response.data,
          data: membershipsWithRemainingData,
        };
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tải danh sách gói tập đã đăng ký",
        errors: [error],
      };
    }
  },

  /**
   * Lấy chi tiết gói tập đã đăng ký theo ID
   * @param _id
   */
  getMembershipById: async (
    _id: string,
  ): Promise<ApiResponse<MembershipWithRemainingData>> => {
    try {
      const response = await apiClient.post("/api/user/my-package/detail", {
        membershipId: _id,
      });

      // Thêm thông tin về số ngày còn lại và phần trăm
      if (response.data.success && response.data.data) {
        const membership = response.data.data;

        // Sử dụng hàm tính toán thời gian còn lại
        const { remaining_days, remaining_percent } =
          calculateMembershipRemaining(membership);

        return {
          ...response.data,
          data: {
            ...membership,
            remaining_days,
            remaining_percent,
          },
        };
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tải chi tiết gói tập",
        errors: [error],
      };
    }
  },

  /**
   * Tạm dừng gói tập đã đăng ký
   * @param membershipId - ID của gói tập cần tạm dừng
   */
  pauseMembership: async (_id: string): Promise<ApiResponse<Membership>> => {
    try {
      const response = await apiClient.patch(`/api/user/my-package/pause`, {
        membershipId: _id,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tạm dừng gói tập",
        errors: [error],
      };
    }
  },

  /**
   * Tiếp tục gói tập đã tạm dừng
   * @param membershipId - ID của gói tập cần tiếp tục
   */
  resumeMembership: async (_id: string): Promise<ApiResponse<Membership>> => {
    try {
      const response = await apiClient.patch(`/api/user/my-package/resume`, {
        membershipId: _id,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tiếp tục gói tập",
        errors: [error],
      };
    }
  },

  getMembershipsActive: async (): Promise<
    ApiResponse<MembershipWithRemainingData[]>
  > => {
    try {
      const response = await apiClient.get("/api/user/my-package-active");

      if (response.data.success && response.data.data) {
        const membershipsWithRemainingData = response.data.data.map(
          (membership: Membership) => {
            // Sử dụng hàm tính toán thời gian còn lại
            const { remaining_days, remaining_percent } =
              calculateMembershipRemaining(membership);

            return {
              ...membership,
              remaining_days,
              remaining_percent,
            };
          },
        );

        return {
          ...response.data,
          data: membershipsWithRemainingData,
        };
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tải danh sách gói tập đã đăng ký",
        errors: [error],
      };
    }
  },
  getInforMembershipDetails: async (): Promise<
    ApiResponse<MembershipDetailsResponse>
  > => {
    try {
      const response = await apiClient.get(
        "/api/user/my-package/infor-membership",
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thông tin chi tiết gói tập",
        errors: [error],
      };
    }
  },
};
