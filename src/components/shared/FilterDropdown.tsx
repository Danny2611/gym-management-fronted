// Thư mục: components/shared
// FilterDropdown.tsx

import React from "react";
import { FiChevronDown } from "react-icons/fi";

interface FilterDropdownProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onChange,
}) => {
  // Ngăn sự kiện click lan tỏa đến document
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative">
      <button
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <span>
          {label}:{" "}
          {options.find((option) => option.value === value)?.label || value}
        </span>
        <FiChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          onClick={handleDropdownClick}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                onChange(option.value);
                onToggle();
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
