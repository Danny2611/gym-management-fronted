import React, { useState, useEffect } from "react";
import ComponentCard from "~/components/dashboard/common/ComponentCard";
import {
  Transaction,
  TransactionStatus,
  PaymentMethod,
  TransactionDetail,
} from "~/types/transaction";
import { toast } from "react-toastify"; // Assuming you use react-toastify for notifications
import { formatCurrency, formatDate } from "~/utils/formatters";
import { transactionService } from "~/services/transactionService";
import { PaginationControls } from "~/components/common/PaginationControls";

// Định nghĩa kiểu dữ liệu cho bộ lọc ngày
interface DateRange {
  start: string;
  end: string;
}

// Props cho component StatusBadge
interface StatusBadgeProps {
  status: TransactionStatus;
}

// Props cho component PaymentMethodBadge
interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

// Props cho component TransactionDetail
interface TransactionDetailProps {
  transaction: TransactionDetail | null;
  onClose: () => void;
}

// Component hiển thị trạng thái thanh toán
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<
    TransactionStatus,
    { color: string; text: string }
  > = {
    completed: {
      color: "success",
      text: "Hoàn thành",
    },
    pending: {
      color: "info",
      text: "Đang xử lý",
    },
    failed: {
      color: "error",
      text: "Thất bại",
    },
    cancelled: {
      color: "warning",
      text: "Đã hủy",
    },
  };

  const config = statusConfig[status] || { color: "info", text: status };

  const colorClasses: Record<string, string> = {
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[config.color]}`}
    >
      {config.text}
    </span>
  );
};

// Component hiển thị phương thức thanh toán
const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({ method }) => {
  const methodConfig: Record<string, { color: string; text: string }> = {
    qr: {
      color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      text: "QR Code",
    },
    credit: {
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      text: "Thẻ tín dụng",
    },
    napas: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      text: "Napas",
    },
    undefined: {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      text: "Chưa xác định",
    },
  };

  const config = methodConfig[method] || {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    text: method,
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  );
};

// Component chi tiết giao dịch
const ComponentTransactionDetail: React.FC<TransactionDetailProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Chi tiết giao dịch
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <div className="mb-4 flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">{transaction.package_id.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mã giao dịch: {transaction.transactionId}
              </p>
            </div>
          </div>

          <div className="mb-2 flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Số tiền:</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {formatCurrency(transaction.package_id.price)}
            </span>
          </div>

          <div className="mb-2 flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Trạng thái:
            </span>
            <StatusBadge status={transaction.status} />
          </div>

          <div className="mb-2 flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Phương thức:
            </span>
            <PaymentMethodBadge method={transaction.paymentMethod} />
          </div>

          <div className="mb-2 flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Thời gian:</span>
            <span>{formatDate(transaction.created_at)}</span>
          </div>

          <div className="mb-2 flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Nội dung:</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {transaction.paymentInfo.orderInfo
                ? transaction.paymentInfo.orderInfo
                : "Chưa xác định"}
            </span>
          </div>
          {/* Conditional rendering for payment-specific info */}
          {transaction.paymentMethod === "qr" &&
            "phoneNumber" in transaction.paymentInfo && (
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Số điện thoại:
                </span>
                <span>{transaction.paymentInfo.phoneNumber}</span>
              </div>
            )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: "", end: "" });
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetail | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const transactionsPerPage = 10;

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};

      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }

      if (filterMethod !== "all") {
        filters.paymentMethod = filterMethod;
      }

      if (dateRange.start) {
        filters.startDate = dateRange.start;
      }

      if (dateRange.end) {
        filters.endDate = dateRange.end;
      }

      const response = await transactionService.getAllTransactions(filters);
      console.log("data", response);
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        toast.error(response.message || "Không thể tải lịch sử giao dịch");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Đã xảy ra lỗi khi tải lịch sử giao dịch");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [filterStatus, filterMethod, dateRange.start, dateRange.end]);

  // Fetch transaction details
  const fetchTransactionDetails = async (transactionId: string) => {
    try {
      const response =
        await transactionService.getTransactionById(transactionId);
      console.log("db detail:", response);
      if (response.success && response.data) {
        setSelectedTransaction(response.data);
      } else {
        toast.error(response.message || "Không thể tải chi tiết giao dịch");
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      toast.error("Đã xảy ra lỗi khi tải chi tiết giao dịch");
    }
  };

  // Lọc giao dịch theo từ khóa tìm kiếm
  const filteredTransactions = transactions.filter((transaction) => {
    if (searchTerm.trim() === "") return true;

    const searchLower = searchTerm.toLowerCase();
    const packageNameMatch = transaction.packageName
      .toLowerCase()
      .includes(searchLower);
    const transactionIdMatch = transaction.transactionId
      .toLowerCase()
      .includes(searchLower);

    return packageNameMatch || transactionIdMatch;
  });

  // Phân trang
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction,
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage,
  );

  // Xử lý khi chọn giao dịch để xem chi tiết
  const handleViewDetail = (transactionId: string) => {
    fetchTransactionDetails(transactionId);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterStatus("all");
    setFilterMethod("all");
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Quản lý lịch sử giao dịch
      </h1>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Bộ lọc */}
        <ComponentCard title="Bộ lọc giao dịch" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="pending">Đang xử lý</option>
                <option value="failed">Thất bại</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phương thức thanh toán
              </label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="all">Tất cả phương thức</option>
                <option value="qr">QR Code</option>
                <option value="credit">Thẻ tín dụng</option>
                <option value="napas">Napas</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Từ ngày
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Đến ngày
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={resetFilters}
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </ComponentCard>

        {/* Danh sách giao dịch */}
        <div className="lg:col-span-3">
          <ComponentCard title="Lịch sử giao dịch">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên gói hoặc mã giao dịch..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Tên gói
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Số tiền
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Phương thức
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Trạng thái
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Ngày tạo
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {currentTransactions.length > 0 ? (
                      currentTransactions.map((transaction) => (
                        <tr
                          key={transaction._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {transaction.packageName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {transaction.transactionId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(transaction.amount)}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <PaymentMethodBadge
                              method={transaction.paymentMethod}
                            />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <StatusBadge status={transaction.status} />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                            <button
                              onClick={() => handleViewDetail(transaction._id)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          Không tìm thấy giao dịch nào phù hợp với bộ lọc
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sử dụng PaginationControls thay thế phân trang cũ */}
            {filteredTransactions.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-1 items-center justify-between border-t border-gray-200 pb-1 pt-3 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {indexOfFirstTransaction + 1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(
                          indexOfLastTransaction,
                          filteredTransactions.length,
                        )}
                      </span>{" "}
                      trong tổng số{" "}
                      <span className="font-medium">
                        {filteredTransactions.length}
                      </span>{" "}
                      kết quả
                    </p>
                  </div>
                </div>

                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </ComponentCard>
        </div>
      </div>

      {/* Modal xem chi tiết giao dịch */}
      {selectedTransaction && (
        <ComponentTransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default TransactionHistory;
