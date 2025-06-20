// src/pages/user/ForgotPassword.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess("Mật khẩu mới đã được gửi vào email của bạn.");
      setEmail(""); // Xóa email sau khi gửi thành công
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Không thể khôi phục mật khẩu. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        {/* Tiêu đề */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
          <p className="mt-2 text-gray-600">
            Nhập email của bạn và chúng tôi sẽ gửi mật khẩu mới
          </p>
        </div>

        {/* Hiển thị thông báo lỗi hoặc thành công */}
        {error && (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        {/* Form quên mật khẩu */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Địa chỉ email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {isLoading ? "Đang xử lý..." : "Gửi mật khẩu mới"}
            </button>
          </div>
        </form>

        {/* Quay lại trang đăng nhập */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Quay lại trang đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
