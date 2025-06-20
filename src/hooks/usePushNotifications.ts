// src/hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from "react";
import {
  pushNotificationService,
  type PushSubscriptionData,
  type Notification,
} from "~/services/pwa/pushNotificationService";

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isPermissionGranted: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: PushSubscription | null;
  notifications: Notification[];
  unreadCount: number;
  isServiceWorkerReady: boolean;
}

interface PushNotificationActions {
  requestPermission: () => Promise<boolean>;
  subscribeToNotifications: () => Promise<boolean>;
  unsubscribeFromNotifications: () => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export const usePushNotifications = (): PushNotificationState &
  PushNotificationActions => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported:
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window,
    isSubscribed: false,
    isPermissionGranted: false,
    isLoading: false,
    error: null,
    subscription: null,
    notifications: [],
    unreadCount: 0,
    isServiceWorkerReady: false,
  });

  // ✅ Cải thiện việc kiểm tra Service Worker readiness
  const checkServiceWorkerReady =
    useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
      if (!("serviceWorker" in navigator)) return null;

      try {
        // Kiểm tra xem có registration đang active không
        const registration = await navigator.serviceWorker.getRegistration();

        if (registration) {
          console.log(
            "✅ Found existing Service Worker registration:",
            registration,
          );

          // Kiểm tra trạng thái của service worker
          if (registration.active) {
            console.log("✅ Service Worker is active and ready");
            return registration;
          }

          if (registration.installing) {
            console.log("🔄 Service Worker is installing, waiting...");
            // Đợi quá trình install hoàn thành
            await new Promise((resolve) => {
              registration.installing!.addEventListener(
                "statechange",
                function () {
                  if (this.state === "activated") {
                    resolve(undefined);
                  }
                },
              );
            });
            return registration;
          }

          if (registration.waiting) {
            console.log("⏳ Service Worker is waiting, activating...");
            return registration;
          }
        }

        // Fallback: đợi service worker ready
        console.log("🔄 Waiting for Service Worker to be ready...");
        const readyRegistration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Service Worker timeout")), 5000),
          ),
        ]);

        console.log("✅ Service Worker is ready:", readyRegistration);
        return readyRegistration;
      } catch (error) {
        console.error("❌ Service Worker check failed:", error);
        return null;
      }
    }, []);

  // ✅ Tối ưu hóa việc khởi tạo state
  useEffect(() => {
    const initializeState = async () => {
      console.log("🚀 Initializing push notification state...");

      if (
        !(
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window
        )
      ) {
        console.log("❌ Push notifications not supported");
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isServiceWorkerReady: false,
        }));
        return;
      }

      // Kiểm tra permission
      const isPermissionGranted = Notification.permission === "granted";
      console.log("🔐 Permission status:", Notification.permission);

      // Kiểm tra Service Worker với retry logic
      let registration = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!registration && retryCount < maxRetries) {
        console.log(
          `🔄 Checking Service Worker (attempt ${retryCount + 1}/${maxRetries})...`,
        );
        registration = await checkServiceWorkerReady();

        if (!registration) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log("⏳ Retrying in 1 second...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      const isServiceWorkerReady = !!registration;
      console.log("📊 Service Worker ready status:", isServiceWorkerReady);

      setState((prev) => ({
        ...prev,
        isSupported: true,
        isPermissionGranted,
        isServiceWorkerReady,
      }));

      // Kiểm tra subscription hiện tại nếu SW sẵn sàng
      if (isServiceWorkerReady && isPermissionGranted) {
        console.log("🔍 Checking existing subscription...");
        await checkCurrentSubscription(registration!);
      }
    };

    initializeState();
  }, []);

  // ✅ Tách riêng function checkCurrentSubscription
  const checkCurrentSubscription = useCallback(
    async (registration?: ServiceWorkerRegistration) => {
      try {
        const reg = registration || (await navigator.serviceWorker.ready);
        const subscription = await reg.pushManager.getSubscription();

        console.log(
          "📱 Current subscription:",
          subscription ? "Found" : "None",
        );

        setState((prev) => ({
          ...prev,
          isSubscribed: !!subscription,
          subscription,
        }));

        if (subscription) {
          await refreshUnreadCount();
        }
      } catch (error) {
        console.error("❌ Error checking subscription:", error);
      }
    },
    [],
  );

  // ✅ Listen for service worker updates
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleControllerChange = () => {
      console.log("🔄 Service Worker controller changed");
      // Re-check service worker readiness
      checkServiceWorkerReady().then((registration) => {
        setState((prev) => ({
          ...prev,
          isServiceWorkerReady: !!registration,
        }));
      });
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, [checkServiceWorkerReady]);

  // Yêu cầu permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Push notifications are not supported",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      const isGranted = permission === "granted";

      setState((prev) => ({
        ...prev,
        isPermissionGranted: isGranted,
        isLoading: false,
        error: isGranted ? null : "Permission denied for notifications",
      }));

      return isGranted;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to request permission",
      }));
      return false;
    }
  }, [state.isSupported]);

  // ✅ Cải thiện subscribeToNotifications
  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    console.log("🔄 Starting subscription process...");

    // Kiểm tra điều kiện cơ bản
    if (!state.isSupported) {
      console.error("❌ Push notifications not supported");
      setState((prev) => ({
        ...prev,
        error: "Push notifications not supported",
      }));
      return false;
    }

    if (!state.isPermissionGranted) {
      console.error("❌ Permission not granted");
      setState((prev) => ({ ...prev, error: "Permission not granted" }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // ✅ Real-time check cho Service Worker thay vì dựa vào state
      console.log("🔧 Checking Service Worker status...");
      const registration = await checkServiceWorkerReady();

      if (!registration) {
        console.error("❌ Service Worker not available");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Service Worker not available. Please refresh and try again.",
        }));
        return false;
      }

      // Cập nhật state nếu chưa đúng
      if (!state.isServiceWorkerReady) {
        setState((prev) => ({ ...prev, isServiceWorkerReady: true }));
      }

      console.log(
        "✅ Service Worker confirmed ready, proceeding with subscription...",
      );

      // Lấy VAPID public key
      console.log("🔑 Getting VAPID public key...");
      const vapidResponse = await pushNotificationService.getVapidPublicKey();

      if (!vapidResponse.success) {
        console.error("❌ Cannot get VAPID public key:", vapidResponse.message);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Không thể lấy VAPID public key: " + vapidResponse.message,
        }));
        return false;
      }

      const publicKey = vapidResponse.publicKey;
      console.log("✅ Public key received");

      // Kiểm tra xem đã có subscription chưa
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("⚠️ Existing subscription found, unsubscribing first...");
        await existingSubscription.unsubscribe();
      }

      console.log("📱 Creating new push subscription...");

      // Đăng ký push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      console.log("✅ Push subscription created successfully");

      // Lấy keys
      const p256dhKey = subscription.getKey("p256dh");
      const authKey = subscription.getKey("auth");

      if (!p256dhKey || !authKey) {
        throw new Error("Missing push subscription keys");
      }

      // Chuẩn bị dữ liệu gửi lên server
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(p256dhKey),
          auth: arrayBufferToBase64(authKey),
        },
      };

      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      };

      console.log("📤 Sending subscription to server...");

      // Gửi subscription lên server
      const response = await pushNotificationService.subscribe(
        subscriptionData,
        deviceInfo,
      );

      if (response.success) {
        console.log("✅ Subscription successful!");
        setState((prev) => ({
          ...prev,
          isSubscribed: true,
          subscription,
          isLoading: false,
          error: null,
        }));

        await refreshUnreadCount();
        return true;
      } else {
        console.error("❌ Server rejected subscription:", response.message);
        throw new Error(response.message || "Server rejected subscription");
      }
    } catch (error) {
      console.error("❌ Error in subscription process:", error);

      let errorMessage = "Failed to subscribe to notifications";
      if (error instanceof Error) {
        errorMessage += ": " + error.message;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [state.isSupported, state.isPermissionGranted, checkServiceWorkerReady]);

  // Hủy đăng ký push notifications
  const unsubscribeFromNotifications =
    useCallback(async (): Promise<boolean> => {
      if (!state.subscription) return false;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Hủy subscription trên browser
        await state.subscription.unsubscribe();

        // Hủy subscription trên server
        await pushNotificationService.unsubscribe(state.subscription.endpoint);

        setState((prev) => ({
          ...prev,
          isSubscribed: false,
          subscription: null,
          isLoading: false,
          notifications: [],
          unreadCount: 0,
        }));

        return true;
      } catch (error) {
        console.error("Error unsubscribing:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to unsubscribe from notifications",
        }));
        return false;
      }
    }, [state.subscription]);

  // Gửi test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!state.isSubscribed) {
      setState((prev) => ({
        ...prev,
        error: "Not subscribed to notifications",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await pushNotificationService.sendTestNotification();

      setState((prev) => ({ ...prev, isLoading: false }));

      if (response.success) {
        await refreshUnreadCount();
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message ?? "Unknown error",
        }));
        return false;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to send test notification",
      }));
      return false;
    }
  }, [state.isSubscribed]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!state.isSubscribed) return;

    try {
      const response = await pushNotificationService.getUserNotifications({
        page: 1,
        limit: 50,
      });

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          notifications: response.data!.notifications,
        }));
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [state.isSubscribed]);

  // Đánh dấu đã đọc
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response =
        await pushNotificationService.markAsRead(notificationIds);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((notification) =>
            notificationIds.includes(notification._id)
              ? {
                  ...notification,
                  status: "read" as const,
                  read_at: new Date(),
                }
              : notification,
          ),
        }));

        await refreshUnreadCount();
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, []);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await pushNotificationService.markAllAsRead();

      if (response.success) {
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((notification) => ({
            ...notification,
            status: "read" as const,
            read_at: new Date(),
          })),
          unreadCount: 0,
        }));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await pushNotificationService.getUnreadCount();

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          unreadCount: response.data!.count,
        }));
      }
    } catch (error) {
      console.error("Error refreshing unread count:", error);
    }
  }, []);

  // Listen for messages from service worker
  useEffect(() => {
    if (!state.isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "NOTIFICATION_RECEIVED") {
        refreshUnreadCount();
        loadNotifications();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [state.isSupported, loadNotifications, refreshUnreadCount]);

  return {
    ...state,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  };
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
