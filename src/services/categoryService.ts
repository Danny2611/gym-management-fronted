// services/categoryService.ts
import { apiClient } from "./api";
import { BlogCategory } from "~/types/blog";
import { ApiResponse } from "~/types/ApiResponse";

export const categoryService = {
  getAllCategories: async (): Promise<ApiResponse<BlogCategory[]>> => {
    try {
      const response = await apiClient.get(`/api/public/blog-categories`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh mục bài viết",
        errors: [error],
      };
    }
  },
  getCategoryBySlug: async (
    slug: string,
  ): Promise<ApiResponse<BlogCategory>> => {
    try {
      const response = await apiClient.get(
        `/api/public/blog-categories/${slug}`,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy category",
        errors: [error],
      };
    }
  },
};
