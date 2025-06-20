import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const OAuthCallback: React.FC = () => {
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Lấy token từ URL (response được chuyển hướng từ server)
        const params = new URLSearchParams(location.search);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        const userData = params.get("userData");
        const errorMsg = params.get("error");

        if (errorMsg) {
          throw new Error(decodeURIComponent(errorMsg));
        }

        if (!accessToken || !refreshToken) {
          throw new Error("Không nhận được token xác thực");
        }

        // Lưu token vào localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Lưu thông tin user nếu có
        if (userData) {
          const user = JSON.parse(decodeURIComponent(userData));
        }

        // Kiểm tra xem có URL chuyển hướng được lưu trước đó không
        const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin"); // Xóa URL đã lưu

        // Chuyển hướng người dùng đến trang được lưu hoặc trang chính
        navigate(redirectUrl, { replace: true });
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        setError(
          err.message || "Đăng nhập không thành công. Vui lòng thử lại.",
        );

        // Đảm bảo đăng xuất nếu có lỗi
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Chuyển hướng đến trang đăng nhập sau 3 giây
        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: { message: "Đăng nhập không thành công. Vui lòng thử lại." },
          });
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      {error ? (
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">
              Đăng nhập không thành công
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <p className="mt-4 text-gray-500">
              Bạn sẽ được chuyển hướng đến trang đăng nhập...
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-indigo-600">
              Đăng nhập thành công
            </h2>
            <p className="mt-2 text-gray-600">
              Đang chuyển hướng bạn đến trang chính...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthCallback;
