// src/pages/user/PackageRegistrationPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ChevronLeft, CreditCard, Info, AlertCircle } from "lucide-react";
import { packageService } from "~/services/packageService";
import { paymentService } from "~/services/paymentService";
import { memberService } from "~/services/memberService";
// Interface for package information that matches your other components
interface Package {
  _id?: string; // thường sẽ có khi lấy từ DB
  name: string;
  max_members?: number;
  price: number;
  duration: number;
  description?: string;
  benefits: string[];
  status: "active" | "inactive";
  category?: "basic" | "premium" | "fitness" | "platinum" | "vip";
  created_at: string; // ISO date string khi truyền từ backend
  deleted_at?: string;
  updated_at: string;
  popular?: boolean;
  training_sessions: number;
  session_duration: number;
  details?: {
    _id: string;
    package_id: string;
    schedule: string[];
    training_areas: string[];
    additional_services: string[];
    status: "active" | "inactive";
  };
}

const PackageRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Lấy ID từ URL params

  const [packageInfo, setPackageInfo] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Sử dụng id từ useParams
  const packageId = id || getPackageIdFromStorage();

  // Fallback function để lấy ID từ localStorage
  function getPackageIdFromStorage() {
    const storedPackage = localStorage.getItem("selectedPackage");
    return storedPackage ? JSON.parse(storedPackage)._id : null;
  }

  useEffect(() => {
    // Lưu package ID vào localStorage để dùng sau này nếu cần
    if (packageId) {
      localStorage.setItem("currentPackageId", packageId);
    }
    const fetchPackageInfo = async () => {
      if (!packageId) {
        setError("Không có ID gói tập");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await packageService.getPackageById(packageId);

        if (response.success && response.data) {
          setPackageInfo(response.data);
        } else {
          setError("Không thể lấy thông tin gói tập");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi lấy thông tin gói tập");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageInfo();
  }, [packageId]);

  const handleRegister = async () => {
    if (!packageId || !agreeTerms) return;

    try {
      setIsProcessing(true);
      // const userResponse = await memberService.getCurrentProfile();

      // const userId = userResponse.data?._id; // Kiểm tra nếu user có tồn tại
      // if (!userId) {
      //   setError("Không thể lấy thông tin người dùng");
      //   setIsProcessing(false);
      //   return;
      // }

      // Step 1: Register for the package
      const registerResponse = await paymentService.registerPackage(
        packageId,
        // userId,
      );

      if (!registerResponse.success) {
        setError(registerResponse.message || "Lỗi khi đăng ký gói tập");
        setIsProcessing(false);
        return;
      }

      // Step 2: Create MoMo payment request
      const paymentResponse = await paymentService.createMoMoPayment(packageId);

      if (!paymentResponse.success || !paymentResponse.data) {
        setError(paymentResponse.message || "Lỗi khi tạo yêu cầu thanh toán");
        setIsProcessing(false);
        return;
      }

      // Save payment info to localStorage for later use
      localStorage.setItem(
        "currentPayment",
        JSON.stringify({
          paymentId: paymentResponse.data.paymentId,
          transactionId: paymentResponse.data.transactionId,
          amount: paymentResponse.data.amount,
          expireTime: paymentResponse.data.expireTime,
          packageId: packageId,
        }),
      );

      // Redirect to MoMo payment page
      window.location.href = paymentResponse.data.payUrl;
    } catch (err) {
      console.error("Lỗi khi xử lý đăng ký:", err);
      setError("Đã xảy ra lỗi không mong muốn");
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Đang tải thông tin đăng ký...</p>
      </div>
    );
  }

  // Error state
  if (error || !packageInfo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>{error || "Không tìm thấy thông tin gói tập"}</p>
        <button
          onClick={() => navigate("/user/packages")}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white"
        >
          Quay lại danh sách gói tập
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => navigate(`/user/package-detail/${packageInfo._id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ChevronLeft className="mr-2" />
          Quay lại chi tiết gói tập
        </button>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Xác nhận đăng ký gói tập
        </h1>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Package Summary */}
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Thông tin gói tập
            </h2>

            <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">
                {packageInfo.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {packageInfo.description || "Không có mô tả"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Thời hạn:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {packageInfo.duration || 30} ngày
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Loại gói:
                </span>
                <span className="font-medium capitalize text-gray-900 dark:text-white">
                  {packageInfo.category || "Standard"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Giá gói tập:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(packageInfo.price)}
                </span>
              </div>

              {packageInfo.max_members && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Số lượng thành viên tối đa:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {packageInfo.max_members} người
                  </span>
                </div>
              )}

              {packageInfo.details?.schedule &&
                packageInfo.details.schedule.length > 0 && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Lịch tập:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {packageInfo.details.schedule.join(", ")}
                    </span>
                  </div>
                )}
            </div>

            <div className="mt-6">
              <h3 className="mb-3 font-medium text-gray-900 dark:text-white">
                Phương thức thanh toán
              </h3>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                    <CreditCard className="text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      MoMo
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Thanh toán qua ví điện tử MoMo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="sticky top-20 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Gói tập:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {packageInfo.name}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Thời hạn:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {packageInfo.duration || 30} ngày
                </span>
              </div>

              <div className="flex justify-between border-t pt-3">
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  Tổng thanh toán:
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(packageInfo.price)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-4 flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label
                  htmlFor="terms"
                  className="ml-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Tôi đồng ý với các{" "}
                  <span className="text-blue-600 hover:underline dark:text-blue-400">
                    điều khoản và điều kiện
                  </span>{" "}
                  của FittLife
                </label>
              </div>

              <button
                className={`w-full rounded-lg px-6 py-3 text-center text-white transition-colors ${
                  agreeTerms && !isProcessing
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-gray-400"
                }`}
                disabled={!agreeTerms || isProcessing}
                onClick={handleRegister}
              >
                {isProcessing ? "Đang xử lý..." : "Xác nhận và thanh toán"}
              </button>

              <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Info size={16} className="mr-2" />
                <span>
                  Bạn sẽ được chuyển đến cổng thanh toán MoMo sau khi xác nhận
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex">
                <AlertCircle className="mr-2 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Lưu ý
                  </p>
                  <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                    Bạn có 10 phút để hoàn tất thanh toán. Sau khi thanh toán
                    thành công, gói tập sẽ được kích hoạt ngay lập tức.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageRegistrationPage;
