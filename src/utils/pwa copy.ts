// # Utility functions cho PWA
// src/utils/pwa.ts
/**
 * Kiểm tra xem ứng dụng có đang chạy như PWA không
 */

// ===== CÁC FUNCTIONS BỔ SUNG =====

/**
 * Đăng ký Service Worker
 */
export const registerServiceWorker = async (
  swPath: string = "/sw.js",
): Promise<ServiceWorkerRegistration | null> => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swPath);
      console.log("Service Worker registered successfully:", registration);

      // Lắng nghe các sự kiện
      registration.addEventListener("updatefound", () => {
        console.log("New Service Worker version found");
      });

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }
  return null;
};

/**
 * Hủy đăng ký Service Worker
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return await registration.unregister();
      }
    } catch (error) {
      console.error("Service Worker unregistration failed:", error);
    }
  }
  return false;
};

export const isPWAMode = (): boolean => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes("android-app://")
  );
};

/**
 * Kiểm tra xem browser có hỗ trợ PWA không
 */
export const isPWASupported = (): boolean => {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    "caches" in window
  );
};

/**
 * Kiểm tra xem có đang online không
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Lấy thông tin về kết nối mạng
 */
export const getNetworkInfo = () => {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (!connection) {
    return {
      effectiveType: "unknown",
      downlink: 0,
      rtt: 0,
      saveData: false,
    };
  }

  return {
    effectiveType: connection.effectiveType || "unknown",
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
};

/**
 * Kiểm tra xem có đang ở chế độ tiết kiệm dữ liệu không
 */
export const isDataSaverMode = (): boolean => {
  const connection = (navigator as any).connection;
  return connection?.saveData || false;
};

/**
 * Convert ArrayBuffer to Base64
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

/**
 * Convert URL-safe Base64 to Uint8Array
 */
export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Hiển thị notification bằng browser API
 */
export const showBrowserNotification = async (
  title: string,
  options: NotificationOptions = {},
): Promise<Notification | null> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
    return null;
  }

  if (Notification.permission === "granted") {
    return new Notification(title, {
      icon: "/icons/app-icon-192.png",
      badge: "/icons/badge-icon.png",
      requireInteraction: true,
      ...options,
    });
  } else if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return new Notification(title, {
        icon: "/icons/app-icon-192.png",
        badge: "/icons/badge-icon.png",
        requireInteraction: true,
        ...options,
      });
    }
  }

  return null;
};

/**
 * Lấy thông tin về storage đã sử dụng
 */
export const getStorageUsage = async (): Promise<{
  quota: number;
  usage: number;
  percentage: number;
}> => {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const quota = estimate.quota || 0;
    const usage = estimate.usage || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return { quota, usage, percentage };
  }

  return { quota: 0, usage: 0, percentage: 0 };
};

/**
 * Xóa cache cũ
 */
export const clearOldCaches = async (
  currentCacheName: string,
): Promise<void> => {
  if ("caches" in window) {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter((name) => name !== currentCacheName);

    await Promise.all(oldCaches.map((cacheName) => caches.delete(cacheName)));

    console.log(`Cleared ${oldCaches.length} old caches`);
  }
};

/**
 * Kiểm tra xem có cần update app không
 */
export const checkForAppUpdate = async (): Promise<boolean> => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return !!registration.waiting;
    }
  }
  return false;
};

/**
 * Skip waiting và reload app
 */
export const updateApp = async (): Promise<void> => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  }
};

/**
 * Lấy thông tin về thiết bị
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  return {
    userAgent,
    platform,
    isMobile:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      ),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isDesktop:
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      ),
  };
};

/**
 * Format thời gian tương đối cho notifications
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "Vừa xong";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  } else {
    return targetDate.toLocaleDateString("vi-VN");
  }
};

/**
 * Lấy thông tin về Service Worker
 */
export const getServiceWorkerInfo = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return {
          active: !!registration.active,
          installing: !!registration.installing,
          waiting: !!registration.waiting,
          scope: registration.scope,
          updateViaCache: registration.updateViaCache,
        };
      }
    } catch (error) {
      console.error("Failed to get Service Worker info:", error);
    }
  }
  return null;
};

/**
 * Kiểm tra và yêu cầu quyền Push notification
 */
export const requestPushPermission =
  async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    if (!("PushManager" in window)) {
      throw new Error("This browser does not support push messaging");
    }

    return await Notification.requestPermission();
  };

/**
 * Subscribe để nhận push notifications
 */
export const subscribeToPush = async (
  vapidPublicKey: string,
): Promise<PushSubscription | null> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error("Service Worker not registered");
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return null;
  }
};

/**
 * Unsubscribe push notifications
 */
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      return await subscription.unsubscribe();
    }
    return true;
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
    return false;
  }
};

/**
 * Lấy thông tin push subscription hiện tại
 */
export const getPushSubscription =
  async (): Promise<PushSubscription | null> => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return null;

      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Failed to get push subscription:", error);
      return null;
    }
  };

/**
 * Cache tài nguyên cho offline mode
 */
export const cacheResources = async (
  cacheName: string,
  resources: string[],
): Promise<void> => {
  if ("caches" in window) {
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(resources);
      console.log(`Cached ${resources.length} resources`);
    } catch (error) {
      console.error("Failed to cache resources:", error);
    }
  }
};

/**
 * Lấy tài nguyên từ cache hoặc network
 */
export const getCachedResource = async (
  url: string,
  cacheName?: string,
): Promise<Response | null> => {
  if ("caches" in window) {
    try {
      let response: Response | undefined;

      if (cacheName) {
        const cache = await caches.open(cacheName);
        response = await cache.match(url);
      } else {
        response = await caches.match(url);
      }

      return response || null;
    } catch (error) {
      console.error("Failed to get cached resource:", error);
    }
  }
  return null;
};

/**
 * Xóa tài nguyên khỏi cache
 */
export const deleteCachedResource = async (
  url: string,
  cacheName?: string,
): Promise<boolean> => {
  if ("caches" in window) {
    try {
      if (cacheName) {
        const cache = await caches.open(cacheName);
        return await cache.delete(url);
      } else {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          return await cache.delete(url);
        });

        const results = await Promise.all(deletePromises);
        return results.some((result) => result);
      }
    } catch (error) {
      console.error("Failed to delete cached resource:", error);
    }
  }
  return false;
};

/**
 * Lấy danh sách tất cả cache names
 */
export const getCacheNames = async (): Promise<string[]> => {
  if ("caches" in window) {
    try {
      return await caches.keys();
    } catch (error) {
      console.error("Failed to get cache names:", error);
    }
  }
  return [];
};

/**
 * Lấy thông tin chi tiết về cache
 */
export const getCacheInfo = async (cacheName: string) => {
  if ("caches" in window) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      return {
        name: cacheName,
        size: keys.length,
        urls: keys.map((request) => request.url),
      };
    } catch (error) {
      console.error("Failed to get cache info:", error);
    }
  }
  return null;
};

/**
 * Kiểm tra xem tài nguyên có trong cache không
 */
export const isResourceCached = async (
  url: string,
  cacheName?: string,
): Promise<boolean> => {
  const cachedResource = await getCachedResource(url, cacheName);
  return !!cachedResource;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Tạo unique ID
 */
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Retry function với exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Kiểm tra connection speed
 */
export const getConnectionSpeed = (): "slow" | "fast" | "unknown" => {
  const connection = (navigator as any).connection;

  if (!connection) return "unknown";

  const effectiveType = connection.effectiveType;

  if (effectiveType === "slow-2g" || effectiveType === "2g") {
    return "slow";
  } else if (effectiveType === "3g" || effectiveType === "4g") {
    return "fast";
  }

  return "unknown";
};

/**
 * Preload important resources
 */
export const preloadResources = (
  resources: Array<{ url: string; as: string }>,
) => {
  resources.forEach(({ url, as }) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
  });
};

/**
 * Add beforeinstallprompt event listener
 */
export const handleInstallPrompt = (
  onPrompt?: (event: any) => void,
  onInstalled?: () => void,
) => {
  let deferredPrompt: any;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (onPrompt) {
      onPrompt(e);
    }
  });

  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed");
    if (onInstalled) {
      onInstalled();
    }
  });

  return {
    showInstallPrompt: async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        return outcome === "accepted";
      }
      return false;
    },
  };
};

/**
 * Background sync utility
 */
export const requestBackgroundSync = async (tag: string): Promise<void> => {
  if (
    "serviceWorker" in navigator &&
    "sync" in window.ServiceWorkerRegistration.prototype
  ) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await (registration as any).sync.register(tag);
        console.log(`Background sync registered for tag: ${tag}`);
      }
    } catch (error) {
      console.error("Background sync registration failed:", error);
    }
  } else {
    console.warn("Background sync is not supported");
  }
};

/**
 * Wake lock để giữ màn hình sáng
 */
export const requestWakeLock = async (): Promise<any> => {
  if ("wakeLock" in navigator) {
    try {
      const wakeLock = await (navigator as any).wakeLock.request("screen");
      console.log("Wake lock is active");
      return wakeLock;
    } catch (error) {
      console.error("Wake lock request failed:", error);
    }
  } else {
    console.warn("Wake Lock API is not supported");
  }
  return null;
};

/**
 * Share API utility
 */
export const shareContent = async (data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error("Sharing failed:", error);
      return false;
    }
  } else {
    console.warn("Web Share API is not supported");
    // Fallback: copy to clipboard hoặc show share dialog
    if (data.url && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(data.url);
        console.log("URL copied to clipboard");
        return true;
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
    return false;
  }
};
