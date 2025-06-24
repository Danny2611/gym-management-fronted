// src/components/appointments/AppointmentCard.tsx
import React, { useState } from "react";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { AppointmentStatus } from "./AppointmentStatus";
import { formatDate, isToday, canBeCancelled } from "./AppointmentUtils";

export interface AppointmentItem {
  id: string;
  date: string;
  time: string;
  location: string;
  package_name?: string;
  notes?: string;
  status: string;
  trainer: {
    id: string;
    name: string;
    image: string;
  };
}

interface AppointmentCardProps {
  appointment: AppointmentItem;
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  onReschedule,
  onViewDetails,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Kiểm tra xem lịch hẹn đã quá hạn chưa
  const isExpired = () => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate < new Date();
  };

  // Kiểm tra xem còn đủ 1 ngày để hủy không
  const hasOneDayBuffer = () => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return appointmentDate.getTime() - now.getTime() >= oneDayInMs;
  };

  // Kiểm tra nút hủy có bị disable không theo logic
  const isCancelDisabled = () => {
    // Nếu là pending thì luôn cho phép hủy
    if (appointment.status === "pending") return false;

    // Nếu đã hoàn thành hoặc đã hủy rồi thì không cho hủy nữa
    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    )
      return true;

    // Nếu là confirmed thì kiểm tra thời gian
    return !hasOneDayBuffer() || isExpired();
  };

  // Lấy lý do tại sao không thể hủy lịch
  const getCancelBlockReason = () => {
    if (appointment.status === "completed") {
      return "Không thể hủy lịch đã hoàn thành";
    }

    if (appointment.status === "cancelled") {
      return "Lịch hẹn đã bị hủy trước đó";
    }

    if (isExpired()) {
      return "Không thể hủy lịch đã qua";
    }

    if (!hasOneDayBuffer()) {
      return "Chỉ có thể hủy lịch trước thời gian hẹn ít nhất 24 giờ";
    }

    return "Không thể hủy lịch";
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col sm:flex-row">
        <div className="mb-4 mr-4 flex-shrink-0 sm:mb-0">
          <img
            src={
              `${appointment.trainer.image}` ||
              "/api/placeholder/400/400"
            }
            alt={appointment.trainer.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Buổi tập với {appointment.trainer.name}
            </h3>
            <AppointmentStatus status={appointment.status as any} />
          </div>

          <div className="mb-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                {isToday(new Date(appointment.date))
                  ? "Hôm nay"
                  : formatDate(appointment.date)}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{appointment.location}</span>
            </div>
            {appointment.package_name && (
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Gói: {appointment.package_name}</span>
              </div>
            )}
            {appointment.notes && (
              <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-700">
                <p className="text-xs">{appointment.notes}</p>
              </div>
            )}
          </div>

          {(appointment.status === "confirmed" ||
            appointment.status === "pending") && (
            <div className="mt-2 flex flex-wrap gap-2">
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(appointment.id)}
                  className="rounded-lg border border-blue-500 px-3 py-1 text-xs font-medium text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  Chi tiết
                </button>
              )}
              <button
                onClick={() => onReschedule(appointment.id)}
                className="rounded-lg border border-blue-500 px-3 py-1 text-xs font-medium text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                Đổi lịch
              </button>
              <div className="relative">
                <button
                  className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                    isCancelDisabled()
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    if (!isCancelDisabled()) {
                      onCancel(appointment.id);
                    } else {
                      setShowTooltip(true);
                      setTimeout(() => setShowTooltip(false), 5000); // Ẩn sau 5 giây
                    }
                  }}
                  onMouseEnter={() => {
                    if (isCancelDisabled()) setShowTooltip(true);
                  }}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  Hủy lịch
                </button>
                {showTooltip && isCancelDisabled() && (
                  <div className="absolute bottom-full left-0 z-10 mb-2 w-64 rounded bg-gray-800 p-2 text-xs text-white shadow-lg">
                    {getCancelBlockReason()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
