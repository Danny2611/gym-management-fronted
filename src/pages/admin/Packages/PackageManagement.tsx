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
  Star,
} from "lucide-react";
import { packageService } from "~/services/admin/packageService";
import {
  Package,
  PackageCategory,
  PackageStatus,
  PackageQueryParams,
} from "~/types/package";
import { toast } from "sonner";
import PackageModal from "./PackageModal";
import ConfirmDialog from "~/components/common/ConfirmDialog";

const PackageManagement: React.FC = () => {
  // Trạng thái cho danh sách gói dịch vụ và phân trang
  const [packages, setPackages] = useState<Package[]>([]);
  const [totalPackages, setTotalPackages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái cho modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null);

  // Trạng thái cho xác nhận xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);

  // Trạng thái cho bộ lọc và sắp xếp
  const [filters, setFilters] = useState<PackageQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
    category: undefined,
    sortBy: "created_at",
    sortOrder: "desc",
    popular: undefined,
  });

  // Danh sách các danh mục gói
  const categories: { value: PackageCategory; label: string }[] = [
    { value: "basic", label: "Cơ bản" },
    { value: "premium", label: "Premium" },
    { value: "fitness", label: "Fitness" },
    { value: "platinum", label: "Platinum" },
    { value: "vip", label: "VIP" },
  ];

  // Tải danh sách gói dịch vụ
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getAllPackages({
        ...filters,
        page: currentPage,
      });

      if (response.success && response.data) {
        setPackages(response.data.packages);
        setTotalPackages(response.data.totalPackages);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setError(null);
      } else {
        setError(response.message || "Không thể tải danh sách gói dịch vụ");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách gói dịch vụ");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu khi component được mount hoặc khi filters hoặc currentPage thay đổi
  useEffect(() => {
    fetchPackages();
  }, [filters, currentPage]);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (name: keyof PackageQueryParams, value: any) => {
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

  // Mở modal tạo gói mới
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setCurrentPackage(null);
    setShowModal(true);
  };

  // Mở modal chỉnh sửa gói
  const handleOpenEditModal = (pkg: Package) => {
    setModalMode("edit");
    setCurrentPackage(pkg);
    setShowModal(true);
  };

  // Xử lý xóa gói
  const handleDeleteConfirm = (packageId: string) => {
    setPackageToDelete(packageId);
    setShowDeleteConfirm(true);
  };

  // Thực hiện xóa gói
  const handleDelete = async () => {
    if (!packageToDelete) return;

    try {
      const response = await packageService.deletePackage(packageToDelete);

      if (response.success) {
        toast.success("Xóa gói dịch vụ thành công");
        fetchPackages(); // Tải lại dữ liệu
      } else {
        toast.error(response.message || "Không thể xóa gói dịch vụ");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi xóa gói dịch vụ");
      console.error(error);
    } finally {
      setShowDeleteConfirm(false);
      setPackageToDelete(null);
    }
  };

  // Xử lý thay đổi trạng thái gói
  const handleToggleStatus = async (packageId: string) => {
    try {
      const response = await packageService.togglePackageStatus(packageId);
      console.log("response: ", response);
      if (response.success) {
        toast.success("Thay đổi trạng thái gói dịch vụ thành công");
        fetchPackages(); // Tải lại dữ liệu
      } else {
        toast.error(
          response.message || "Không thể thay đổi trạng thái gói dịch vụ",
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi thay đổi trạng thái gói dịch vụ");
      console.error(error);
    }
  };

  // Xử lý lưu gói
  const handleSavePackage = async (packageData: any) => {
    try {
      let response;

      if (modalMode === "create") {
        response = await packageService.createPackage(packageData);
        if (response.success) {
          toast.success("Tạo gói dịch vụ mới thành công");
        }
      } else {
        if (!currentPackage?._id) return;
        response = await packageService.updatePackage(
          currentPackage._id,
          packageData,
        );
        if (response.success) {
          toast.success("Cập nhật gói dịch vụ thành công");
        }
      }

      if (response.success) {
        setShowModal(false);
        fetchPackages(); // Tải lại dữ liệu
      } else {
        toast.error(response.message || "Không thể lưu gói dịch vụ");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lưu gói dịch vụ");
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

  // Render badges cho trạng thái
  const StatusBadge: React.FC<{ status: PackageStatus }> = ({ status }) => {
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

  // Render badges cho danh mục
  const CategoryBadge: React.FC<{ category?: PackageCategory }> = ({
    category,
  }) => {
    if (!category) return null;

    const categoryColors: Record<PackageCategory, string> = {
      basic: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      premium:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      fitness:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      platinum:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      vip: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    const categoryLabel =
      categories.find((c) => c.value === category)?.label || category;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[category]}`}
      >
        {categoryLabel}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Quản lí Gói tập</title>
      </Helmet>
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Quản lý Gói Dịch vụ
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Quản lý các gói dịch vụ, chỉnh sửa thông tin và giá cả.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Thêm gói mới</span>
          </button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="mb-4 rounded-lg bg-white p-3 shadow dark:bg-gray-800 sm:mb-6 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Tìm kiếm */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm gói dịch vụ..."
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

            {/* Lọc theo danh mục */}
            <div>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={filters.category || ""}
                onChange={(e) =>
                  handleFilterChange("category", e.target.value || undefined)
                }
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo phổ biến */}
            <div>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={
                  filters.popular === undefined
                    ? ""
                    : filters.popular
                      ? "true"
                      : "false"
                }
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange(
                    "popular",
                    value === "" ? undefined : value === "true",
                  );
                }}
              >
                <option value="">Tất cả</option>
                <option value="true">Phổ biến</option>
                <option value="false">Không phổ biến</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách gói dịch vụ */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 dark:text-red-400">
              <p>{error}</p>
              <button
                onClick={() => fetchPackages()}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : packages.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <p>Không tìm thấy gói dịch vụ nào</p>
            </div>
          ) : (
            <>
              {/* Bảng cho màn hình lớn */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                        onClick={() => handleSortChange("name")}
                      >
                        <div className="flex cursor-pointer items-center">
                          <span>Tên gói</span>
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
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Danh mục
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                        onClick={() => handleSortChange("price")}
                      >
                        <div className="flex cursor-pointer items-center">
                          <span>Giá</span>
                          {filters.sortBy === "price" &&
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
                        <div className="flex items-center">
                          <span>Thời hạn</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                      >
                        Buổi PT
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
                        Phổ biến
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
                    {packages.map((pkg) => (
                      <tr
                        key={pkg._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {pkg.name}
                          </div>
                          {pkg.description && (
                            <div className="mt-1 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                              {pkg.description}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <CategoryBadge category={pkg.category} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">
                          {formatCurrency(pkg.price)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">
                          {pkg.duration} ngày
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">
                          {pkg.training_sessions > 0 ? (
                            <span>
                              {pkg.training_sessions} buổi (
                              {pkg.session_duration} phút)
                            </span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              Không có
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={pkg.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {pkg.popular ? (
                            <Star
                              className="h-5 w-5 text-yellow-500"
                              fill="currentColor"
                            />
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              -
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(pkg._id!)}
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                              title={
                                pkg.status === "active"
                                  ? "Tắt gói dịch vụ"
                                  : "Bật gói dịch vụ"
                              }
                            >
                              <ToggleRight className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(pkg)}
                              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-yellow-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-yellow-400"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(pkg._id!)}
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
              <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
                {packages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {pkg.name}
                        </h3>
                        {pkg.description && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                            {pkg.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-2 flex">
                        {pkg.popular && (
                          <Star
                            className="h-5 w-5 text-yellow-500"
                            fill="currentColor"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Danh mục:{" "}
                        </span>
                        <CategoryBadge category={pkg.category} />
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Giá:{" "}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(pkg.price)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Thời hạn:{" "}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {pkg.duration} ngày
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Buổi PT:{" "}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {pkg.training_sessions > 0
                            ? `${pkg.training_sessions} buổi (${pkg.session_duration} phút)`
                            : "Không có"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Trạng thái:{" "}
                        </span>
                        <StatusBadge status={pkg.status} />
                      </div>
                    </div>

                    <div className="flex justify-end border-t pt-2 dark:border-gray-700">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleToggleStatus(pkg._id!)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                        >
                          <ToggleRight className="h-4 w-4" />
                          <span>{pkg.status === "active" ? "Tắt" : "Bật"}</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(pkg)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(pkg._id!)}
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
                  <span className="font-medium">{packages.length}</span> của{" "}
                  <span className="font-medium">{totalPackages}</span> gói dịch
                  vụ
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
          <PackageModal
            mode={modalMode}
            initialData={currentPackage}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSavePackage}
            categories={categories}
          />
        )}

        {/* Dialog xác nhận xóa */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa gói dịch vụ này? Hành động này không thể hoàn tác."
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

export default PackageManagement;
