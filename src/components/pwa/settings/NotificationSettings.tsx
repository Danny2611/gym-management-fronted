// src/components/settings/NotificationSettings.tsx
import React, { useState } from "react";
import {
  Bell,
  BellOff,
  TestTube,
  Loader2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { usePushNotifications } from "~/hooks/usePushNotifications";

export const NotificationSettings: React.FC = () => {
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isSupported,
    isSubscribed,
    isPermissionGranted,
    isLoading,
    unreadCount,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
  } = usePushNotifications();

  const handleToggleNotifications = async () => {
    setError(null);

    try {
      if (!isPermissionGranted) {
        const granted = await requestPermission();
        if (!granted) {
          setError("Cần cấp quyền để nhận thông báo");
          return;
        }
      }

      if (isSubscribed) {
        const success = await unsubscribeFromNotifications();
        if (!success) {
          setError("Không thể hủy đăng ký thông báo");
        }
      } else {
        const success = await subscribeToNotifications();
        if (!success) {
          setError("Không thể đăng ký thông báo");
        }
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi thay đổi cài đặt thông báo");
    }
  };

  const handleSendTestNotification = async () => {
    setError(null);
    setTestNotificationSent(false);

    try {
      const success = await sendTestNotification();
      if (success) {
        setTestNotificationSent(true);
        setTimeout(() => setTestNotificationSent(false), 3000);
      } else {
        setError("Không thể gửi thông báo thử");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi gửi thông báo thử");
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) return "Không hỗ trợ";
    if (!isPermissionGranted) return "Chưa cấp quyền";
    if (isSubscribed) return "Đã bật";
    return "Đã tắt";
  };

  const getPermissionStatusColor = () => {
    if (!isSupported || !isPermissionGranted) return "text-red-600";
    if (isSubscribed) return "text-green-600";
    return "text-yellow-600";
  };

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-500" />
          <div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Thông báo không được hỗ trợ
            </h3>
            <p className="text-gray-600">
              Trình duyệt của bạn không hỗ trợ push notifications. Vui lòng cập
              nhật lên phiên bản mới nhất hoặc sử dụng trình duyệt khác.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-6">
        <h3 className="mb-1 text-lg font-medium text-gray-900">
          Cài đặt thông báo
        </h3>
        <p className="text-sm text-gray-600">
          Quản lý cách bạn nhận thông báo từ ứng dụng
        </p>
      </div>

      <div className="space-y-6 p-6">
        {/* Status Overview */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {getPermissionStatus()}
              </div>
              <div
                className={`text-sm font-medium ${getPermissionStatusColor()}`}
              >
                Trạng thái
              </div>
            </div>

            {isSubscribed && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {unreadCount}
                  </div>
                  <div className="text-sm text-gray-600">Chưa đọc</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-gray-600">Đang hoạt động</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">Lỗi</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {testNotificationSent && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">Thành công</p>
                <p className="text-sm text-green-700">
                  Thông báo thử đã được gửi! Kiểm tra thông báo của bạn.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            {isSubscribed ? (
              <Bell className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
            ) : (
              <BellOff className="mt-0.5 h-6 w-6 flex-shrink-0 text-gray-400" />
            )}
            <div>
              <h4 className="text-base font-medium text-gray-900">
                Push Notifications
              </h4>
              <p className="text-sm text-gray-600">
                Nhận thông báo về lịch tập, dinh dưỡng và cập nhật ứng dụng
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleNotifications}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubscribed ? "bg-blue-600" : "bg-gray-200"
            } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSubscribed ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Test Notification */}
        {isSubscribed && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <TestTube className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <h4 className="text-base font-medium text-gray-900">
                    Gửi thông báo thử
                  </h4>
                  <p className="text-sm text-gray-600">
                    Kiểm tra xem thông báo có hoạt động đúng không
                  </p>
                </div>
              </div>

              <button
                onClick={handleSendTestNotification}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                Gửi thử
              </button>
            </div>
          </div>
        )}

        {/* Permission Help */}
        {!isPermissionGranted && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Cần cấp quyền
                </p>
                <p className="text-sm text-blue-700">
                  Để nhận thông báo, bạn cần cấp quyền thông báo cho trang web
                  này. Nhấp vào nút bật thông báo và chọn "Cho phép" khi được
                  hỏi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
