// src/pages/user/settings/NotificationSettings.tsx
import React from "react";
import { NotificationSettings } from "~/components/pwa/settings/NotificationSettings";

const NotificationSettingsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt thông báo</h1>
        <p className="mt-1 text-gray-600">
          Quản lý cách bạn nhận thông báo từ ứng dụng
        </p>
      </div>

      <NotificationSettings />
    </div>
  );
};

export default NotificationSettingsPage;
