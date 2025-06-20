// src/components/pwa/PWAUpdatePrompt.tsx
import React, { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";

interface PWAUpdatePromptProps {
  className?: string;
}

export const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({
  className = "",
}) => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!isUpdating) {
          setShowUpdatePrompt(true);
        }
      });

      // Check for waiting service worker
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          setShowUpdatePrompt(true);
        }
      });
    }
  }, [isUpdating]);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (registration.waiting) {
        // Send message to waiting service worker to skip waiting
        registration.waiting.postMessage({ type: "SKIP_WAITING" });

        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating PWA:", error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div
      className={`fixed left-4 right-4 top-4 z-50 md:left-auto md:right-4 md:w-96 ${className}`}
    >
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <RefreshCw className="h-4 w-4 text-green-600" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="mb-1 text-sm font-semibold text-green-900">
              Cập nhật có sẵn
            </h3>
            <p className="mb-3 text-xs text-green-700">
              Phiên bản mới của ứng dụng đã sẵn sàng. Cập nhật ngay để có trải
              nghiệm tốt nhất.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    Cập nhật ngay
                  </>
                )}
              </button>

              <button
                onClick={handleDismiss}
                disabled={isUpdating}
                className="px-3 py-1.5 text-xs text-green-700 hover:text-green-800 disabled:opacity-50"
              >
                Để sau
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="flex-shrink-0 rounded-md p-1 hover:bg-green-100 disabled:opacity-50"
          >
            <X className="h-4 w-4 text-green-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
