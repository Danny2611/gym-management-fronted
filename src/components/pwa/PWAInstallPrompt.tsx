// src/components/pwa/PWAInstallPrompt.tsx
import React from "react";
import { Download, X, Smartphone, Monitor } from "lucide-react";
import { usePWA } from "~/hooks/usePWA";

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className = "",
}) => {
  const { showInstallPrompt, isLoading, promptInstall, dismissInstallPrompt } =
    usePWA();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      console.log("PWA installed successfully");
    }
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 ${className}`}
    >
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="mb-1 text-sm font-semibold text-gray-900">
              Cài đặt FitLife App
            </h3>
            <p className="mb-3 text-xs text-gray-600">
              Cài đặt ứng dụng để trải nghiệm tốt hơn với chế độ offline và
              thông báo push.
            </p>

            <div className="mb-3 flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Smartphone className="h-3 w-3" />
                Mobile
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Monitor className="h-3 w-3" />
                Desktop
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                disabled={isLoading}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                Cài đặt
              </button>

              <button
                onClick={dismissInstallPrompt}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
              >
                Để sau
              </button>
            </div>
          </div>

          <button
            onClick={dismissInstallPrompt}
            className="flex-shrink-0 rounded-md p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
