import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, Link } from "react-router-dom";
import { authService } from "../../services/authService";

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verifyOTP } = useAuth();
  const location = useLocation();
  const email = location.state?.email || "";

  // Redirect if no email in state
  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 text-center shadow-md">
          <h2 className="text-2xl font-bold">Lỗi xác thực</h2>
          <p className="text-gray-600">
            Không tìm thấy thông tin email. Vui lòng đăng ký lại.
          </p>
          <Link
            to="/register"
            className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Quay lại trang đăng ký
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      await verifyOTP(email, otp);
      // Redirect happens in verifyOTP function in AuthContext
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Xác thực mã OTP không thành công. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setMessage("");
    setIsResending(true);

    try {
      const response = await authService.resendOTP(email);
      setMessage(
        response.message || "Mã OTP mới đã được gửi đến email của bạn.",
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Không thể gửi lại mã OTP. Vui lòng thử lại sau.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Xác thực tài khoản
          </h1>
          <p className="mt-2 text-gray-600">
            Vui lòng nhập mã OTP đã được gửi đến email {email}
          </p>
        </div>

        {error && (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700"
            >
              Mã OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-xl tracking-widest shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {isLoading ? "Đang xử lý..." : "Xác thực"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Không nhận được mã?
            <button
              onClick={handleResendOTP}
              disabled={isResending}
              className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
            >
              {isResending ? "Đang gửi..." : "Gửi lại mã"}
            </button>
          </p>
          <p className="mt-2">
            <Link
              to="/user/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Quay lại trang đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
