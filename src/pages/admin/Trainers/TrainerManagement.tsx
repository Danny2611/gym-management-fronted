import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Phone,
  Mail,
  ToggleRight,
} from "lucide-react";
import { trainerService } from "~/services/admin/trainerService";
import { Trainer, TrainerQueryParams, TrainerStatus } from "~/types/trainer";
import { toast } from "sonner";
import ConfirmDialog from "~/components/common/ConfirmDialog";
import TrainerModal from "./TrainerModal";
import TrainerScheduleModal from "./TrainerScheduleModal";

const TrainerManagement: React.FC = () => {
  // Trạng thái cho danh sách huấn luyện viên và phân trang
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [totalTrainers, setTotalTrainers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái cho modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentTrainer, setCurrentTrainer] = useState<Trainer | null>(null);

  // Trạng thái cho modal lịch làm việc
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [trainerForSchedule, setTrainerForSchedule] = useState<Trainer | null>(
    null,
  );

  // Trạng thái cho xác nhận xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<string | null>(null);

  // Trạng thái cho bộ lọc và sắp xếp
  const [filters, setFilters] = useState<TrainerQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    specialization: undefined,
    status: undefined,
    experience: undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Danh sách các chuyên môn
  const specializations: { value: string; label: string }[] = [
    { value: "strength", label: "Strength Training" },
    { value: "cardio", label: "Cardio" },
    { value: "yoga", label: "Yoga" },
    { value: "pilates", label: "Pilates" },
    { value: "crossfit", label: "CrossFit" },
    { value: "nutrition", label: "Nutrition" },
  ];

  // Tải danh sách huấn luyện viên
  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await trainerService.getAllTrainers({
        ...filters,
        page: currentPage,
      });

      if (response.success && response.data) {
        setTrainers(response.data.trainers);
        setTotalTrainers(response.data.totalTrainers);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setError(null);
      } else {
        setError(response.message || "Không thể tải danh sách huấn luyện viên");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách huấn luyện viên");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi trạng thái gói
  const handleToggleStatus = async (id: string) => {
    try {
      const response = await trainerService.toggleTrainerStatus(id);
      console.log("response: ", response);
      if (response.success) {
        toast.success("Thay đổi trạng thái Trainer thành công");
        fetchTrainers(); // Tải lại dữ liệu
      } else {
        toast.error(
          response.message || "Không thể thay đổi trạng thái Trainer",
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi thay đổi trạng thái Trainer");
      console.error(error);
    }
  };

  // Tải dữ liệu khi component được mount hoặc khi filters hoặc currentPage thay đổi
  useEffect(() => {
    fetchTrainers();
  }, [filters, currentPage]);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (name: keyof TrainerQueryParams, value: any) => {
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

  const StatusBadge: React.FC<{ status: TrainerStatus }> = ({ status }) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          status === "active"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {status === "active" ? "Đang hoạt động" : "Không hoạt động"}
      </span>
    );
  };

  // Mở modal tạo huấn luyện viên mới
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setCurrentTrainer(null);
    setShowModal(true);
  };

  // Mở modal chỉnh sửa huấn luyện viên
  const handleOpenEditModal = (trainer: Trainer) => {
    setModalMode("edit");
    setCurrentTrainer(trainer);
    setShowModal(true);
  };

  // Mở modal lịch làm việc
  const handleOpenScheduleModal = (trainer: Trainer) => {
    setTrainerForSchedule(trainer);
    setShowScheduleModal(true);
  };

  // Xử lý xóa huấn luyện viên
  const handleDeleteConfirm = (trainerId: string) => {
    setTrainerToDelete(trainerId);
    setShowDeleteConfirm(true);
  };

  // Thực hiện xóa huấn luyện viên
  const handleDelete = async () => {
    if (!trainerToDelete) return;

    try {
      const response = await trainerService.deleteTrainer(trainerToDelete);

      if (response.success) {
        toast.success("Xóa huấn luyện viên thành công");
        fetchTrainers(); // Tải lại dữ liệu
      } else {
        toast.error(response.message || "Không thể xóa huấn luyện viên");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi xóa huấn luyện viên");
      console.error(error);
    } finally {
      setShowDeleteConfirm(false);
      setTrainerToDelete(null);
    }
  };

  // Xử lý lưu huấn luyện viên
  const handleSaveTrainer = async (trainerData: any) => {
    try {
      let response;

      if (modalMode === "create") {
        response = await trainerService.createTrainer(trainerData);
        if (response.success) {
          toast.success("Tạo huấn luyện viên mới thành công");
        }
      } else {
        if (!currentTrainer?._id) return;
        response = await trainerService.updateTrainer(
          currentTrainer._id,
          trainerData,
        );
        if (response.success) {
          toast.success("Cập nhật huấn luyện viên thành công");
        }
      }

      if (response.success) {
        setShowModal(false);
        fetchTrainers(); // Tải lại dữ liệu
      } else {
        toast.error(
          response.message || "Không thể lưu thông tin huấn luyện viên",
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lưu thông tin huấn luyện viên");
      console.error(error);
    }
  };

  // Xử lý lưu lịch làm việc
  const handleSaveSchedule = async (schedule: any) => {
    if (!trainerForSchedule?._id) return;

    try {
      const response = await trainerService.updateTrainerSchedule(
        trainerForSchedule._id,
        schedule,
      );

      if (response.success) {
        toast.success("Cập nhật lịch làm việc thành công");
        setShowScheduleModal(false);
        fetchTrainers(); // Tải lại dữ liệu
      } else {
        toast.error(response.message || "Không thể cập nhật lịch làm việc");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật lịch làm việc");
      console.error(error);
    }
  };

  // Render badges cho chuyên môn
  const SpecializationBadge: React.FC<{ specialization?: string }> = ({
    specialization,
  }) => {
    if (!specialization) return null;

    const specializationColors: Record<string, string> = {
      strength: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      cardio:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      yoga: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      pilates:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      crossfit:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      nutrition:
        "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    };

    const color =
      specializationColors[specialization] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    const label =
      specializations.find((s) => s.value === specialization)?.label ||
      specialization;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
      >
        {label}
      </span>
    );
  };

  // Render badge cho kinh nghiệm
  const ExperienceBadge: React.FC<{ years?: number }> = ({ years }) => {
    if (years === undefined || years === null) return null;

    let badge = "";
    if (years < 3) {
      badge = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    } else if (years < 6) {
      badge =
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    } else if (years < 11) {
      badge =
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    } else {
      badge =
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}
      >
        {years} năm
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Quản lí Trainer</title>
      </Helmet>
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Quản lý Huấn luyện viên
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Quản lý đội ngũ huấn luyện viên, thông tin cá nhân và lịch làm
              việc.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:gap-2 sm:px-4"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Thêm huấn luyện viên</span>
          </button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="mb-4 rounded-lg bg-white p-3 shadow dark:bg-gray-800 sm:mb-6 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Tìm kiếm */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm huấn luyện viên..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:pl-10 sm:pr-4 sm:text-base"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            {/* Lọc theo trạng thái */}
            <div>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:px-4 sm:text-base"
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value || undefined)
                }
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
            {/* Lọc theo chuyên môn */}
            <div>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:px-4 sm:text-base"
                value={filters.specialization || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "specialization",
                    e.target.value || undefined,
                  )
                }
              >
                <option value="">Tất cả chuyên môn</option>
                {specializations.map((spec) => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo kinh nghiệm */}
            <div>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:px-4 sm:text-base"
                value={filters.experience || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange(
                    "experience",
                    value ? parseInt(value) : undefined,
                  );
                }}
              >
                <option value="">Tất cả kinh nghiệm</option>
                <option value="1">1 năm trở lên</option>
                <option value="3">3 năm trở lên</option>
                <option value="5">5 năm trở lên</option>
                <option value="10">10 năm trở lên</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách huấn luyện viên */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="flex h-48 items-center justify-center sm:h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 dark:text-red-400 sm:p-6">
              <p>{error}</p>
              <button
                onClick={() => fetchTrainers()}
                className="mt-3 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 sm:mt-4 sm:px-4 sm:py-2 sm:text-base"
              >
                Thử lại
              </button>
            </div>
          ) : trainers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 sm:p-6">
              <p>Không tìm thấy huấn luyện viên nào</p>
            </div>
          ) : (
            <>
              {/* Hiển thị dạng bảng trên màn hình lớn */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-6"
                        onClick={() => handleSortChange("name")}
                      >
                        <div className="flex cursor-pointer items-center">
                          <span>Huấn luyện viên</span>
                          {filters.sortBy === "name" &&
                            (filters.sortOrder === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-6"
                      >
                        Chuyên môn
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-6"
                        onClick={() => handleSortChange("status")}
                      >
                        <div className="flex cursor-pointer items-center">
                          <span>Trạng thái</span>
                          {filters.sortBy === "status" &&
                            (filters.sortOrder === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-6"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-6"
                      >
                        Điện thoại
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-6"
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {trainers.map((trainer) => (
                      <tr
                        key={trainer._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                          <div className="flex items-center">
                            {trainer.image ? (
                              <img
                                src={trainer.image}
                                alt={trainer.name}
                                className="h-8 w-8 flex-shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
                              />
                            ) : (
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 sm:h-10 sm:w-10">
                                <span className="font-medium">
                                  {trainer.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="ml-3 sm:ml-4">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {trainer.name}
                              </div>
                              {trainer.bio && (
                                <div className="mt-0.5 max-w-xs truncate text-xs text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-sm">
                                  {trainer.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                          <SpecializationBadge
                            specialization={trainer.specialization}
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                          <StatusBadge status={trainer.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                          <div className="flex items-center text-xs text-gray-900 dark:text-gray-200 sm:text-sm">
                            <Mail className="mr-1.5 h-3 w-3 text-gray-500 sm:mr-2 sm:h-4 sm:w-4" />
                            {trainer.email}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                          {trainer.phone ? (
                            <div className="flex items-center text-xs text-gray-900 dark:text-gray-200 sm:text-sm">
                              <Phone className="mr-1.5 h-3 w-3 text-gray-500 sm:mr-2 sm:h-4 sm:w-4" />
                              {trainer.phone}
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              -
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs sm:px-6 sm:py-4 sm:text-sm">
                          <div className="flex justify-end space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleOpenScheduleModal(trainer)}
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                              title="Quản lý lịch làm việc"
                            >
                              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(trainer._id)}
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                              title={
                                trainer.status === "active"
                                  ? "Tắt hoạt động Trainer"
                                  : "Bật hoạt động Trainer"
                              }
                            >
                              <ToggleRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(trainer)}
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-yellow-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-yellow-400"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(trainer._id)}
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Hiển thị dạng card trên mobile */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700 sm:hidden">
                {trainers.map((trainer) => (
                  <div key={trainer._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {trainer.image ? (
                          <img
                            src={trainer.image}
                            alt={trainer.name}
                            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700">
                            <span className="text-lg font-medium">
                              {trainer.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {trainer.name}
                          </div>
                          <StatusBadge status={trainer.status} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Chuyên môn:
                        </span>
                        <div className="mt-1">
                          <SpecializationBadge
                            specialization={trainer.specialization}
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Mail className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-900 dark:text-gray-200">
                          {trainer.email}
                        </span>
                      </div>

                      {trainer.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-900 dark:text-gray-200">
                            {trainer.phone}
                          </span>
                        </div>
                      )}

                      {trainer.bio && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Mô tả:</span>{" "}
                          {trainer.bio}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenScheduleModal(trainer)}
                        className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        Lịch
                      </button>
                      <button
                        onClick={() => handleToggleStatus(trainer._id)}
                        className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <ToggleRight className="mr-1 h-3.5 w-3.5" />
                        {trainer.status === "active" ? "Tắt" : "Bật"}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(trainer)}
                        className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <Edit className="mr-1 h-3.5 w-3.5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(trainer._id)}
                        className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Phân trang - Desktop version */}
          {!loading && !error && totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Hiển thị{" "}
                    <span className="font-medium">{trainers.length}</span> của{" "}
                    <span className="font-medium">{totalTrainers}</span> huấn
                    luyện viên
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
                      <ChevronLeft className="h-5 w-5" />
                    </button>

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

                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-600 dark:hover:bg-gray-700 ${
                        currentPage === totalPages ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>

              {/* Mobile pagination */}
              <div className="flex w-full items-center justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ${
                    currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Trước
                </button>

                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Trang <span className="font-medium">{currentPage}</span> /{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ${
                    currentPage === totalPages
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  Sau
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal tạo/chỉnh sửa huấn luyện viên */}
        {showModal && (
          <TrainerModal
            mode={modalMode}
            initialData={currentTrainer}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveTrainer}
            specializations={specializations}
          />
        )}

        {/* Modal quản lý lịch làm việc */}
        {showScheduleModal && trainerForSchedule && (
          <TrainerScheduleModal
            trainer={trainerForSchedule}
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            onSave={handleSaveSchedule}
          />
        )}

        {/* Dialog xác nhận xóa */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa huấn luyện viên này? Hành động này không thể hoàn tác."
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </>
  );
};

export default TrainerManagement;
