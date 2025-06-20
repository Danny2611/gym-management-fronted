import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Search,
  Plus,
  Edit,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar as CalendarIcon,
  ChevronDown,
  BarChart2,
} from "lucide-react";
import { appointmentService } from "~/services/admin/appointmentService";
import {
  Appointment,
  AppointmentStatus,
  AppointmentQueryParams,
  AppointmentStats,
} from "~/types/appointment";
import { toast } from "sonner";
import ConfirmDialog from "~/components/common/ConfirmDialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const AppointmentManagement: React.FC = () => {
  // State for appointments list and pagination
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for stats
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // State for status change confirmation
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{
    id: string;
    status: AppointmentStatus;
  } | null>(null);

  // State for filters and sorting
  const [filters, setFilters] = useState<AppointmentQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    sortBy: "date",
    sortOrder: "desc",
  });

  // State for date range filter
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAllAppointments({
        ...filters,
        page: currentPage,
      });

      if (response.success && response.data) {
        setAppointments(response.data.appointments);
        setTotalAppointments(response.data.totalAppointments);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setError(null);
      } else {
        setError(response.message || "Không thể tải danh sách lịch hẹn");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách lịch hẹn");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointment stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await appointmentService.getAppointmentStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load data when component mounts or when filters or currentPage change
  useEffect(() => {
    fetchAppointments();
  }, [filters, currentPage]);

  // Load stats when component mounts
  useEffect(() => {
    fetchStats();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter change
  const handleFilterChange = (
    name: keyof AppointmentQueryParams,
    value: any,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  // Handle date range filter changes
  const handleDateRangeChange = (
    field: "startDate" | "endDate",
    value: string,
  ) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply date range filter
  const applyDateFilter = () => {
    setFilters((prev) => ({
      ...prev,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    }));
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  // Handle status change confirmation
  const handleStatusConfirm = (
    appointmentId: string,
    status: AppointmentStatus,
  ) => {
    setAppointmentToUpdate({ id: appointmentId, status });
    setShowStatusConfirm(true);
  };

  // Update appointment status
  const handleUpdateStatus = async () => {
    if (!appointmentToUpdate) return;

    try {
      const response = await appointmentService.updateAppointmentStatus(
        appointmentToUpdate.id,
        appointmentToUpdate.status,
      );

      if (response.success) {
        toast.success("Cập nhật trạng thái lịch hẹn thành công");
        fetchAppointments(); // Reload data
        fetchStats(); // Reload stats
      } else {
        toast.error(
          response.message || "Không thể cập nhật trạng thái lịch hẹn",
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái lịch hẹn");
      console.error(error);
    } finally {
      setShowStatusConfirm(false);
      setAppointmentToUpdate(null);
    }
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: vi });
  };

  // Format time
  const formatTime = (time: { start: string; end: string }) => {
    return `${time.start} - ${time.end}`;
  };

  // Render status badge
  const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
    const statusConfig = {
      confirmed: {
        label: "Đã xác nhận",
        class:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      pending: {
        label: "Chờ xác nhận",
        class:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
      cancelled: {
        label: "Đã hủy",
        class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      },
      completed: {
        label: "Hoàn thành",
        class:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      missed: {
        label: "Bỏ lỡ",
        class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      },
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[status].class}`}
      >
        {statusConfig[status].label}
      </span>
    );
  };

  // Render status icon
  const StatusIcon: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "missed":
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  // Render status dropdown
  const StatusDropdown: React.FC<{ appointment: Appointment }> = ({
    appointment,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const statusOptions: { value: AppointmentStatus; label: string }[] = [
      { value: "confirmed", label: "Đã xác nhận" },
      { value: "pending", label: "Chờ xác nhận" },
      { value: "cancelled", label: "Đã hủy" },
      { value: "completed", label: "Hoàn thành" },
      { value: "missed", label: "Bỏ lỡ" },
    ];

    return (
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex w-full items-center justify-between gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <div className="flex items-center gap-1.5">
            <StatusIcon status={appointment.status} />
            <span>
              {
                statusOptions.find(
                  (option) => option.value === appointment.status,
                )?.label
              }
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
          >
            {statusOptions
              .filter((option) => option.value !== appointment.status)
              .map((option) => (
                <button
                  key={option.value}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  onClick={() => {
                    handleStatusConfirm(appointment._id, option.value);
                    setIsOpen(false);
                  }}
                >
                  <StatusIcon status={option.value} />
                  <span className="ml-2">{option.label}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Quản lý Lịch hẹn</title>
      </Helmet>
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Quản lý Lịch hẹn
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Quản lý lịch hẹn tập luyện của hội viên với huấn luyện viên
            </p>
          </div>
          <a
            href="#stats"
            className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
          >
            <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Xem thống kê</span>
          </a>
        </div>

        {/* Stats section */}
        <section
          id="stats"
          className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4"
        >
          {loadingStats ? (
            <div className="col-span-full flex justify-center p-4">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : stats ? (
            <>
              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tổng lịch hẹn
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
                <div className="mt-1 flex space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Hôm nay: {stats.upcomingToday}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Tuần này: {stats.upcomingWeek}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Đã xác nhận
                </h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.confirmed}
                </p>
                <div className="mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.total > 0
                      ? Math.round((stats.confirmed / stats.total) * 100)
                      : 0}
                    % tổng lịch hẹn
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Hoàn thành
                </h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.completed}
                </p>
                <div className="mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.total > 0
                      ? Math.round((stats.completed / stats.total) * 100)
                      : 0}
                    % tổng lịch hẹn
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Bỏ lỡ/Hủy
                </h3>
                <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.missed + stats.cancelled}
                </p>
                <div className="mt-1 flex space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Bỏ lỡ: {stats.missed}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Hủy: {stats.cancelled}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-full p-4 text-center text-gray-500 dark:text-gray-400">
              Không thể tải dữ liệu thống kê
            </div>
          )}
        </section>

        {/* Filters and search */}
        <div className="mb-4 rounded-lg bg-white p-3 shadow dark:bg-gray-800 sm:mb-6 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm lịch hẹn..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Filter by status */}
            <div>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value || undefined)
                }
              >
                <option value="">Tất cả trạng thái</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Hoàn thành</option>
                <option value="missed">Bỏ lỡ</option>
              </select>
            </div>

            {/* Start date filter */}
            <div>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={dateRange.startDate}
                onChange={(e) =>
                  handleDateRangeChange("startDate", e.target.value)
                }
                placeholder="Từ ngày"
              />
            </div>

            {/* End date filter */}
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={dateRange.endDate}
                onChange={(e) =>
                  handleDateRangeChange("endDate", e.target.value)
                }
                placeholder="Đến ngày"
              />
              <button
                onClick={applyDateFilter}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Appointments list */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 dark:text-red-400">
              <p>{error}</p>
              <button
                onClick={() => fetchAppointments()}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <p>Không tìm thấy lịch hẹn nào</p>
            </div>
          ) : (
            <>
              {/* Table for large screens */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                        onClick={() => handleSortChange("date")}
                      >
                        <div className="flex cursor-pointer items-center">
                          <span>Ngày</span>
                          {filters.sortBy === "date" &&
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
                        Thời gian
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Hội viên
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Huấn luyện viên
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Địa điểm
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
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {appointments.map((appointment) => (
                      <tr
                        key={appointment._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">
                          {formatDate(appointment.date)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">
                          {formatTime(appointment.time)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">
                              {appointment.member.name}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">
                              {appointment.trainer.name}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">
                          {appointment.location || "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={appointment.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <StatusDropdown appointment={appointment} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card view for mobile */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="mb-2 flex justify-between">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-1 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>

                    <div className="mb-2 grid grid-cols-2 gap-1 text-sm">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Clock className="mr-1 h-4 w-4 text-gray-500" />
                        <span>{formatTime(appointment.time)}</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <MapPin className="mr-1 h-4 w-4 text-gray-500" />
                        <span>{appointment.location || "Không có"}</span>
                      </div>
                    </div>

                    <div className="mb-2 grid grid-cols-1 gap-1 text-sm">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <User className="mr-1 h-4 w-4 text-gray-500" />
                        <span className="font-medium">Hội viên:</span>
                        <span className="ml-1">{appointment.member.name}</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <User className="mr-1 h-4 w-4 text-gray-500" />
                        <span className="font-medium">Huấn luyện viên:</span>
                        <span className="ml-1">{appointment.trainer.name}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Ghi chú:</span>{" "}
                        {appointment.notes}
                      </div>
                    )}

                    <div className="mt-2">
                      <StatusDropdown appointment={appointment} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 0 && (
            <div className="flex flex-col items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:px-6">
              <div className="mb-4 text-sm text-gray-700 dark:text-gray-300 sm:mb-0">
                <p>
                  Hiển thị{" "}
                  <span className="font-medium">{appointments.length}</span> của{" "}
                  <span className="font-medium">{totalAppointments}</span> lịch
                  hẹn
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
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show current page, first page, last page, and pages within 1 of current page
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      // Show ellipsis between non-consecutive pages
                      const showEllipsisBefore =
                        index > 0 && array[index - 1] !== page - 1;
                      const showEllipsisAfter =
                        index < array.length - 1 &&
                        array[index + 1] !== page + 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:text-gray-200 dark:ring-gray-600">
                              ...
                            </span>
                          )}

                          <button
                            onClick={() => handlePageChange(page)}
                            aria-current={
                              currentPage === page ? "page" : undefined
                            }
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === page
                                ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-700"
                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>

                          {showEllipsisAfter && (
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:text-gray-200 dark:ring-gray-600">
                              ...
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status confirmation dialog */}
      <ConfirmDialog
        isOpen={showStatusConfirm}
        title="Xác nhận thay đổi trạng thái"
        message={
          appointmentToUpdate
            ? `Bạn có chắc chắn muốn thay đổi trạng thái lịch hẹn thành "${
                {
                  confirmed: "Đã xác nhận",
                  pending: "Chờ xác nhận",
                  cancelled: "Đã hủy",
                  completed: "Hoàn thành",
                  missed: "Bỏ lỡ",
                }[appointmentToUpdate.status]
              }" không?`
            : "Bạn có chắc chắn muốn thay đổi trạng thái lịch hẹn không?"
        }
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
        onConfirm={handleUpdateStatus}
        onCancel={() => {
          setShowStatusConfirm(false);
          setAppointmentToUpdate(null);
        }}
      />
    </>
  );
};

export default AppointmentManagement;
