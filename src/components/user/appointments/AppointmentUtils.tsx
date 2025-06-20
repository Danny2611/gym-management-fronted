import { format } from "date-fns";

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const canBeCancelled = (appointment: any) => {
  // Pending appointments can always be cancelled
  if (appointment.status === "pending") return true;

  // Check time buffer for confirmed appointments
  const now = new Date();
  const appointmentDate = new Date(appointment.date);
  const oneDayInMs = 24 * 60 * 60 * 1000;
  return (
    appointment.status === "confirmed" &&
    appointmentDate.getTime() - now.getTime() >= oneDayInMs
  );
};

// Get time slot label for a given time
export const getTimeSlot = (time: string): string => {
  const hour = parseInt(time.split(":")[0]);

  if (hour >= 6 && hour < 12) return "Sáng (6:00-12:00)";
  if (hour >= 12 && hour < 15) return "Trưa (12:00-15:00)";
  if (hour >= 15 && hour < 18) return "Chiều (15:00-18:00)";
  if (hour >= 18 && hour < 22) return "Tối (18:00-22:00)";
  return "Khác";
};

// src/components/appointments/EmptyStateCard.tsx
import React from "react";
import { Calendar } from "lucide-react";

interface EmptyStateCardProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  message,
  actionLabel,
  actionLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
      <Calendar className="mb-3 h-12 w-12 text-gray-400" />
      <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-4 text-gray-500 dark:text-gray-400">{message}</p>
      {actionLabel && actionLink && (
        <a
          href={actionLink}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
};
