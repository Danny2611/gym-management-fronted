//services/pwa/pushNotificationService
import { ApiResponse } from "~/types/ApiResponse";
import { apiClient } from "../api";

// Types for Push Notifications
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface DeviceInfo {
  userAgent?: string;
  platform?: string;
}

export interface NotificationData {
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
  scheduledAt?: Date;
}

export interface NotificationTemplate {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  requireInteraction?: boolean;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

export interface Notification {
  _id: string;
  member_id: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
  status: "pending" | "sent" | "failed" | "read";
  scheduled_at?: Date;
  sent_at?: Date;
  read_at?: Date;
  created_at: Date;
  updated_at: Date;
  trainer_id?: {
    _id: string;
    name: string;
  };
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  read: number;
  pending: number;
}

export interface BulkNotificationRequest {
  memberIds: string[];
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
}

export interface BulkNotificationResult {
  successful: number;
  failed: number;
  total: number;
}
type VapidPublicKeyResponse =
  | { success: true; publicKey: string }
  | { success: false; message: string; error?: any };
export const pushNotificationService = {
  /**
   * Đăng ký push notification subscription
   */
  subscribe: async (
    subscription: PushSubscriptionData,
    deviceInfo?: DeviceInfo,
  ): Promise<ApiResponse<{ message: string; data: any }>> => {
    try {
      const response = await apiClient.post(
        "/api/pwa/push-notifications/subscribe",
        {
          subscription,
          platform: deviceInfo?.platform || "web",
          ...deviceInfo,
        },
      );
      return response.data;
    } catch (error: any) {
      console.error("Push notification subscription error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Không thể đăng ký push notification",
        errors: [error.response?.data || error.message || error],
      };
    }
  },

  /**
   * Lấy VAPID public key để đăng ký push notification
   */
  getVapidPublicKey: async (): Promise<VapidPublicKeyResponse> => {
    try {
      const response = await apiClient.get(
        "/api/pwa/push-notifications/vapid-public-key",
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy VAPID public key",
        error: error,
      };
    }
  },

  /**
   * Hủy đăng ký push notification
   */
  unsubscribe: async (
    endpoint: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post(
        "/api/pwa/push-notifications/unsubscribe",
        {
          endpoint,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể hủy đăng ký push notification",
        errors: [error],
      };
    }
  },

  /**
   * Gửi test notification
   */
  sendTestNotification: async (
    title?: string,
    message?: string,
    type?: string,
  ): Promise<ApiResponse<{ message: string; data: Notification }>> => {
    try {
      const response = await apiClient.post(
        "/api/pwa/push-notifications/test",
        {
          title: title || "Test Notification",
          message: message || "This is a test notification",
          type: type || "system",
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể gửi test notification",
        errors: [error],
      };
    }
  },

  /**
   * Lấy danh sách notifications của user
   */
  getUserNotifications: async (
    params: NotificationQueryParams = {},
  ): Promise<
    ApiResponse<{
      notifications: Notification[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > => {
    try {
      const response = await apiClient.get(
        "/api/pwa/push-notifications/notifications",
        { params },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy danh sách thông báo",
        errors: [error],
      };
    }
  },

  /**
   * Đánh dấu notifications đã đọc
   */
  markAsRead: async (
    notificationIds: string[],
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.put(
        "/api/pwa/push-notifications/notifications/read",
        {
          notificationIds,
        },
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Không thể đánh dấu thông báo đã đọc",
        errors: [error],
      };
    }
  },

  /**
   * Đánh dấu một notification đã đọc
   */
  markSingleAsRead: async (
    notificationId: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    return pushNotificationService.markAsRead([notificationId]);
  },

  /**
   * Đánh dấu tất cả notifications đã đọc
   */
  markAllAsRead: async (): Promise<ApiResponse<{ message: string }>> => {
    try {
      // First get all unread notifications
      const unreadResponse = await pushNotificationService.getUserNotifications(
        {
          status: "sent", // Assuming 'sent' means unread
          limit: 1000, // Get a large number to mark all
        },
      );

      if (unreadResponse.success && unreadResponse.data) {
        const unreadIds = unreadResponse.data.notifications.map((n) => n._id);
        if (unreadIds.length > 0) {
          return await pushNotificationService.markAsRead(unreadIds);
        }
      }

      return {
        success: true,
        message: "Không có thông báo nào để đánh dấu",
      };
    } catch (error) {
      return {
        success: false,
        message: "Không thể đánh dấu tất cả thông báo đã đọc",
        errors: [error],
      };
    }
  },

  /**
   * Lấy số lượng notifications chưa đọc
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    try {
      const response = await pushNotificationService.getUserNotifications({
        status: "sent",
        limit: 1,
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: { count: response.data.pagination.total },
        };
      }

      return {
        success: false,
        message: "Không thể lấy số lượng thông báo chưa đọc",
      };
    } catch (error) {
      return {
        success: false,
        message: "Không thể lấy số lượng thông báo chưa đọc",
        errors: [error],
      };
    }
  },

  // /**
  //  * Xóa notification (soft delete)
  //  */
  // deleteNotification: async (
  //   notificationId: string
  // ): Promise<ApiResponse<{ message: string }>> => {
  //   try {
  //     const response = await apiClient.delete(`/api/pwa/push-notifications/notifications/${notificationId}`);
  //     return response.data;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: "Không thể xóa thông báo",
  //       errors: [error],
  //     };
  //   }
  // },

  // /**
  //  * Lấy thống kê notifications
  //  */
  // getNotificationStats: async (): Promise<ApiResponse<NotificationStats>> => {
  //   try {
  //     const response = await apiClient.get('/api/pwa/push-notifications/stats');
  //     return response.data;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: "Không thể lấy thống kê thông báo",
  //       errors: [error],
  //     };
  //   }
  // }
};
