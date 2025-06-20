// src/components/pwa/OfflineWarning.tsx
import React from "react";
import { useOffline } from "~/contexts/OfflineContext";

interface OfflineWarningProps {
  feature: string;
  className?: string;
}

export const OfflineWarning: React.FC<OfflineWarningProps> = ({
  feature,
  className = "",
}) => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div
      className={`rounded-md border border-yellow-200 bg-yellow-50 p-3 ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Chế độ offline
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Tính năng "{feature}" không khả dụng khi offline. Vui lòng kết nối
              internet để sử dụng đầy đủ chức năng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
