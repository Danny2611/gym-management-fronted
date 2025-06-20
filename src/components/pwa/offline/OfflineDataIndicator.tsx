// src/components/pwa/OfflineDataIndicator.tsx
import React from "react";
import { useOffline } from "~/contexts/OfflineContext";

interface OfflineDataIndicatorProps {
  showWhenOnline?: boolean;
  className?: string;
}

export const OfflineDataIndicator: React.FC<OfflineDataIndicatorProps> = ({
  showWhenOnline = false,
  className = "",
}) => {
  const { isOnline, hasOfflineData } = useOffline();

  if (!hasOfflineData || (isOnline && !showWhenOnline)) return null;

  return (
    <div className={`inline-flex items-center gap-1 text-xs ${className}`}>
      <div className="h-2 w-2 rounded-full bg-orange-400"></div>
      <span className="text-orange-600">
        {isOnline ? "Có dữ liệu offline" : "Dữ liệu offline"}
      </span>
    </div>
  );
};
