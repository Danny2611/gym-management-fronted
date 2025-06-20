// # Hook quản lý trạng thái PWA
// src/hooks/usePWA.ts
import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  showInstallPrompt: boolean;
  isLoading: boolean;
  error: string | null;
}

interface PWAActions {
  promptInstall: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  checkOnlineStatus: () => boolean;
  refreshPWAState: () => void;
}

export const usePWA = (): PWAState & PWAActions => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    isOnline: navigator.onLine,
    showInstallPrompt: false,
    isLoading: false,
    error: null,
  });

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Kiểm tra trạng thái PWA
  const checkPWAStatus = useCallback(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    const isInstalled =
      isStandalone || localStorage.getItem("pwa-installed") === "true";

    setState((prev) => ({
      ...prev,
      isStandalone,
      isInstalled,
      isOnline: navigator.onLine,
    }));
  }, []);

  // Xử lý sự kiện beforeinstallprompt
  useEffect(() => {
    console.log("[PWA] useEffect setup listeners");
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA] beforeinstallprompt received");
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      setState((prev) => ({
        ...prev,
        isInstallable: true,
        showInstallPrompt: !prev.isInstalled,
      }));
    };

    const handleAppInstalled = () => {
      console.log("[PWA] App installed!");
      localStorage.setItem("pwa-installed", "true");
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        showInstallPrompt: false,
        isInstallable: false,
      }));
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
  }, []);

  // Xử lý trạng thái online/offline
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true, error: null }));
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Khởi tạo trạng thái PWA
  useEffect(() => {
    checkPWAStatus();
  }, [checkPWAStatus]);

  // Prompt cài đặt PWA
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      setState((prev) => ({ ...prev, error: "Install prompt not available" }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          showInstallPrompt: false,
        }));
        return true;
      } else {
        console.log("User dismissed the install prompt");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          showInstallPrompt: false,
        }));
        return false;
      }
    } catch (error) {
      console.error("Error during PWA installation:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Installation failed",
      }));
      return false;
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // Tắt prompt cài đặt
  const dismissInstallPrompt = useCallback(() => {
    setState((prev) => ({ ...prev, showInstallPrompt: false }));

    // Hiển thị lại sau 24h
    setTimeout(
      () => {
        if (deferredPrompt && !state.isInstalled) {
          setState((prev) => ({ ...prev, showInstallPrompt: true }));
        }
      },
      24 * 60 * 60 * 1000,
    );
  }, [deferredPrompt, state.isInstalled]);

  // Kiểm tra trạng thái online
  const checkOnlineStatus = useCallback((): boolean => {
    return navigator.onLine;
  }, []);

  // Refresh trạng thái PWA
  const refreshPWAState = useCallback(() => {
    checkPWAStatus();
  }, [checkPWAStatus]);

  return {
    ...state,
    promptInstall,
    dismissInstallPrompt,
    checkOnlineStatus,
    refreshPWAState,
  };
};
