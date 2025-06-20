import { useState, useEffect, useRef } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import { usePushNotifications } from "~/hooks/usePushNotifications";
import { Notification } from "~/services/pwa/pushNotificationService";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const scrollThreshold = 30; // Ngưỡng scroll để ẩn dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    isSupported,
    isSubscribed,
    isPermissionGranted,
    isLoading,
    error,
    notifications,
    unreadCount,
    isServiceWorkerReady,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  } = usePushNotifications();

  // Load notifications khi component mount và khi dropdown mở
  useEffect(() => {
    if (isSubscribed && isServiceWorkerReady) {
      loadNotifications();
      refreshUnreadCount();
    }
  }, [
    isSubscribed,
    isServiceWorkerReady,
    loadNotifications,
    refreshUnreadCount,
  ]);

  // Load notifications khi dropdown mở
  useEffect(() => {
    if (isOpen && isSubscribed && isServiceWorkerReady) {
      loadNotifications();
    }
  }, [isOpen, isSubscribed, isServiceWorkerReady, loadNotifications]);

  // Xử lý scroll để ẩn dropdown
  useEffect(() => {
    const handleScroll = () => {
      if (!isOpen) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Nếu scroll xuống quá ngưỡng so với vị trí trước đó
      if (scrollTop > lastScrollTop + scrollThreshold) {
        setIsOpen(false);
      }
      
      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
    };

    // Chỉ thêm event listener khi dropdown đang mở
    if (isOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      setLastScrollTop(window.pageYOffset || document.documentElement.scrollTop);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, lastScrollTop, scrollThreshold]);

  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleNotificationClick = async () => {
    toggleDropdown();

    // Mark notifications as read when opening
    if (unreadCount > 0 && isSubscribed) {
      const unreadNotifications = notifications
        .filter((n) => n.status === "sent")
        .map((n) => n._id);

      if (unreadNotifications.length > 0) {
        await markAsRead(unreadNotifications);
      }
    }
  };

  const handleToggleNotifications = async () => {
    if (!isSupported) {
      alert("Trình duyệt này không hỗ trợ thông báo đẩy");
      return;
    }

    if (!isServiceWorkerReady) {
      alert("Service Worker chưa sẵn sàng. Vui lòng đợi một chút và thử lại.");
      return;
    }

    if (isSubscribed) {
      // Tắt thông báo
      const success = await unsubscribeFromNotifications();
      if (success) {
        // Không cần alert, UI sẽ tự cập nhật
      } else {
        alert("Không thể tắt thông báo. Vui lòng thử lại.");
      }
    } else {
      // Bật thông báo  
      if (!isPermissionGranted) {
        const granted = await requestPermission();
        if (!granted) {
          alert("Quyền bị từ chối. Vui lòng bật thông báo trong cài đặt trình duyệt.");
          return;
        }
      }

      const success = await subscribeToNotifications();
      if (!success) {
        alert("Không thể bật thông báo. Vui lòng thử lại.");
      }
    }
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      alert("Đã gửi thông báo thử nghiệm!");
    } else {
      alert("Không thể gửi thông báo thử nghiệm.");
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - new Date(date).getTime()) / 1000,
    );

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "workout":
        return "🏋️‍♂️"; // Lịch tập
      case "achievement":
        return "🏆"; // Thành tích
      case "reminder":
        return "⏰"; // Nhắc nhở chung
      case "promotion":
        return "🎁"; // Khuyến mãi
      case "appointment":
        return "📅"; // Cuộc hẹn với HLV
      case "membership":
        return "🎫"; // Gói hội viên
      case "payment":
        return "💳"; // Thanh toán
      case "system":
        return "⚙️"; // Thông báo hệ thống
      default:
        return "📢"; // Chung
    }
  };

  const getNotificationTypeText = (type?: string) => {
    switch (type) {
      case "workout":
        return "Lịch tập";
      case "achievement":
        return "Thành tích";
      case "reminder":
        return "Nhắc nhở";
      case "promotion":
        return "Khuyến mãi";
      case "appointment":
        return "Cuộc hẹn";
      case "membership":
        return "Hội viên";
      case "payment":
        return "Thanh toán";
      case "system":
        return "Hệ thống";
      default:
        return "Tổng quát";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-gray-700 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        onClick={handleNotificationClick}
        disabled={isLoading}
      >
        {unreadCount > 0 && (
          <>
            <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-medium text-white shadow-lg">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
            <span className="absolute -right-1 -top-1 h-5 w-5 animate-ping rounded-full bg-red-400 opacity-75"></span>
          </>
        )}

        <svg
          className="fill-current transition-transform duration-200 hover:scale-110"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="shadow-2xl absolute -right-[240px] mt-[17px] flex h-[520px] w-[380px] flex-col rounded-2xl border border-gray-200 bg-white backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800 sm:w-[390px] lg:right-0"
       
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                <path d="M10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                Thông báo
              </h5>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount} tin mới
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                disabled={isLoading}
              >
                Đánh dấu đã đọc
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notification Controls */}
        {isSupported && (
          <div className="border-b border-gray-100 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Thông báo đẩy
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isSubscribed ? "Đang bật" : "Đang tắt"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Toggle Switch */}
                <button
                  onClick={handleToggleNotifications}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSubscribed 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                      isSubscribed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>

                {/* Test Button */}
                {isSubscribed && (
                  <button
                    onClick={handleTestNotification}
                    className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-105"
                    disabled={isLoading}
                  >
                    Thử nghiệm
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 rounded-xl bg-red-50 border border-red-200 p-3 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Đang tải...</span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-hidden">
          <ul className="custom-scrollbar h-full overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-700">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5-5-5h5v-4a7 7 0 10-14 0v4h5l-5 5-5-5h5V9a9 9 0 1118 0v8z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Chưa có thông báo
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Thông báo của bạn sẽ xuất hiện ở đây
                </p>
                {!isSubscribed && isSupported && (
                  <button
                    onClick={handleToggleNotifications}
                    className="mt-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-105"
                  >
                    Bật thông báo
                  </button>
                )}
              </li>
            ) : (
              notifications.map((notification: Notification) => (
                <li key={notification._id}>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className={`mx-2 mb-2 flex gap-3 rounded-xl p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      notification.status === "sent"
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800/30"
                        : "bg-white dark:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-xl dark:from-gray-700 dark:to-gray-600">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {notification.title}
                        </h4>
                        {notification.status === "sent" && (
                          <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 mt-2"></span>
                        )}
                      </div>

                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="rounded-full bg-gray-100 px-2 py-1 font-medium dark:bg-gray-700">
                          {getNotificationTypeText(notification.type)}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                        <span>{formatTimeAgo(notification.created_at)}</span>
                      </div>
                    </div>
                  </DropdownItem>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 dark:border-gray-700">
          <Link
            to="/notifications"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Xem tất cả thông báo
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}