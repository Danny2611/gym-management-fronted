import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Package, PackageCategory } from "~/types/package";

interface PackageModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Package>) => void;
  initialData: Package | null;
  categories: { value: PackageCategory; label: string }[];
}

const PackageModal: React.FC<PackageModalProps> = ({
  mode,
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
}) => {
  const [formData, setFormData] = useState<Partial<Package>>({
    name: "",
    description: "",
    price: 0,
    duration: 30,
    category: "basic",
    status: "active",
    training_sessions: 0,
    session_duration: 60,
    popular: false,
    benefits: [],
  });

  const [newFeature, setNewFeature] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        duration: initialData.duration || 30,
        category: initialData.category || "basic",
        status: initialData.status || "active",
        training_sessions: initialData.training_sessions || 0,
        session_duration: initialData.session_duration || 60,
        popular: initialData.popular || false,
        benefits: initialData.benefits || [],
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        description: "",
        price: 0,
        duration: 30,
        category: "basic",
        status: "active",
        training_sessions: 0,
        session_duration: 60,
        popular: false,
        benefits: [],
      });
    }
    setErrors({});
  }, [mode, initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    // Special handling for checkboxes
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Handle number inputs
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
      return;
    }

    // Handle regular inputs
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;

    setFormData((prev) => ({
      ...prev,
      benefits: [...(prev.benefits || []), newFeature.trim()],
    }));
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: (prev.benefits || []).filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Tên gói không được để trống";
    }

    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = "Giá không hợp lệ";
    }

    if (formData.duration === undefined || formData.duration <= 0) {
      newErrors.duration = "Thời hạn phải lớn hơn 0";
    }

    if (
      formData.training_sessions !== undefined &&
      formData.training_sessions < 0
    ) {
      newErrors.training_sessions = "Số buổi PT không hợp lệ";
    }

    if (
      formData.session_duration !== undefined &&
      formData.session_duration <= 0 &&
      formData.training_sessions! > 0
    ) {
      newErrors.session_duration = "Thời lượng buổi tập phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === "create"
              ? "Thêm gói dịch vụ mới"
              : "Chỉnh sửa gói dịch vụ"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Tên gói */}
            <div className="col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tên gói <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Mô tả */}
            <div className="col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Giá */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min={0}
                value={formData.price}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                  errors.price ? "border-red-500" : ""
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Thời hạn */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Thời hạn (ngày) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min={1}
                value={formData.duration}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                  errors.duration ? "border-red-500" : ""
                }`}
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
              )}
            </div>

            {/* Danh mục */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Danh mục
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>

            {/* Số buổi PT */}
            <div>
              <label
                htmlFor="training_sessions"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Số buổi PT
              </label>
              <input
                type="number"
                id="training_sessions"
                name="training_sessions"
                min={0}
                value={formData.training_sessions}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                  errors.training_sessions ? "border-red-500" : ""
                }`}
              />
              {errors.training_sessions && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.training_sessions}
                </p>
              )}
            </div>

            {/* Thời lượng buổi tập */}
            <div>
              <label
                htmlFor="session_duration"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Thời lượng mỗi buổi (phút)
              </label>
              <input
                type="number"
                id="session_duration"
                name="session_duration"
                min={1}
                value={formData.session_duration}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                  errors.session_duration ? "border-red-500" : ""
                }`}
              />
              {errors.session_duration && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.session_duration}
                </p>
              )}
            </div>

            {/* Gói phổ biến */}
            <div className="col-span-2 mt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="popular"
                  name="popular"
                  checked={formData.popular}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      popular: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                />
                <label
                  htmlFor="popular"
                  className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Đánh dấu là gói phổ biến
                </label>
              </div>
            </div>

            {/* Tính năng */}
            <div className="col-span-2 mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tính năng của gói
              </label>

              <div className="mt-2 flex">
                <input
                  type="text"
                  placeholder="Nhập tính năng gói dịch vụ"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="rounded-r-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Thêm
                </button>
              </div>

              {formData.benefits && formData.benefits.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {formData.benefits.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-700"
                    >
                      <span className="text-gray-700 dark:text-gray-200">
                        {feature}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Chưa có tính năng nào được thêm.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {mode === "create" ? "Tạo gói" : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageModal;
