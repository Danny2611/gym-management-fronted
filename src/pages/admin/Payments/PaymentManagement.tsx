import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Info,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { paymentService } from "~/services/admin/paymentService";
import {
  Payment,
  PaymentResponse,
  PaymentQueryParams,
  PaymentStats,
} from "~/types/payment";
import { toast } from "sonner";
import ConfirmDialog from "~/components/common/ConfirmDialog";
import { formatDate } from "~/utils/formatters";

const PaymentManagement: React.FC = () => {
  // Trạng thái cho danh sách thanh toán và phân trang
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái cho thống kê
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Trạng thái cho modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Trạng thái cho xác nhận cập nhật trạng thái
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<{
    paymentId: string;
    newStatus: PaymentResponse["status"];
  } | null>(null);

  // Trạng thái cho bộ lọc và sắp xếp
  const [filters, setFilters] = useState<PaymentQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
    paymentMethod: undefined,
    sortBy: "created_at",
    sortOrder: "desc",
    dateFrom: undefined,
    dateTo: undefined,
  });

  // Danh sách phương thức thanh toán
  const paymentMethods: {
    value: PaymentResponse["paymentMethod"];
    label: string;
  }[] = [
    { value: "qr", label: "QR Code" },
    { value: "credit", label: "Thẻ tín dụng" },
    { value: "napas", label: "Napas" },
    { value: "undefined", label: "Khác" },
  ];

  // Danh sách trạng thái thanh toán
  const paymentStatuses: { value: PaymentResponse["status"]; label: string }[] =
    [
      { value: "pending", label: "Đang chờ" },
      { value: "completed", label: "Hoàn thành" },
      { value: "failed", label: "Thất bại" },
      { value: "cancelled", label: "Đã hủy" },
    ];

  // Tải thống kê thanh toán
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await paymentService.getPaymentStats();
      console.log("response:", response);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Tải danh sách thanh toán
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPayments({
        ...filters,
        page: currentPage,
      });
      // console.log("response: ",response)
      if (response.success && response.data) {
        setPayments(response.data.payments);
        setTotalPayments(response.data.totalPayments);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setError(null);
      } else {
        setError(response.message || "Không thể tải danh sách thanh toán");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách thanh toán");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tải chi tiết thanh toán
  const fetchPaymentDetail = async (paymentId: string) => {
    try {
      setDetailLoading(true);
      const response = await paymentService.getPaymentById(paymentId);
      console.log("response:", response);
      if (response.success && response.data) {
        setSelectedPayment(response.data);
        setShowDetailModal(true);
      } else {
        toast.error(response.message || "Không thể tải chi tiết thanh toán");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi tải chi tiết thanh toán");
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Tải dữ liệu khi component được mount hoặc khi filters hoặc currentPage thay đổi
  useEffect(() => {
    fetchPayments();
  }, [filters, currentPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (name: keyof PaymentQueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  // Xử lý cập nhật trạng thái thanh toán
  const handleStatusUpdate = (
    paymentId: string,
    newStatus: PaymentResponse["status"],
  ) => {
    setStatusUpdateData({ paymentId, newStatus });
    setShowStatusConfirm(true);
  };

  // Thực hiện cập nhật trạng thái
  const confirmStatusUpdate = async () => {
    if (!statusUpdateData) return;

    try {
      const response = await paymentService.updatePaymentStatus(
        statusUpdateData.paymentId,
        { status: statusUpdateData.newStatus },
      );

      if (response.success) {
        toast.success("Cập nhật trạng thái thanh toán thành công");
        fetchPayments(); // Tải lại dữ liệu
        fetchStats(); // Cập nhật thống kê
      } else {
        toast.error(
          response.message || "Không thể cập nhật trạng thái thanh toán",
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái thanh toán");
      console.error(error);
    } finally {
      setShowStatusConfirm(false);
      setStatusUpdateData(null);
    }
  };

  // Format giá tiền
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // // Format ngày tháng
  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleString('vi-VN');
  // };

  // Render badges cho trạng thái
  const StatusBadge: React.FC<{ status: PaymentResponse["status"] }> = ({
    status,
  }) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
        label: "Đang chờ",
      },
      completed: {
        icon: CheckCircle,
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
        label: "Hoàn thành",
      },
      failed: {
        icon: XCircle,
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
        label: "Thất bại",
      },
      cancelled: {
        icon: AlertCircle,
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        label: "Đã hủy",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  // Render badges cho phương thức thanh toán
  const PaymentMethodBadge: React.FC<{
    method: PaymentResponse["paymentMethod"];
  }> = ({ method }) => {
    const methodConfig = {
      qr: {
        label: "QR Code",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      credit: {
        label: "Thẻ tín dụng",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      },
      napas: {
        label: "Napas",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
      },
      undefined: {
        label: "Khác",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      },
    };

    const config = methodConfig[method] || methodConfig.undefined;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
      >
        <CreditCard className="mr-1 h-3 w-3" />
        {config.label}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Quản lý Thanh toán</title>
      </Helmet>

      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Quản lý Thanh toán
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Theo dõi và quản lý các giao dịch thanh toán của hệ thống.
            </p>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tổng doanh thu
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(stats.completedRevenue)}
                  </dd>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Hoàn thành
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.completed}
                  </dd>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Đang chờ
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.pending}
                  </dd>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Thất bại
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.failed}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bộ lọc và tìm kiếm */}
        <div className="mb-4 rounded-lg bg-white p-3 shadow dark:bg-gray-800 sm:mb-6 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Tìm kiếm */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo ID giao dịch, tên thành viên..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            {/* Lọc theo trạng thái */}
            <div>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value || undefined)
                }
              >
                <option value="">Tất cả trạng thái</option>
                {paymentStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo phương thức */}
            <div>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={filters.paymentMethod || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "paymentMethod",
                    e.target.value || undefined,
                  )
                }
              >
                <option value="">Tất cả phương thức</option>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Từ ngày */}
            <div>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={filters.dateFrom || ""}
                onChange={(e) =>
                  handleFilterChange("dateFrom", e.target.value || undefined)
                }
              />
            </div>

            {/* Đến ngày */}
            <div>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={filters.dateTo || ""}
                onChange={(e) =>
                  handleFilterChange("dateTo", e.target.value || undefined)
                }
              />
            </div>
          </div>
        </div>

        {/* Danh sách thanh toán */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 dark:text-red-400">
              <p>{error}</p>
              <button
                onClick={() => fetchPayments()}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <p>Không tìm thấy giao dịch thanh toán nào</p>
            </div>
          ) : (
            <>
              {/* Bảng cho màn hình lớn */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                        onClick={() => handleSortChange("created_at")}
                      >
                        <div className="flex items-center">
                          <span>Thời gian</span>
                          {filters.sortBy === "created_at" &&
                            (filters.sortOrder === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Thành viên
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Gói dịch vụ
                      </th>
                      <th
                        scope="col"
                        className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                        onClick={() => handleSortChange("amount")}
                      >
                        <div className="flex items-center">
                          <span>Số tiền</span>
                          {filters.sortBy === "amount" &&
                            (filters.sortOrder === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Phương thức
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Trạng thái
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {payments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {(payment as any).member.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {(payment as any).member_id?.email || ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {(payment as any).package.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {(payment as any).package_id?.category || ""}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <PaymentMethodBadge
                            method={
                              payment.paymentMethod as PaymentResponse["paymentMethod"]
                            }
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => fetchPaymentDetail(payment._id!)}
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                              title="Xem chi tiết"
                              disabled={detailLoading}
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {payment.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      payment._id!,
                                      "completed",
                                    )
                                  }
                                  className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-green-400"
                                  title="Xác nhận thanh toán"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(payment._id!, "failed")
                                  }
                                  className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
                                  title="Đánh dấu thất bại"
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Hiển thị dạng card cho màn hình nhỏ */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:hidden">
                {payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {(payment as any).member.name || "N/A"}
                          </span>
                          <StatusBadge status={payment.status} />
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </div>
                        <PaymentMethodBadge
                          method={
                            payment.paymentMethod as PaymentResponse["paymentMethod"]
                          }
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Gói dịch vụ:
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {(payment as any).package.name || "N/A"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3 dark:border-gray-700">
                      <button
                        onClick={() => fetchPaymentDetail(payment._id!)}
                        className="flex items-center gap-1 rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                        disabled={detailLoading}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Chi tiết</span>
                      </button>

                      {payment.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(payment._id!, "completed")
                            }
                            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-gray-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Xác nhận</span>
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(payment._id!, "failed")
                            }
                            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Thất bại</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Phân trang */}
          {!loading && !error && totalPages > 0 && (
            <div className="flex flex-col items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:px-6">
              <div className="mb-4 text-sm text-gray-700 dark:text-gray-300 sm:mb-0">
                <p>
                  Hiển thị{" "}
                  <span className="font-medium">{payments.length}</span> của{" "}
                  <span className="font-medium">{totalPayments}</span> giao dịch
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-600 dark:hover:bg-gray-700 ${
                      currentPage === 1 ? "cursor-not-allowed" : ""
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  {/* Hiển thị số trang trên màn hình lớn */}
                  <div className="hidden sm:flex">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            pageNumber === currentPage
                              ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Hiển thị chỉ số trang hiện tại trên mobile */}
                  <div className="flex items-center px-4 text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">
                    Trang {currentPage} / {totalPages}
                  </div>

                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-600 dark:hover:bg-gray-700 ${
                      currentPage === totalPages ? "cursor-not-allowed" : ""
                    }`}
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* Modal chi tiết thanh toán */}
        {showDetailModal && selectedPayment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowDetailModal(false)}
              ></div>

              <span
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Chi tiết giao dịch
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        ID giao dịch
                      </label>
                      <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                        {selectedPayment._id}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mã giao dịch
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedPayment.transactionId || "Chưa có"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Thành viên
                      </label>
                      <div className="mt-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedPayment.member.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedPayment.member.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedPayment.member.phone}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gói dịch vụ
                      </label>
                      <div className="mt-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedPayment.package.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Danh mục: {selectedPayment.package.category}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Giá gốc:{" "}
                          {formatCurrency(selectedPayment.package.price)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số tiền thanh toán
                      </label>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phương thức
                      </label>
                      <div className="mt-1">
                        <PaymentMethodBadge
                          method={selectedPayment.paymentMethod}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trạng thái
                      </label>
                      <div className="mt-1">
                        <StatusBadge status={selectedPayment.status} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Thời gian tạo
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedPayment.created_at)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cập nhật lần cuối
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedPayment.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedPayment.status === "pending" && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleStatusUpdate(selectedPayment._id, "failed");
                      }}
                      className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Đánh dấu thất bại
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleStatusUpdate(selectedPayment._id, "completed");
                      }}
                      className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Xác nhận thanh toán
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dialog xác nhận cập nhật trạng thái */}
        <ConfirmDialog
          isOpen={showStatusConfirm}
          title="Xác nhận cập nhật trạng thái"
          message={`Bạn có chắc chắn muốn ${
            statusUpdateData?.newStatus === "completed"
              ? "xác nhận thanh toán này"
              : statusUpdateData?.newStatus === "failed"
                ? "đánh dấu thanh toán này là thất bại"
                : "cập nhật trạng thái thanh toán này"
          }? Hành động này không thể hoàn tác.`}
          confirmLabel={
            statusUpdateData?.newStatus === "completed"
              ? "Xác nhận"
              : statusUpdateData?.newStatus === "failed"
                ? "Đánh dấu thất bại"
                : "Cập nhật"
          }
          cancelLabel="Hủy"
          confirmVariant={
            statusUpdateData?.newStatus === "failed" ? "danger" : "primary"
          }
          onConfirm={confirmStatusUpdate}
          onCancel={() => {
            setShowStatusConfirm(false);
            setStatusUpdateData(null);
          }}
        />
      </div>
    </>
  );
};

export default PaymentManagement;
