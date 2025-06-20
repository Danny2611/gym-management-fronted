import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  TrendingUp,
  Users,
  DollarSign,
  UserCheck,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Package,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { reportService } from "~/services/admin/reportService";
import {
  DashboardStatsResponse,
  RevenueTimeSeriesResponse,
  AdvancedAnalyticsResponse,
  ReportDateRange,
} from "~/services/admin/reportService";
import { toast } from "sonner";
import ComponentCard from "~/components/dashboard/common/ComponentCard";
import Spinner from "~/pages/user/Spinner";

const Dashboard: React.FC = () => {
  // State cho dữ liệu dashboard
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStatsResponse | null>(null);
  const [revenueTimeSeries, setRevenueTimeSeries] = useState<
    RevenueTimeSeriesResponse[]
  >([]);
  const [advancedAnalytics, setAdvancedAnalytics] =
    useState<AdvancedAnalyticsResponse | null>(null);

  // State cho UI
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho date range
  const [dateRange, setDateRange] = useState<ReportDateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 ngày trước
    endDate: new Date().toISOString().split("T")[0], // Hôm nay
  });

  // Màu sắc cho biểu đồ
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  // Tải dữ liệu dashboard
  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [statsResponse, timeSeriesResponse, analyticsResponse] =
        await Promise.all([
          reportService.getDashboardStats(dateRange),
          reportService.getRevenueTimeSeries({
            ...dateRange,
            groupBy: "day",
          }),
          reportService.getAdvancedAnalytics(dateRange),
        ]);

      if (statsResponse.success && statsResponse.data) {
        setDashboardStats(statsResponse.data);
      } else {
        throw new Error(
          statsResponse.message || "Không thể tải thống kê dashboard",
        );
      }

      if (timeSeriesResponse.success && timeSeriesResponse.data) {
        setRevenueTimeSeries(timeSeriesResponse.data);
      }

      if (analyticsResponse.success && analyticsResponse.data) {
        setAdvancedAnalytics(analyticsResponse.data);
      }

      setError(null);

      if (showRefreshToast) {
        toast.success("Dữ liệu đã được cập nhật");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu dashboard");
      toast.error("Không thể tải dữ liệu dashboard");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load dữ liệu khi component mount hoặc dateRange thay đổi
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  // Xử lý thay đổi date range
  const handleDateRangeChange = (
    field: keyof ReportDateRange,
    value: string,
  ) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Xử lý refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format số lượng
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Format phần trăm
  const formatPercent = (num: number) => {
    return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
  };

  // Component thống kê tổng quan
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {change !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {change >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`ml-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatPercent(change)}
              </span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                so với tháng trước
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-full p-3 ${color}`}>{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Dashboard - Báo cáo và Doanh thu</title>
        </Helmet>
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
          <div className="flex h-64 items-center justify-center">
            <Spinner size="xl" />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Dashboard - Báo cáo và Doanh thu</title>
        </Helmet>
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
          <div className="p-6 text-center text-red-500 dark:text-red-400">
            <p>{error}</p>
            <button
              onClick={() => fetchDashboardData()}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Báo cáo và Doanh thu</title>
      </Helmet>

      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Dashboard - Báo cáo và Doanh thu
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Tổng quan về tình hình kinh doanh và thành viên
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
            >
              <RefreshCw
                className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Đang cập nhật..." : "Làm mới"}</span>
            </button>
          </div>
        </div>

        {/* Bộ lọc ngày tháng */}
        <div className="mb-4 rounded-lg bg-white p-3 shadow dark:bg-gray-800 sm:mb-6 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Khoảng thời gian:
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Từ:
                </label>
                <input
                  type="date"
                  value={dateRange.startDate || ""}
                  onChange={(e) =>
                    handleDateRangeChange("startDate", e.target.value)
                  }
                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Đến:
                </label>
                <input
                  type="date"
                  value={dateRange.endDate || ""}
                  onChange={(e) =>
                    handleDateRangeChange("endDate", e.target.value)
                  }
                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        {dashboardStats && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Tổng doanh thu"
              value={formatCurrency(dashboardStats.totalRevenue)}
              change={dashboardStats.revenueGrowth}
              icon={<DollarSign className="h-6 w-6 text-white" />}
              color="bg-green-500"
            />
            <StatCard
              title="Tổng thành viên"
              value={dashboardStats.totalMembers}
              change={dashboardStats.memberGrowth}
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-blue-500"
            />
            <StatCard
              title="Thành viên hoạt động"
              value={dashboardStats.activeMembers}
              icon={<UserCheck className="h-6 w-6 text-white" />}
              color="bg-purple-500"
            />
            <StatCard
              title="Hết hạn trong tháng"
              value={dashboardStats.expiredMemberships}
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              color="bg-orange-500"
            />
          </div>
        )}

        {/* Biểu đồ và thống kê chi tiết */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Biểu đồ doanh thu theo thời gian */}
          {revenueTimeSeries.length > 0 && (
            <ComponentCard
              title="Doanh thu theo thời gian"
              desc="Biểu đồ thể hiện xu hướng doanh thu trong khoảng thời gian đã chọn"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTimeSeries}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="period"
                      className="text-gray-600 dark:text-gray-400"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className="text-gray-600 dark:text-gray-400"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        formatCurrency(value),
                        "Doanh thu",
                      ]}
                      labelClassName="text-gray-900"
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ComponentCard>
          )}

          {/* Gói dịch vụ phổ biến */}
          {dashboardStats?.topPackages &&
            dashboardStats.topPackages.length > 0 && (
              <ComponentCard
                title="Gói dịch vụ phổ biến"
                desc="Top các gói dịch vụ có doanh thu cao nhất"
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardStats.topPackages}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-gray-200 dark:stroke-gray-700"
                      />
                      <XAxis
                        dataKey="packageName"
                        className="text-gray-600 dark:text-gray-400"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        className="text-gray-600 dark:text-gray-400"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip
                        formatter={(value: any) => [
                          formatCurrency(value),
                          "Doanh thu",
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ComponentCard>
            )}

          {/* Phân tích độ phổ biến gói dịch vụ */}
          {advancedAnalytics?.packagePopularity &&
            advancedAnalytics.packagePopularity.length > 0 && (
              <ComponentCard
                title="Phân bố gói dịch vụ"
                desc="Tỷ lệ sử dụng các loại gói dịch vụ"
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={advancedAnalytics.packagePopularity}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ packageName, percentage }) =>
                          `${packageName}: ${percentage}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {advancedAnalytics.packagePopularity.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [`${value}%`, "Tỷ lệ"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ComponentCard>
            )}

          {/* Phương thức thanh toán */}
          {advancedAnalytics?.revenueByPaymentMethod &&
            advancedAnalytics.revenueByPaymentMethod.length > 0 && (
              <ComponentCard
                title="Doanh thu theo phương thức thanh toán"
                desc="Phân bố doanh thu theo các hình thức thanh toán"
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={advancedAnalytics.revenueByPaymentMethod}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percentage }) =>
                          `${method}: ${percentage}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {advancedAnalytics.revenueByPaymentMethod.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any, props: any) => [
                          formatCurrency(props.payload.revenue),
                          "Doanh thu",
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ComponentCard>
            )}
        </div>

        {/* Phân tích nâng cao */}
        {advancedAnalytics && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ComponentCard title="Tỷ lệ giữ chân khách hàng">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {advancedAnalytics.memberRetentionRate.toFixed(1)}%
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Khách hàng tiếp tục sử dụng dịch vụ
                </p>
              </div>
            </ComponentCard>

            <ComponentCard title="Giá trị trung bình khách hàng">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(advancedAnalytics.averageLifetimeValue)}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Doanh thu trung bình mỗi khách hàng
                </p>
              </div>
            </ComponentCard>

            <ComponentCard title="Tỷ lệ rời bỏ dịch vụ">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {advancedAnalytics.churnRate.toFixed(1)}%
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Khách hàng ngừng sử dụng dịch vụ
                </p>
              </div>
            </ComponentCard>
          </div>
        )}

        {/* Giao dịch gần đây */}
        {dashboardStats?.recentPayments &&
          dashboardStats.recentPayments.length > 0 && (
            <ComponentCard
              title="Giao dịch gần đây"
              desc="Danh sách các giao dịch thanh toán mới nhất"
              className="mt-6"
            >
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Thành viên
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Gói dịch vụ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Số tiền
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Ngày
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {dashboardStats.recentPayments
                      .slice(0, 5)
                      .map((payment) => (
                        <tr
                          key={payment.paymentId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {payment.memberName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {payment.packageName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                payment.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : payment.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                    : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                              }`}
                            >
                              {payment.status === "completed"
                                ? "Hoàn thành"
                                : payment.status === "pending"
                                  ? "Đang xử lý"
                                  : "Thất bại"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(payment.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </ComponentCard>
          )}
      </div>
    </>
  );
};

export default Dashboard;
