import { useState, useEffect } from "react";
import { Link } from "react-router";
import { usePushNotifications } from "~/hooks/usePushNotifications";
import { Notification } from "~/services/pwa/pushNotificationService";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);


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

  // Load notifications khi component mount
  useEffect(() => {
    if (isSubscribed && isServiceWorkerReady) {
      loadNotifications();
      refreshUnreadCount();
    }
  }, [isSubscribed, isServiceWorkerReady, loadNotifications, refreshUnreadCount]);

  const handleToggleNotifications = async () => {
    if (!isSupported) {
      toast.error("Trình duyệt này không hỗ trợ thông báo đẩy");
      return;
    }

    if (!isServiceWorkerReady) {
      toast.error("Service Worker chưa sẵn sàng. Vui lòng đợi một chút và thử lại.");
      return;
    }

    if (isSubscribed) {
      const success = await unsubscribeFromNotifications();
      if (success) {
        toast.success("Đã tắt thông báo đẩy");
      } else {
        toast.error("Không thể tắt thông báo. Vui lòng thử lại.");
      }
    } else {
      if (!isPermissionGranted) {
        const granted = await requestPermission();
        if (!granted) {
          toast.error("Quyền bị từ chối. Vui lòng bật thông báo trong cài đặt trình duyệt.");
          return;
        }
      }

      const success = await subscribeToNotifications();
      if (success) {
        toast.success("Đã bật thông báo đẩy");
      } else {
        toast.error("Không thể bật thông báo. Vui lòng thử lại.");
      }
    }
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      toast.success("Đã gửi thông báo thử nghiệm!");
    } else {
      toast.error("Không thể gửi thông báo thử nghiệm.");
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await markAsRead(selectedNotifications);
      setSelectedNotifications([]);
      toast.success(`Đã đánh dấu ${selectedNotifications.length} thông báo là đã đọc`);
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "workout": return "🏋️‍♂️";
      case "achievement": return "🏆";
      case "reminder": return "⏰";
      case "promotion": return "🎁";
      case "appointment": return "📅";
      case "membership": return "🎫";
      case "payment": return "💳";
      case "system": return "⚙️";
      default: return "📢";
    }
  };

  const getNotificationTypeText = (type?: string) => {
    switch (type) {
      case "workout": return "Lịch tập";
      case "achievement": return "Thành tích";
      case "reminder": return "Nhắc nhở";
      case "promotion": return "Khuyến mãi";
      case "appointment": return "Cuộc hẹn";
      case "membership": return "Hội viên";
      case "payment": return "Thanh toán";
      case "system": return "Hệ thống";
      default: return "Tổng quát";
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = selectedFilter === "all" || 
      (selectedFilter === "unread" && notification.status === "sent") ||
      (selectedFilter === "read" && notification.status === "read") ||
      notification.type === selectedFilter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: "all", label: "Tất cả", count: notifications.length },
    { value: "unread", label: "Chưa đọc", count: notifications.filter(n => n.status === "sent").length },
    { value: "read", label: "Đã đọc", count: notifications.filter(n => n.status === "read").length },
    { value: "workout", label: "Lịch tập", count: notifications.filter(n => n.type === "workout").length },
    { value: "achievement", label: "Thành tích", count: notifications.filter(n => n.type === "achievement").length },
    { value: "reminder", label: "Nhắc nhở", count: notifications.filter(n => n.type === "reminder").length },
    { value: "promotion", label: "Khuyến mãi", count: notifications.filter(n => n.type === "promotion").length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center justify-center h-10 w-10 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Thông báo
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quản lý thông báo của bạn
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đánh dấu tất cả
                </button>
              )}
              
              {isSupported && (
                <button
                  onClick={handleToggleNotifications}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isSubscribed 
                      ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  disabled={isLoading}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  </svg>
                  <span className="hidden sm:inline">
                    {isSubscribed ? "Đang bật" : "Đã tắt"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Bộ lọc
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm kiếm thông báo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Filter options */}
              <div className="space-y-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFilter === option.value
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>{option.label}</span>
                    {option.count > 0 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedFilter === option.value
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                        {option.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Notification Settings */}
              {isSupported && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Cài đặt thông báo
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Thông báo đẩy
                      </span>
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
                    </div>
                    
                    {isSubscribed && (
                      <button
                        onClick={handleTestNotification}
                        className="w-full px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        disabled={isLoading}
                      >
                        Gửi thông báo thử nghiệm
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Bulk actions */}
            {selectedNotifications.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Đã chọn {selectedNotifications.length} thông báo
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkSelectedAsRead}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-800 rounded-lg transition-colors"
                    >
                      Đánh dấu đã đọc
                    </button>
                    <button
                      onClick={() => setSelectedNotifications([])}
                      className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications list */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {/* List header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {filteredNotifications.length} thông báo
                  </span>
                </div>
                
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="sm:hidden text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Đánh dấu tất cả
                  </button>
                )}
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Đang tải...</span>
                    </div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-700">
                      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5-5-5h5v-4a7 7 0 10-14 0v4h5l-5 5-5-5h5V9a9 9 0 1118 0v8z" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                      Không có thông báo
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm 
                        ? "Không tìm thấy thông báo nào phù hợp" 
                        : "Thông báo của bạn sẽ xuất hiện ở đây"
                      }
                    </p>
                    {!isSubscribed && isSupported && (
                      <button
                        onClick={handleToggleNotifications}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                      >
                        Bật thông báo
                      </button>
                    )}
                  </div>
                ) : (
                  filteredNotifications.map((notification: Notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        notification.status === "sent"
                          ? "bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification._id)}
                          onChange={() => handleSelectNotification(notification._id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-xl dark:from-gray-700 dark:to-gray-600">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {notification.status === "sent" && (
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                              {getNotificationTypeText(notification.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-xl p-4 shadow-lg">
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
    </div>
  );
}