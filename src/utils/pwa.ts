//utils/pwa
import {
  DeviceInfo,
  pushNotificationService,
  PushSubscriptionData,
} from "~/services/pwa/pushNotificationService";

/**
 * Kiểm tra browser có hỗ trợ push notifications không
 */
export const isPushNotificationSupported = (): boolean => {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
};

/**
 * Kiểm tra quyền notification
 */
export const getNotificationPermission = (): NotificationPermission => {
  return Notification.permission;
};

/**
 * Yêu cầu quyền notification
 */
export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (!isPushNotificationSupported()) {
      throw new Error("Push notifications are not supported");
    }

    const permission = await Notification.requestPermission();
    return permission;
  };

/**
 * Đăng ký service worker và push subscription
 */
export const registerPushNotification = async (): Promise<{
  success: boolean;
  subscription?: PushSubscriptionData;
  error?: string;
}> => {
  try {
    // Kiểm tra hỗ trợ
    if (!isPushNotificationSupported()) {
      return {
        success: false,
        error: "Push notifications are not supported",
      };
    }

    // Yêu cầu quyền
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error: "Notification permission not granted",
      };
    }

    // Đăng ký service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // Lấy VAPID public key
    const vapidResponse = await pushNotificationService.getVapidPublicKey();
    if (!vapidResponse.success) {
      return {
        success: false,
        error: "Failed to get VAPID public key",
      };
    }

    // Tạo push subscription
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidResponse.publicKey,
    });

    const subscriptionData: PushSubscriptionData = {
      endpoint: pushSubscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(pushSubscription.getKey("p256dh")!),
        auth: arrayBufferToBase64(pushSubscription.getKey("auth")!),
      },
    };

    // Gửi subscription lên server
    const deviceInfo: DeviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    };

    const subscribeResponse = await pushNotificationService.subscribe(
      subscriptionData,
      deviceInfo,
    );

    if (subscribeResponse.success) {
      return {
        success: true,
        subscription: subscriptionData,
      };
    } else {
      return {
        success: false,
        error: subscribeResponse.message,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to register push notification",
    };
  }
};

/**
 * Hủy đăng ký push notification
 */
export const unregisterPushNotification = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return { success: true }; // Already unregistered
    }

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      // Hủy subscription trên server
      await pushNotificationService.unsubscribe(subscription.endpoint);

      // Hủy subscription trên browser
      await subscription.unsubscribe();
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to unregister push notification",
    };
  }
};

// utils/pwa.ts
export const getSubscriptionStatus = async (): Promise<{
  isSubscribed: boolean;
  subscription?: PushSubscription;
}> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return {
      isSubscribed: !!subscription,
      subscription: subscription || undefined,
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { isSubscribed: false };
  }
};

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

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const isStandalonePWA = (): boolean => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes("android-app://")
  );
};

export const isPWAInstalled = (): boolean => {
  return isStandalonePWA() || localStorage.getItem("pwa-installed") === "true";
};

export const detectDeviceType = (): "mobile" | "tablet" | "desktop" => {
  const userAgent = navigator.userAgent;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return "tablet";
  }

  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      userAgent,
    )
  ) {
    return "mobile";
  }

  return "desktop";
};
