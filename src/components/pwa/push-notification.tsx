// src/components/pwa/push-notification.tsx
import React, { useEffect, useState } from "react";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { usePWA } from "~/hooks/usePWA";
import { usePushNotifications } from "~/hooks/usePushNotifications";

// import { NotificationList } from "./test/NotificationList";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { PWAUpdatePrompt } from "./PWAUpdatePrompt";

interface PWAPushNotificationProps {
  children: React.ReactNode;
}

export const PWAPushNotification: React.FC<PWAPushNotificationProps> = ({
  children,
}) => {
  const [isNotificationListOpen, setIsNotificationListOpen] = useState(false);
  const { isOnline } = usePWA();
  const {
    isSupported: isNotificationSupported,
    isSubscribed,
    unreadCount,
    isServiceWorkerReady, // ✅ Sử dụng trạng thái này
    error: notificationError,
  } = usePushNotifications();

  useEffect(() => {
    // Listen for messages from service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "NAVIGATE") {
          // Handle navigation from notification click
          window.history.pushState(null, "", event.data.url);
        }
      });
    }
  }, []);

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-red-500 py-2 text-center text-sm text-white">
          <WifiOff className="h-4 w-4" />
          Bạn đang offline. Một số tính năng có thể bị hạn chế.
        </div>
      )}

      {/* Service Worker not ready indicator - ✅ Thêm thông báo này */}
      {isNotificationSupported && !isServiceWorkerReady && (
        <div
          className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-yellow-500 py-2 text-center text-sm text-white"
          style={{ top: isOnline ? "0" : "40px" }}
        >
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Service Worker đang khởi tạo...
        </div>
      )}

      {/* Notification error indicator */}
      {notificationError && (
        <div
          className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-red-600 py-2 text-center text-sm text-white"
          style={{
            top: !isOnline
              ? "40px"
              : !isServiceWorkerReady && isNotificationSupported
                ? "40px"
                : "0",
          }}
        >
          <Bell className="h-4 w-4" />
          Lỗi thông báo: {notificationError}
        </div>
      )}

      {/* Main content with dynamic padding */}
      <div
        className={` ${!isOnline ? "pt-10" : ""} ${!isServiceWorkerReady && isNotificationSupported ? "pt-10" : ""} ${notificationError ? "pt-10" : ""} `}
      >
        {children}
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* PWA Update Prompt */}
      <PWAUpdatePrompt />

      {/* Notification List */}
      {/* <NotificationList
        isOpen={isNotificationListOpen}
        onClose={() => setIsNotificationListOpen(false)}
      /> */}

      {/* Floating Notification Button - ✅ Kiểm tra Service Worker ready */}
      {isNotificationSupported &&
        isServiceWorkerReady &&
        isSubscribed &&
        unreadCount > 0 && (
          <button
            onClick={() => setIsNotificationListOpen(true)}
            className="fixed relative bottom-24 right-4 z-40 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700 md:bottom-6"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute -right-2 -top-2 flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </button>
        )}

      {/* Debug info (chỉ hiện trong development) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div>Online: {isOnline ? '✅' : '❌'}</div>
          <div>SW Ready: {isServiceWorkerReady ? '✅' : '❌'}</div>
          <div>Push Supported: {isNotificationSupported ? '✅' : '❌'}</div>
          <div>Subscribed: {isSubscribed ? '✅' : '❌'}</div>
          <div>Unread: {unreadCount}</div>
          {notificationError && <div className="text-red-400">Error: {notificationError}</div>}
        </div>
      )} */}
    </>
  );
};
