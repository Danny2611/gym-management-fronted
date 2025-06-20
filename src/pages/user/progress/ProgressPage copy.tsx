import React, { useState, ChangeEvent } from "react";
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
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  TooltipProps,
} from "recharts";

// Định nghĩa interface cho chỉ số cơ thể
interface BodyStats {
  date: string;
  weight: number;
  height: number;
  muscle_mass: number;
  body_fat: number;
  bmi: number;
}

// Interface cho dữ liệu buổi tập theo tuần
interface WeeklyWorkout {
  name: string;
  sessions: number;
  duration: number;
  target: number;
}

// Interface cho dữ liệu so sánh tháng
interface MonthlyStats {
  totalSessions: number;
  totalDuration: number; // phút
  completionRate: number;
  avgSessionLength: number;
}

interface MonthComparison {
  current: MonthlyStats;
  previous: MonthlyStats;
}

// Interface cho tiến độ chỉ số cơ thể theo thời gian
interface BodyStatsProgress {
  month: string;
  weight: number;
  body_fat: number;
  muscle_mass: number;
  bmi: number;
}

// Interface cho dữ liệu biểu đồ radar
interface FitnessRadarData {
  subject: string;
  current: number;
  initial: number;
  full: number;
}

// Interface cho dữ liệu hoàn thành mục tiêu
interface GoalCompletionData {
  name: string;
  value: number;
}

// Interface cho form data cập nhật chỉ số cơ thể
interface BodyStatsFormData {
  weight: number;
  height: number;
  muscle_mass: number;
  body_fat: number;
  bmi: number;
}

// Props cho component Badge
interface BadgeProps {
  type: "success" | "warning" | "error" | "info";
  text: string;
}

// Props cho component Card
interface ComponentCardProps {
  title: string;
  desc?: string;
  children: React.ReactNode;
  className?: string;
}

// Props cho Custom Tooltip
interface CustomTooltipProps extends TooltipProps<number, string> {
  // Mở rộng từ TooltipProps của recharts
}

// Mock data cho các chỉ số cơ thể qua các thời kỳ
const bodyStatsHistory: BodyStats[] = [
  {
    date: "01/01/2025",
    weight: 78,
    height: 175,
    muscle_mass: 30.2,
    body_fat: 22.5,
    bmi: 25.5,
  },
  {
    date: "01/02/2025",
    weight: 77.2,
    height: 175,
    muscle_mass: 31.0,
    body_fat: 21.8,
    bmi: 25.2,
  },
  {
    date: "01/03/2025",
    weight: 76.5,
    height: 175,
    muscle_mass: 31.5,
    body_fat: 21.0,
    bmi: 25.0,
  },
  {
    date: "01/04/2025",
    weight: 75.8,
    height: 175,
    muscle_mass: 32.3,
    body_fat: 20.2,
    bmi: 24.7,
  },
  {
    date: "01/05/2025", // hiện tại
    weight: 75.0,
    height: 175,
    muscle_mass: 33.1,
    body_fat: 19.5,
    bmi: 24.5,
  },
];

// Mock data cho buổi tập theo tuần
const weeklyWorkoutData: WeeklyWorkout[] = [
  { name: "T2", sessions: 2, duration: 90, target: 1 },
  { name: "T3", sessions: 1, duration: 45, target: 1 },
  { name: "T4", sessions: 2, duration: 120, target: 1 },
  { name: "T5", sessions: 0, duration: 0, target: 1 },
  { name: "T6", sessions: 3, duration: 150, target: 1 },
  { name: "T7", sessions: 1, duration: 60, target: 1 },
  { name: "CN", sessions: 0, duration: 0, target: 1 },
];

// Mock data cho so sánh tháng trước và tháng này
const monthComparisonData: MonthComparison = {
  current: {
    totalSessions: 28,
    totalDuration: 1520, // phút
    completionRate: 85,
    avgSessionLength: 54.3,
  },
  previous: {
    totalSessions: 22,
    totalDuration: 1230, // phút
    completionRate: 70,
    avgSessionLength: 55.9,
  },
};

// Mock data cho tiến độ chỉ số cơ thể theo thời gian
const bodyStatsProgressData: BodyStatsProgress[] = [
  {
    month: "01/2025",
    weight: 78,
    body_fat: 22.5,
    muscle_mass: 30.2,
    bmi: 17.5,
  },
  {
    month: "02/2025",
    weight: 77.2,
    body_fat: 21.8,
    muscle_mass: 31.0,
    bmi: 18.5,
  },
  {
    month: "03/2025",
    weight: 76.5,
    body_fat: 21.0,
    muscle_mass: 31.5,
    bmi: 19.5,
  },
  {
    month: "04/2025",
    weight: 75.8,
    body_fat: 20.2,
    muscle_mass: 32.3,
    bmi: 20.5,
  },
  {
    month: "05/2025",
    weight: 75.0,
    body_fat: 19.5,
    muscle_mass: 33.1,
    bmi: 20.5,
  },
];

// Data cho biểu đồ radar
const fitnessRadarData: FitnessRadarData[] = [
  { subject: "Sức bền", current: 7, initial: 4, full: 10 },
  { subject: "Sức mạnh", current: 8, initial: 5, full: 10 },
  { subject: "Linh hoạt", current: 5, initial: 3, full: 10 },
  { subject: "Cân đối", current: 6, initial: 4, full: 10 },
  { subject: "Tim mạch", current: 7, initial: 3, full: 10 },
];

// Data cho biểu đồ hoàn thành mục tiêu
const goalCompletionData: GoalCompletionData[] = [
  { name: "Hoàn thành", value: 72 },
  { name: "Còn lại", value: 28 },
];

const COLORS: string[] = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
];
const GOAL_COLORS: string[] = ["#00C49F", "#F3F4F6"];

// Component Badge cho hiển thị trạng thái
const Badge: React.FC<BadgeProps> = ({ type, text }) => {
  const colorClasses: Record<string, string> = {
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

// Component Card chung cho các phần trong trang
const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  desc,
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {desc && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

// Component chính - Trang Tiến Độ Tập Luyện
const ProgressPage1: React.FC = () => {
  // State cho form cập nhật chỉ số cơ thể
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [formData, setFormData] = useState<BodyStatsFormData>({
    weight: bodyStatsHistory[bodyStatsHistory.length - 1].weight,
    height: bodyStatsHistory[bodyStatsHistory.length - 1].height,
    muscle_mass: bodyStatsHistory[bodyStatsHistory.length - 1].muscle_mass,
    body_fat: bodyStatsHistory[bodyStatsHistory.length - 1].body_fat,
    bmi: bodyStatsHistory[bodyStatsHistory.length - 1].bmi,
  });

  // Lấy chỉ số cơ thể hiện tại, trước đó và ban đầu
  const currentStats: BodyStats = bodyStatsHistory[bodyStatsHistory.length - 1];
  const previousStats: BodyStats =
    bodyStatsHistory[bodyStatsHistory.length - 2];
  const initialStats: BodyStats = bodyStatsHistory[0];

  // Hàm xử lý thay đổi input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value),
    });
  };

  // Hàm tính % thay đổi giữa 2 giá trị
  const calculateChange = (current: number, previous: number): string => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  // Hàm tạo màu dựa trên giá trị thay đổi (xanh nếu tích cực, đỏ nếu tiêu cực)
  const getChangeColor = (
    current: number,
    previous: number,
    isPositiveBetter: boolean = true,
  ): string => {
    const change = current - previous;
    if (change === 0) return "text-gray-500";

    if (isPositiveBetter) {
      return change > 0 ? "text-green-500" : "text-red-500";
    } else {
      return change < 0 ? "text-green-500" : "text-red-500";
    }
  };

  // Custom tooltip cho biểu đồ
  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border border-gray-200 bg-white p-3 shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Tiến Độ Tập Luyện
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Chỉ số cơ thể hiện tại */}
        <ComponentCard
          title="Chỉ số cơ thể hiện tại"
          className="lg:col-span-2"
          desc="Cập nhật các chỉ số mới nhất của bạn"
        >
          {isUpdating ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Khối lượng cơ (kg)
                  </label>
                  <input
                    type="number"
                    name="muscle_mass"
                    value={formData.muscle_mass}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tỷ lệ mỡ (%)
                  </label>
                  <input
                    type="number"
                    name="body_fat"
                    value={formData.body_fat}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    BMI
                  </label>
                  <input
                    type="number"
                    name="bmi"
                    value={formData.bmi}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  onClick={() => setIsUpdating(false)}
                >
                  Hủy
                </button>
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  onClick={() => setIsUpdating(false)}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    Cân nặng
                  </div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {currentStats.weight} kg
                  </div>
                  <div
                    className={`text-xs ${getChangeColor(currentStats.weight, previousStats.weight, false)}`}
                  >
                    {currentStats.weight > previousStats.weight ? "+" : ""}
                    {calculateChange(currentStats.weight, previousStats.weight)}
                    % so với tháng trước
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="text-sm text-green-600 dark:text-green-300">
                    Khối lượng cơ
                  </div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {currentStats.muscle_mass} kg
                  </div>
                  <div
                    className={`text-xs ${getChangeColor(currentStats.muscle_mass, previousStats.muscle_mass, true)}`}
                  >
                    {currentStats.muscle_mass > previousStats.muscle_mass
                      ? "+"
                      : ""}
                    {calculateChange(
                      currentStats.muscle_mass,
                      previousStats.muscle_mass,
                    )}
                    % so với tháng trước
                  </div>
                </div>

                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                  <div className="text-sm text-red-600 dark:text-red-300">
                    Tỷ lệ mỡ
                  </div>
                  <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                    {currentStats.body_fat}%
                  </div>
                  <div
                    className={`text-xs ${getChangeColor(currentStats.body_fat, previousStats.body_fat, false)}`}
                  >
                    {currentStats.body_fat > previousStats.body_fat ? "+" : ""}
                    {calculateChange(
                      currentStats.body_fat,
                      previousStats.body_fat,
                    )}
                    % so với tháng trước
                  </div>
                </div>

                <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                  <div className="text-sm text-purple-600 dark:text-purple-300">
                    BMI
                  </div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {currentStats.bmi}
                  </div>
                  <div
                    className={`text-xs ${getChangeColor(currentStats.bmi, previousStats.bmi, false)}`}
                  >
                    {currentStats.bmi > previousStats.bmi ? "+" : ""}
                    {calculateChange(currentStats.bmi, previousStats.bmi)}% so
                    với tháng trước
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  onClick={() => setIsUpdating(true)}
                >
                  Cập nhật chỉ số
                </button>
              </div>
            </div>
          )}
        </ComponentCard>

        {/* So sánh chỉ số với ban đầu */}
        <ComponentCard
          title="So sánh với chỉ số ban đầu"
          className="lg:col-span-2"
          desc="Tiến độ thay đổi từ khi bắt đầu đến hiện tại"
        >
          <div className="flex flex-col md:flex-row">
            <div className="mb-4 w-full md:mb-0 md:w-1/2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Cân nặng:
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">
                      {initialStats.weight} kg → {currentStats.weight} kg
                    </span>
                    <span
                      className={`ml-2 text-sm ${getChangeColor(currentStats.weight, initialStats.weight, false)}`}
                    >
                      ({currentStats.weight > initialStats.weight ? "+" : ""}
                      {calculateChange(
                        currentStats.weight,
                        initialStats.weight,
                      )}
                      %)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Khối lượng cơ:
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">
                      {initialStats.muscle_mass} kg → {currentStats.muscle_mass}{" "}
                      kg
                    </span>
                    <span
                      className={`ml-2 text-sm ${getChangeColor(currentStats.muscle_mass, initialStats.muscle_mass, true)}`}
                    >
                      (
                      {currentStats.muscle_mass > initialStats.muscle_mass
                        ? "+"
                        : ""}
                      {calculateChange(
                        currentStats.muscle_mass,
                        initialStats.muscle_mass,
                      )}
                      %)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tỷ lệ mỡ:
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">
                      {initialStats.body_fat}% → {currentStats.body_fat}%
                    </span>
                    <span
                      className={`ml-2 text-sm ${getChangeColor(currentStats.body_fat, initialStats.body_fat, false)}`}
                    >
                      (
                      {currentStats.body_fat > initialStats.body_fat ? "+" : ""}
                      {calculateChange(
                        currentStats.body_fat,
                        initialStats.body_fat,
                      )}
                      %)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    BMI:
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">
                      {initialStats.bmi} → {currentStats.bmi}
                    </span>
                    <span
                      className={`ml-2 text-sm ${getChangeColor(currentStats.bmi, initialStats.bmi, false)}`}
                    >
                      ({currentStats.bmi > initialStats.bmi ? "+" : ""}
                      {calculateChange(currentStats.bmi, initialStats.bmi)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 md:pl-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={70} data={fitnessRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar
                      name="Hiện tại"
                      dataKey="current"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Ban đầu"
                      dataKey="initial"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Buổi tập hoàn thành trong tuần */}
        <ComponentCard
          title="Buổi tập trong tuần"
          className="lg:col-span-4"
          desc="Số buổi tập và thời gian tập trung bình trong tuần này"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyWorkoutData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
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

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Tổng số buổi tập
              </p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                9 buổi
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                {monthComparisonData.current.totalSessions >
                monthComparisonData.previous.totalSessions
                  ? "+"
                  : ""}
                {monthComparisonData.current.totalSessions -
                  monthComparisonData.previous.totalSessions}{" "}
                so với tuần trước
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-green-700 dark:text-green-300">
                Thời gian tập trung bình
              </p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {Math.round(
                  weeklyWorkoutData.reduce(
                    (sum, day) => sum + day.duration,
                    0,
                  ) /
                    weeklyWorkoutData.filter((day) => day.sessions > 0).length,
                )}{" "}
                phút
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {monthComparisonData.current.avgSessionLength >
                monthComparisonData.previous.avgSessionLength
                  ? "+"
                  : ""}
                {(
                  monthComparisonData.current.avgSessionLength -
                  monthComparisonData.previous.avgSessionLength
                ).toFixed(1)}{" "}
                phút so với tuần trước
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Tỷ lệ hoàn thành
              </p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {Math.round(
                  (weeklyWorkoutData.reduce(
                    (sum, day) => sum + day.sessions,
                    0,
                  ) /
                    weeklyWorkoutData.reduce(
                      (sum, day) => sum + day.target,
                      0,
                    )) *
                    100,
                )}
                %
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {monthComparisonData.current.completionRate >
                monthComparisonData.previous.completionRate
                  ? "+"
                  : ""}
                {monthComparisonData.current.completionRate -
                  monthComparisonData.previous.completionRate}
                % so với tuần trước
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Tổng thời gian tập
              </p>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {weeklyWorkoutData.reduce((sum, day) => sum + day.duration, 0)}{" "}
                phút
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                {monthComparisonData.current.totalDuration >
                monthComparisonData.previous.totalDuration
                  ? "+"
                  : ""}
                {monthComparisonData.current.totalDuration -
                  monthComparisonData.previous.totalDuration}{" "}
                phút so với tuần trước
              </p>
            </div>
          </div>
        </ComponentCard>

        {/* So sánh hiệu suất tháng này với tháng trước */}
        {/* <ComponentCard
          title="Tiến độ mục tiêu"
          className="lg:col-span-1"
          desc="Tóm tắt tiến độ mục tiêu tháng 5/2025"
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={goalCompletionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {goalCompletionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GOAL_COLORS[index % GOAL_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2">
            <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:border-green-600 dark:bg-green-900/20">
              <h4 className="font-medium text-green-700 dark:text-green-400">
                72% hoàn thành mục tiêu tháng
              </h4>
              <p className="mt-1 text-sm text-green-600 dark:text-green-300">
                Bạn đã hoàn thành 28/39 buổi tập theo kế hoạch.
              </p>
            </div>
          </div>
        </ComponentCard> */}

        {/* Biểu đồ tiến triển chỉ số cơ thể */}
        <ComponentCard
          title="Tiến triển chỉ số cơ thể"
          className="lg:col-span-2"
          desc="Biểu đồ theo dõi sự thay đổi các chỉ số theo thời gian"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={bodyStatsProgressData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#8884d8"
                  name="Cân nặng (kg)"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="body_fat"
                  stroke="#ff8042"
                  name="Tỷ lệ mỡ (%)"
                />
                <Line
                  type="monotone"
                  dataKey="muscle_mass"
                  stroke="#82ca9d"
                  name="Khối lượng cơ (kg)"
                />
                <Line type="monotone" dataKey="bmi" stroke="#000" name="BMI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ComponentCard>

        {/* Gợi ý cải thiện chỉ số cơ thể */}
        {/* <ComponentCard
          title="Gợi ý cải thiện chỉ số"
          className="lg:col-span-2"
          desc="Phân tích và khuyến nghị để cải thiện hiệu quả tập luyện"
        >
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Phân tích hiệu suất
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Dựa trên tiến triển của bạn, khối lượng cơ đã tăng 9.6% và tỷ
                  lệ mỡ giảm 13.3% kể từ khi bắt đầu. Tiến độ này vượt mục tiêu
                  đặt ra 8% cho cả hai chỉ số.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Điểm mạnh
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Bạn đang thực hiện rất tốt trong việc tăng cường sức mạnh và
                  cải thiện sức bền. Việc tập luyện đều đặn vào các ngày T2, T4
                  và T6 đã tạo ra kết quả tích cực.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Cần cải thiện
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Điểm linh hoạt còn thấp (5/10). Việc bổ sung các bài tập yoga
                  hoặc căng cơ 2-3 lần/tuần sẽ giúp cải thiện tính linh hoạt và
                  phòng ngừa chấn thương.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Khuyến nghị
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  1. Tăng cường bài tập tim mạch để cải thiện sức bền tổng thể.
                  <br />
                  2. Bổ sung 1-2 buổi tập linh hoạt mỗi tuần.
                  <br />
                  3. Duy trì chế độ ăn giàu protein để hỗ trợ phát triển cơ bắp.
                  <br />
                  4. Cân nhắc chia nhỏ buổi tập T6 thành 2 buổi để tránh quá
                  tải.
                </p>
              </div>
            </div>
          </div>
        </ComponentCard> */}

        {/* Lịch sử buổi tập gần đây */}
        <ComponentCard
          title="Lịch sử buổi tập gần đây"
          className="lg:col-span-2"
          desc="Chi tiết các buổi tập của bạn trong 7 ngày qua"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Ngày
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Loại tập
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Thời gian
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Cường độ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    05/05/2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Tập lưng & vai
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    45 phút
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{ width: "80%" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Cao (80%)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge type="success" text="Hoàn thành" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    04/05/2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Chạy bộ & tim mạch
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    30 phút
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Trung bình (60%)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge type="success" text="Hoàn thành" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    03/05/2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Tập ngực & tay
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    60 phút
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Rất cao (90%)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge type="success" text="Hoàn thành" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    02/05/2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Yoga
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    45 phút
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{ width: "50%" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Trung bình (50%)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge type="info" text="Đã lên lịch" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    01/05/2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Tập chân
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    50 phút
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Cao (85%)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge type="warning" text="Hoàn thành một phần" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ComponentCard>

        {/* Kết quả so sánh về hiệu suất */}
        <ComponentCard
          title="So sánh hiệu suất tập luyện"
          className="lg:col-span-4"
          desc="So sánh hiệu suất tập luyện giữa tháng này và tháng trước"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Phân tích buổi tập
              </h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tổng số buổi tập
                  </span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {monthComparisonData.previous.totalSessions} →{" "}
                      {monthComparisonData.current.totalSessions}
                    </span>
                    <span className="ml-2 text-sm text-green-600">
                      (+
                      {monthComparisonData.current.totalSessions -
                        monthComparisonData.previous.totalSessions}
                      )
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Tháng trước
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {monthComparisonData.previous.totalSessions} buổi
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-gray-600"
                      style={{
                        width: `${(monthComparisonData.previous.totalSessions / 30) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Tháng này
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {monthComparisonData.current.totalSessions} buổi
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-blue-600"
                      style={{
                        width: `${(monthComparisonData.current.totalSessions / 30) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tổng thời gian tập (phút)
                  </span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {monthComparisonData.previous.totalDuration} →{" "}
                      {monthComparisonData.current.totalDuration}
                    </span>
                    <span className="ml-2 text-sm text-green-600">
                      (+
                      {monthComparisonData.current.totalDuration -
                        monthComparisonData.previous.totalDuration}
                      )
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Tháng trước
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {monthComparisonData.previous.totalDuration} phút
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-gray-600"
                      style={{
                        width: `${(monthComparisonData.previous.totalDuration / 2000) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Tháng này
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {monthComparisonData.current.totalDuration} phút
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-blue-600"
                      style={{
                        width: `${(monthComparisonData.current.totalDuration / 2000) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Tỷ lệ hoàn thành mục tiêu
              </h4>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tỷ lệ hoàn thành
                  </span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {monthComparisonData.previous.completionRate}% →{" "}
                      {monthComparisonData.current.completionRate}%
                    </span>
                    <span className="ml-2 text-sm text-green-600">
                      (+
                      {monthComparisonData.current.completionRate -
                        monthComparisonData.previous.completionRate}
                      %)
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Tháng trước
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {monthComparisonData.previous.completionRate}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-gray-600"
                      style={{
                        width: `${monthComparisonData.previous.completionRate}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Tháng này
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {monthComparisonData.current.completionRate}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-blue-600"
                      style={{
                        width: `${monthComparisonData.current.completionRate}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thời gian trung bình mỗi buổi tập
                  </span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {monthComparisonData.previous.avgSessionLength} →{" "}
                      {monthComparisonData.current.avgSessionLength} phút
                    </span>
                    <span className="ml-2 text-sm text-red-600">
                      (
                      {(
                        monthComparisonData.current.avgSessionLength -
                        monthComparisonData.previous.avgSessionLength
                      ).toFixed(1)}
                      )
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Tháng trước
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {monthComparisonData.previous.avgSessionLength} phút
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-gray-600"
                      style={{
                        width: `${(monthComparisonData.previous.avgSessionLength / 90) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Tháng này
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {monthComparisonData.current.avgSessionLength} phút
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-blue-600"
                      style={{
                        width: `${(monthComparisonData.current.avgSessionLength / 90) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Tóm tắt hiệu suất
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <p>
                    Hiệu suất tập luyện trong tháng này đã cải thiện đáng kể so
                    với tháng trước. Số buổi tập tăng 27%, tổng thời gian tập
                    tăng 23% và tỷ lệ hoàn thành tăng 15%. Bạn đang đi đúng
                    hướng để đạt mục tiêu đã đề ra.{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default ProgressPage1;
