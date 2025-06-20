import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Trainer, ISchedule, IWorkingHours } from "~/types/trainer";

interface TrainerScheduleModalProps {
  trainer: Trainer;
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: ISchedule[]) => void;
}

const DAYS_OF_WEEK = [
  { id: 0, name: "Chủ nhật" },
  { id: 1, name: "Thứ hai" },
  { id: 2, name: "Thứ ba" },
  { id: 3, name: "Thứ tư" },
  { id: 4, name: "Thứ năm" },
  { id: 5, name: "Thứ sáu" },
  { id: 6, name: "Thứ bảy" },
];

const DEFAULT_WORKING_HOURS: IWorkingHours = {
  start: "08:00",
  end: "17:00",
  available: true,
};

const TrainerScheduleModal: React.FC<TrainerScheduleModalProps> = ({
  trainer,
  isOpen,
  onClose,
  onSave,
}) => {
  const [schedule, setSchedule] = useState<ISchedule[]>([]);

  // Initialize schedule when modal opens
  useEffect(() => {
    if (isOpen) {
      // If trainer has schedule, use it; otherwise create default
      if (trainer.schedule && trainer.schedule.length > 0) {
        setSchedule(
          [...trainer.schedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
        );
      } else {
        // Create default schedule for all days
        const defaultSchedule: ISchedule[] = DAYS_OF_WEEK.map((day) => ({
          dayOfWeek: day.id,
          available: false,
          workingHours: [],
        }));
        setSchedule(defaultSchedule);
      }
    }
  }, [isOpen, trainer]);

  // Handle day availability toggle
  const handleDayAvailabilityChange = (dayOfWeek: number) => {
    setSchedule((prevSchedule) =>
      prevSchedule.map((day) => {
        if (day.dayOfWeek === dayOfWeek) {
          // If making day available and no working hours exist, add default
          const newWorkingHours =
            !day.available &&
            (!day.workingHours || day.workingHours.length === 0)
              ? [{ ...DEFAULT_WORKING_HOURS }]
              : day.workingHours;

          return {
            ...day,
            available: !day.available,
            workingHours: newWorkingHours,
          };
        }
        return day;
      }),
    );
  };

  // Handle working hours change
  const handleWorkingHoursChange = (
    dayOfWeek: number,
    index: number,
    field: keyof IWorkingHours,
    value: string | boolean,
  ) => {
    setSchedule((prevSchedule) =>
      prevSchedule.map((day) => {
        if (day.dayOfWeek === dayOfWeek && day.workingHours) {
          const updatedHours = [...day.workingHours];
          updatedHours[index] = {
            ...updatedHours[index],
            [field]: value,
          };
          return { ...day, workingHours: updatedHours };
        }
        return day;
      }),
    );
  };

  // Add new working hours slot
  const addWorkingHours = (dayOfWeek: number) => {
    setSchedule((prevSchedule) =>
      prevSchedule.map((day) => {
        if (day.dayOfWeek === dayOfWeek) {
          const workingHours = day.workingHours || [];
          return {
            ...day,
            workingHours: [...workingHours, { ...DEFAULT_WORKING_HOURS }],
          };
        }
        return day;
      }),
    );
  };

  // Remove working hours slot
  const removeWorkingHours = (dayOfWeek: number, index: number) => {
    setSchedule((prevSchedule) =>
      prevSchedule.map((day) => {
        if (day.dayOfWeek === dayOfWeek && day.workingHours) {
          const workingHours = [...day.workingHours];
          workingHours.splice(index, 1);
          return { ...day, workingHours };
        }
        return day;
      }),
    );
  };

  // Check for overlapping time slots
  const validateSchedule = (): { valid: boolean; message?: string } => {
    for (const day of schedule) {
      if (!day.available || !day.workingHours || day.workingHours.length <= 1) {
        continue;
      }

      // Sort hours by start time for validation
      const sortedHours = [...day.workingHours].sort((a, b) =>
        a.start.localeCompare(b.start),
      );

      for (let i = 0; i < sortedHours.length - 1; i++) {
        if (sortedHours[i].end > sortedHours[i + 1].start) {
          return {
            valid: false,
            message: `Khung giờ làm việc bị chồng chéo vào ${DAYS_OF_WEEK.find((d) => d.id === day.dayOfWeek)?.name}`,
          };
        }
      }
    }
    return { valid: true };
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSchedule();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    // Process schedule before saving
    const processedSchedule = schedule.map((day) => ({
      ...day,
      // If day is not available, ensure workingHours is empty
      workingHours: day.available ? day.workingHours : [],
    }));

    onSave(processedSchedule);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quản lý lịch làm việc - {trainer.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Thiết lập lịch làm việc cho huấn luyện viên. Bạn có thể thêm nhiều
          khung giờ làm việc trong một ngày.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {schedule.map((day) => (
              <div
                key={day.dayOfWeek}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`available-${day.dayOfWeek}`}
                      checked={day.available}
                      onChange={() =>
                        handleDayAvailabilityChange(day.dayOfWeek)
                      }
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    />
                    <label
                      htmlFor={`available-${day.dayOfWeek}`}
                      className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      {DAYS_OF_WEEK.find((d) => d.id === day.dayOfWeek)?.name}
                    </label>
                  </div>

                  {day.available && (
                    <button
                      type="button"
                      onClick={() => addWorkingHours(day.dayOfWeek)}
                      className="flex items-center rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Thêm khung giờ
                    </button>
                  )}
                </div>

                {day.available &&
                day.workingHours &&
                day.workingHours.length > 0 ? (
                  <div className="space-y-3">
                    {day.workingHours.map((hours, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap items-center gap-3"
                      >
                        <div className="flex items-center">
                          <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                            Từ:
                          </label>
                          <input
                            type="time"
                            value={hours.start}
                            onChange={(e) =>
                              handleWorkingHoursChange(
                                day.dayOfWeek,
                                index,
                                "start",
                                e.target.value,
                              )
                            }
                            className="rounded-md border border-gray-300 bg-gray-50 p-1.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div className="flex items-center">
                          <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                            Đến:
                          </label>
                          <input
                            type="time"
                            value={hours.end}
                            onChange={(e) =>
                              handleWorkingHoursChange(
                                day.dayOfWeek,
                                index,
                                "end",
                                e.target.value,
                              )
                            }
                            className="rounded-md border border-gray-300 bg-gray-50 p-1.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeWorkingHours(day.dayOfWeek, index)
                          }
                          className="ml-auto flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40"
                          disabled={day.workingHours?.length === 1}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                ) : day.available ? (
                  <p className="text-sm italic text-gray-500 dark:text-gray-400">
                    Chưa có khung giờ làm việc. Nhấn "Thêm khung giờ" để thêm
                    mới.
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {/* Footer với các nút */}
          <div className="mt-6 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Lưu lịch làm việc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerScheduleModal;
