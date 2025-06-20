import React, { useState, useEffect, ChangeEvent } from "react";
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
import { progressService } from "~/services/progressService";
import { workoutService } from "~/services/workoutService";
import {
  Progress,
  BodyStats,
  FitnessRadarData,
  BodyMetricsComparison,
  UpdateBodyMetricsParams,
  GoalCompletionData,
  BodyStatsProgress,
} from "~/types/progress";
import {
  MonthComparison,
  RecentWorkoutLog,
  WeeklyWorkout,
} from "~/types/workout";
import { formatDate, formatDate2, formatFullDate } from "~/utils/formatters";

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
const ProgressPage: React.FC = () => {
  // States
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [currentStats, setCurrentStats] = useState<Progress | null>(null);
  const [previousStats, setPreviousStats] = useState<Progress | null>(null);
  const [initialStats, setInitialStats] = useState<Progress | null>(null);
  const [fitnessRadarData, setFitnessRadarData] = useState<FitnessRadarData[]>(
    [],
  );
  const [bodyStatsProgressData, setBodyStatsProgressData] = useState<
    BodyStatsProgress[]
  >([]);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkoutLog[]>([]);

  // Form state
  const [formData, setFormData] = useState<UpdateBodyMetricsParams>({
    weight: 0,
    height: 0,
    muscle_mass: 0,
    body_fat: 0,
  });

  // Hàm lấy thông tin về trạng thái buổi tập
  const getStatusBadge = (status: "upcoming" | "completed" | "missed") => {
    switch (status) {
      case "completed":
        return <Badge type="success" text="Hoàn thành" />;
      case "upcoming":
        return <Badge type="info" text="Đã lên lịch" />;
      case "missed":
        return <Badge type="error" text="Bỏ lỡ" />;
      default:
        return <Badge type="warning" text="Không xác định" />;
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Load all necessary data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch current stats
      const latestResponse = await progressService.getLatestBodyMetrics();
      // console.log("current:", latestResponse);
      if (latestResponse.success && latestResponse.data) {
        setCurrentStats(latestResponse.data);
        // Initialize form data with current stats
        setFormData({
          weight: latestResponse.data.weight,
          height: latestResponse.data.height,
          muscle_mass: latestResponse.data.muscle_mass,
          body_fat: latestResponse.data.body_fat,
        });
      }

      const bodyMetricsComparison =
        await progressService.getBodyMetricsComparison();
      if (bodyMetricsComparison.success && bodyMetricsComparison.data) {
        const pre = bodyMetricsComparison.data.previous || null;
        const init = bodyMetricsComparison.data.initial || null;
        // console.log("pre: ", pre);
        // console.log("init: ", init);
        setPreviousStats(pre);
        setInitialStats(init);
      }

      const weeklyStatsResponse = await workoutService.getWeeklyWorkoutStats();
      //  console.log('weekly: ',weeklyStatsResponse)
      if (weeklyStatsResponse.success && weeklyStatsResponse.data) {
        setWeeklyWorkoutData(weeklyStatsResponse.data);
      }
      const monthComparisonResponse =
        await workoutService.getMonthComparisonStats();
      // console.log("month: ", monthComparisonResponse);

      if (monthComparisonResponse.success && monthComparisonResponse.data) {
        setMonthComparisonData(monthComparisonResponse.data);
      }

      // Fetch fitness radar data
      const radarResponse = await progressService.getFitnessRadarData();
      if (radarResponse.success && radarResponse.data) {
        setFitnessRadarData(radarResponse.data);
      }

      // Fetch monthly body metrics data
      const monthlyBodyMetricsResponse =
        await progressService.getMonthlyBodyMetrics();

      if (
        monthlyBodyMetricsResponse.success &&
        monthlyBodyMetricsResponse.data
      ) {
        setBodyStatsProgressData(monthlyBodyMetricsResponse.data);
      }

      const getLast7DaysWorkoutsResponse =
        await workoutService.getLast7DaysWorkouts();

      if (
        getLast7DaysWorkoutsResponse.success &&
        getLast7DaysWorkoutsResponse.data
      ) {
        setRecentWorkouts(getLast7DaysWorkoutsResponse.data);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [weeklyWorkoutData, setWeeklyWorkoutData] = useState<WeeklyWorkout[]>([
    { name: "T2", sessions: 0, duration: 0, target: 0 },
    { name: "T3", sessions: 0, duration: 0, target: 0 },
    { name: "T4", sessions: 0, duration: 0, target: 0 },
    { name: "T5", sessions: 0, duration: 0, target: 0 },
    { name: "T6", sessions: 0, duration: 0, target: 0 },
    { name: "T7", sessions: 0, duration: 0, target: 0 },
    { name: "CN", sessions: 0, duration: 0, target: 0 },
  ]);
  const [monthComparisonData, setMonthComparisonData] =
    useState<MonthComparison>({
      current: {
        totalSessions: 0,
        totalDuration: 0,
        completionRate: 0,
        avgSessionLength: 0,
      },
      previous: {
        totalSessions: 0,
        totalDuration: 0,
        completionRate: 0,
        avgSessionLength: 0,
      },
    });
  // Handle updating body metrics
  const handleUpdateMetrics = async () => {
    try {
      const response = await progressService.updateBodyMetrics(formData);
      if (response.success && response.data) {
        // Update the currentStats with new data
        const updated = response.data;
        setCurrentStats({
          ...(currentStats as Progress),
          weight: updated.weight,
          height: updated.height,
          muscle_mass: updated.muscle_mass,
          body_fat: updated.body_fat,
          bmi: updated.bmi,
          updated_at: updated.updated_at,
        });
        setIsUpdating(false);
        // Refresh data to ensure everything is up to date
        fetchData();
      } else {
        setError("Không thể cập nhật chỉ số cơ thể");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật chỉ số");
      console.error("Error updating metrics:", err);
    }
  };

  // Handle input change in form
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value),
    });
  };

  // Calculate % change between two values
  const calculateChange = (
    current: number = 0,
    previous: number = 0,
  ): string => {
    if (previous === 0) return "0.0";
    return progressService.calculatePercentChange(current, previous);
  };

  // Get color based on change value
  const getChangeColor = (
    current: number = 0,
    previous: number = 0,
    isPositiveBetter: boolean = true,
  ): string => {
    if (!current || !previous) return "text-gray-500";

    const change = current - previous;
    if (change === 0) return "text-gray-500";

    if (isPositiveBetter) {
      return change > 0 ? "text-green-500" : "text-red-500";
    } else {
      return change < 0 ? "text-green-500" : "text-red-500";
    }
  };

  // Custom tooltip for charts
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
          Tiến Độ Tập Luyện
        </h1>
        <div className="flex h-48 items-center justify-center">
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
          Tiến Độ Tập Luyện
        </h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          <p>{error}</p>
          <button
            className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
            onClick={fetchData}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

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
                  onClick={handleUpdateMetrics}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          ) : (
            <div>
              {currentStats ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="text-sm text-blue-600 dark:text-blue-300">
                      Cân nặng
                    </div>
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {currentStats.weight} kg
                    </div>
                    <div
                      className={`text-xs ${previousStats ? getChangeColor(currentStats.weight, previousStats.weight, false) : "text-gray-500"}`}
                    >
                      {previousStats ? (
                        <>
                          {currentStats.weight > previousStats.weight
                            ? "+"
                            : ""}
                          {calculateChange(
                            currentStats.weight,
                            previousStats.weight,
                          )}
                          % so với tháng trước
                        </>
                      ) : (
                        "Không có dữ liệu so sánh"
                      )}
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
                      className={`text-xs ${previousStats ? getChangeColor(currentStats.muscle_mass, previousStats.muscle_mass, true) : "text-gray-500"}`}
                    >
                      {previousStats ? (
                        <>
                          {currentStats.muscle_mass > previousStats.muscle_mass
                            ? "+"
                            : ""}
                          {calculateChange(
                            currentStats.muscle_mass,
                            previousStats.muscle_mass,
                          )}
                          % so với tháng trước
                        </>
                      ) : (
                        "Không có dữ liệu so sánh"
                      )}
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
                      className={`text-xs ${previousStats ? getChangeColor(currentStats.body_fat, previousStats.body_fat, false) : "text-gray-500"}`}
                    >
                      {previousStats ? (
                        <>
                          {currentStats.body_fat > previousStats.body_fat
                            ? "+"
                            : ""}
                          {calculateChange(
                            currentStats.body_fat,
                            previousStats.body_fat,
                          )}
                          % so với tháng trước
                        </>
                      ) : (
                        "Không có dữ liệu so sánh"
                      )}
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
                      className={`text-xs ${previousStats ? getChangeColor(currentStats.bmi, previousStats.bmi, false) : "text-gray-500"}`}
                    >
                      {previousStats ? (
                        <>
                          {currentStats.bmi > previousStats.bmi ? "+" : ""}
                          {calculateChange(currentStats.bmi, previousStats.bmi)}
                          % so với tháng trước
                        </>
                      ) : (
                        "Không có dữ liệu so sánh"
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Không có dữ liệu hiện tại</div>
              )}

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
              {currentStats && initialStats ? (
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
                        {initialStats.muscle_mass} kg →{" "}
                        {currentStats.muscle_mass} kg
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
                        {currentStats.body_fat > initialStats.body_fat
                          ? "+"
                          : ""}
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
              ) : (
                <div className="text-gray-500">Không có dữ liệu so sánh</div>
              )}
            </div>

            <div className="w-full md:w-1/2 md:pl-4">
              <div className="h-48">
                {fitnessRadarData && fitnessRadarData.length > 0 ? (
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
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-gray-500">Không có dữ liệu radar</div>
                  </div>
                )}
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
        </ComponentCard>

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
                <Tooltip content={<CustomTooltip />} />
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
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {recentWorkouts.length > 0 ? (
                  recentWorkouts.map((workout, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {formatDate2(workout.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {workout.muscle_groups}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {workout.duration} phút
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {getStatusBadge(workout.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Không có dữ liệu buổi tập nào trong 7 ngày qua
                    </td>
                  </tr>
                )}
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
                Tỷ lệ hoàn thành buổi tập
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
                      (
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

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Tổng số buổi tập
              </p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {weeklyWorkoutData.reduce((sum, day) => sum + day.sessions, 0)}{" "}
                buổi
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                {monthComparisonData.current.totalSessions >
                monthComparisonData.previous.totalSessions
                  ? "+"
                  : ""}
                {monthComparisonData.current.totalSessions -
                  monthComparisonData.previous.totalSessions}{" "}
                so với tháng trước
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
                phút so với tháng trước
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
                % so với tháng trước
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
                phút so với tháng trước
              </p>
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
                    với tháng trước. Số buổi tập đã{" "}
                    {monthComparisonData.current.totalSessions >
                    monthComparisonData.previous.totalSessions
                      ? " tăng "
                      : " giảm "}
                    {calculateChange(
                      monthComparisonData.current.totalDuration,
                      monthComparisonData.previous.totalDuration,
                    )}
                    % so với tháng trước, tổng thời gian tập{" "}
                    {monthComparisonData.current.totalDuration >
                    monthComparisonData.previous.totalDuration
                      ? " tăng "
                      : " giảm "}
                    {calculateChange(
                      monthComparisonData.current.totalDuration,
                      monthComparisonData.previous.totalDuration,
                    )}
                    % và tỷ lệ hoàn thành{" "}
                    {monthComparisonData.current.completionRate >
                    monthComparisonData.previous.completionRate
                      ? " tăng "
                      : " giảm "}
                    {calculateChange(
                      monthComparisonData.current.completionRate,
                      monthComparisonData.previous.completionRate,
                    )}
                    %.
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

export default ProgressPage;
