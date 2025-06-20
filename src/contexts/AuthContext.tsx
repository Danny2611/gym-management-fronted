//contexts/AuthContext
import { apiClient } from "../services/api";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { authService } from "../services/authService";
import { createContext, useContext, useEffect, useState } from "react";


interface User {
  id: string;
  name: string;
  email: string;  
  role: string
  roleName: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  avatar?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo một wrapper component để sử dụng useNavigate

export const AuthProviderWithRouter: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigate = useNavigate();
  return <AuthProvider navigate={navigate}>{children}</AuthProvider>;
};

// Tách biệt AuthProvider và không sử dụng useNavigate trực tiếp
export const AuthProvider: React.FC<{
  children: React.ReactNode;
  navigate: NavigateFunction;
}> = ({ children, navigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken"),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and fetch user data
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          // Set token state immediately
          setToken(accessToken);

          // Fetch current user data
          const response = await authService.getCurrentUser();

          setUser(response.data); // Assuming your API returns user data in response.data
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Clear tokens on error
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      // Update to match backend response structure
      const { accessToken, refreshToken } = response.data.data.tokens;

      const userData = response.data.data.user;
      setUser(userData);

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setToken(accessToken);

      setIsAuthenticated(true);
      console.log("isAuthenticated", isAuthenticated);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await authService.register(userData);
      // Đăng ký thành công, navigate to OTP verification
      navigate("/verify-otp", { state: { email: userData.email } });
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      await authService.verifyOTP(email, otp);
      navigate("/login", {
        state: { message: "Xác thực thành công. Vui lòng đăng nhập." },
      });
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      navigate("/forgot-password", { state: { email } });
    } catch (error) {
      console.error("Forgot password request failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    setUser,

    login,
    register,
    verifyOTP,
    forgotPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
