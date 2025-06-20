// src/components/layout/Header.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Dumbbell, Apple, Settings, Bell } from "lucide-react";
import { NotificationButton } from "~/components/pwa/NotificationButton";

import { usePushNotifications } from "~/hooks/usePushNotifications";

interface HeaderProps {
  onNotificationClick?: () => void;
  showBottomNav?: boolean;
  navItems?: Array<{
    path: string;
    icon: any;
    label: string;
  }>;
}

export const HeaderPWA: React.FC<HeaderProps> = ({
  onNotificationClick,
  showBottomNav = false,
  navItems = [
    { path: "/user/dashboard", icon: Home, label: "Trang chủ" },
    { path: "/user/workout", icon: Dumbbell, label: "Tập luyện" },
    { path: "/user/packages", icon: Apple, label: "Gói tập" },
    { path: "/user/profile", icon: Settings, label: "Cài đặt" },
  ],
}) => {
  const location = useLocation();
  const { isSupported, isSubscribed, unreadCount } = usePushNotifications();
  //  const isNotificationSupported = isPushNotificationSupported(); // ✅ ĐÚNG
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FitLife</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              {isSupported && onNotificationClick && (
                <button
                  onClick={onNotificationClick}
                  className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <Bell className="h-6 w-6" />
                  {isSubscribed && unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Notification Toggle */}
              <NotificationButton />
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - chỉ hiện khi showBottomNav = true */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">
          <div
            className={`grid h-16 ${navItems.length === 4 ? "grid-cols-4" : `grid-cols-${navItems.length}`}`}
          >
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center justify-center space-y-1 ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Desktop Sidebar - chỉ hiện khi có navItems */}
      {navItems.length > 0 && (
        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:block md:w-64 md:border-r md:border-gray-200 md:bg-white md:pt-16">
          <nav className="mt-8">
            <div className="space-y-2 px-4">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>
      )}
    </>
  );
};
