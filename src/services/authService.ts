// src/services/authService.ts
import { apiClient } from "./api";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
}

// Interceptor để thêm token vào header cho các request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
// Interceptor để refresh token khi token hết hạn
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu status là 401 (Unauthorized) và chưa thử refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Lấy refreshToken từ localStorage
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // Đăng xuất nếu không có refreshToken
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Gọi API để refresh token
        const response = await apiClient.post(`/api/auth/refresh-token`, {
          refreshToken,
        });

        // Lưu token mới
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.tokens;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Thêm token mới vào header và thử lại request
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Đăng xuất nếu refresh token thất bại
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
// Xác định base URL cho ứng dụng
const getAppBaseUrl = () => {
  return window.location.origin; // Ví dụ: http://localhost:3000
};

// Lưu lại URL hiện tại để chuyển hướng trở lại sau khi đăng nhập
const saveCurrentLocation = () => {
  const currentPath = window.location.pathname;
  if (
    currentPath !== "/login" &&
    currentPath !== "/register" &&
    !currentPath.includes("/oauth")
  ) {
    sessionStorage.setItem("redirectAfterLogin", currentPath);
  }
};
export const authService = {
  register: async (userData: RegisterData): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/register", userData);
    return response.data;
  },

  verifyOTP: async (
    email: string,
    otp: string,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/verify-otp", {
      email,
      otp,
    });
    return response.data;
  },

  resendOTP: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/resend-otp", { email });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });

    // Store tokens immediately upon login
    const { accessToken, refreshToken } = response.data.data.tokens;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/forgot-password", {
      email,
    });
    return response.data;
  },
  // In authService.ts
  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Đổi mật khẩu thất bại");
      }
      throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau");
    }
  },

  loginWithGoogle: () => {
    saveCurrentLocation(); // Lưu URL hiện tại
    const callbackUrl = `${getAppBaseUrl()}/oauth/callback`;
    window.location.href = `${apiClient.defaults.baseURL}/api/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  },

  loginWithFacebook: () => {
    saveCurrentLocation(); // Lưu URL hiện tại
    const callbackUrl = `${getAppBaseUrl()}/oauth/callback`;
    window.location.href = `${apiClient.defaults.baseURL}/api/auth/facebook?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/api/user/profile");
    return response.data;
  },
  validateCurrentPassword: async (
    currentPassword: string,
  ): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post(
        "/api/auth/validate-current-password",
        {
          currentPassword,
        },
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Xác thực mật khẩu thất bại",
        );
      }
      throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau");
    }
  },
};
