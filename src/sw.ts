/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// API Configuration - Cấu hình đúng base URL
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL, // Backend URL
  FRONTEND_URL: import.meta.env.VITE_APP_URL // Frontend URL
};

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache tên và TTL
const CACHE_NAMES = {
  API_CACHE: 'api-cache-v1',
  STATIC_CACHE: 'static-cache-v1',
  OFFLINE_QUEUE: 'offline-queue-v1'
};

// Helper function để get đúng API URL
function getFullApiUrl(url: string): string {
  if (url.startsWith('/api/')) {
    return `${API_CONFIG.BASE_URL}${url}`;
  }
  if (url.startsWith('http')) {
    return url;
  }
  return `${API_CONFIG.BASE_URL}/${url}`;
}

// Helper function để extract relative path từ full URL
function getRelativePath(fullUrl: string): string {
  try {
    const url = new URL(fullUrl);
    return url.pathname + url.search;
  } catch {
    return fullUrl;
  }
}

// Cache cho static assets (images, fonts, etc.)
registerRoute(
  ({ request }) => 
    request.destination === 'image' || 
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script',
  new CacheFirst({
    cacheName: CACHE_NAMES.STATIC_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache cho API calls (chỉ GET requests)
registerRoute(
  ({ url, request }) => 
    url.pathname.startsWith('/api/') && request.method === 'GET',
  new NetworkFirst({
    cacheName: CACHE_NAMES.API_CACHE,
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Offline queue cho các requests không thành công
const offlineQueue: Array<{
  originalUrl: string;
  fullApiUrl: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  id: string;
}> = [];

// Xử lý các requests không thành công (POST, PATCH, PUT, DELETE)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Chỉ xử lý API requests không phải GET
  if (request.url.includes('/api/') && request.method !== 'GET') {
    event.respondWith(
      fetch(request.clone()).catch(async (error) => {
        console.log('Network request failed, adding to offline queue:', request.url);
        
        const originalUrl = getRelativePath(request.url);
        const fullApiUrl = getFullApiUrl(originalUrl);
        
        // ✅ FIX: Đảm bảo body được serialize đúng cách
        let bodyString: string | undefined;
        try {
          if (request.method !== 'GET' && request.method !== 'HEAD') {
            const bodyText = await request.clone().text();
            // Nếu body đã là string thì giữ nguyên, nếu không thì stringify
            bodyString = bodyText;
          }
        } catch (err) {
          console.error('Error reading request body:', err);
        }
        
        // Thêm vào offline queue với đúng URL
        const requestData = {
          originalUrl, // URL gốc từ frontend
          fullApiUrl,  // URL đầy đủ để gọi API
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          body: bodyString, // ✅ Đã là string
          timestamp: Date.now(),
          id: `offline-${Date.now()}-${Math.random()}`
        };
        
        offlineQueue.push(requestData);
        
        // Lưu vào cache
        const cache = await caches.open(CACHE_NAMES.OFFLINE_QUEUE);
        await cache.put(
          new Request(requestData.id),
          new Response(JSON.stringify(requestData))
        );
        
        console.log('Cached request:', {
          original: originalUrl,
          fullApi: fullApiUrl,
          method: request.method,
          bodyLength: bodyString?.length || 0
        });
        
        // Trả về response báo lỗi
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Không có kết nối mạng. Yêu cầu sẽ được thực hiện khi có mạng.',
            cached: true,
            queueId: requestData.id
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
  }
});

// Background sync khi có mạng trở lại
self.addEventListener('online', async () => {
  console.log('Network is back online, processing offline queue');
  await processOfflineQueue();
});

// Xử lý offline queue
async function processOfflineQueue() {
  console.log('Processing offline queue...');
  const cache = await caches.open(CACHE_NAMES.OFFLINE_QUEUE);
  const requests = await cache.keys();
  
  console.log(`Found ${requests.length} requests in offline queue`);
  
  for (const request of requests) {
    try {
      const response = await cache.match(request);
      if (response) {
        const requestData = await response.json();
        
        console.log('Processing request:', {
          id: requestData.id,
          url: requestData.fullApiUrl,
          method: requestData.method,
          hasBody: !!requestData.body
        });
        
        // ✅ FIX: Đảm bảo headers và body được xử lý đúng
        const fetchOptions: RequestInit = {
          method: requestData.method,
          headers: {
            ...requestData.headers,
            // Đảm bảo Content-Type được set cho requests có body
            ...(requestData.body && {
              'Content-Type': requestData.headers['Content-Type'] || 'application/json'
            })
          }
        };

        // Chỉ thêm body nếu method hỗ trợ
        if (requestData.body && !['GET', 'HEAD'].includes(requestData.method)) {
          fetchOptions.body = requestData.body; // Body đã là string
        }
        
        // Thử gửi lại request với đúng URL
        const fetchResponse = await fetch(requestData.fullApiUrl, fetchOptions);
        
        if (fetchResponse.ok) {
          // Xóa khỏi cache nếu thành công
          await cache.delete(request);
          console.log('✅ Successfully processed offline request:', requestData.fullApiUrl);
          
          // Thông báo cho client về việc sync thành công
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'OFFLINE_SYNC_SUCCESS',
              data: {
                id: requestData.id,
                url: requestData.originalUrl,
                method: requestData.method,
                response: fetchResponse.status
              }
            });
          });
        } else {
          console.log('❌ Failed to process offline request:', requestData.fullApiUrl, 'Status:', fetchResponse.status);
          
          // Log response text để debug
          try {
            const errorText = await fetchResponse.text();
            console.log('Error response:', errorText);
          } catch (e) {
            console.log('Could not read error response');
          }
          
          // Nếu là lỗi client (4xx), xóa khỏi queue
          if (fetchResponse.status >= 400 && fetchResponse.status < 500) {
            await cache.delete(request);
            console.log('Removed invalid request from queue');
          }
        }
      }
    } catch (error) {
      console.error('Failed to process offline request:', error);
      // Giữ lại trong queue để thử lại sau
    }
  }
  
  // Check remaining queue
  const remainingRequests = await cache.keys();
  console.log(`Offline queue processing complete. ${remainingRequests.length} requests remaining.`);
}

// Manual sync trigger từ client
self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SYNC_OFFLINE_QUEUE') {
    console.log('Manual sync triggered from client');
    await processOfflineQueue();
    event.ports[0]?.postMessage({ success: true });
  }
  
  if (event.data?.type === 'GET_QUEUE_STATUS') {
    const cache = await caches.open(CACHE_NAMES.OFFLINE_QUEUE);
    const requests = await cache.keys();
    event.ports[0]?.postMessage({ 
      queueLength: requests.length,
      items: await Promise.all(
        requests.map(async (req) => {
          const response = await cache.match(req);
          return response ? await response.json() : null;
        })
      )
    });
  }
});

// Periodic check cho network status
setInterval(async () => {
  if (navigator.onLine) {
    const cache = await caches.open(CACHE_NAMES.OFFLINE_QUEUE);
    const requests = await cache.keys();
    if (requests.length > 0) {
      console.log('Periodic check: Found pending requests, processing...');
      await processOfflineQueue();
    }
  }
}, 30000); // Check every 30 seconds

// Periodic background sync (nếu browser hỗ trợ)
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'offline-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  let notificationData;
  
  try {
    // Parse JSON data từ push event
    const rawData = event.data?.text();
    console.log('Raw push data:', rawData);
    
    if (rawData) {
      notificationData = JSON.parse(rawData);
      console.log('Parsed notification data:', notificationData);
    }
  } catch (error) {
    console.error('Error parsing push data:', error);
    notificationData = null;
  }

  // Tạo options cho notification
  const options = {
    body: notificationData?.body || notificationData?.message || 'Bạn có thông báo mới từ FitLife',
    icon: notificationData?.icon || '/icons/icon-192x192.png',
    badge: notificationData?.badge || '/icons/icon-96x96.png',
    tag: notificationData?.data?.notificationId || 'fitlife-notification',
    data: {
      url: notificationData?.data?.url || '/',
      notificationId: notificationData?.data?.notificationId,
      type: notificationData?.data?.type,
      ...notificationData?.data
    },
    actions: notificationData?.actions || [
      { action: 'view', title: 'Xem chi tiết' },
      { action: 'close', title: 'Đóng' }
    ],
    requireInteraction: false,
    silent: false
  };

  // Hiển thị notification
  const title = notificationData?.title || 'FitLife Gym';
  
  console.log('Showing notification:', title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});


// Xử lý khi user click vào notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Lấy URL từ data
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Tìm tab đã mở với URL tương tự
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Nếu không tìm thấy, mở tab mới
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
console.log('Service Worker loaded successfully with API URL:', API_CONFIG.BASE_URL);