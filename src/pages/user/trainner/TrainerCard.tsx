import React, { useState } from "react";
import { Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Trainer, ISchedule, TrainerCardProps } from "~/types/trainer";

// Hàm chuyển đổi lịch làm việc từ ISchedule sang định dạng hiển thị
const formatSchedule = (schedule?: ISchedule[]): ISchedule[] => {
  if (!schedule || schedule.length === 0) return [];

  return schedule
    .filter((s) => s.available && s.workingHours && s.workingHours.length > 0)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek); // Sắp xếp theo thứ tự ngày trong tuần
};

// Component hiển thị lịch làm việc
const ScheduleDisplay: React.FC<{ schedule?: ISchedule[] }> = ({
  schedule,
}) => {
  const [expanded, setExpanded] = useState(false);
  const formattedSchedule = formatSchedule(schedule);
  const dayNames = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  if (formattedSchedule.length === 0) {
    return (
      <div className="mt-2 italic text-gray-500">
        Chưa cập nhật lịch làm việc
      </div>
    );
  }

  // Hiển thị tóm tắt số ngày làm việc trong tuần
  const daysAvailable = formattedSchedule.length;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {daysAvailable} ngày trong tuần
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {expanded ? (
            <>
              Thu gọn <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Xem chi tiết <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          {formattedSchedule.map((day, index) => (
            <div
              key={index}
              className="rounded-md bg-gray-50 p-2 dark:bg-gray-700/50"
            >
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {dayNames[day.dayOfWeek]}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {day.workingHours?.map((hours, idx) => (
                  <div
                    key={idx}
                    className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {hours.start}-{hours.end}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TrainerCard: React.FC<TrainerCardProps> = ({
  trainer,
  onBookTrainer,
  isBooking,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col md:flex-row">
        <div className="mb-4 mr-6 flex-shrink-0 md:mb-0">
          <img
            src={
              `${trainer.image}` ||
              "/api/placeholder/400/400"
            }
            alt={trainer.name}
            className="h-48 w-48 rounded-lg object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {trainer.name}
            </h3>
          </div>

          <div className="mb-3 text-sm">
            {trainer.specialization && (
              <span className="mr-2 rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {trainer.specialization}
              </span>
            )}
            {trainer.experience && (
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {trainer.experience} năm kinh nghiệm
              </span>
            )}
          </div>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {trainer.bio || "Chưa có thông tin"}
          </p>

          <div className="mb-4 mt-auto rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-bold text-gray-900 dark:text-white">
                Lịch làm việc
              </h4>
            </div>
            <ScheduleDisplay schedule={trainer.schedule} />
          </div>

          <div className="mt-auto flex justify-end space-x-3">
            <button
              onClick={onBookTrainer}
              disabled={isBooking}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              {isBooking ? "Đang xử lý..." : "Đặt lịch hẹn"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerCard;
