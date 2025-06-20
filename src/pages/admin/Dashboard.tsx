import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import ComponentCard from "~/components/dashboard/common/ComponentCard";

// Dummy data - replace with actual data in your application
const progressData = [
  { name: "T2", sessions: 2, duration: 90 },
  { name: "T3", sessions: 1, duration: 45 },
  { name: "T4", sessions: 2, duration: 120 },
  { name: "T5", sessions: 0, duration: 0 },
  { name: "T6", sessions: 3, duration: 150 },
  { name: "T7", sessions: 1, duration: 60 },
  { name: "CN", sessions: 0, duration: 0 },
];

// Example Avatar component - replace with your actual component
const Avatar = ({
  src,
  name,
  size = "md",
}: {
  src: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) => (
  <div className="flex items-center gap-3">
    <div
      className={`overflow-hidden rounded-full ${size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10"}`}
    >
      <img src={src} alt={name} className="h-full w-full object-cover" />
    </div>
    <span className="font-medium text-gray-800 dark:text-white/90">{name}</span>
  </div>
);

// Badge component for statuses
const Badge = ({
  type,
  text,
}: {
  type: "success" | "warning" | "error" | "info";
  text: string;
}) => {
  const colorClasses = {
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[type]}`}
    >
      {text}
    </span>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard Hội Viên
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Thông tin tài khoản hội viên */}
        <ComponentCard title="Thông tin hội viên" className="lg:col-span-1">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Avatar
                src="/placeholder-avatar.jpg"
                name="Nguyễn Văn A"
                size="lg"
              />
              <Badge type="success" text="Premium" />
            </div>

            <div className="mt-2 space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Gói tập hiện tại:
                </span>
                <span className="font-medium">Premium 6 tháng</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Thời hạn còn lại:
                </span>
                <span className="font-medium">45 ngày</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Buổi tập còn lại:
                </span>
                <span className="font-medium">12/30 buổi</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Gia hạn gói tập
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Xem chi tiết
              </button>
            </div>
          </div>
        </ComponentCard>

        {/* Lịch tập sắp tới */}
        <ComponentCard
          title="Lịch tập sắp tới"
          className="lg:col-span-2"
          desc="Các buổi tập được lên lịch trong 7 ngày tới"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ngày & Giờ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Loại buổi tập
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Phòng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <div className="font-medium">Hôm nay</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      17:00 - 18:00
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    Yoga Flow
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    Phòng 203
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <Badge type="success" text="Đã xác nhận" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <div className="font-medium">Ngày mai</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      08:30 - 09:30
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    Cá nhân với PT
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    Khu vực tự do
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <Badge type="info" text="Chờ xác nhận" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <div className="font-medium">20/03/2025</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      19:00 - 20:30
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">HIIT</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    Phòng 101
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <Badge type="success" text="Đã xác nhận" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Xem tất cả lịch tập →
            </button>
          </div>
        </ComponentCard>

        {/* Lịch hẹn với PT */}
        <ComponentCard
          title="Huấn luyện viên của bạn"
          className="lg:col-span-1"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full">
                <img
                  src="/placeholder-trainer.jpg"
                  alt="PT"
                  className="h-full w-full object-cover"
                />
              </div>
              <h4 className="mt-3 text-lg font-medium">Trần Văn B</h4>
              <p className="text-gray-600 dark:text-gray-400">
                HLV Cá nhân - 5 năm kinh nghiệm
              </p>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <h5 className="mb-2 font-medium">Buổi tập sắp tới:</h5>
              <div className="mb-2 flex items-center justify-between">
                <span>Ngày mai, 08:30</span>
                <Badge type="info" text="Chờ xác nhận" />
              </div>
              <div className="flex justify-between">
                <button className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                  Hủy
                </button>
                <button className="ml-2 flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
                  Liên hệ
                </button>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Tiến độ tập luyện */}
        <ComponentCard
          title="Tiến độ tập luyện trong tuần"
          className="lg:col-span-2"
          desc="Số buổi tập và thời gian tập trung bình"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={progressData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="sessions"
                  name="Số buổi tập"
                  fill="#8884d8"
                />
                <Bar
                  yAxisId="right"
                  dataKey="duration"
                  name="Thời gian (phút)"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Tổng số buổi tập
              </p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                9 buổi
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                +2 so với tuần trước
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-green-700 dark:text-green-300">
                Thời gian tập trung bình
              </p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                66 phút
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                +5 so với tuần trước
              </p>
            </div>
          </div>
        </ComponentCard>

        {/* Giao dịch gần đây */}
        <ComponentCard title="Giao dịch gần đây" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Thanh toán gói tập</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    15/03/2025
                  </p>
                </div>
              </div>
              <span className="font-medium text-green-600 dark:text-green-400">
                2.500.000đ
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Mua nước protein</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    10/03/2025
                  </p>
                </div>
              </div>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                85.000đ
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Đặt lịch PT</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    05/03/2025
                  </p>
                </div>
              </div>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                350.000đ
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Xem tất cả giao dịch →
            </button>
          </div>
        </ComponentCard>

        {/* Thông báo và nhắc nhở */}
        <ComponentCard title="Thông báo" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-900/20">
              <h4 className="mb-1 font-medium text-yellow-700 dark:text-yellow-400">
                Gói tập sắp hết hạn
              </h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">
                Gói tập của bạn sẽ hết hạn sau 45 ngày. Gia hạn ngay để nhận ưu
                đãi 15%.
              </p>
              <button className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300">
                Gia hạn ngay
              </button>
            </div>

            <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/20">
              <h4 className="mb-1 font-medium text-blue-700 dark:text-blue-400">
                Sự kiện sắp diễn ra
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Workshop "Dinh dưỡng cho người tập gym" sẽ diễn ra vào
                20/03/2025.
              </p>
              <button className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Đăng ký tham gia
              </button>
            </div>

            <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:border-green-600 dark:bg-green-900/20">
              <h4 className="mb-1 font-medium text-green-700 dark:text-green-400">
                Chạm mốc thành tựu
              </h4>
              <p className="text-sm text-green-600 dark:text-green-300">
                Chúc mừng! Bạn đã hoàn thành 50 buổi tập tại phòng gym.
              </p>
              <button className="mt-2 text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                Xem thành tựu
              </button>
            </div>
          </div>
        </ComponentCard>

        {/* Khuyến mãi */}
        <ComponentCard title="Đề xuất & Khuyến mãi" className="lg:col-span-1">
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
            <h4 className="mb-2 text-lg font-bold">
              Gói Platinum - Tiết kiệm 25%
            </h4>
            <p className="mb-4 text-sm text-white/90">
              Dựa trên hoạt động của bạn, gói Platinum sẽ phù hợp hơn với lịch
              tập của bạn.
            </p>
            <ul className="mb-4 space-y-1 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Không giới hạn thời gian tập
              </li>
              <li className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                8 buổi PT miễn phí mỗi tháng
              </li>
              <li className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Ưu đãi 20% khi mua thực phẩm bổ sung
              </li>
            </ul>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-white/80">Chỉ từ</span>
                <p className="text-2xl font-bold">1.200.000đ/tháng</p>
              </div>
              <button className="rounded-lg bg-white px-4 py-2 font-medium text-blue-600 hover:bg-blue-50">
                Nâng cấp
              </button>
            </div>
          </div>
        </ComponentCard>

        {/* Truy cập nhanh */}
        <ComponentCard title="Truy cập nhanh" className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-blue-600 dark:text-blue-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Đặt lịch tập
              </span>
            </button>

            <button className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-purple-600 dark:text-purple-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Hẹn với PT
              </span>
            </button>

            <button className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-green-600 dark:text-green-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Xem tiến độ
              </span>
            </button>

            <button className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-red-600 dark:text-red-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Xem lịch sử tập
              </span>
            </button>

            <button className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-orange-600 dark:text-orange-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m6-6H6"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Mua gói tập
              </span>
            </button>

            <button className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-teal-600 dark:text-teal-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Xem giao dịch
              </span>
            </button>

            <button className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-gray-600 dark:text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Cài đặt tài khoản
              </span>
            </button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default Dashboard;
