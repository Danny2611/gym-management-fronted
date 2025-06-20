// src/services/admin/packageService.ts
import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "../api";
import {
  Package,
  PackageCreateUpdateData,
  PackageQueryParams,
  PackageStats,
} from "~/types/package";

export const packageService = {
  /**
   * Lấy danh sách tất cả gói dịch vụ (có phân trang, lọc và sắp xếp)
   */
  getAllPackages: async (
    params: PackageQueryParams = {},
  ): Promise<
    ApiResponse<{
      packages: Package[];
      totalPackages: number;
      totalPages: number;
      currentPage: number;
    }>
  > => {
    try {
      const response = await apiClient.get("/api/admin/packages", { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách gói dịch vụ",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thông tin chi tiết một gói dịch vụ theo ID
   */
  getPackageById: async (packageId: string): Promise<ApiResponse<Package>> => {
    try {
      const response = await apiClient.get(`/api/admin/packages/${packageId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thông tin gói dịch vụ",
        errors: [error],
      };
    }
  },

  /**
   * Tạo mới một gói dịch vụ
   */
  createPackage: async (
    packageData: PackageCreateUpdateData,
  ): Promise<ApiResponse<Package>> => {
    try {
      const response = await apiClient.post("/api/admin/packages", packageData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể tạo gói dịch vụ mới",
        errors: [error],
      };
    }
  },

  /**
   * Cập nhật thông tin một gói dịch vụ
   */
  updatePackage: async (
    packageId: string,
    packageData: Partial<PackageCreateUpdateData>,
  ): Promise<ApiResponse<Package>> => {
    try {
      const response = await apiClient.put(
        `/api/admin/packages/${packageId}`,
        packageData,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể cập nhật gói dịch vụ",
        errors: [error],
      };
    }
  },

  /**
   * Xóa một gói dịch vụ (xóa mềm)
   */
  deletePackage: async (packageId: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await apiClient.delete(
        `/api/admin/packages/${packageId}`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể xóa gói dịch vụ",
        errors: [error],
      };
    }
  },

  /**
   * Chuyển đổi trạng thái gói dịch vụ (active/inactive)
   */
  togglePackageStatus: async (
    packageId: string,
  ): Promise<ApiResponse<Package>> => {
    try {
      const response = await apiClient.patch(
        `/api/admin/packages/${packageId}/status`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể thay đổi trạng thái gói dịch vụ",
        errors: [error],
      };
    }
  },

  /**
   * Lấy thống kê về gói dịch vụ
   */
  getPackageStats: async (): Promise<ApiResponse<PackageStats>> => {
    try {
      const response = await apiClient.get("/api/admin/packages/stats");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy thống kê gói dịch vụ",
        errors: [error],
      };
    }
  },
};
