interface FilterButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  children,
  isActive,
  onClick,
}) => (
  <button
    className={`rounded-full px-4 py-2 text-sm ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

// src/components/appointments/CalendarNavigation.tsx
import React from "react";
import { format, addDays, addMonths } from "date-fns";
import { vi } from "date-fns/locale";

interface CalendarNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  type: "week" | "month";
  startDay?: Date;
  endDay?: Date;
}

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentDate,
  onDateChange,
  type,
  startDay,
  endDay,
}) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100"
        onClick={() =>
          onDateChange(
            type === "week"
              ? addDays(currentDate, -7)
              : addMonths(currentDate, -1),
          )
        }
      >
        {type === "week" ? "Tuần trước" : "Tháng trước"}
      </button>
      <h2 className="text-xl font-semibold">
        {type === "week" && startDay && endDay
          ? `${format(startDay, "dd/MM/yyyy", { locale: vi })} - ${format(endDay, "dd/MM/yyyy", { locale: vi })}`
          : format(currentDate, "MMMM yyyy", { locale: vi })}
      </h2>
      <button
        className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100"
        onClick={() =>
          onDateChange(
            type === "week"
              ? addDays(currentDate, 7)
              : addMonths(currentDate, 1),
          )
        }
      >
        {type === "week" ? "Tuần sau" : "Tháng sau"}
      </button>
    </div>
  );
};
