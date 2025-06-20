// # Báo cáo doanh thu
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
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
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import { revenueReportService } from "~/services/admin/reports/revenueReportService";
import {
  RevenueByPackageResponse,
  RevenueTimeSeriesResponse,
  AdvancedAnalyticsResponse,
  ComprehensiveRevenueReport,
  ReportDateRange,
  RevenueReportOptions,
} from "~/types/revenueReport";
import { toast } from "sonner";
import ComponentCard from "~/components/dashboard/common/ComponentCard";
import Spinner from "~/pages/user/Spinner";

const RevenueReport: React.FC = () => {
  // State cho dữ liệu báo cáo
  const [revenueByPackages, setRevenueByPackages] = useState<
    RevenueByPackageResponse[]
  >([]);
  const [revenueTimeSeries, setRevenueTimeSeries] = useState<
    RevenueTimeSeriesResponse[]
  >([]);
  const [advancedAnalytics, setAdvancedAnalytics] =
    useState<AdvancedAnalyticsResponse | null>(null);
  const [comprehensiveReport, setComprehensiveReport] =
    useState<ComprehensiveRevenueReport | null>(null);

  // State cho UI
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho bộ lọc
  const [dateRange, setDateRange] = useState<ReportDateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 ngày trước
    endDate: new Date(), // Hôm nay
  });

  const [reportOptions, setReportOptions] = useState<RevenueReportOptions>({
    groupBy: "day",
    category: undefined,
    packageId: undefined,
  });

  // Màu sắc cho biểu đồ
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#F97316",
    "#84CC16",
  ];

  // Tải dữ liệu báo cáo
  const fetchRevenueData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const options: RevenueReportOptions = {
        ...dateRange,
        ...reportOptions,
      };

      const [
        packagesResponse,
        timeSeriesResponse,
        analyticsResponse,
        comprehensiveResponse,
      ] = await Promise.all([
        revenueReportService.getRevenueByPackages(options),
        revenueReportService.getRevenueTimeSeries(options),
        revenueReportService.getAdvancedAnalytics(dateRange),
        revenueReportService.getComprehensiveRevenueReport(options),
      ]);
      console.log(
        "analyticsResponse:",
        analyticsResponse.data?.revenueByPaymentMethod,
      );
      if (packagesResponse.success && packagesResponse.data) {
        setRevenueByPackages(packagesResponse.data);
      }

      if (timeSeriesResponse.success && timeSeriesResponse.data) {
        setRevenueTimeSeries(timeSeriesResponse.data);
      }

      if (analyticsResponse.success && analyticsResponse.data) {
        setAdvancedAnalytics(analyticsResponse.data);
      }

      if (comprehensiveResponse.success && comprehensiveResponse.data) {
        setComprehensiveReport(comprehensiveResponse.data);
      }

      setError(null);

      if (showRefreshToast) {
        toast.success("Báo cáo đã được cập nhật");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải báo cáo doanh thu");
      toast.error("Không thể tải báo cáo doanh thu");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load dữ liệu khi component mount hoặc options thay đổi
  useEffect(() => {
    fetchRevenueData();
  }, [dateRange, reportOptions]);

  // Xử lý thay đổi date range
  const handleDateRangeChange = (field: keyof ReportDateRange, value: Date) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Xử lý thay đổi options
  const handleOptionsChange = (
    field: keyof RevenueReportOptions,
    value: any,
  ) => {
    setReportOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Xử lý refresh
  const handleRefresh = () => {
    fetchRevenueData(true);
  };

  // Xử lý export Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await revenueReportService.exportRevenueReportToExcel();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bao-cao-doanh-thu-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Đã tải xuống báo cáo Excel");
      } else {
        toast.error("Không thể tải xuống báo cáo Excel");
      }
    } catch (error) {
      toast.error("Lỗi khi tải xuống báo cáo Excel");
    } finally {
      setExporting(false);
    }
  };

  // Xử lý export PDF
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const blob = await revenueReportService.exportRevenueReportToPDF();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bao-cao-doanh-thu-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Đã tải xuống báo cáo PDF");
      } else {
        toast.error("Không thể tải xuống báo cáo PDF");
      }
    } catch (error) {
      toast.error("Lỗi khi tải xuống báo cáo PDF");
    } finally {
      setExporting(false);
    }
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

  // Format ngày
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Component thống kê tổng quan
  const SummaryCard: React.FC<{
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
                so với kỳ trước
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
          <title>Báo cáo Doanh thu - Gym Management</title>
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
          <title>Báo cáo Doanh thu - Gym Management</title>
        </Helmet>
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
          <div className="p-6 text-center text-red-500 dark:text-red-400">
            <p>{error}</p>
            <button
              onClick={() => fetchRevenueData()}
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
        <title>Báo cáo Doanh thu - Gym Management</title>
      </Helmet>

      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Báo cáo Doanh thu
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Báo cáo chi tiết về doanh thu từ các gói dịch vụ
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>PDF</span>
            </button>

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

        {/* Bộ lọc */}
        <div className="mb-4 rounded-lg bg-white p-3 shadow dark:bg-gray-800 sm:mb-6 sm:p-4">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bộ lọc báo cáo:
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Từ ngày:
                </label>
                <input
                  type="date"
                  value={
                    dateRange.startDate ? formatDate(dateRange.startDate) : ""
                  }
                  onChange={(e) =>
                    handleDateRangeChange("startDate", new Date(e.target.value))
                  }
                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Đến ngày:
                </label>
                <input
                  type="date"
                  value={dateRange.endDate ? formatDate(dateRange.endDate) : ""}
                  onChange={(e) =>
                    handleDateRangeChange("endDate", new Date(e.target.value))
                  }
                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Group By */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Nhóm theo:
              </label>
              <select
                value={reportOptions.groupBy || "day"}
                onChange={(e) => handleOptionsChange("groupBy", e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
                <option value="year">Theo năm</option>
              </select>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Loại gói:
              </label>
              <select
                value={reportOptions.category || ""}
                onChange={(e) =>
                  handleOptionsChange("category", e.target.value || undefined)
                }
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Tất cả</option>
                <option value="basic">Basic</option>
                <option value="fitness">Fitness</option>
                <option value="premium">Premium</option>
                <option value="platinum">Platinum</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        {comprehensiveReport?.summary && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Tổng doanh thu"
              value={formatCurrency(comprehensiveReport.summary.totalRevenue)}
              change={comprehensiveReport.summary.periodOverPeriodGrowth}
              icon={<DollarSign className="h-6 w-6 text-white" />}
              color="bg-green-500"
            />
            <SummaryCard
              title="Tổng số đơn hàng"
              value={comprehensiveReport.summary.totalSales}
              icon={<Package className="h-6 w-6 text-white" />}
              color="bg-blue-500"
            />
            <SummaryCard
              title="Giá trị đơn hàng trung bình"
              value={formatCurrency(
                comprehensiveReport.summary.averageOrderValue,
              )}
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              color="bg-purple-500"
            />
            <SummaryCard
              title="Gói bán chạy nhất"
              value={comprehensiveReport.summary.topPerformingPackage.name}
              icon={<BarChart3 className="h-6 w-6 text-white" />}
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
              desc="Xu hướng doanh thu trong khoảng thời gian đã chọn"
              className="lg:col-span-2"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={revenueTimeSeries}>
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
                      yAxisId="revenue"
                      className="text-gray-600 dark:text-gray-400"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis
                      yAxisId="sales"
                      orientation="right"
                      className="text-gray-600 dark:text-gray-400"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === "totalRevenue"
                          ? formatCurrency(value)
                          : formatNumber(value),
                        name === "totalRevenue" ? "Doanh thu" : "Số đơn hàng",
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="totalRevenue"
                      fill="#3B82F6"
                      fillOpacity={0.1}
                    />
                    <Line
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    />
                    <Bar
                      yAxisId="sales"
                      dataKey="totalSales"
                      fill="#10B981"
                      opacity={0.7}
                      radius={[2, 2, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </ComponentCard>
          )}

          {/* Doanh thu theo gói dịch vụ */}
          {revenueByPackages.length > 0 && (
            <ComponentCard
              title="Doanh thu theo gói dịch vụ"
              desc="So sánh doanh thu giữa các gói dịch vụ"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByPackages}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="packageName"
                      className="text-gray-600 dark:text-gray-400"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
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
                      dataKey="totalRevenue"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    >
                      {revenueByPackages.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ComponentCard>
          )}

          {/* Phân tích độ phổ biến gói dịch vụ */}
          {advancedAnalytics?.packagePopularity &&
            advancedAnalytics.packagePopularity.length > 0 && (
              <ComponentCard
                title="Độ phổ biến gói dịch vụ"
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
                        formatter={(value: any, name: any, props: any) => [
                          `${value}% (${formatNumber(props.payload.memberCount)} thành viên)`,
                          "Tỷ lệ",
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

          {/* Doanh thu theo phương thức thanh toán */}
          {advancedAnalytics?.revenueByPaymentMethod &&
            advancedAnalytics.revenueByPaymentMethod.length > 0 && (
              <ComponentCard
                title="Doanh thu theo phương thức thanh toán"
                desc="Phân bố doanh thu theo các hình thức thanh toán"
                className="lg:col-span-2"
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={advancedAnalytics.revenueByPaymentMethod}
                      layout="vertical" // Thay đổi từ horizontal sang vertical
                      margin={{ left: 80 }} // Thêm margin để tránh bị cắt chữ
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-gray-200 dark:stroke-gray-700"
                      />
                      <XAxis
                        type="number"
                        className="text-gray-600 dark:text-gray-400"
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <YAxis
                        type="category"
                        dataKey="method"
                        className="text-gray-600 dark:text-gray-400"
                        width={100}
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
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {advancedAnalytics.revenueByPaymentMethod.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ),
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ComponentCard>
            )}
        </div>

        {/* Bảng chi tiết doanh thu theo gói */}
        {revenueByPackages.length > 0 && (
          <ComponentCard
            title="Chi tiết doanh thu theo gói dịch vụ"
            desc="Thông tin chi tiết về hiệu suất từng gói dịch vụ"
            className="mt-6"
          >
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Gói dịch vụ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Loại gói
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Doanh thu
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Số đơn hàng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Giá trị trung bình
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Tỷ lệ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {revenueByPackages.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {item.packageName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {item.category}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                        {formatNumber(item.totalSales)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.averageRevenue)}
                      </td>
                    </tr>
                  ))}
                  {comprehensiveReport?.summary && (
                    <tr className="bg-gray-50 font-semibold dark:bg-gray-700">
                      <td
                        className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white"
                        colSpan={2}
                      >
                        Tổng cộng
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(
                          comprehensiveReport.summary.totalRevenue,
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                        {formatNumber(comprehensiveReport.summary.totalSales)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(
                          comprehensiveReport.summary.averageOrderValue,
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                        100%
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ComponentCard>
        )}
      </div>
    </>
  );
};

export default RevenueReport;
