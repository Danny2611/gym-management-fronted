// src/components/notifications/NotificationButton.tsx
import React from "react";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "../../hooks/usePushNotifications";

interface NotificationButtonProps {
  className?: string;
  showLabel?: boolean;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  className = "",
  showLabel = false,
}) => {
  const {
    isSupported,
    isSubscribed,
    isPermissionGranted,
    isLoading,
    unreadCount,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } = usePushNotifications();

  const handleToggleNotifications = async () => {
    if (!isSupported) {
      alert("Trình duyệt của bạn không hỗ trợ push notifications");
      return;
    }

    if (!isPermissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        alert("Cần cấp quyền để nhận thông báo");
        return;
      }
    }

    if (isSubscribed) {
      await unsubscribeFromNotifications();
    } else {
      await subscribeToNotifications();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleToggleNotifications}
      disabled={isLoading}
      className={`relative inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
        isSubscribed
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isSubscribed ? (
        <Bell className="h-5 w-5" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}

      {showLabel && (
        <span className="text-sm font-medium">
          {isSubscribed ? "Notifications On" : "Enable Notifications"}
        </span>
      )}

      {isSubscribed && unreadCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};
