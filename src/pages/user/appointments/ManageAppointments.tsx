import React, { useState, useEffect } from "react";
import { Search, Filter, AlertTriangle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Import các components đã được tách riêng
import {
  AppointmentCard,
  AppointmentItem,
} from "~/components/user/appointments/AppointmentCard";
import { ConfirmModal } from "~/components/shared/ConfirmModal";
import { EmptyStateCard } from "~/components/user/appointments/EmptyStateCard";
import { PaginationControls } from "~/components/common/PaginationControls";
import {
  appointmentService,
  AppointmentListFilter,
} from "~/services/appointmentService";
import { canBeCancelled } from "~/components/user/appointments/AppointmentUtils";

const ManageAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    appointmentId: string | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    appointmentId: null,
    title: "",
    message: "",
  });
  const itemsPerPage = 3;

  // Fetch appointments data
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: AppointmentListFilter = {};

      // Add status filter if not 'all'
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }

      // Add search term if not empty
      if (searchTerm.trim()) {
        filters.searchTerm = searchTerm.trim();
      }

      const response =
        await appointmentService.getAllMemberAppointments(filters);

      if (response.success && response.data) {
        setAppointments(response.data);
      } else {
        setError(response.message || "Không thể tải danh sách lịch hẹn");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách lịch hẹn");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount and when filters change
  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  // Sort appointments - upcoming first, then by date
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    const today = new Date().getTime();

    // Past appointments go to the bottom
    if (dateA < today && dateB >= today) return 1;
    if (dateB < today && dateA >= today) return -1;

    // Sort by date
    return dateA - dateB;
  });

  // Paginate appointments
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Open confirm cancel modal
  const openCancelModal = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);

    if (!appointment) return;

    if (!canBeCancelled(appointment)) {
      // If can't be cancelled, show error toast
      if (appointment.status === "confirmed") {
        toast.error(
          "Bạn chỉ có thể hủy lịch hẹn trước ngày hẹn ít nhất 1 ngày",
        );
      } else if (
        appointment.status === "completed" ||
        appointment.status === "cancelled"
      ) {
        toast.error(
          `Không thể hủy lịch hẹn đã ${appointment.status === "completed" ? "hoàn thành" : "hủy"}`,
        );
      }
      return;
    }

    // If can be cancelled, show confirmation modal
    setModalState({
      isOpen: true,
      appointmentId,
      title: "Xác nhận hủy lịch",
      message: "Bạn có chắc chắn muốn hủy lịch hẹn này không?",
    });
  };

  // Close modal
  const closeModal = () => {
    setModalState({
      ...modalState,
      isOpen: false,
    });
  };

  // Cancel appointment
  const handleCancel = async (appointmentId: string) => {
    try {
      console.log("appoimentId", appointmentId);
      const response =
        await appointmentService.cancelAppointment(appointmentId);

      if (response.success) {
        // Update appointment status locally
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status: "cancelled" }
              : appointment,
          ),
        );

        toast.success("Đã hủy lịch hẹn thành công");
      } else {
        toast.error(response.message || "Không thể hủy lịch hẹn");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi hủy lịch hẹn");
    }
  };

  // Confirm cancel appointment from modal
  const confirmCancelAppointment = () => {
    if (modalState.appointmentId) {
      handleCancel(modalState.appointmentId);
      closeModal();
    }
  };

  // Reschedule appointment
  const handleReschedule = (id: string) => {
    // Navigate to reschedule page
    navigate(`/user/reschedule-appointment/${id}`);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Calculate counts for statistics
  const confirmCount = appointments.filter(
    (a) => a.status === "confirmed",
  ).length;
  const pendingCount = appointments.filter(
    (a) => a.status === "pending",
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "completed",
  ).length;
  const cancelledCount = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  const handleViewDetails = (id: string) => {
    navigate(`/user/appointment-details/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Lịch hẹn của tôi
      </h1>

      {/* Bộ lọc và tìm kiếm */}
      <form
        onSubmit={handleSearchSubmit}
        className="mb-6 flex flex-col space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0"
      >
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên PT, địa điểm..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Error display */}
      {error && (
        <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Modal xác nhận */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={confirmCancelAppointment}
        title={modalState.title}
        message={modalState.message}
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
        confirmButtonColor="red"
      />

      {/* Loading indicator */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Hiển thị lịch hẹn */}
          <div className="space-y-4">
            {paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={openCancelModal}
                  onReschedule={handleReschedule}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <EmptyStateCard
                title="Không tìm thấy lịch hẹn"
                message={
                  searchTerm || filterStatus !== "all"
                    ? "Không có lịch hẹn phù hợp với tiêu chí tìm kiếm của bạn."
                    : "Bạn chưa có lịch hẹn nào với huấn luyện viên."
                }
                actionLabel="Đặt lịch hẹn mới"
                actionLink="/user/list-trainer"
              />
            )}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Thống kê nhanh */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {confirmCount}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Đã xác nhận
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {pendingCount}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chờ xác nhận
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {completedCount}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Đã hoàn thành
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {cancelledCount}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Đã hủy</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageAppointments;
