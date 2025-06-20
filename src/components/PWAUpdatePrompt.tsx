// src/components/pwa/PWAUpdatePrompt.tsx
import React, { useState, useEffect } from "react";
import { registerSW } from "virtual:pwa-register";

interface PWAUpdatePromptProps {
  children: React.ReactNode;
}

const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({ children }) => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSW, setUpdateSW] = useState<
    ((reloadPage?: boolean) => Promise<void>) | null
  >(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
      onRegistered(registration) {
        console.log("Service Worker registered successfully:", registration);
      },
      onRegisterError(error) {
        console.error("Service Worker registration failed:", error);
      },
    });

    setUpdateSW(() => update);
  }, []);

  const handleUpdate = () => {
    if (updateSW) {
      updateSW(true);
    }
  };

  const handleClose = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <>
      {children}

      {/* Update Available Toast */}
      {needRefresh && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-blue-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Cập nhật mới!</h4>
              <p className="text-sm">Có phiên bản mới của ứng dụng</p>
            </div>
            <button
              onClick={handleClose}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdate}
              className="rounded bg-white px-3 py-1 text-sm font-medium text-blue-600 hover:bg-gray-100"
            >
              Cập nhật
            </button>
            <button
              onClick={handleClose}
              className="rounded border border-white px-3 py-1 text-sm text-white hover:bg-white hover:text-blue-600"
            >
              Để sau
            </button>
          </div>
        </div>
      )}

      {/* Offline Ready Toast */}
      {offlineReady && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-green-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Sẵn sàng offline!</h4>
              <p className="text-sm">App có thể hoạt động khi mất mạng</p>
            </div>
            <button
              onClick={handleClose}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAUpdatePrompt;
