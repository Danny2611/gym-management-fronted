// src/utils/backgroundSync.ts - Background Sync Management
export interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
  action: string; // Description of the action
}

export interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ item: SyncQueueItem; error: string }>;
}

export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolveData?: any;
}

export class BackgroundSyncManager {
  private static instance: BackgroundSyncManager;
  private db: IDBDatabase | null = null;
  
  // Database configuration
  private static readonly DB_NAME = 'FitLifeOfflineDB';
  private static readonly DB_VERSION = 1;
  private static readonly SYNC_STORE = 'syncQueue';
  private static readonly SYNC_TAG = 'fitlife-background-sync';
  
  // Retry configuration
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s
  
  private constructor() {}

  static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance;
  }

  // Initialize IndexedDB
  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(BackgroundSyncManager.DB_NAME, BackgroundSyncManager.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(BackgroundSyncManager.SYNC_STORE)) {
          const store = db.createObjectStore(BackgroundSyncManager.SYNC_STORE, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Create indexes for efficient querying
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('url', 'url', { unique: false });
          store.createIndex('method', 'method', { unique: false });
        }
      };
    });
  }

  // Add request to sync queue
  async queueRequest(
    url: string, 
    method: string, 
    data?: any, 
    options?: {
      priority?: 'high' | 'medium' | 'low';
      action?: string;
      headers?: Record<string, string>;
    }
  ): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([BackgroundSyncManager.SYNC_STORE], 'readwrite');
      const store = transaction.objectStore(BackgroundSyncManager.SYNC_STORE);
      
      const queueItem: SyncQueueItem = {
        url,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        body: data ? JSON.stringify(data) : null,
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 0,
        priority: options?.priority || 'medium',
        action: options?.action || `${method.toUpperCase()} ${url}`
      };

      return new Promise((resolve, reject) => {
        const request = store.add(queueItem);
        request.onsuccess = () => {
          console.log(`📝 Queued for sync: ${queueItem.action}`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error queuing request:', error);
      throw error;
    }
  }

  // Get pending sync items
  async getPendingItems(): Promise<SyncQueueItem[]> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([BackgroundSyncManager.SYNC_STORE], 'readonly');
      const store = transaction.objectStore(BackgroundSyncManager.SYNC_STORE);
      const index = store.index('status');
      
      return new Promise((resolve, reject) => {
        const request = index.getAll('pending');
        request.onsuccess = () => {
          // Sort by priority and timestamp
          const items = request.result.sort((a: SyncQueueItem, b: SyncQueueItem) => {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityWeight[a.priority];
            const bPriority = priorityWeight[b.priority];
            
            if (aPriority !== bPriority) {
              return bPriority - aPriority; // Higher priority first
            }
            
            return a.timestamp - b.timestamp; // Older first
          });
          
          resolve(items);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error getting pending items:', error);
      return [];
    }
  }

  // Update sync item status
  async updateItemStatus(
    id: number, 
    status: 'pending' | 'completed' | 'failed', 
    retryCount?: number
  ): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([BackgroundSyncManager.SYNC_STORE], 'readwrite');
      const store = transaction.objectStore(BackgroundSyncManager.SYNC_STORE);
      
      return new Promise((resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const item = getRequest.result;
          if (item) {
            item.status = status;
            if (retryCount !== undefined) {
              item.retryCount = retryCount;
            }
            
            const putRequest = store.put(item);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            resolve();
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (error) {
      console.error('❌ Error updating item status:', error);
    }
  }

  // Process single sync item
  private async processSyncItem(item: SyncQueueItem): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔄 Processing: ${item.action}`);
      
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });

      if (response.ok) {
        await this.updateItemStatus(item.id!, 'completed');
        console.log(`✅ Synced: ${item.action}`);
        return { success: true };
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Sync failed: ${item.action}`, errorMessage);
      
      const newRetryCount = item.retryCount + 1;
      
      if (newRetryCount >= BackgroundSyncManager.MAX_RETRIES) {
        await this.updateItemStatus(item.id!, 'failed', newRetryCount);
        console.error(`💀 Max retries exceeded: ${item.action}`);
      } else {
        await this.updateItemStatus(item.id!, 'pending', newRetryCount);
        console.log(`🔄 Will retry (${newRetryCount}/${BackgroundSyncManager.MAX_RETRIES}): ${item.action}`);
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Process all pending sync items
  async processQueue(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    };

    try {
      const pendingItems = await this.getPendingItems();
      console.log(`🔄 Processing ${pendingItems.length} pending sync items`);

      if (pendingItems.length === 0) {
        console.log('✅ No items to sync');
        return result;
      }

      // Process items sequentially to avoid overwhelming the server
      for (const item of pendingItems) {
        const itemResult = await this.processSyncItem(item);
        
        result.processed++;
        
        if (itemResult.success) {
          // Success - continue
        } else {
          result.failed++;
          result.errors.push({ item, error: itemResult.error || 'Unknown error' });
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      result.success = result.failed === 0;
      
      console.log(`✅ Sync completed: ${result.processed - result.failed}/${result.processed} successful`);
      
      return result;
    } catch (error) {
      console.error('❌ Error processing sync queue:', error);
      result.success = false;
      return result;
    }
  }

  // Register background sync
  async registerBackgroundSync(): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        
        
        const syncManager = (registration as any).sync;

      if (syncManager && typeof syncManager.register === 'function') {
        await syncManager.register(BackgroundSyncManager.SYNC_TAG);
        console.log('✅ Background sync registered');
        return true;
      }
      }
      
      console.warn('⚠️ Background sync not supported');
      return false;
    } catch (error) {
      console.error('❌ Error registering background sync:', error);
      return false;
    }
  }

  // Manual sync trigger (fallback for unsupported browsers)
  async manualSync(): Promise<SyncResult> {
    if (!navigator.onLine) {
      console.warn('⚠️ Cannot sync: offline');
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: []
      };
    }

    return await this.processQueue();
  }

  // Get sync queue statistics
  async getQueueStats(): Promise<{
    pending: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([BackgroundSyncManager.SYNC_STORE], 'readonly');
      const store = transaction.objectStore(BackgroundSyncManager.SYNC_STORE);
      
      const stats = {
        pending: 0,
        completed: 0,
        failed: 0,
        total: 0
      };

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const items: SyncQueueItem[] = request.result;
          stats.total = items.length;
          
          items.forEach(item => {
            stats[item.status]++;
          });
          
          resolve(stats);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error getting queue stats:', error);
      return { pending: 0, completed: 0, failed: 0, total: 0 };
    }
  }

  // Clear completed items from queue
  async clearCompleted(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([BackgroundSyncManager.SYNC_STORE], 'readwrite');
      const store = transaction.objectStore(BackgroundSyncManager.SYNC_STORE);
      const index = store.index('status');
      
      return new Promise((resolve, reject) => {
        const request = index.getAll('completed');
        request.onsuccess = () => {
          const completedItems: SyncQueueItem[] = request.result;
          
          completedItems.forEach(item => {
            if (item.id) {
              store.delete(item.id);
            }
          });
          
          console.log(`🗑️ Cleared ${completedItems.length} completed sync items`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error clearing completed items:', error);
    }
  }

  // Clear all sync queue
  async clearQueue(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([BackgroundSyncManager.SYNC_STORE], 'readwrite');
      const store = transaction.objectStore(BackgroundSyncManager.SYNC_STORE);
      
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => {
          console.log('🗑️ Sync queue cleared');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error clearing sync queue:', error);
      throw error;
    }
  }

  // High-level methods for common operations
  
  async queueUserProfileUpdate(profileData: any): Promise<void> {
    await this.queueRequest('/api/user/profile', 'PUT', profileData, {
      priority: 'high',
      action: 'Cập nhật thông tin cá nhân'
    });
  }

  async queueAppointmentBooking(appointmentData: any): Promise<void> {
    await this.queueRequest('/api/user/appointments', 'POST', appointmentData, {
      priority: 'high',
      action: 'Đặt lịch tập'
    });
  }

  async queueAppointmentCancellation(appointmentId: string): Promise<void> {
    await this.queueRequest(`/api/user/appointments/${appointmentId}`, 'DELETE', null, {
      priority: 'medium',
      action: 'Hủy lịch tập'
    });
  }

  async queueWorkoutLog(workoutData: any): Promise<void> {
    await this.queueRequest('/api/user/workout/log', 'POST', workoutData, {
      priority: 'low',
      action: 'Ghi nhận bài tập'
    });
  }

  async queueFeedback(feedbackData: any): Promise<void> {
    await this.queueRequest('/api/user/feedback', 'POST', feedbackData, {
      priority: 'low',
      action: 'Gửi phản hồi'
    });
  }
}

// Export singleton instance
export const backgroundSync = BackgroundSyncManager.getInstance();

// Utility functions for easier usage
export const syncUtils = {
  // Queue a generic request
  queue: (url: string, method: string, data?: any, options?: any) => 
    backgroundSync.queueRequest(url, method, data, options),
    
  // Process queue manually
  sync: () => backgroundSync.manualSync(),
  
  // Get statistics
  getStats: () => backgroundSync.getQueueStats(),
  
  // Clear completed items
  cleanup: () => backgroundSync.clearCompleted(),
  
  // Check if background sync is supported
  isSupported: () => 
    'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
};