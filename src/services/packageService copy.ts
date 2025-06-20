// # API liên quan đến gói tập
// src/services/packageService.ts
import { apiClient } from "./api";
import { Package } from "~/types/package";

interface PackageDetail {
  _id: string;
  package_id: string;
  schedule: string[];
  training_areas: string[];
  additional_services: string[];
  status: "active" | "inactive";
}

interface PackageWithDetails extends Package {
  details?: PackageDetail;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export const packageService = {
  /**
   * Lấy danh sách tất cả gói tập (public)
   * @param params - Query parameters (optional)
   * Example: { category: 'premium', status: 'active' }
   */
  getAllPackages: async (params?: {
    category?: Package["category"];
    status?: Package["status"];
    popular?: boolean;
  }): Promise<ApiResponse<Package[]>> => {
    try {
      const response = await apiClient.get("/api/public/packages", { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch packages",
        errors: [error],
      };
    }
  },

  /**
   * Lấy chi tiết gói tập theo ID (public)
   * @param packageId - ID của gói tập
   */
  getPackageById: async (
    packageId: string,
  ): Promise<ApiResponse<PackageWithDetails>> => {
    try {
      const response = await apiClient.get(`/api/public/packages/${packageId}`);
      // console.log("Raw API Response:", response); // Debug log

      // Bọc lại dữ liệu theo đúng format ApiResponse
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch package details",
        errors: [error],
      };
    }
  },

  /**
   * Lấy các gói tập nổi bật (public)
   * @param limit - Số lượng gói trả về (mặc định: 4)
   */
  getFeaturedPackages: async (
    limit: number = 4,
  ): Promise<ApiResponse<Package[]>> => {
    try {
      const response = await apiClient.get(`/api/public/packages/featured`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch featured packages",
        errors: [error],
      };
    }
  },

  /**
   * Lấy gói tập theo danh mục
   * @param category - Loại gói tập
   * @param excludeCurrentId - ID gói cần loại trừ (optional)
   */
  getPackagesByCategory: async (
    category: Package["category"],
    excludeCurrentId?: string,
  ): Promise<ApiResponse<Package[]>> => {
    try {
      const response = await apiClient.get(
        `/api/public/packages/category/${category}`,
        {
          params: { exclude: excludeCurrentId },
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${category} packages`,
        errors: [error],
      };
    }
  },
};
