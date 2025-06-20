import React from "react";
import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger" | "warning" | "success";
  onConfirm: () => void;
  onCancel: () => void;
  icon?: "alert" | "info" | "none";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  icon = "alert",
}) => {
  if (!isOpen) return null;

  // Variant class mappings
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  };

  // Icon components
  const IconComponent = () => {
    if (icon === "none") return null;

    const iconClasses = "h-6 w-6";
    const wrapperClasses =
      "mx-auto flex h-12 w-12 items-center justify-center rounded-full";

    if (icon === "info") {
      return (
        <div className={`${wrapperClasses} bg-blue-100 dark:bg-blue-900/30`}>
          <Info className={`${iconClasses} text-blue-600 dark:text-blue-400`} />
        </div>
      );
    }

    return (
      <div className={`${wrapperClasses} bg-red-100 dark:bg-red-900/30`}>
        <AlertTriangle
          className={`${iconClasses} text-red-600 dark:text-red-400`}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="absolute right-0 top-0 pr-4 pt-4">
          <button
            type="button"
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={onCancel}
          >
            <span className="sr-only">Đóng</span>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center sm:mt-0 sm:text-left">
          {icon !== "none" && (
            <div className="mx-auto flex items-center justify-center">
              <IconComponent />
            </div>
          )}

          <h3 className="mt-4 text-center text-lg font-medium leading-6 text-gray-900 dark:text-white">
            {title}
          </h3>

          <div className="mt-3">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 sm:w-auto sm:text-sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:w-auto sm:text-sm ${
              variantClasses[confirmVariant]
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
