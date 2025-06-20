// Thư mục: components/shared
// FilterButton.tsx
import React from "react";

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
