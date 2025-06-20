import { format, addWeeks, subWeeks } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Định nghĩa interface cho props của component
interface CalendarNavigationProps {
  /** Ngày hiện tại đang được chọn */
  currentDate: Date;

  /** Function callback khi thay đổi ngày */
  onDateChange: (date: Date) => void;

  /** Loại hiển thị lịch (mặc định là 'week') */
  type?: "day" | "week" | "month" | "year";

  /** Ngày bắt đầu của tuần hiện tại */
  startDay?: Date;

  /** Ngày kết thúc của tuần hiện tại */
  endDay?: Date;
}

// Component CalendarNavigation với TypeScript
export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentDate,
  onDateChange,
  type = "week",
  startDay,
  endDay,
}) => {
  // Xử lý di chuyển đến tuần trước
  const handlePreviousWeek = () => {
    onDateChange(subWeeks(currentDate, 1));
  };

  // Xử lý di chuyển đến tuần sau
  const handleNextWeek = () => {
    onDateChange(addWeeks(currentDate, 1));
  };

  // Xử lý di chuyển đến ngày hôm nay
  const handleToday = () => {
    onDateChange(new Date());
  };

  // Format hiển thị khoảng thời gian (VD: 15 - 21 tháng 4, 2025)
  const dateRangeDisplay = (): string => {
    if (type === "week" && startDay && endDay) {
      const startFormat = format(startDay, "dd", { locale: vi });
      const endFormat = format(endDay, "dd", { locale: vi });
      const monthFormat = format(endDay, "MMMM, yyyy", { locale: vi });
      return `${startFormat} - ${endFormat} ${monthFormat}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: vi });
  };

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePreviousWeek}
          className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Tuần trước"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleToday}
          className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
        >
          Hôm nay
        </button>

        <button
          onClick={handleNextWeek}
          className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Tuần sau"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="text-lg font-semibold">{dateRangeDisplay()}</div>
    </div>
  );
};
