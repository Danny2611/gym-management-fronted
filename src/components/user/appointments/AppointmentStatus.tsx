import React from "react";
import { CheckCircle, Clock3, XCircle, AlertCircle } from "lucide-react";
import { AppointmentStatusType } from "~/types/schedule";

interface AppointmentStatusProps {
  status: AppointmentStatusType;
  size?: "sm" | "md"; // Size variant
}

export const AppointmentStatus: React.FC<AppointmentStatusProps> = ({
  status,
  size = "md",
}) => {
  const statusConfig = {
    confirmed: {
      icon: (
        <CheckCircle
          className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1 text-green-500`}
        />
      ),
      text: "Đã xác nhận",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      textColor: "text-green-700 dark:text-green-300",
    },
    pending: {
      icon: (
        <Clock3
          className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1 text-amber-500`}
        />
      ),
      text: "Chờ xác nhận",
      bgColor: "bg-amber-50 dark:bg-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-300",
    },
    cancelled: {
      icon: (
        <XCircle
          className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1 text-red-500`}
        />
      ),
      text: "Đã hủy",
      bgColor: "bg-red-50 dark:bg-red-900/30",
      textColor: "text-red-700 dark:text-red-300",
    },
    completed: {
      icon: (
        <CheckCircle
          className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1 text-blue-500`}
        />
      ),
      text: "Đã hoàn thành",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    missed: {
      icon: (
        <AlertCircle
          className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1 text-gray-500`}
        />
      ),
      text: "Bỏ lỡ",
      bgColor: "bg-gray-50 dark:bg-gray-800/30",
      textColor: "text-gray-700 dark:text-gray-300",
    },
    upcoming: {
      icon: (
        <Clock3
          className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1 text-blue-500`}
        />
      ),
      text: "Sắp tới",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-300",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center rounded-full ${config.bgColor} ${config.textColor} px-3 py-1 text-xs font-medium`}
    >
      {config.icon}
      {config.text}
    </div>
  );
};
