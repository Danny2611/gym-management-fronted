// # Component hiển thị gợi ý cài đặt PWA
// src/components/pwa/InstallPrompt.tsx
import React, { useState, useEffect } from "react";
import { X, Download, Smartphone, Monitor } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<"mobile" | "desktop">("desktop");

  useEffect(() => {
    // Kiểm tra xem PWA đã được cài đặt chưa
    const checkInstallStatus = () => {
      // Kiểm tra display-mode
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      // Kiểm tra navigator.standalone cho iOS Safari
      const isStandaloneiOS = (window.navigator as any).standalone === true;

      setIsInstalled(isStandalone || isStandaloneiOS);
    };

    // Detect platform
    const detectPlatform = () => {
      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      setPlatform(isMobile ? "mobile" : "desktop");
    };

    checkInstallStatus();
    detectPlatform();

    // Lắng nghe beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Hiển thị prompt sau một khoảng thời gian delay
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 2000);
    };

    // Lắng nghe appinstalled event
    const handleAppInstalled = () => {
      console.log("PWA đã được cài đặt");
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Hiển thị install prompt
      await deferredPrompt.prompt();

      // Chờ người dùng phản hồi
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User ${outcome} the install prompt`);

      if (outcome === "accepted") {
        setShowPrompt(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error showing install prompt:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Không hiển thị lại trong 24h
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // Kiểm tra xem đã dismiss gần đây chưa
  useEffect(() => {
    const dismissedTime = localStorage.getItem("pwa-install-dismissed");
    if (dismissedTime) {
      const timeDiff = Date.now() - parseInt(dismissedTime);
      const dayInMs = 24 * 60 * 60 * 1000;

      if (timeDiff < dayInMs) {
        setShowPrompt(false);
      }
    }
  }, []);

  // Không hiển thị nếu đã cài đặt hoặc không có prompt event
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {platform === "mobile" ? (
              <Smartphone className="h-5 w-5 text-blue-600" />
            ) : (
              <Monitor className="h-5 w-5 text-blue-600" />
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Cài đặt ứng dụng
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          {platform === "mobile"
            ? "Thêm ứng dụng vào màn hình chính để truy cập nhanh hơn."
            : "Cài đặt ứng dụng để có trải nghiệm tốt hơn và truy cập offline."}
        </p>

        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex flex-1 items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span>Cài đặt</span>
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-md px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Không
          </button>
        </div>
      </div>
    </div>
  );
};
