// src/pages/user/PaymentStatusPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentService } from "~/services/paymentService";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

interface PaymentInfo {
  paymentId: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod: string;
  amount: number;
  transactionId: string;
  created_at: string;
  membership?: {
    _id: string;
    start_date: string;
    end_date: string;
    package_id: {
      _id: string;
      name: string;
    };
  };
}

const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const resultCode = searchParams.get("resultCode");

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_POLLING = 20; // 60 giây (20 x 3s)
  const MAX_RETRIES = 3;

  // Hàm kiểm tra trạng thái thanh toán
  const checkPaymentStatus = useCallback(async () => {
    // Lấy paymentId từ URL hoặc localStorage
    let currentPaymentId = paymentId;

    if (!currentPaymentId) {
      // Thử lấy từ localStorage nếu không có trong URL
      setError("Không tìm thấy thông tin thanh toán");
      setIsLoading(false);
      return;
    }

    try {
      const response = await paymentService.getPaymentStatus(currentPaymentId);
      console.log("v:", response);
      if (response.success && response.data) {
        setPaymentInfo({
          paymentId: currentPaymentId,
          ...response.data,
        });

        // Nếu thanh toán đã hoàn tất hoặc thất bại, dừng polling và xóa thông tin lưu trữ
        if (response.data.status !== "pending") {
          localStorage.removeItem("currentPayment");
          setPollingCount(MAX_POLLING); // Dừng polling
        }

        // Reset retry count nếu thành công
        setRetryCount(0);
      } else {
        // Tăng số lần retry
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prevCount) => prevCount + 1);
        } else {
          setError(
            response.message ||
              "Không thể kiểm tra trạng thái thanh toán sau nhiều lần thử",
          );
        }
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);

      // Tăng số lần retry
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prevCount) => prevCount + 1);
      } else {
        setError("Đã xảy ra lỗi khi kiểm tra trạng thái thanh toán");
      }
    } finally {
      setIsLoading(false);
    }
  }, [paymentId, retryCount]);

  // Gọi API kiểm tra trạng thái lần đầu
  useEffect(() => {
    checkPaymentStatus();
  }, [checkPaymentStatus]);

  // Polling mỗi 3 giây nếu trạng thái đang pending, tối đa 20 lần (60 giây)
  useEffect(() => {
    if (paymentInfo?.status === "pending" && pollingCount < MAX_POLLING) {
      const interval = setInterval(() => {
        checkPaymentStatus();
        setPollingCount((prev) => prev + 1);
      }, 3000);

      return () => clearInterval(interval);
    }

    if (pollingCount >= MAX_POLLING && paymentInfo?.status === "pending") {
      setError(
        "Quá thời gian chờ xác nhận thanh toán. Vui lòng kiểm tra tài khoản của bạn.",
      );
    }
  }, [paymentInfo?.status, pollingCount, checkPaymentStatus]);

  // Xử lý khi có resultCode từ MoMo redirect về
  useEffect(() => {
    if (resultCode === "0") {
      // Nếu có resultCode=0 thì đã redirect từ MoMo về, nhưng cần check lại để chắc chắn
      checkPaymentStatus();
    } else if (resultCode && resultCode !== "0") {
      // Nếu resultCode khác 0 thì đã thất bại
      setPaymentInfo((prev) => (prev ? { ...prev, status: "failed" } : null));
      localStorage.removeItem("currentPayment");
      setIsLoading(false);
    }
  }, [resultCode, checkPaymentStatus]);

  // Xử lý nút thử lại
  const handleRetryCheck = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    checkPaymentStatus();
  };

  // Xử lý nút thanh toán lại
  const handlePayAgain = () => {
    if (paymentInfo?.membership?.package_id?._id) {
      // navigate(`/user/packages/${paymentInfo.membership.package_id._id}/register`);
      navigate(
        `/user/packages-register/${paymentInfo.membership.package_id._id}`,
      );
    } else {
      navigate("/user/packages");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Clock className="mx-auto h-16 w-16 animate-pulse text-blue-500" />
        <h2 className="mt-4 text-xl font-semibold">
          Đang kiểm tra trạng thái thanh toán...
        </h2>
        <p className="mt-2 text-gray-600">
          Vui lòng không đóng trang này khi đang xử lý
        </p>
        <div className="mx-auto mt-4 h-2 max-w-md rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${Math.min((pollingCount / MAX_POLLING) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !paymentInfo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-red-600">{error}</h2>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleRetryCheck}
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Thử lại
          </button>
          <button
            onClick={() => navigate("/user/packages")}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <ArrowLeft className="mr-2" />
            Quay lại danh sách gói tập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
          {/* Trạng thái thanh toán */}
          <div className="mb-6 text-center">
            {paymentInfo?.status === "completed" ? (
              <>
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="mt-4 text-2xl font-bold text-green-600">
                  Thanh toán thành công!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Gói tập của bạn đã được kích hoạt thành công
                </p>
              </>
            ) : paymentInfo?.status === "failed" ? (
              <>
                <XCircle className="mx-auto h-16 w-16 text-red-500" />
                <h1 className="mt-4 text-2xl font-bold text-red-600">
                  Thanh toán thất bại!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.
                </p>
              </>
            ) : (
              <>
                <Clock className="mx-auto h-16 w-16 animate-pulse text-yellow-500" />
                <h1 className="mt-4 text-2xl font-bold text-yellow-600">
                  Đang xử lý thanh toán...
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Vui lòng chờ trong khi chúng tôi xác nhận thanh toán của bạn
                </p>
                <div className="mx-auto mt-4 h-2 max-w-md rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all duration-300"
                    style={{
                      width: `${Math.min((pollingCount / MAX_POLLING) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </>
            )}
          </div>

          {/* Thông tin thanh toán */}
          {paymentInfo && (
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Thông tin thanh toán
              </h2>

              <div className="space-y-3">
                {paymentInfo.membership && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Gói tập:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {paymentInfo.membership.package_id.name}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Mã giao dịch:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {paymentInfo.transactionId}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Phương thức:
                  </span>
                  <span className="font-medium capitalize text-gray-900 dark:text-white">
                    {paymentInfo.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Trạng thái:
                  </span>
                  <span
                    className={`font-medium ${
                      paymentInfo.status === "completed"
                        ? "text-green-600"
                        : paymentInfo.status === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {paymentInfo.status === "completed"
                      ? "Thành công"
                      : paymentInfo.status === "failed"
                        ? "Thất bại"
                        : "Đang xử lý"}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Thời gian:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(paymentInfo.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Số tiền:
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(paymentInfo.amount)}
                  </span>
                </div>
              </div>

              {paymentInfo.membership && (
                <div className="mt-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <h3 className="font-medium text-green-800 dark:text-green-300">
                    Thông tin thời hạn
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ngày bắt đầu:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(
                          paymentInfo.membership.start_date,
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ngày kết thúc:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(
                          paymentInfo.membership.end_date,
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nút điều hướng */}
          <div className="mt-8 flex justify-center space-x-4">
            {paymentInfo?.status === "completed" ? (
              <>
                <button
                  onClick={() => navigate("/user/my-packages")}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  Xem gói tập của tôi
                </button>
              </>
            ) : paymentInfo?.status === "failed" ? (
              <>
                <button
                  onClick={handlePayAgain}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  Thanh toán lại
                </button>
                <button
                  onClick={() => navigate("/user/packages")}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  Quay lại danh sách gói tập
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRetryCheck}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  Cập nhật trạng thái
                </button>
                <button
                  onClick={() => navigate("/user/packages")}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  Quay lại danh sách gói tập
                </button>
              </>
            )}
          </div>

          {/* Thông tin hỗ trợ - hiển thị khi trạng thái thất bại */}
          {paymentInfo?.status === "failed" && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Cần hỗ trợ?
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Nếu bạn đã bị trừ tiền nhưng trạng thái hiển thị thất bại, vui
                lòng liên hệ với bộ phận hỗ trợ khách hàng qua:{" "}
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  hotro@fittlife.vn
                </span>{" "}
                hoặc hotline:{" "}
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  1900 xxxx
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
