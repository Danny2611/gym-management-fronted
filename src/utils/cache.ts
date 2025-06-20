// Cache management utilities with authentication support
export class CacheManager {
  private static readonly CACHE_NAMES = {
    API_DATA: 'dashboard-api-data-v1',
    OFFLINE_QUEUE: 'offline-queue-v1'
  };

  private static readonly CACHE_DURATION = {
    MEMBERSHIP: 5 * 60 * 1000, // 5 minutes
    WORKOUT: 2 * 60 * 1000,    // 2 minutes
    TRANSACTION: 10 * 60 * 1000, // 10 minutes
    PROMOTION: 30 * 60 * 1000,   // 30 minutes
  };

  // API Configuration
  private static readonly API_CONFIG = {
    BASE_URL: 'http://localhost:5000', // Backend URL
    FRONTEND_URL: 'http://localhost:5173' // Frontend URL
  };

  // ✅ Helper để lấy current auth token
  private static getCurrentAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Helper để get đúng API URL
  private static getFullApiUrl(url: string): string {
    if (url.startsWith('/api/')) {
      return `${this.API_CONFIG.BASE_URL}${url}`;
    }
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.API_CONFIG.BASE_URL}/${url}`;
  }

  // Lưu data vào cache
  static async setData(key: string, data: any, ttl?: number): Promise<void> {
    try {
      const cache = await caches.open(this.CACHE_NAMES.API_DATA);
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: ttl || 5 * 60 * 1000 // default 5 minutes
      };
      
      await cache.put(
        new Request(key),
        new Response(JSON.stringify(cacheData))
      );
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  // Lấy data từ cache
  static async getData(key: string): Promise<any | null> {
    try {
      const cache = await caches.open(this.CACHE_NAMES.API_DATA);
      const response = await cache.match(new Request(key));
      
      if (!response) return null;
      
      const cacheData = await response.json();
      const now = Date.now();
      
      // Kiểm tra TTL
      if (now - cacheData.timestamp > cacheData.ttl) {
        await this.removeData(key);
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  // Xóa data khỏi cache
  static async removeData(key: string): Promise<void> {
    try {
      const cache = await caches.open(this.CACHE_NAMES.API_DATA);
      await cache.delete(new Request(key));
    } catch (error) {
      console.error('Error removing cached data:', error);
    }
  }

  // Clear tất cả cache
  static async clearAllCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Cache methods cho từng loại data
  static async cacheMembershipDetails(data: any): Promise<void> {
    await this.setData('membership-details', data, this.CACHE_DURATION.MEMBERSHIP);
  }

  static async getCachedMembershipDetails(): Promise<any | null> {
    return await this.getData('membership-details');
  }

  static async cacheWeeklyWorkout(data: any): Promise<void> {
    await this.setData('weekly-workout', data, this.CACHE_DURATION.WORKOUT);
  }

  static async getCachedWeeklyWorkout(): Promise<any | null> {
    return await this.getData('weekly-workout');
  }

  static async cacheUpcomingWorkouts(data: any): Promise<void> {
    await this.setData('upcoming-workouts', data, this.CACHE_DURATION.WORKOUT);
  }

  static async getCachedUpcomingWorkouts(): Promise<any | null> {
    return await this.getData('upcoming-workouts');
  }

  static async cacheUpcomingAppointments(data: any): Promise<void> {
    await this.setData('upcoming-appointments', data, this.CACHE_DURATION.WORKOUT);
  }

  static async getCachedUpcomingAppointments(): Promise<any | null> {
    return await this.getData('upcoming-appointments');
  }

  static async cacheTransactions(data: any): Promise<void> {
    await this.setData('recent-transactions', data, this.CACHE_DURATION.TRANSACTION);
  }

  static async getCachedTransactions(): Promise<any | null> {
    return await this.getData('recent-transactions');
  }

  static async cachePromotions(data: any): Promise<void> {
    await this.setData('promotions', data, this.CACHE_DURATION.PROMOTION);
  }

  static async getCachedPromotions(): Promise<any | null> {
    return await this.getData('promotions');
  }

  // ✅ FIX: Offline queue management với authentication
  static async addToOfflineQueue(requestData: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  }): Promise<void> {
    try {
      const cache = await caches.open(this.CACHE_NAMES.OFFLINE_QUEUE);
      const fullApiUrl = this.getFullApiUrl(requestData.url);
      
      // ✅ Đảm bảo current auth token được include
      const currentToken = this.getCurrentAuthToken();
      const headersWithAuth: Record<string, string> = {
      ...requestData.headers,
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
    };

      
      // ✅ Đảm bảo body được serialize thành JSON string nếu cần
      let bodyString: string | undefined;
      if (requestData.body !== undefined && !['GET', 'HEAD'].includes(requestData.method)) {
        if (typeof requestData.body === 'string') {
          bodyString = requestData.body;
        } else {
          // Nếu body là object, stringify nó
          bodyString = JSON.stringify(requestData.body);
        }
      }
      
      const queueItem = {
        originalUrl: requestData.url, // URL gốc
        fullApiUrl, // URL đầy đủ cho backend
        method: requestData.method,
        headers: {
          ...headersWithAuth, // ✅ Sử dụng headers có auth
          // Đảm bảo Content-Type được set nếu có body
          ...(bodyString && {
            'Content-Type': headersWithAuth['Content-Type'] || 'application/json'
          })
        },
        body: bodyString, // ✅ Đã là JSON string
        timestamp: Date.now(),
        id: `offline-${Date.now()}-${Math.random()}`,
        // ✅ Lưu thông tin về token tại thời điểm cache
        authTokenAtCache: currentToken ? true : false
      };
      
      console.log('Adding to offline queue:', {
        original: requestData.url,
        fullApi: fullApiUrl,
        method: requestData.method,
        bodyType: typeof bodyString,
        hasBody: !!bodyString,
        hasAuth: !!currentToken
      });
      
      await cache.put(
        new Request(queueItem.id),
        new Response(JSON.stringify(queueItem))
      );
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  static async getOfflineQueue(): Promise<any[]> {
    try {
      const cache = await caches.open(this.CACHE_NAMES.OFFLINE_QUEUE);
      const requests = await cache.keys();
      const queueItems = [];
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const item = await response.json();
          queueItems.push(item);
        }
      }
      
      return queueItems.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  static async removeFromOfflineQueue(id: string): Promise<void> {
    try {
      const cache = await caches.open(this.CACHE_NAMES.OFFLINE_QUEUE);
      await cache.delete(new Request(id));
    } catch (error) {
      console.error('Error removing from offline queue:', error);
    }
  }

  static async clearOfflineQueue(): Promise<void> {
    try {
      const cache = await caches.open(this.CACHE_NAMES.OFFLINE_QUEUE);
      const requests = await cache.keys();
      await Promise.all(requests.map(request => cache.delete(request)));
    } catch (error) {
      console.error('Error clearing offline queue:', error);
    }
  }

  // ✅ FIX: Manual sync với current auth token
  static async syncOfflineQueue(): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const queue = await this.getOfflineQueue();
      const currentToken = this.getCurrentAuthToken();
      
      if (!currentToken) {
        return { 
          success: false, 
          processed: 0, 
          failed: queue.length, 
          errors: ['No authentication token available'] 
        };
      }

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const queueItem of queue) {
        try {
          console.log('Syncing request:', {
            id: queueItem.id,
            fullApiUrl: queueItem.fullApiUrl,
            method: queueItem.method,
            hasBody: !!queueItem.body
          });

          // ✅ Luôn sử dụng current token
          const syncHeaders = {
            ...queueItem.headers,
            'Authorization': `Bearer ${currentToken}` // Override với current token
          };

          const fetchOptions: RequestInit = {
            method: queueItem.method,
            headers: syncHeaders
          };

          // Chỉ thêm body nếu method hỗ trợ
          if (queueItem.body && !['GET', 'HEAD'].includes(queueItem.method)) {
            fetchOptions.body = queueItem.body;
          }

          const response = await fetch(queueItem.fullApiUrl, fetchOptions);

          if (response.ok) {
            await this.removeFromOfflineQueue(queueItem.id);
            processed++;
            console.log('✅ Successfully synced:', queueItem.fullApiUrl);
          } else if (response.status === 401) {
            console.log('❌ Authentication failed during sync:', queueItem.fullApiUrl);
            errors.push(`Auth failed for ${queueItem.originalUrl}`);
            failed++;
            // Có thể xóa hoặc giữ lại tùy logic business
          } else {
            console.log('❌ Failed to sync:', queueItem.fullApiUrl, 'Status:', response.status);
            
            try {
              const errorText = await response.text();
              errors.push(`${queueItem.originalUrl}: ${response.status} - ${errorText}`);
            } catch (e) {
              errors.push(`${queueItem.originalUrl}: ${response.status}`);
            }
            
            // Xóa client errors (trừ 401)
            if (response.status >= 400 && response.status < 500 && response.status !== 401) {
              await this.removeFromOfflineQueue(queueItem.id);
            }
            failed++;
          }
        } catch (error) {
          console.error('Failed to sync request:', queueItem.fullApiUrl, error);
          errors.push(`${queueItem.originalUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          failed++;
        }
      }

      return { success: processed > 0, processed, failed, errors };
    } catch (error) {
      console.error('Error syncing offline queue:', error);
      return { 
        success: false, 
        processed: 0, 
        failed: 0, 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      };
    }
  }

  // Service Worker communication methods
  static async getQueueStatus(): Promise<{
    queueLength: number;
    items: any[];
  }> {
    try {
      if ('serviceWorker' in navigator) {
        const controller = navigator.serviceWorker.controller;
        if (!controller) return { queueLength: 0, items: [] };

        const messageChannel = new MessageChannel();

        return new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data || { queueLength: 0, items: [] });
          };

          // Set timeout
          setTimeout(() => {
            resolve({ queueLength: 0, items: [] });
          }, 10000); // 10 seconds timeout

          controller.postMessage(
            { type: 'GET_QUEUE_STATUS' },
            [messageChannel.port2]
          );
        });
      }
      return { queueLength: 0, items: [] };
    } catch (error) {
      console.error('Error getting queue status:', error);
      return { queueLength: 0, items: [] };
    }
  }

  // Listen for sync success messages
  static setupSyncListener(onSyncSuccess?: (data: any) => void): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'OFFLINE_SYNC_SUCCESS') {
          console.log('Offline sync success:', event.data.data);
          onSyncSuccess?.(event.data.data);
        }
      });
    }
  }

  // ✅ NEW: Method để check và clean expired tokens từ queue
  static async cleanExpiredTokenRequests(): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const currentToken = this.getCurrentAuthToken();
      
      // Nếu không có token hiện tại, clear toàn bộ queue
      if (!currentToken) {
        await this.clearOfflineQueue();
        console.log('Cleared offline queue due to no auth token');
        return;
      }

      // Xóa các requests có token cũ hoặc không có token
      for (const item of queue) {
        const itemToken = item.headers?.Authorization?.replace('Bearer ', '');
        if (!itemToken || itemToken !== currentToken) {
          await this.removeFromOfflineQueue(item.id);
          console.log('Removed outdated auth request:', item.originalUrl);
        }
      }
    } catch (error) {
      console.error('Error cleaning expired token requests:', error);
    }
  }
}

// Helper functions
export const getCacheKey = (endpoint: string, params?: Record<string, any>): string => {
  const baseKey = endpoint.replace('/api/', '').replace(/\//g, '-');
  if (params) {
    const paramString = Object.keys(params)
      .sort() // Đảm bảo thứ tự consistent
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${baseKey}?${paramString}`;
  }
  return baseKey;
};

export const isDataFresh = (timestamp: number, maxAge: number): boolean => {
  return Date.now() - timestamp < maxAge;
};

export const formatCacheSize = async (): Promise<{
  totalSize: string;
  cacheCount: number;
}> => {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    let cacheCount = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      cacheCount += requests.length;
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    return {
      totalSize: `${sizeInMB} MB`,
      cacheCount
    };
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return { totalSize: '0 MB', cacheCount: 0 };
  }
};

// Network status utilities
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
};