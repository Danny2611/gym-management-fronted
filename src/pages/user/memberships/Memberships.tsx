import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiCalendar,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import {
  membershipService,
  
} from "~/services/membershipService";
import { memberService } from "~/services/memberService";
import { paymentService } from "~/services/paymentService";
import { formatDate } from "~/utils/formatters";
import MembershipDetailsModal from "~/components/user/memberships/MembershipDetailsModal";
import { MembershipWithRemainingData } from "~/types/membership";

// Component hiển thị thanh tiến trình
interface ProgressBarProps {
  percent: number;
  remainingDays: number;
  status: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  remainingDays,
  status,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return remainingDays < 7 ? "bg-orange-500" : "bg-green-500";
      case "expired":
        return "bg-red-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {status === "active"
            ? `Còn ${remainingDays} ngày`
            : status === "expired"
              ? "Đã hết hạn"
              : status === "paused"
                ? "Tạm dừng"
                : "Đang xử lý"}
        </span>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {status === "active" ? `${percent}%` : ""}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-2.5 rounded-full ${getStatusColor()}`}
          style={{ width: `${Math.max(percent, 3)}%` }}
        ></div>
      </div>
    </div>
  );
};

// re- payment:

// Component hiển thị thẻ gói tập
interface MembershipCardProps {
  membership: MembershipWithRemainingData;
  onRenew: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onViewDetails: (id: string) => void;
  onPayment: (packageId: string, userId: string) => void;
}

const MembershipCard: React.FC<MembershipCardProps> = ({
  membership,
  onRenew,
  onPause,
  onResume,
  onViewDetails,
  onPayment,
}) => {
  const startDate = membership.start_date
    ? new Date(membership.start_date)
    : null;
  const endDate = membership.end_date ? new Date(membership.end_date) : null;
  const paymentDate = new Date(membership.payment_id.payment_date);
  const packageInfo = membership.package_id;

  const getStatusBadge = () => {
    switch (membership.status) {
      case "active":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
            Đang hoạt động
          </span>
        );
      case "expired":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
            Đã hết hạn
          </span>
        );
      case "pending":
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Đang xử lý
          </span>
        );
      case "paused":
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Tạm dừng
          </span>
        );
      default:
        return null;
    }
  };

  const handlePayment = async () => {
    try {
      const userResponse = await memberService.getCurrentProfile();
      const userId = userResponse.data?._id;

      if (!userId) {
        alert("Không thể xác định danh tính người dùng");
        return;
      }

      onPayment(membership.package_id._id, userId);
    } catch (error) {
      console.error("Lỗi khi khởi tạo thanh toán:", error);
      alert("Đã xảy ra lỗi khi khởi tạo thanh toán");
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {packageInfo.name}
          </h3>
          {getStatusBadge()}
        </div>
      </div>

      <div className="p-4">
        <ProgressBar
          percent={membership.remaining_percent}
          remainingDays={membership.remaining_days}
          status={membership.status}
        />

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Ngày bắt đầu</p>
            <p className="flex items-center font-medium text-gray-900 dark:text-white">
              <FiCalendar className="mr-1 text-blue-500" />
              {startDate ? formatDate(startDate) : "Chưa xác định"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Ngày kết thúc</p>
            <p className="flex items-center font-medium text-gray-900 dark:text-white">
              <FiClock className="mr-1 text-blue-500" />
              {endDate ? formatDate(endDate) : "Chưa xác định"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Thanh toán</p>
            <p className="flex items-center font-medium text-gray-900 dark:text-white">
              {membership.payment_id.status === "completed" ? (
                <FiCheck className="mr-1 text-green-500" />
              ) : (
                <FiAlertCircle className="mr-1 text-yellow-500" />
              )}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(membership.payment_id.amount)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Tự động gia hạn</p>
            <p className="flex items-center font-medium text-gray-900 dark:text-white">
              {membership.auto_renew ? (
                <FiCheck className="mr-1 text-green-500" />
              ) : (
                <FiX className="mr-1 text-red-500" />
              )}
              {membership.auto_renew ? "Có" : "Không"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onViewDetails(membership._id)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Xem chi tiết
          </button>

          {membership.status === "pending" && (
            <button
              onClick={handlePayment}
              className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              Thanh toán
            </button>
          )}

          {membership.status === "active" && (
            <button
              onClick={() => onPause(membership._id)}
              className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-100 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
            >
              Tạm dừng
            </button>
          )}

          {membership.status === "paused" && (
            <button
              onClick={() => onResume(membership._id)}
              className="rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
            >
              Tiếp tục
            </button>
          )}

          {(membership.status === "expired" ||
            (membership.status === "active" &&
              membership.remaining_days < 5)) && (
            <button
              onClick={() => onRenew(membership._id)}
              className="rounded-md border border-blue-500 bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600 dark:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Gia hạn
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Component chính trang gói tập đã đăng ký
const MyPackagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "expired" | "pending" | "paused"
  >("all");
  const [selectedMembership, setSelectedMembership] =
    useState<MembershipWithRemainingData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberships, setMemberships] = useState<MembershipWithRemainingData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchMemberships = async () => {
      setLoading(true);

      try {
        const response = await membershipService.getMemberships();

        if (response.success && response.data) {
          setMemberships(response.data);
        } else {
          setError(response.message || "Không thể tải dữ liệu gói tập");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  // Xử lý tạm dừng gói tập
  const handlePauseMembership = async (id: string) => {
    try {
      const response = await membershipService.pauseMembership(id);
      if (response.success) {
        // Cập nhật danh sách gói tập sau khi tạm dừng thành công
        const updatedMemberships = await membershipService.getMemberships();
        if (updatedMemberships.success && updatedMemberships.data) {
          setMemberships(updatedMemberships.data);
        }
        alert("Tạm dừng gói tập thành công");
      } else {
        alert(response.message || "Không thể tạm dừng gói tập");
      }
    } catch (error) {
      console.error("Lỗi khi tạm dừng gói tập:", error);
      alert("Đã xảy ra lỗi khi tạm dừng gói tập");
    }
  };

  // Xử lý tiếp tục gói tập
  const handleResumeMembership = async (id: string) => {
    try {
      const response = await membershipService.resumeMembership(id);
      if (response.success) {
        // Cập nhật danh sách gói tập sau khi tiếp tục thành công
        const updatedMemberships = await membershipService.getMemberships();
        if (updatedMemberships.success && updatedMemberships.data) {
          setMemberships(updatedMemberships.data);
        }
        alert("Tiếp tục gói tập thành công");
      } else {
        alert(response.message || "Không thể tiếp tục gói tập");
      }
    } catch (error) {
      console.error("Lỗi khi tiếp tục gói tập:", error);
      alert("Đã xảy ra lỗi khi tiếp tục gói tập");
    }
  };

  // Xử lý mở modal chi tiết
  const handleViewDetails = async (id: string) => {
    try {
      const userResponse = await memberService.getCurrentProfile();
      const userId = userResponse.data?._id; // Kiểm tra nếu user có tồn tại

      if (!userId) {
        alert("Không thể xác định danh tính người dùng");
        return;
      }
      const response = await membershipService.getMembershipById(id);
      if (response.success && response.data) {
        setSelectedMembership(response.data);
        setIsModalOpen(true);
      } else {
        alert(response.message || "Không thể tải chi tiết gói tập");
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết gói tập:", error);
      alert("Đã xảy ra lỗi khi tải chi tiết gói tập");
    }
  };

  // xử lí thanh toán
  const handlePayment = async (packageId: string) => {
    try {
      // Step 1: Register for the package
      const registerResponse = await paymentService.registerPackage(
        packageId,
        //  userId,
      );

      if (!registerResponse.success) {
        alert(registerResponse.message || "Lỗi khi đăng ký gói tập");
        return;
      }

      // Step 2: Create MoMo payment request
      const paymentResponse = await paymentService.createMoMoPayment(packageId);

      if (!paymentResponse.success || !paymentResponse.data) {
        alert(paymentResponse.message || "Lỗi khi tạo yêu cầu thanh toán");
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
      alert("Đã xảy ra lỗi không mong muốn");
    }
  };

  // Xử lý lọc dữ liệu theo tab
  const filteredMemberships = memberships.filter((membership) => {
    if (activeTab === "all") return true;
    return membership.status === activeTab;
  });

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-2">
          <FiRefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Đang tải dữ liệu...
          </span>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
        <div className="flex items-center">
          <FiAlertCircle className="mr-2 h-5 w-5 text-red-500" />
          <span className="font-medium text-red-700 dark:text-red-400">
            {error}
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-800/50 dark:text-red-300 dark:hover:bg-red-800"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Gói tập đã đăng ký
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Quản lý và theo dõi các gói tập bạn đã đăng ký
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="-mb-px flex flex-wrap text-center text-sm font-medium">
          <li className="mr-2">
            <button
              className={`inline-block rounded-t-lg border-b-2 p-4 ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                  : "border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block rounded-t-lg border-b-2 p-4 ${
                activeTab === "active"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                  : "border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Đang hoạt động
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block rounded-t-lg border-b-2 p-4 ${
                activeTab === "pending"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                  : "border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Đang xử lý
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block rounded-t-lg border-b-2 p-4 ${
                activeTab === "paused"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                  : "border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("paused")}
            >
              Tạm dừng
            </button>
          </li>
          <li>
            <button
              className={`inline-block rounded-t-lg border-b-2 p-4 ${
                activeTab === "expired"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                  : "border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("expired")}
            >
              Đã hết hạn
            </button>
          </li>
        </ul>
      </div>

      {/* Thông báo khi không có gói tập */}
      {filteredMemberships.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex justify-center">
            <FiAlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            Không có gói tập nào
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === "all"
              ? "Bạn chưa đăng ký gói tập nào."
              : activeTab === "active"
                ? "Bạn không có gói tập nào đang hoạt động."
                : activeTab === "expired"
                  ? "Bạn không có gói tập nào đã hết hạn."
                  : activeTab === "paused"
                    ? "Bạn không có gói tập nào đang tạm dừng."
                    : "Bạn không có gói tập nào đang xử lý."}
          </p>
          <div className="mt-4">
            <a
              href="/user/packages"
              className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Xem danh sách gói tập
            </a>
          </div>
        </div>
      )}

      {/* Danh sách gói tập đã đăng ký */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMemberships.map((membership) => (
          <MembershipCard
            key={membership._id}
            membership={membership}
            onRenew={(id) => console.log("Gia hạn gói tập có id:", id)}
            onPause={handlePauseMembership}
            onResume={handleResumeMembership}
            onViewDetails={handleViewDetails}
            onPayment={handlePayment}
          />
        ))}
      </div>

      {/* Modal xem chi tiết */}
      <MembershipDetailsModal
        membership={selectedMembership}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPause={handlePauseMembership}
        onResume={handleResumeMembership}
      />
    </div>
  );
};

export default MyPackagesPage;
