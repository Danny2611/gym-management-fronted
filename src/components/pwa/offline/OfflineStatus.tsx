// # Hiển thị trạng thái offline/online
// src/components/pwa/OfflineStatus.tsx
import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../ui/alert";
import { Button } from "../../ui/button";

interface OfflineStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  className = "",
  showDetails = true,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 5000);
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Hiển thị thông báo kết nối lại
  if (showReconnected) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>Đã kết nối lại internet!</span>
            <Button
              onClick={() => setShowReconnected(false)}
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700"
            >
              Đóng
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Không hiển thị gì khi online
  if (isOnline) {
    return null;
  }

  // Hiển thị thông báo offline
  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Không có kết nối internet</div>
            {showDetails && (
              <div className="mt-1 text-sm">
                Bạn đang ở chế độ offline. Một số tính năng có thể bị hạn chế.
              </div>
            )}
          </div>
          <div className="ml-4 flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
              <span>Offline</span>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Component đơn giản chỉ hiển thị trạng thái
export const OfflineIndicator: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      )}
      <span
        className={`text-sm ${isOnline ? "text-green-600" : "text-red-600"}`}
      >
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
};
