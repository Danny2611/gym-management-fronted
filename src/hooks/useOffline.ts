import { useState, useEffect, useCallback } from 'react';
import { CacheManager } from '~/utils/cache';

export interface OfflineState {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingRequests: number;
  lastSync: Date | null;
}

export const useOffline = () => {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOfflineMode: false,
    pendingRequests: 0,
    lastSync: null
  });

  // Helper để lấy current auth token
  const getCurrentAuthToken = useCallback(() => {
    return localStorage.getItem('accessToken');
  }, []);

  // Cập nhật trạng thái online/offline
  const updateOnlineStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    setOfflineState(prev => ({
      ...prev,
      isOnline,
      isOfflineMode: !isOnline
    }));
  }, []);

  // ✅ FIX: Đồng bộ dữ liệu với current auth token
  const syncOfflineData = useCallback(async () => {
    if (!navigator.onLine) return;

    try {
      const offlineQueue = await CacheManager.getOfflineQueue();
      setOfflineState(prev => ({ ...prev, pendingRequests: offlineQueue.length }));

      // ✅ Lấy current auth token
      const currentToken = getCurrentAuthToken();
      if (!currentToken) {
        console.warn('No auth token available for sync');
        return;
      }

      for (const queueItem of offlineQueue) {
        try {
          console.log('Syncing request:', {
            id: queueItem.id,
            fullApiUrl: queueItem.fullApiUrl,
            method: queueItem.method,
            hasBody: !!queueItem.body
          });

          // ✅ FIX: Luôn sử dụng current token thay vì token đã cache
          const syncHeaders = {
            ...queueItem.headers,
            'Authorization': `Bearer ${currentToken}` // ✅ Override với current token
          };

          const response = await fetch(queueItem.fullApiUrl, {
            method: queueItem.method,
            headers: syncHeaders, // ✅ Sử dụng headers đã update
            body: queueItem.body
          });

          if (response.ok) {
            await CacheManager.removeFromOfflineQueue(queueItem.id);
            console.log('✅ Synced offline request:', queueItem.fullApiUrl);
          } else if (response.status === 401) {
            // ✅ Handle 401 - có thể token đã expire
            console.log('❌ Authentication failed during sync:', queueItem.fullApiUrl);
            console.log('Token may have expired, skipping this request');
            
            // Có thể xóa request khỏi queue nếu muốn, hoặc giữ lại để thử lại
            // await CacheManager.removeFromOfflineQueue(queueItem.id);
          } else {
            console.log('❌ Failed to sync request:', queueItem.fullApiUrl, 'Status:', response.status);
            
            try {
              const errorText = await response.text();
              console.log('Error response:', errorText);
            } catch (e) {
              console.log('Could not read error response');
            }
            
            // Xóa khỏi queue nếu là client error (4xx) trừ 401
            if (response.status >= 400 && response.status < 500 && response.status !== 401) {
              await CacheManager.removeFromOfflineQueue(queueItem.id);
              console.log('Removed invalid request from queue');
            }
          }
        } catch (error) {
          console.error('Failed to sync request:', queueItem.fullApiUrl, error);
        }
      }

      // Cập nhật số lượng pending requests
      const remainingQueue = await CacheManager.getOfflineQueue();
      setOfflineState(prev => ({
        ...prev,
        pendingRequests: remainingQueue.length,
        lastSync: new Date()
      }));

    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }, [getCurrentAuthToken]);

  // Cache-first data fetching với fallback
  const fetchWithCache = useCallback(async <T>(
    fetchFunction: () => Promise<T>,
    cacheKey: string,
    cacheDuration?: number
  ): Promise<T> => {
    try {
      // Thử lấy từ cache trước
      const cachedData = await CacheManager.getData(cacheKey);
      
      if (cachedData && (!navigator.onLine || offlineState.isOfflineMode)) {
        // Nếu offline hoặc có cache và đang ở offline mode, return cache
        return cachedData;
      }

      if (navigator.onLine) {
        try {
          // Thử fetch data mới
          const freshData = await fetchFunction();
          
          // Cache data mới
          await CacheManager.setData(cacheKey, freshData, cacheDuration);
          
          return freshData;
        } catch (error) {
          // Nếu network error, fallback về cache
          if (cachedData) {
            console.log('Network error, falling back to cache for:', cacheKey);
            return cachedData;
          }
          throw error;
        }
      } else {
        // Nếu offline và có cache
        if (cachedData) {
          return cachedData;
        }
        throw new Error('No cached data available offline');
      }
    } catch (error) {
      console.error('Error in fetchWithCache:', error);
      throw error;
    }
  }, [offlineState.isOfflineMode]);

  // ✅ FIX: Queue request với current auth token
  const queueOfflineRequest = useCallback(async (
    url: string,
    method: string,
    headers: Record<string, string>,
    body?: any
  ) => {
    // ✅ Lấy current auth token
    const currentToken = getCurrentAuthToken();
    
    // ✅ Merge current token vào headers
    const headersWithAuth = {
      ...headers,
      ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
    };

    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    await CacheManager.addToOfflineQueue({
      url: cleanUrl,
      method,
      headers: headersWithAuth, // ✅ Sử dụng headers có auth
      body
    });

    // Cập nhật số lượng pending requests
    const queue = await CacheManager.getOfflineQueue();
    setOfflineState(prev => ({
      ...prev,
      pendingRequests: queue.length
    }));
  }, [getCurrentAuthToken]);

  // Enhanced fetch function với offline support và auth
  const offlineAwareFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!navigator.onLine && options.method !== 'GET') {
      // ✅ Đảm bảo auth header được include khi queue
      const currentToken = getCurrentAuthToken();
      const headers = {
        ...Object.fromEntries(
          Object.entries(options.headers || {}).map(([k, v]) => [k, String(v)])
        ),
        ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
      };

      await queueOfflineRequest(
        url,
        options.method || 'GET',
        headers,
        options.body
      );

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Offline - Request queued for sync',
          queued: true
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // ✅ Normal fetch với current auth token cho online requests
    const currentToken = getCurrentAuthToken();
    const enhancedOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
      }
    };

    return fetch(url, enhancedOptions);
  }, [queueOfflineRequest, getCurrentAuthToken]);

  // Clear tất cả offline data
  const clearOfflineData = useCallback(async () => {
    await CacheManager.clearOfflineQueue();
    await CacheManager.clearAllCache();
    setOfflineState(prev => ({
      ...prev,
      pendingRequests: 0,
      lastSync: null
    }));
  }, []);

  // Get cache stats
  const getCacheStats = useCallback(async () => {
    const queue = await CacheManager.getOfflineQueue();
    return {
      pendingRequests: queue.length,
      queueItems: queue
    };
  }, []);

  useEffect(() => {
    // Lắng nghe sự kiện online/offline
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Sync data khi có mạng trở lại
    if (navigator.onLine && offlineState.pendingRequests > 0) {
      syncOfflineData();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [updateOnlineStatus, syncOfflineData, offlineState.pendingRequests]);

  // Định kỳ sync khi online
  useEffect(() => {
    if (!navigator.onLine) return;

    const syncInterval = setInterval(() => {
      if (offlineState.pendingRequests > 0) {
        syncOfflineData();
      }
    }, 30000); // Sync mỗi 30 giây

    return () => clearInterval(syncInterval);
  }, [syncOfflineData, offlineState.pendingRequests]);

  return {
    ...offlineState,
    fetchWithCache,
    offlineAwareFetch,
    queueOfflineRequest,
    syncOfflineData,
    clearOfflineData,
    getCacheStats,
    updateOnlineStatus
  };
};