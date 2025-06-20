//services/pwa/pushNotificationService
import { apiClient } from "../api";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "reminder" | "promotion" | "appointment" | "membership" | "system";
  data?: any;
  status: "pending" | "sent" | "delivered" | "failed" | "read";
  created_at: string;
  read_at?: string;
}
// Sửa lại PushNotificationService để không duplicate SW registration
class PushNotificationService {
  private vapidPublicKey: string | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private isInitializing: boolean = false;
  private isInitialized: boolean = false;

  async initialize(): Promise<boolean> {
    if (this.isInitializing) {
      console.log("Push service is already initializing...");
      return false;
    }

    if (this.isInitialized) {
      console.log("Push service is already initialized");
      return true;
    }

    this.isInitializing = true;

    try {
      if (!this.isPushSupported()) {
        console.warn("Push notifications not supported in this browser");
        return false;
      }

      // Đợi một chút để đảm bảo các initialization khác hoàn tất
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Lấy VAPID key
      await this.getVapidPublicKeyWithRetry();

      // SỬ DỤNG SERVICE WORKER ĐÃ CÓ thay vì đăng ký mới
      await this.getExistingServiceWorker();

      this.isInitialized = true;
      console.log("Push notification service initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing push service:", error);
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  // Lấy Service Worker registration đã có thay vì tạo mới
  private async getExistingServiceWorker(): Promise<void> {
    try {
      // Đợi Service Worker ready
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        this.registration = registration;
        console.log("Using existing service worker registration");
        return;
      }

      // Nếu chưa có, tìm registration theo scope
      const registrations = await navigator.serviceWorker.getRegistrations();
      const swRegistration = registrations.find((reg) =>
        reg.scope.includes(window.location.origin),
      );

      if (swRegistration) {
        this.registration = swRegistration;
        console.log("Found existing service worker registration");
        return;
      }

      // Nếu thực sự chưa có, đăng ký mới (fallback)
      console.log("No existing SW found, registering new one...");
      this.registration = await navigator.serviceWorker.register("/sw.js");

      // Đợi SW active
      if (this.registration.installing) {
        await new Promise((resolve) => {
          this.registration!.installing!.addEventListener(
            "statechange",
            function () {
              if (this.state === "activated") {
                resolve(void 0);
              }
            },
          );
        });
      }

      console.log("Service Worker registered as fallback");
    } catch (error) {
      console.error("Error getting service worker:", error);
      throw error;
    }
  }

  // Hủy push subscription
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const subscription =
        await this.registration.pushManager.getSubscription();
      if (subscription) {
        // Hủy subscription trên browser
        await subscription.unsubscribe();

        // Thông báo server hủy subscription
        await apiClient.post("/api/pwa/push/unsubscribe", {
          endpoint: subscription.endpoint,
        });
      }

      console.log("Push unsubscription successful");
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      return false;
    }
  }

  // Lấy VAPID key với retry nhưng ít aggressive hơn
  private async getVapidPublicKeyWithRetry(maxRetries = 2): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await apiClient.get("/api/pwa/push/vapid-public-key");
        this.vapidPublicKey = response.data.publicKey;
        console.log("VAPID key retrieved successfully");
        return;
      } catch (error) {
        console.error(`Error getting VAPID key (attempt ${attempt}):`, error);
        if (attempt === maxRetries) {
          throw new Error("Failed to get VAPID key after multiple attempts");
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // Subscribe với better error handling
  async subscribe(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.warn("Push service not initialized");
        const initialized = await this.initialize();
        if (!initialized) {
          return false;
        }
      }

      const permission = await this.requestPermission();
      if (permission !== "granted") {
        console.log("Permission not granted for notifications");
        return false;
      }

      if (!this.registration || !this.vapidPublicKey) {
        throw new Error("Service not properly initialized");
      }

      // Kiểm tra subscription hiện tại
      const existingSubscription =
        await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Already subscribed, updating server...");
        await this.sendSubscriptionToServer(existingSubscription);
        return true;
      }

      // Tạo subscription mới
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      await this.sendSubscriptionToServer(subscription);

      console.log("Push subscription successful");
      return true;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return false;
    }
  }

  // Thêm method để reset state nếu cần
  reset(): void {
    this.isInitializing = false;
    this.isInitialized = false;
    this.registration = null;
    this.vapidPublicKey = null;
    console.log("Push service reset");
  }

  // Các methods khác giữ nguyên...
  isPushSupported(): boolean {
    try {
      const hasServiceWorker = "serviceWorker" in navigator;
      const hasPushManager = "PushManager" in window;
      const hasNotification = "Notification" in window;
      const hasPromises = typeof Promise !== "undefined";

      console.log("Browser support check:", {
        serviceWorker: hasServiceWorker,
        pushManager: hasPushManager,
        notification: hasNotification,
        promises: hasPromises,
      });

      return (
        hasServiceWorker && hasPushManager && hasNotification && hasPromises
      );
    } catch (error) {
      console.error("Error checking push support:", error);
      return false;
    }
  }

  async checkPermission(): Promise<NotificationPermission> {
    try {
      if (!("Notification" in window)) {
        return "denied";
      }
      return Notification.permission;
    } catch (error) {
      console.error("Error checking notification permission:", error);
      return "denied";
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!("Notification" in window)) {
        return "denied";
      }

      if (Notification.permission !== "default") {
        return Notification.permission;
      }

      const permission = await Notification.requestPermission();
      console.log("Permission request result:", permission);
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    subscription?: PushSubscription;
  }> {
    try {
      if (!this.registration) {
        // Chỉ lấy existing registration, không tạo mới
        try {
          this.registration = await navigator.serviceWorker.ready;
        } catch (error) {
          return { isSubscribed: false };
        }
      }

      const subscription =
        await this.registration.pushManager.getSubscription();
      return {
        isSubscribed: !!subscription,
        subscription: subscription || undefined,
      };
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return { isSubscribed: false };
    }
  }

  // Utility functions giữ nguyên
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private async sendSubscriptionToServer(
    subscription: PushSubscription,
  ): Promise<void> {
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
        auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
      },
    };

    await apiClient.post("/api/pwa/push/subscribe", {
      subscription: subscriptionData,
      platform: navigator.platform,
    });
  }
  // Gửi test notification
  async sendTestNotification(title?: string, message?: string): Promise<void> {
    try {
      await apiClient.post("/api/pwa/push/test", {
        title: title || "Test Notification",
        message: message || "This is a test notification from FitLife!",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      throw error;
    }
  }

  // Lấy danh sách notifications
  async getNotifications(
    page = 1,
    limit = 20,
  ): Promise<{
    notifications: NotificationData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const response = await apiClient.get("/api/pwa/push/notifications", {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  }

  // Đánh dấu notifications đã đọc
  async markNotificationsAsRead(notificationIds: string[]): Promise<void> {
    try {
      await apiClient.put("/api/pwa/push/notifications/read", {
        notificationIds,
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
