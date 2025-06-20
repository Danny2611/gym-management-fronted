import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ScheduleDetailProps {
  scheduleId: number;
  onClose: () => void;
  onReschedule: () => void;
  onMarkComplete: () => void;
}

const ScheduleDetail: React.FC<ScheduleDetailProps> = ({
  scheduleId,
  onClose,
  onReschedule,
  onMarkComplete,
}) => {
  // In a real app, you would fetch the schedule details using the ID
  // For this example, we'll use mock data
  const scheduleDetail = {
    id: scheduleId,
    date: "2025-03-20",
    time: "08:00",
    endTime: "09:30",
    location: "Phòng Tập Chính - Tầng 2",
    notes: "Tập trung vào cardio và giảm cân. Mang theo nước uống.",
    package_name: "Gói Premium",
    trainer: {
      id: 3,
      name: "Mike Williams",
      image: "/images/trainers/mike.jpg",
      specialization: "Cardio & Weight Loss",
      experience: 8,
      bio: "Chuyên gia về cardio và giảm cân với 8 năm kinh nghiệm huấn luyện. Tốt nghiệp Đại học Thể Dục Thể Thao TP.HCM.",
    },
    status: "upcoming",
    exercises: [
      {
        name: "Khởi động",
        duration: "10 phút",
        description: "Chạy bộ nhẹ nhàng, căng cơ các nhóm cơ chính.",
      },
      {
        name: "Circuit Training",
        duration: "30 phút",
        description:
          "Tập đa nhóm cơ với 5 động tác: squat, push-up, plank, burpees, và mountain climbers.",
      },
      {
        name: "Cardio Interval",
        duration: "20 phút",
        description: "Chạy HIIT: 30 giây chạy nhanh, 30 giây nghỉ ngơi.",
      },
      {
        name: "Giãn cơ",
        duration: "10 phút",
        description: "Giãn cơ đầy đủ các nhóm cơ đã tập.",
      },
    ],
    equipment: ["Máy chạy bộ", "Tạ tay 3kg", "Thảm tập"],
  };

  const [activeTab, setActiveTab] = useState<"info" | "exercises" | "notes">(
    "info",
  );

  // Format date for display
  const formattedDate = format(
    new Date(scheduleDetail.date),
    "EEEE, dd/MM/yyyy",
    { locale: vi },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Chi tiết buổi tập</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Date and status banner */}
        <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900">
          <div>
            <div className="text-lg font-semibold">{formattedDate}</div>
            <div className="text-gray-600 dark:text-gray-300">
              {scheduleDetail.time} - {scheduleDetail.endTime}
            </div>
          </div>
          <div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                scheduleDetail.status === "upcoming"
                  ? "bg-blue-100 text-blue-800"
                  : scheduleDetail.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
              } `}
            >
              {scheduleDetail.status === "upcoming"
                ? "Sắp tới"
                : scheduleDetail.status === "completed"
                  ? "Đã hoàn thành"
                  : "Đã lỡ"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium ${activeTab === "info" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("info")}
          >
            Thông tin chung
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === "exercises" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("exercises")}
          >
            Bài tập
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === "notes" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("notes")}
          >
            Ghi chú
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "info" && (
            <div>
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold">Địa điểm</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {scheduleDetail.location}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold">Gói tập</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {scheduleDetail.package_name}
                </p>
              </div>

              {scheduleDetail.trainer && (
                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-semibold">
                    Huấn luyện viên
                  </h3>
                  <div className="flex items-start">
                    <div className="mr-4 h-16 w-16 overflow-hidden rounded-full">
                      <img
                        src="/api/placeholder/64/64"
                        alt={scheduleDetail.trainer.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {scheduleDetail.trainer.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {scheduleDetail.trainer.specialization} •{" "}
                        {scheduleDetail.trainer.experience} năm kinh nghiệm
                      </p>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {scheduleDetail.trainer.bio}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold">Dụng cụ cần mang</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                  {scheduleDetail.equipment.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "exercises" && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">Lịch trình bài tập</h3>
              <div className="space-y-4">
                {scheduleDetail.exercises.map((exercise, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {exercise.duration}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {exercise.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">Ghi chú</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {scheduleDetail.notes}
              </p>

              <div className="mt-6">
                <h4 className="mb-2 font-medium">Thêm ghi chú</h4>
                <textarea
                  className="h-32 w-full rounded-lg border p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thêm ghi chú cá nhân về buổi tập này..."
                ></textarea>
                <button className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  Lưu ghi chú
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between border-t p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>

          <div className="flex gap-3">
            {scheduleDetail.status === "upcoming" && (
              <>
                <button
                  onClick={onReschedule}
                  className="rounded-lg border border-blue-500 px-4 py-2 text-blue-500 hover:bg-blue-50"
                >
                  Đổi lịch
                </button>
                <button
                  onClick={onMarkComplete}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Đánh dấu hoàn thành
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;
