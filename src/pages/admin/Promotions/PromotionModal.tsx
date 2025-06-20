import React, { useState, useEffect } from "react";
import { X, Calendar, Percent, Package, AlertCircle } from "lucide-react";
import {
  PromotionResponse,
  CreatePromotionData,
  UpdatePromotionData,
} from "~/types/promotion";

interface PromotionModalProps {
  isOpen: boolean;

  mode: "create" | "edit";
  promotion?: PromotionResponse | null;
  onClose: () => void;
  onSave: (data: CreatePromotionData | UpdatePromotionData) => Promise<void>;
  availablePackages?: Array<{ _id: string; name: string; price: number }>;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  mode,

  promotion,
  onClose,
  onSave,
  availablePackages = [],
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount: 0,
    start_date: "",
    end_date: "",
    applicable_packages: [] as string[],
    status: "active" as "active" | "inactive",
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens or promotion changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && promotion) {
        setFormData({
          name: promotion.name,
          description: promotion.description || "",
          discount: promotion.discount,
          start_date: new Date(promotion.start_date)
            .toISOString()
            .split("T")[0],
          end_date: new Date(promotion.end_date).toISOString().split("T")[0],
          applicable_packages: promotion.applicable_packages.map(
            (pkg) => pkg._id,
          ),
          status: promotion.status,
        });
      } else {
        // Reset form for create mode
        setFormData({
          name: "",
          description: "",
          discount: 0,
          start_date: "",
          end_date: "",
          applicable_packages: [],
          status: "active",
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, promotion]);

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle package selection
  const handlePackageToggle = (packageId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicable_packages: prev.applicable_packages.includes(packageId)
        ? prev.applicable_packages.filter((id) => id !== packageId)
        : [...prev.applicable_packages, packageId],
    }));

    // Clear package selection error
    if (errors.applicable_packages) {
      setErrors((prev) => ({
        ...prev,
        applicable_packages: "",
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Tên chương trình khuyến mãi là bắt buộc";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Tên chương trình phải có ít nhất 3 ký tự";
    }

    // Discount validation
    if (formData.discount <= 0) {
      newErrors.discount = "Phần trăm giảm giá phải lớn hơn 0";
    } else if (formData.discount > 100) {
      newErrors.discount = "Phần trăm giảm giá không được vượt quá 100%";
    }

    // Date validation
    if (!formData.start_date) {
      newErrors.start_date = "Ngày bắt đầu là bắt buộc";
    }

    if (!formData.end_date) {
      newErrors.end_date = "Ngày kết thúc là bắt buộc";
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        newErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
      }

      // Check if start date is in the past (only for create mode)
      if (mode === "create") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
          newErrors.start_date =
            "Ngày bắt đầu không được là ngày trong quá khứ";
        }
      }
    }

    // Package validation
    if (formData.applicable_packages.length === 0) {
      newErrors.applicable_packages = "Phải chọn ít nhất một gói dịch vụ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        start_date: new Date(formData.start_date),
        end_date: new Date(formData.end_date),
      };

      await onSave(submissionData);
    } catch (error) {
      console.error("Error saving promotion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="relative w-full max-w-2xl transform rounded-lg bg-white shadow-xl transition-all dark:bg-gray-800">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === "create"
                ? "Tạo chương trình khuyến mãi mới"
                : "Chỉnh sửa chương trình khuyến mãi"}
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Thông tin cơ bản
                </h4>

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Tên chương trình <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Nhập tên chương trình khuyến mãi"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Nhập mô tả cho chương trình khuyến mãi"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Discount */}
                <div>
                  <label
                    htmlFor="discount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phần trăm giảm giá (%){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Percent className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="discount"
                      min="1"
                      max="100"
                      value={formData.discount}
                      onChange={(e) =>
                        handleInputChange(
                          "discount",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className={`block w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                        errors.discount
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.discount && (
                    <p className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      {errors.discount}
                    </p>
                  )}
                </div>
              </div>

              {/* Time Period */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Thời gian áp dụng
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Start Date */}
                  <div>
                    <label
                      htmlFor="start_date"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="start_date"
                        value={formData.start_date}
                        onChange={(e) =>
                          handleInputChange("start_date", e.target.value)
                        }
                        className={`block w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                          errors.start_date
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.start_date && (
                      <p className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        {errors.start_date}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label
                      htmlFor="end_date"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="end_date"
                        value={formData.end_date}
                        onChange={(e) =>
                          handleInputChange("end_date", e.target.value)
                        }
                        className={`block w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                          errors.end_date
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.end_date && (
                      <p className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        {errors.end_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Applicable Packages */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Gói dịch vụ áp dụng <span className="text-red-500">*</span>
                </h4>

                {availablePackages.length === 0 ? (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                      <span className="ml-2 text-sm text-yellow-700 dark:text-yellow-400">
                        Không có gói dịch vụ nào khả dụng
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                    {availablePackages.map((pkg) => (
                      <label
                        key={pkg._id}
                        className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={formData.applicable_packages.includes(
                            pkg._id,
                          )}
                          onChange={() => handlePackageToggle(pkg._id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                          disabled={isSubmitting}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Package className="mr-2 h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {pkg.name}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(pkg.price)}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {errors.applicable_packages && (
                  <p className="flex items-center text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.applicable_packages}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Trạng thái
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange(
                      "status",
                      e.target.value as "active" | "inactive",
                    )
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  disabled={isSubmitting}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSubmitting && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                )}
                {mode === "create" ? "Tạo chương trình" : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
