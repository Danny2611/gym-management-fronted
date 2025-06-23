import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
export const apiClient = axios.create({
  baseURL : baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // ✅ Thêm header này để bỏ qua cảnh báo
  },
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Add a response interceptor to handle auth errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        // Thêm headers cho request refresh token
        const response = await axios.post(
          `${baseURL}/api/auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              // Không thêm Authorization header ở đây
            },
          },
        );

        // Kiểm tra cấu trúc response
        if (response.data && response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          originalRequest.headers["Authorization"] =
            `Bearer ${response.data.accessToken}`;
          return apiClient(originalRequest);
        }
        throw new Error("Invalid token response");
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
