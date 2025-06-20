import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "./api";
import { BlogPost } from "~/types/blog";

export const blogService = {
  /**
   * Lấy danh sách tất cả blogs (có phân trang)
   */
  getAllPosts: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<
    ApiResponse<{ posts: BlogPost[]; total: number; totalPages: number }>
  > => {
    try {
      const response = await apiClient.get(`/api/public/blogs`, {
        params: { page, pageSize },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách bài viết",
        errors: [error],
      };
    }
  },

  /**
   * Lấy danh sách bài viết theo category slug
   */
  getPostsByCategory: async (
    slug: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<
    ApiResponse<{ posts: BlogPost[]; total: number; totalPages: number }>
  > => {
    try {
      const response = await apiClient.get(
        `/api/public/blog/category/${slug}`,
        {
          params: { page, pageSize },
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy bài viết theo danh mục",
        errors: [error],
      };
    }
  },

  /**
   * Lấy danh sách bài viết theo tag
   */
  getPostsByTag: async (
    tag: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<
    ApiResponse<{ posts: BlogPost[]; total: number; totalPages: number }>
  > => {
    try {
      const response = await apiClient.get(`/api/public/blog/tag/${tag}`, {
        params: { page, pageSize },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy bài viết theo thẻ",
        errors: [error],
      };
    }
  },

  /**
   * Lấy bài viết chi tiết theo slug
   */
  getPostBySlug: async (slug: string): Promise<ApiResponse<BlogPost>> => {
    try {
      const response = await apiClient.get(`/api/public/blog/${slug}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy chi tiết bài viết",
        errors: [error],
      };
    }
  },

  /**
   * Lấy n bài viết mới nhất (ví dụ: hiển thị trên trang chủ)
   */
  getLatestPosts: async (
    limit: number = 5,
  ): Promise<ApiResponse<BlogPost[]>> => {
    try {
      const response = await apiClient.get(`/api/public/blog/latest`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy bài viết mới nhất",
        errors: [error],
      };
    }
  },

  getFeaturedPosts: async (
    limit: number = 5,
  ): Promise<ApiResponse<BlogPost[]>> => {
    try {
      const response = await apiClient.get(`/api/public/blog/featured`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy bài viết mới nhất",
        errors: [error],
      };
    }
  },
};
