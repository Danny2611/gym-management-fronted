import React from "react";
import { FiX } from "react-icons/fi";
import { MembershipWithRemainingData } from "~/services/membershipService";

interface MembershipDetailsModalProps {
  membership: MembershipWithRemainingData | null;
  isOpen: boolean;
  onClose: () => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

const MembershipDetailsModal: React.FC<MembershipDetailsModalProps> = ({
  membership,
  isOpen,
  onClose,
  onPause,
  onResume,
}) => {
  if (!isOpen || !membership) return null;

  const startDate = membership.start_date
    ? new Date(membership.start_date)
    : null;
  const endDate = membership.end_date ? new Date(membership.end_date) : null;
  const packageInfo = membership.package_id;
  const payment = membership.payment_id;
  const paymentInfo = membership.payment_id.paymentInfo;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Chi tiết gói tập
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {packageInfo.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {packageInfo.description}
          </p>

          <div className="mt-4">
            <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
              Quyền lợi:
            </h4>
            <ul className="ml-5 list-disc space-y-1 text-gray-600 dark:text-gray-400">
              {(packageInfo.benefits as string[]).map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
            Thông tin đăng ký
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Ngày bắt đầu</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {startDate ? formatDate(startDate) : "Chưa xác định"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Ngày kết thúc</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {endDate ? formatDate(endDate) : "Chưa xác định"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Trạng thái</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {membership.status === "active"
                  ? "Đang hoạt động"
                  : membership.status === "expired"
                    ? "Đã hết hạn"
                    : membership.status === "paused"
                      ? "Tạm dừng"
                      : "Đang xử lý"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                Tự động gia hạn
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {membership.auto_renew ? "Có" : "Không"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
            Thông tin thanh toán
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Số tiền</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(payment.amount)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Phương thức</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {payment.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                Ngày thanh toán
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(paymentInfo.responseTime).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                Trạng thái thanh toán
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {paymentInfo.message === "Thành công"
                  ? "Thành công"
                  : paymentInfo.message === "pending"
                    ? "Đang xử lý"
                    : paymentInfo.message === "failed"
                      ? "Thất bại"
                      : paymentInfo.message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Đóng
          </button>
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
        </div>
      </div>
    </div>
  );
};

export default MembershipDetailsModal;
