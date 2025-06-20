//~/components/appointments/EmptyStateCard
import React from "react";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

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
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
        <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="mb-6 text-gray-500 dark:text-gray-400">{message}</p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};
