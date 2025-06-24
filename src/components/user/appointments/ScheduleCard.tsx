import React, { useState } from "react";

import {
  ClockIcon,
  MapPinIcon,
  UserRoundIcon,
  DumbbellIcon,
  ActivityIcon,
  ClipboardIcon,
  InfoIcon,

} from "lucide-react";
import Button from "~/components/common/Button";
import Avatar from "~/components/ui/avatar/Avatar";
import { useNavigate } from "react-router-dom";
import { CombinedSchedule } from "~/types/workout";
import { formatFullDate } from "~/utils/formatters";

interface ScheduleCardProps {
  schedule: CombinedSchedule;
  onMarkCompleted?: (id: string, endTime: string, date: string) => void;
  onViewDetails?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onMarkCompleted,
  onReschedule,

}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  // Extract the end time from the time field or use default (1 hour later)
  const getEndTime = () => {
    // Nếu đã có end time thì trả về luôn
    if (schedule.time?.endTime) return schedule.time.endTime;

    const startTime = schedule.time?.startTime;
    if (!startTime) return "00:00"; // hoặc trả về giá trị mặc định khác

    const [hour, minute] = startTime.split(":").map(Number);

    const endDate = new Date();
    endDate.setHours(hour + 1, minute, 0, 0);

    // Chuẩn hóa lại HH:MM
    const formattedHour = String(endDate.getHours()).padStart(2, "0");
    const formattedMinute = String(endDate.getMinutes()).padStart(2, "0");

    return `${formattedHour}:${formattedMinute}`;
  };

  // Check if appointment can be marked as completed
  const canMarkCompleted = () => {
    // Must be in "upcoming" status (which corresponds to "confirmed" in backend)
    if (schedule.status !== "upcoming") return false;

    const now = new Date();
    const [endHour, endMinute] = getEndTime().split(":").map(Number);
    const appointmentEnd = new Date(schedule.date);
    appointmentEnd.setHours(endHour, endMinute, 0, 0);

    // Calculate latest allowed time (23:59:59 of the day after appointment)
    const latestAllowedTime = new Date(schedule.date);
    latestAllowedTime.setDate(latestAllowedTime.getDate() + 1);
    latestAllowedTime.setHours(23, 59, 59, 999);

    // Can only mark completed if current time is after end time and before the deadline
    return now >= appointmentEnd && now <= latestAllowedTime;
  };

  // Get reason why it can't be marked as completed
  const getCompletionBlockReason = () => {
    if (schedule.status !== "upcoming") {
      return "Chỉ lịch tập có trạng thái 'Sắp tới' mới có thể đánh dấu hoàn thành";
    }

    const now = new Date();
    const [endHour, endMinute] = getEndTime().split(":").map(Number);
    const appointmentEnd = new Date(schedule.date);
    appointmentEnd.setHours(endHour, endMinute, 0, 0);

    // Calculate latest allowed time (23:59:59 of the day after appointment)
    const latestAllowedTime = new Date(schedule.date);
    latestAllowedTime.setDate(latestAllowedTime.getDate() + 1);
    latestAllowedTime.setHours(23, 59, 59, 999);

    if (now < appointmentEnd) {
      return "Chỉ có thể đánh dấu hoàn thành sau khi buổi tập kết thúc";
    }

    if (now > latestAllowedTime) {
      return "Đã quá thời gian cho phép cập nhật hoàn thành buổi tập (trước 23:59 của ngày sau buổi tập)";
    }

    return "";
  };

  // Xác định các class CSS dựa vào trạng thái
  let statusBgColor = "";
  let statusTextColor = "";
  let cardBorderColor = "";
  let cardBgColor = "";

  switch (schedule.status) {
    case "upcoming":
      statusBgColor = "bg-blue-100 dark:bg-blue-900/30";
      statusTextColor = "text-blue-800 dark:text-blue-200";
      cardBorderColor = "border-l-4 border-l-blue-500";
      cardBgColor = "bg-blue-50/50 dark:bg-blue-900/10";
      break;
    case "completed":
      statusBgColor = "bg-green-100 dark:bg-green-900/30";
      statusTextColor = "text-green-800 dark:text-green-200";
      cardBorderColor = "border-l-4 border-l-green-500";
      cardBgColor = "bg-green-50/50 dark:bg-green-900/10";
      break;
    case "missed":
      statusBgColor = "bg-red-100 dark:bg-red-900/30";
      statusTextColor = "text-red-800 dark:text-red-200";
      cardBorderColor = "border-l-4 border-l-red-500";
      cardBgColor = "bg-red-50/50 dark:bg-red-900/10";
      break;
    default:
      statusBgColor = "bg-gray-100 dark:bg-gray-800";
      statusTextColor = "text-gray-800 dark:text-gray-200";
      cardBorderColor = "border-l-4 border-l-gray-500";
      cardBgColor = "";
  }

  return (
    <div className={`p-4 ${cardBorderColor} ${cardBgColor}`}>
      <div className="flex justify-between">
        <div className="flex">
          {schedule.type === "appointment" ? (
            // PT Schedule info
            <div className="mr-4 h-12 w-12 overflow-hidden rounded-full">
              {schedule.trainer_image ? (
                <Avatar
                  src={schedule.trainer_image}
                  alt="PT"
                  size="xlarge"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                  <UserRoundIcon size={24} />
                </div>
              )}
            </div>
          ) : (
            // Workout Schedule icon
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white">
              <DumbbellIcon size={24} />
            </div>
          )}

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {schedule.type === "appointment"
                ? `Buổi tập PT: ${schedule.package_name || "Không có tên gói"}`
                : `Tập cá nhân: ${schedule.muscle_groups?.join(", ") || "Tất cả nhóm cơ"}`}
            </h3>
            <div className="mt-1 flex items-center space-x-2">
              <ClockIcon size={16} className="text-gray-500" />
              {schedule.type === "workout" && schedule.duration ? (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {schedule.timeStart
                    ? formatFullDate(schedule.timeStart)
                    : null}
                </span>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {schedule.time?.startTime} - {schedule.time?.endTime}
                </p>
              )}
            </div>
            {schedule.type === "workout" && schedule.timeStart && (
              <div className="mt-1 flex items-center space-x-2">
                <ActivityIcon size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Thời lượng: {schedule.duration} phút
                </span>
              </div>
            )}

            {schedule.location && (
              <div className="mt-1 flex items-center space-x-2">
                <MapPinIcon size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {schedule.location}
                </span>
              </div>
            )}

            {schedule.trainer_name && (
              <div className="mt-1 flex items-center space-x-2">
                <UserRoundIcon size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  HLV: {schedule.trainer_name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusBgColor} ${statusTextColor}`}
          >
            {schedule.status === "upcoming" && "Sắp tới"}
            {schedule.status === "completed" && "Đã hoàn thành"}
            {schedule.status === "missed" && "Đã bỏ lỡ"}
          </div>
        </div>
      </div>

      {schedule.notes && (
        <div className="mt-3 rounded-lg bg-gray-100 p-2 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          <div className="flex">
            <ClipboardIcon size={16} className="mr-1 text-gray-500" />
            <span className="font-semibold">Ghi chú:</span>
          </div>
          <p className="mt-1">{schedule.notes}</p>
        </div>
      )}

      {schedule.type === "workout" &&
        schedule.exercises &&
        schedule.exercises.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center">
              <DumbbellIcon size={16} className="mr-1 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Bài tập ({schedule.exercises.length}):
              </span>
            </div>
            <div className="mt-1 space-y-1">
              {schedule.exercises.slice(0, 3).map((exercise, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  • {exercise.name} ({exercise.sets} x {exercise.reps})
                </div>
              ))}
              {schedule.exercises.length > 3 && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  + {schedule.exercises.length - 3} bài tập khác
                </div>
              )}
            </div>
          </div>
        )}

      <div className="mt-3 flex justify-end space-x-2">
        {schedule.type === "appointment" && (
          <Button
            size="small"
            variant="outline"
            className="text-xs"
            onClick={() => navigate(`/member/pt-session/${schedule._id}`)}
          >
            <InfoIcon size={14} className="mr-1" />
            Chi tiết
          </Button>
        )}

        {schedule.type === "workout" && (
          <Button
            size="small"
            variant="outline"
            className="text-xs"
            onClick={() => navigate(`/member/workout/${schedule._id}`)}
          >
            <InfoIcon size={14} className="mr-1" />
            Chi tiết
          </Button>
        )}

        {/* Nút đánh dấu hoàn thành */}
        {schedule.status === "upcoming" && onMarkCompleted && (
          <div className="relative">
            <button
              className={`rounded px-3 py-1 text-sm text-white ${
                canMarkCompleted()
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "cursor-not-allowed bg-gray-400"
              }`}
              onClick={() => {
                if (canMarkCompleted() && onMarkCompleted) {
                  onMarkCompleted(schedule._id, getEndTime(), schedule.date);
                } else {
                  setShowTooltip(true);
                  setTimeout(() => setShowTooltip(false), 5000); // Hide after 5 seconds
                }
              }}
              onMouseEnter={() => {
                if (!canMarkCompleted()) setShowTooltip(true);
              }}
              onMouseLeave={() => setShowTooltip(false)}
            >
              Đánh dấu hoàn thành
            </button>
            {showTooltip && !canMarkCompleted() && (
              <div className="absolute bottom-full left-0 mb-2 w-64 rounded bg-gray-800 p-2 text-xs text-white shadow-lg">
                {getCompletionBlockReason()}
              </div>
            )}
          </div>
        )}

        {/* Nút đổi lịch */}
        {schedule.status === "upcoming" &&
          schedule.type === "appointment" &&
          onReschedule && (
            <Button
              size="small"
              variant="outline"
              className="text-xs"
              onClick={() => onReschedule(schedule._id)}
            >
              Đổi lịch
            </Button>
          )}
      </div>
    </div>
  );
};

