import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ToggleRight,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Percent,
  Calendar,
  TrendingUp,
  Package,
} from "lucide-react";
import { promotionService } from "~/services/admin/promotionService";
import {
  PromotionResponse,
  PromotionQueryOptions,
  CreatePromotionData,
  UpdatePromotionData,
  PackageSummary,
} from "~/types/promotion";
import { toast } from "sonner";
import PromotionModal from "./PromotionModal";
import ConfirmDialog from "~/components/common/ConfirmDialog";
import { packageService } from "~/services/admin/packageService";

const PromotionManagement: React.FC = () => {
  // Trạng thái cho danh sách khuyến mãi và phân trang
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [availablePackages, setAvailablePackages] = useState<PackageSummary[]>(
    [],
  );
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái cho modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentPromotion, setCurrentPromotion] =
    useState<PromotionResponse | null>(null);

  // Trạng thái cho xác nhận xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(
    null,
  );

  // Trạng thái cho bộ lọc và sắp xếp
  const [filters, setFilters] = useState<PromotionQueryOptions>({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Tải danh sách khuyến mãi
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionService.getAllPromotions({
        ...filters,
        page: currentPage,
      });
      console.log("response: ", response);
      if (response.success && response.data) {
        setPromotions(response.data.promotions);
        setTotalPromotions(response.data.totalPromotions);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setError(null);
      } else {
        setError(
          response.message || "Không thể tải danh sách chương trình khuyến mãi",
        );
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách chương trình khuyến mãi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách khuyến mãi
  const fetchPackage = async () => {
    try {
      setLoading(true);
      const response = await packageService.getAllPackages();

      if (response.success && response.data) {
        const activePackages = response.data.packages
          .filter((pkg) => pkg.status === "active") // Lọc gói active
          .map(
            (pkg) =>
              ({
                _id: pkg._id!,
                name: pkg.name,
                price: pkg.price,
                benefits: pkg.benefits,
              }) as PackageSummary,
          ); // Ép kiểu rõ ràng

        setAvailablePackages(activePackages);
        setError(null);
      } else {
        setError(response.message || "Không thể tải danh sách gói tập");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách gói tập");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu khi component được mount hoặc khi filters hoặc currentPage thay đổi
  useEffect(() => {
    fetchPromotions();
    fetchPackage();
  }, [filters, currentPage]);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (
    name: keyof PromotionQueryOptions,
    value: any,
  ) => {
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

  // Mở modal tạo khuyến mãi mới
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setCurrentPromotion(null);
    setShowModal(true);
  };

  // Mở modal chỉnh sửa khuyến mãi
  const handleOpenEditModal = (promotion: PromotionResponse) => {
    setModalMode("edit");
    setCurrentPromotion(promotion);
    setShowModal(true);
  };

  // Xử lý xóa khuyến mãi
  const handleDeleteConfirm = (promotionId: string) => {
    setPromotionToDelete(promotionId);
    setShowDeleteConfirm(true);
  };

  // Thực hiện xóa khuyến mãi
  const handleDelete = async () => {
    if (!promotionToDelete) return;

    try {
      const response =
        await promotionService.deletePromotion(promotionToDelete);

      if (response.success) {
        toast.success("Xóa chương trình khuyến mãi thành công");
        fetchPromotions(); // Tải lại dữ liệu
      } else {
        toast.error(
          response.message || "Không thể xóa chương trình khuyến mãi",
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi xóa chương trình khuyến mãi");
      console.error(error);
    } finally {
      setShowDeleteConfirm(false);
      setPromotionToDelete(null);
    }
  };

  // Xử lý thay đổi trạng thái khuyến mãi
  const handleToggleStatus = async (promotionId: string) => {
    try {
      const promotion = promotions.find((p) => p._id === promotionId);
      if (!promotion) return;

      const newStatus = promotion.status === "active" ? "inactive" : "active";
      const response = await promotionService.updatePromotion(promotionId, {
        status: newStatus,
      });

      if (response.success) {
        toast.success("Thay đổi trạng thái chương trình khuyến mãi thành công");
        fetchPromotions(); // Tải lại dữ liệu
      } else {
        toast.error(
          response.message ||
            "Không thể thay đổi trạng thái chương trình khuyến mãi",
        );
      }
    } catch (error) {
      toast.error(
        "Đã xảy ra lỗi khi thay đổi trạng thái chương trình khuyến mãi",
      );
      console.error(error);
    }
  };

  // Xử lý lưu khuyến mãi
  const handleSavePromotion = async (
    promotionData: CreatePromotionData | UpdatePromotionData,
  ) => {
    try {
      let response;

      if (modalMode === "create") {
        response = await promotionService.createPromotion(
          promotionData as CreatePromotionData,
        );
        if (response.success) {
          toast.success("Tạo chương trình khuyến mãi mới thành công");
        }
      } else {
        if (!currentPromotion?._id) return;
        response = await promotionService.updatePromotion(
          currentPromotion._id,
          promotionData as UpdatePromotionData,
        );
        if (response.success) {
          toast.success("Cập nhật chương trình khuyến mãi thành công");
        }
      }

      if (response.success) {
        setShowModal(false);
        fetchPromotions(); // Tải lại dữ liệu
      } else {
        toast.error(
          response.message || "Không thể lưu chương trình khuyến mãi",
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lưu chương trình khuyến mãi");
      console.error(error);
    }
  };

  // Format giá tiền
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format ngày tháng
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Kiểm tra trạng thái khuyến mãi
  const getPromotionTimeStatus = (
    startDate: Date | string,
    endDate: Date | string,
  ) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "expired";
  };

  // Render badges cho trạng thái
  const StatusBadge: React.FC<{ status: "active" | "inactive" }> = ({
    status,
  }) => {
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

  // Render badges cho trạng thái thời gian
  const TimeStatusBadge: React.FC<{
    startDate: Date | string;
    endDate: Date | string;
  }> = ({ startDate, endDate }) => {
    const timeStatus = getPromotionTimeStatus(startDate, endDate);

    const statusConfig = {
      upcoming: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        text: "Sắp diễn ra",
      },
      ongoing: {
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        text: "Đang diễn ra",
      },
      expired: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        text: "Đã hết hạn",
      },
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[timeStatus].color}`}
      >
        {statusConfig[timeStatus].text}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Quản lý Khuyến mãi</title>
      </Helmet>
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Quản lý Chương trình Khuyến mãi
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Quản lý các chương trình khuyến mãi, chỉnh sửa thông tin và thời
              gian áp dụng.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Thêm khuyến mãi</span>
          </button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="mb-4 rounded-lg bg-white p-3 shadow dark:bg-gray-800 sm:mb-6 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tìm kiếm */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm chương trình khuyến mãi..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
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
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  setFilters((prev) => ({
                    ...prev,
                    sortBy,
                    sortOrder: sortOrder as "asc" | "desc",
                  }));
                }}
              >
                <option value="created_at-desc">Mới nhất</option>
                <option value="created_at-asc">Cũ nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="discount-desc">Giảm giá cao nhất</option>
                <option value="discount-asc">Giảm giá thấp nhất</option>
                <option value="start_date-asc">Ngày bắt đầu</option>
                <option value="end_date-asc">Ngày kết thúc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách chương trình khuyến mãi */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 dark:text-red-400">
              <p>{error}</p>
              <button
                onClick={() => fetchPromotions()}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : promotions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <p>Không tìm thấy chương trình khuyến mãi nào</p>
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
                        onClick={() => handleSortChange("name")}
                      >
                        <div className="flex items-center">
                          <span>Tên chương trình</span>
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
                        className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                        onClick={() => handleSortChange("discount")}
                      >
                        <div className="flex items-center">
                          <span>Giảm giá</span>
                          {filters.sortBy === "discount" &&
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
                        Gói áp dụng
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Trạng thái
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Tình trạng
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
                    {promotions.map((promotion) => (
                      <tr
                        key={promotion._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {promotion.name}
                          </div>
                          {promotion.description && (
                            <div className="mt-1 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                              {promotion.description}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center text-lg font-semibold text-red-600 dark:text-red-400">
                            <Percent className="mr-1 h-4 w-4" />
                            {promotion.discount}%
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                              {formatDate(promotion.start_date)}
                            </div>
                            <div className="mt-1 flex items-center">
                              <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                              {formatDate(promotion.end_date)}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center">
                            <Package className="mr-1 h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {promotion.applicable_packages.length} gói
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={promotion.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <TimeStatusBadge
                            startDate={promotion.start_date}
                            endDate={promotion.end_date}
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(promotion._id!)}
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                              title={
                                promotion.status === "active"
                                  ? "Tắt chương trình"
                                  : "Bật chương trình"
                              }
                            >
                              <ToggleRight className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(promotion)}
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-yellow-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-yellow-400"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteConfirm(promotion._id!)
                              }
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
                              title="Xóa"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Hiển thị dạng card cho màn hình di động */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:hidden">
                {promotions.map((promotion) => (
                  <div
                    key={promotion._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {promotion.name}
                        </h3>
                        {promotion.description && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                            {promotion.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-2 flex items-center text-lg font-semibold text-red-600 dark:text-red-400">
                        <Percent className="mr-1 h-4 w-4" />
                        {promotion.discount}%
                      </div>
                    </div>

                    <div className="mb-3 grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Thời gian:{" "}
                        </span>
                        <div className="mt-1">
                          <div className="flex items-center text-gray-900 dark:text-white">
                            <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                            {formatDate(promotion.start_date)} -{" "}
                            {formatDate(promotion.end_date)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Gói áp dụng:{" "}
                        </span>
                        <div className="mt-1 flex items-center">
                          <Package className="mr-1 h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {promotion.applicable_packages.length} gói
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Trạng thái:{" "}
                          </span>
                          <StatusBadge status={promotion.status} />
                        </div>
                        <TimeStatusBadge
                          startDate={promotion.start_date}
                          endDate={promotion.end_date}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end border-t pt-2 dark:border-gray-700">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleToggleStatus(promotion._id!)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                        >
                          <ToggleRight className="h-4 w-4" />
                          <span>
                            {promotion.status === "active" ? "Tắt" : "Bật"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(promotion)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(promotion._id!)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Xóa</span>
                        </button>
                      </div>
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
                  <span className="font-medium">{promotions.length}</span> của{" "}
                  <span className="font-medium">{totalPromotions}</span> gói
                  dịch vụ
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
        {/* Modal tạo/chỉnh sửa gói */}
        {showModal && (
          <PromotionModal
            mode={modalMode}
            promotion={currentPromotion}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSavePromotion}
            availablePackages={availablePackages}
          />
        )}

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa  khuyến mãi này? Hành động này không thể hoàn tác."
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

export default PromotionManagement;
