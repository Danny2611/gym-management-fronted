import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart2,
  LineChartIcon,
  TrendingUp,
  Filter,
  Settings,
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
import { reportMemberService } from "~/services/admin/reports/reportMemberService";
import {
  MemberStatsOptions,
  MemberStatsResponse,
  ComprehensiveMemberReport,
  RetentionAnalysis,
  StatusDistribution,
} from "~/types/memberReport";
import { toast } from "sonner";
import ComponentCard from "~/components/dashboard/common/ComponentCard";
import Spinner from "~/pages/user/Spinner";

const MembershipReport: React.FC = () => {
  // State for member data
  const [basicStats, setBasicStats] = useState<MemberStatsResponse[]>([]);
  const [comprehensiveReport, setComprehensiveReport] =
    useState<ComprehensiveMemberReport | null>(null);

  // State for UI
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // State for filters with better structure
  const [filters, setFilters] = useState<MemberStatsOptions>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(), // today
    groupBy: "day",
    includeRetention: true,
    includeChurn: true,
    status: undefined,
  });

  // Filter UI state
  const [showFilters, setShowFilters] = useState(false);

  // Chart colors
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  // Formatting functions
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatPercent = (num: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num / 100);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Fetch member data with improved error handling
  const fetchMemberData = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Validate date range
        if (
          filters.startDate &&
          filters.endDate &&
          filters.startDate > filters.endDate
        ) {
          throw new Error("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
        }

        const [statsResponse, comprehensiveResponse] = await Promise.all([
          reportMemberService.getMemberStats(filters),
          reportMemberService.getComprehensiveMemberReport(filters),
        ]);
        console.log("comprehensiveResponse", statsResponse);
        if (statsResponse.success && statsResponse.data) {
          setBasicStats(statsResponse.data);
        } else {
          throw new Error(
            statsResponse.message || "Không thể tải thống kê thành viên cơ bản",
          );
        }

        if (comprehensiveResponse.success && comprehensiveResponse.data) {
          setComprehensiveReport(comprehensiveResponse.data);
        } else {
          console.warn(
            "Không thể tải báo cáo chi tiết:",
            comprehensiveResponse.message,
          );
        }

        if (showRefreshToast) {
          toast.success("Dữ liệu thành viên đã được cập nhật");
        }
      } catch (err: any) {
        const errorMessage =
          err.message || "Đã xảy ra lỗi khi tải dữ liệu thành viên";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error fetching member data:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );

  // Load data on mount or when filters change
  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  // Handle filter changes with validation
  const handleFilterChange = (field: keyof MemberStatsOptions, value: any) => {
    if (field === "startDate" || field === "endDate") {
      const dateValue = typeof value === "string" ? new Date(value) : value;
      if (isNaN(dateValue.getTime())) {
        toast.error("Ngày không hợp lệ");
        return;
      }
      value = dateValue;
    }

    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMemberData(true);
  };

  // Handle export to Excel with loading state
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const data = await reportMemberService.exportToExcel();
      if (data) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `bao-cao-thanh-vien-${formatDate(new Date())}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Xuất file Excel thành công");
      }
    } catch (error) {
      toast.error("Xuất file Excel thất bại");
      console.error("Excel export error:", error);
    } finally {
      setExportingExcel(false);
    }
  };

  // Handle export to PDF with loading state
  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const data = await reportMemberService.exportToPDF();
      if (data) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `bao-cao-thanh-vien-${formatDate(new Date())}.pdf`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Xuất file PDF thành công");
      }
    } catch (error) {
      toast.error("Xuất file PDF thất bại");
      console.error("PDF export error:", error);
    } finally {
      setExportingPDF(false);
    }
  };

  // Stat card component with improved design
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
  }> = ({ title, value, change, icon, color, loading = false }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          ) : (
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {typeof value === "number" ? formatNumber(value) : value}
            </p>
          )}
          {change !== undefined && !loading && (
            <div className="mt-2 flex items-center text-sm">
              {change >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`ml-1 font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatPercent(Math.abs(change))}
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

  // Loading state
  if (loading) {
    return (
      <>
        <Helmet>
          <title>Báo cáo thành viên</title>
        </Helmet>
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
          <div className="flex h-64 items-center justify-center">
            <Spinner size="xl" />
          </div>
        </div>
      </>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <>
        <Helmet>
          <title>Báo cáo thành viên</title>
        </Helmet>
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
            <UserX className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
              Không thể tải dữ liệu
            </h3>
            <p className="mb-4 text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => fetchMemberData()}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-800"
            >
              <RefreshCw className="h-4 w-4" />
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
        <title>Báo cáo thành viên</title>
      </Helmet>

      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Báo cáo thành viên
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Phân tích và thống kê tình hình thành viên
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Bộ lọc</span>
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
            >
              {exportingExcel ? (
                <RefreshCw className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              ) : (
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span>{exportingExcel ? "Đang xuất..." : "Xuất Excel"}</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF}
              className="flex items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
            >
              {exportingPDF ? (
                <RefreshCw className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              ) : (
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span>{exportingPDF ? "Đang xuất..." : "Xuất PDF"}</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
            >
              <RefreshCw
                className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Đang cập nhật..." : "Làm mới"}</span>
            </button>
          </div>
        </div>

        {/* Filters - Collapsible */}
        {showFilters && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mb-6 sm:p-4">
            <div className="mb-3 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Bộ lọc báo cáo
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Từ ngày:
                </label>
                <input
                  type="date"
                  value={
                    filters.startDate
                      ? filters.startDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đến ngày:
                </label>
                <input
                  type="date"
                  value={
                    filters.startDate
                      ? filters.startDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nhóm theo:
                </label>
                <select
                  value={filters.groupBy || ""}
                  onChange={(e) =>
                    handleFilterChange("groupBy", e.target.value as any)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                >
                  <option value="day">Ngày</option>
                  <option value="week">Tuần</option>
                  <option value="month">Tháng</option>
                  <option value="year">Năm</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái:
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value || undefined)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                >
                  <option value="">Tất cả</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="banned">Bị cấm</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {comprehensiveReport?.summary && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Tổng thành viên"
              value={comprehensiveReport.summary.totalMembers}
              change={comprehensiveReport.summary.growthRate}
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-blue-500"
            />
            <StatCard
              title="Thành viên mới"
              value={comprehensiveReport.summary.totalGrowth}
              icon={<UserPlus className="h-6 w-6 text-white" />}
              color="bg-green-500"
            />
            <StatCard
              title="Thành viên rời đi"
              value={comprehensiveReport.churnAnalysis?.averageChurnRate || 0}
              icon={<UserMinus className="h-6 w-6 text-white" />}
              color="bg-red-500"
            />
            <StatCard
              title="Tỷ lệ giữ chân"
              value={
                comprehensiveReport.summary.retentionFunnel
                  ?.activeAfter30Days || 0
              }
              icon={<UserCheck className="h-6 w-6 text-white" />}
              color="bg-purple-500"
            />
          </div>
        )}

        {/* Charts and Detailed Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Member Growth Over Time */}
          {basicStats.length > 0 && (
            <ComponentCard
              title="Tăng trưởng thành viên theo thời gian"
              desc="Biểu đồ thể hiện sự thay đổi số lượng thành viên theo thời gian"
              icon={<LineChartIcon className="h-5 w-5 text-blue-500" />}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={basicStats}>
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
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => {
                        const labelMap: Record<string, string> = {
                          totalMembers: "Tổng thành viên",
                          newMembers: "Thành viên mới",
                          expiredMembers: "Thành viên hết hạn",
                        };
                        return [formatNumber(value), labelMap[name] || name];
                      }}
                      labelClassName="text-gray-900 dark:text-white"
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: "black",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalMembers"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Tổng thành viên"
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="newMembers"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Thành viên mới"
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expiredMembers"
                      stroke="#EF4444"
                      strokeWidth={2}
                      name="Thành viên hết hạn"
                      dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#EF4444", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ComponentCard>
          )}

          {/* Status Distribution */}
          {comprehensiveReport?.statusDistribution && (
            <ComponentCard
              title="Phân bố trạng thái thành viên"
              desc="Tỷ lệ các trạng thái thành viên hiện tại"
              icon={<PieChartIcon className="h-5 w-5 text-purple-500" />}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Hoạt động",
                          value:
                            comprehensiveReport.statusDistribution.active
                              ?.count || 0,
                        },
                        {
                          name: "Không hoạt động",
                          value:
                            comprehensiveReport.statusDistribution.inactive
                              ?.count || 0,
                        },
                        {
                          name: "Chờ xử lý",
                          value:
                            comprehensiveReport.statusDistribution.pending
                              ?.count || 0,
                        },
                        {
                          name: "Bị cấm",
                          value:
                            comprehensiveReport.statusDistribution.banned
                              ?.count || 0,
                        },
                      ].filter((item) => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${formatNumber(value)} thành viên`,
                        name,
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

          {/* Retention Analysis */}
          {comprehensiveReport?.retentionAnalysis &&
            comprehensiveReport.retentionAnalysis.length > 0 && (
              <ComponentCard
                title="Phân tích giữ chân thành viên"
                desc="Tỷ lệ giữ chân thành viên theo các nhóm"
                icon={<BarChart2 className="h-5 w-5 text-green-500" />}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comprehensiveReport.retentionAnalysis}>
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
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          const labelMap: Record<string, string> = {
                            retentionRate: "Tỷ lệ giữ chân",
                            churnRate: "Tỷ lệ rời đi",
                          };
                          return [`${value}%`, labelMap[name] || name];
                        }}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="retentionRate"
                        fill="#10B981"
                        name="Tỷ lệ giữ chân"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="churnRate"
                        fill="#EF4444"
                        name="Tỷ lệ rời đi"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ComponentCard>
            )}

          {/* Churn Reasons */}
          {comprehensiveReport?.churnAnalysis?.churnReasons &&
            comprehensiveReport.churnAnalysis.churnReasons.length > 0 && (
              <ComponentCard
                title="Lý do rời đi của thành viên"
                desc="Các lý do chính khiến thành viên rời đi"
                icon={<UserX className="h-5 w-5 text-red-500" />}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={comprehensiveReport.churnAnalysis.churnReasons}
                      margin={{ left: 30 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-gray-200 dark:stroke-gray-700"
                      />
                      <XAxis
                        type="number"
                        className="text-gray-600 dark:text-gray-400"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        dataKey="reason"
                        type="category"
                        width={100}
                        className="text-gray-600 dark:text-gray-400"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: any) => [
                          `${value} thành viên`,
                          "Số lượng",
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#EF4444"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ComponentCard>
            )}
        </div>

        {/* Additional Stats Tables */}
        {comprehensiveReport && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Growth Periods */}
            {comprehensiveReport.topGrowthPeriods &&
              comprehensiveReport.topGrowthPeriods.length > 0 && (
                <ComponentCard
                  title="Giai đoạn tăng trưởng mạnh nhất"
                  desc="Các giai đoạn có số lượng thành viên tăng trưởng nhiều nhất"
                  icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Giai đoạn
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Tăng trưởng
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {comprehensiveReport.topGrowthPeriods.map(
                          (period, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? "bg-white dark:bg-gray-800"
                                  : "bg-gray-50 dark:bg-gray-700"
                              }
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {period.period}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-green-600 dark:text-green-400">
                                +{formatNumber(period.growth)}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </ComponentCard>
              )}

            {/* Retention Funnel */}
            {comprehensiveReport.summary.retentionFunnel && (
              <ComponentCard
                title="Phễu giữ chân thành viên"
                desc="Tỷ lệ thành viên tiếp tục hoạt động sau khi đăng ký"
                icon={<Clock className="h-5 w-5 text-purple-500" />}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          Khoảng thời gian
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          Số lượng
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          Tỷ lệ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                      <tr className="bg-white dark:bg-gray-800">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          Thành viên mới
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {formatNumber(
                            comprehensiveReport.summary.retentionFunnel
                              .newMembers,
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          100%
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          Hoạt động sau 30 ngày
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {formatNumber(
                            comprehensiveReport.summary.retentionFunnel
                              .activeAfter30Days,
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-green-600 dark:text-green-400">
                          {formatPercent(
                            comprehensiveReport.summary.retentionFunnel
                              .activeAfter30Days /
                              comprehensiveReport.summary.retentionFunnel
                                .newMembers,
                          )}
                        </td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-800">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          Hoạt động sau 90 ngày
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {formatNumber(
                            comprehensiveReport.summary.retentionFunnel
                              .activeAfter90Days,
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-green-600 dark:text-green-400">
                          {formatPercent(
                            comprehensiveReport.summary.retentionFunnel
                              .activeAfter90Days /
                              comprehensiveReport.summary.retentionFunnel
                                .newMembers,
                          )}
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          Hoạt động sau 180 ngày
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {formatNumber(
                            comprehensiveReport.summary.retentionFunnel
                              .activeAfter180Days,
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-green-600 dark:text-green-400">
                          {formatPercent(
                            comprehensiveReport.summary.retentionFunnel
                              .activeAfter180Days /
                              comprehensiveReport.summary.retentionFunnel
                                .newMembers,
                          )}
                        </td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-800">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          Hoạt động sau 365 ngày
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {formatNumber(
                            comprehensiveReport.summary.retentionFunnel
                              .activeAfter365Days,
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-green-600 dark:text-green-400">
                          {formatPercent(
                            comprehensiveReport.summary.retentionFunnel
                              .activeAfter365Days /
                              comprehensiveReport.summary.retentionFunnel
                                .newMembers,
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ComponentCard>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MembershipReport;
