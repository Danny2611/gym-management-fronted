import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from "recharts";
import ComponentCard from "~/components/dashboard/common/ComponentCard";

// Interface for Weekly Workout data
interface WeeklyWorkout {
  name: string;
  sessions: number;
  duration: number;
  target?: number;
}

// Props for Weekly Workout Chart component
interface WeeklyWorkoutChartProps {
  weeklyWorkoutData: WeeklyWorkout[];
  className?: string;
}

// Props for Custom Tooltip
interface CustomTooltipProps extends TooltipProps<number, string> {
  // Extended from TooltipProps of recharts
}

const WeeklyWorkoutChart: React.FC<WeeklyWorkoutChartProps> = ({
  weeklyWorkoutData,
  className = "",
}) => {
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

  return (
    <ComponentCard
      title="Buổi tập trong tuần"
      className={className}
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
  );
};

export default WeeklyWorkoutChart;
