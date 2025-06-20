import React, { useState } from "react";
import { LucideEye, LucideEyeOff, LucideUserCog } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { authService } from "~/services/authService";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visibleFields, setVisibleFields] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleVisibility = (field: keyof typeof visibleFields) => {
    setVisibleFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Mật khẩu hiện tại không được để trống";
    }

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới không được để trống";
    } else {
      // Check password complexity
      if (
        !/\d/.test(formData.newPassword) ||
        !/[A-Z]/.test(formData.newPassword) ||
        formData.newPassword.length < 8
      ) {
        newErrors.newPassword =
          "Mật khẩu phải chứa ít nhất 1 số và 1 chữ in hoa và có độ dài ít nhất 8 ký tự";
      }
      if (formData.newPassword === formData.currentPassword) {
        newErrors.newPassword =
          "Mật khẩu mới không được trùng với mật khẩu hiện tại";
      }
    }

    // Validate confirm password
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setIsLoading(true);

      // First, validate the current password
      await authService.validateCurrentPassword(formData.currentPassword);

      // If validation passes, proceed with changing password
      const response = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword,
      );

      // Show success toast
      toast.success(response.message || "Đổi mật khẩu thành công!");

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear any previous errors
      setErrors({});
    } catch (error: any) {
      // Handle error from backend
      if (error.message.includes("mật khẩu hiện tại không đúng")) {
        // Specifically handle incorrect current password
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Mật khẩu hiện tại không đúng",
        }));
        toast.error("Mật khẩu hiện tại không đúng. Vui lòng thử lại.");
      } else {
        // Handle other errors
        toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-2xl bg-white shadow-lg dark:bg-gray-800">
        <CardHeader className="bg-blue-600 text-white dark:bg-blue-800">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <LucideUserCog className="h-6 w-6" />
              Đổi mật khẩu
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mật khẩu hiện tại */}
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-gray-700 dark:text-gray-300"
              >
                Mật khẩu hiện tại
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={visibleFields.currentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`w-full ${errors.currentPassword ? "border-destructive" : "border-gray-300 dark:border-gray-600"} ${!isLoading ? "bg-white text-gray-900 dark:bg-gray-700 dark:text-white" : ""}`}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("currentPassword")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-white"
                >
                  {visibleFields.currentPassword ? (
                    <LucideEyeOff className="h-5 w-5" />
                  ) : (
                    <LucideEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-gray-700 dark:text-gray-300"
              >
                Mật khẩu mới
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={visibleFields.newPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full ${errors.newPassword ? "border-destructive" : "border-gray-300 dark:border-gray-600"} ${!isLoading ? "bg-white text-gray-900 dark:bg-gray-700 dark:text-white" : ""}`}
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("newPassword")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-white"
                >
                  {visibleFields.newPassword ? (
                    <LucideEyeOff className="h-5 w-5" />
                  ) : (
                    <LucideEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-gray-700 dark:text-gray-300"
              >
                Xác nhận mật khẩu mới
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={visibleFields.confirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full ${errors.confirmPassword ? "border-destructive" : "border-gray-300 dark:border-gray-600"} ${!isLoading ? "bg-white text-gray-900 dark:bg-gray-700 dark:text-white" : ""}`}
                  placeholder="Xác nhận mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("confirmPassword")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-white"
                >
                  {visibleFields.confirmPassword ? (
                    <LucideEyeOff className="h-5 w-5" />
                  ) : (
                    <LucideEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Nút điều khiển */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                onClick={() => {
                  setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setErrors({});
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
