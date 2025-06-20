// // src/utils/cacheManager.ts - Unified Cache Manager
// export interface CacheConfig {
//   ttl?: number; // Time to live in milliseconds
//   store: string;
// }

// export interface CachedItem {
//   id?: number;
//   url: string;
//   data: any;
//   timestamp: number;
//   expiry: number;
//   cached: boolean;
// }

// export class CacheManager {
//   private static instance: CacheManager;
//   private db: IDBDatabase | null = null;
  
//   // Database configuration
//   private static readonly DB_NAME = 'FitLifeOfflineDB';
//   private static readonly DB_VERSION = 1;
  
//   // Store names - synchronized with Service Worker
//   public static readonly STORES = {
//     USER_DATA: 'userData',
//     APPOINTMENTS: 'appointments',
//     WORKOUTS: 'workouts', 
//     TRANSACTIONS: 'transactions',
//     PROMOTIONS: 'promotions',
//     SYNC_QUEUE: 'syncQueue'
//   };

//   // Cache configurations for different data types
//   private static readonly CACHE_CONFIGS: Record<string, CacheConfig> = {
//     // User data - cache for 1 hour
//     USER_PROFILE: { ttl: 60 * 60 * 1000, store: CacheManager.STORES.USER_DATA },
//     USER_MEMBERSHIP: { ttl: 60 * 60 * 1000, store: CacheManager.STORES.USER_DATA },
    
//     // Appointments - cache for 30 minutes
//     USER_APPOINTMENTS: { ttl: 30 * 60 * 1000, store: CacheManager.STORES.APPOINTMENTS },
    
//     // Workouts - cache for 2 hours
//     USER_WORKOUTS: { ttl: 2 * 60 * 60 * 1000, store: CacheManager.STORES.WORKOUTS },
    
//     // Transactions - cache for 6 hours
//     USER_TRANSACTIONS: { ttl: 6 * 60 * 60 * 1000, store: CacheManager.STORES.TRANSACTIONS },
    
//     // Promotions - cache for 12 hours
//     PUBLIC_PROMOTIONS: { ttl: 12 * 60 * 60 * 1000, store: CacheManager.STORES.PROMOTIONS },
//   };

//   private constructor() {}

//   static getInstance(): CacheManager {
//     if (!CacheManager.instance) {
//       CacheManager.instance = new CacheManager();
//     }
//     return CacheManager.instance;
//   }

//   // Initialize IndexedDB
//   async initDB(): Promise<IDBDatabase> {
//     if (this.db) return this.db;

//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(CacheManager.DB_NAME, CacheManager.DB_VERSION);
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => {
//         this.db = request.result;
//         resolve(this.db);
//       };
      
//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
        
//         // Create object stores
//         Object.values(CacheManager.STORES).forEach(storeName => {
//           if (!db.objectStoreNames.contains(storeName)) {
//             const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
//             store.createIndex('url', 'url', { unique: false });
//             store.createIndex('timestamp', 'timestamp', { unique: false });
            
//             // Special indexes for sync queue
//             if (storeName === CacheManager.STORES.SYNC_QUEUE) {
//               store.createIndex('status', 'status', { unique: false });
//               store.createIndex('method', 'method', { unique: false });
//             }
//           }
//         });
//       };
//     });
//   }

//   // Generic cache operations
//   async set(key: string, data: any, customTTL?: number): Promise<void> {
//     const config = CacheManager.CACHE_CONFIGS[key];
//     if (!config) {
//       throw new Error(`No cache configuration found for key: ${key}`);
//     }

//     const ttl = customTTL || config.ttl || 60 * 60 * 1000; // Default 1 hour
//     const expiry = Date.now() + ttl;

//     try {
//       const db = await this.initDB();
//       const transaction = db.transaction([config.store], 'readwrite');
//       const store = transaction.objectStore(config.store);
      
//       const cacheItem: CachedItem = {
//         url: key,
//         data,
//         timestamp: Date.now(),
//         expiry,
//         cached: true
//       };

//       return new Promise((resolve, reject) => {
//         // Check if item exists
//         const getRequest = store.index('url').get(key);
        
//         getRequest.onsuccess = () => {
//           const existing = getRequest.result;
//           if (existing) {
//             cacheItem.id = existing.id;
//           }
          
//           const putRequest = store.put(cacheItem);
//           putRequest.onsuccess = () => {
//             console.log(`✅ Cached: ${key}`);
//             resolve();
//           };
//           putRequest.onerror = () => reject(putRequest.error);
//         };
        
//         getRequest.onerror = () => reject(getRequest.error);
//       });
//     } catch (error) {
//       console.error(`❌ Error caching ${key}:`, error);
//       throw error;
//     }
//   }

//   async get(key: string): Promise<any | null> {
//     const config = CacheManager.CACHE_CONFIGS[key];
//     if (!config) {
//       console.warn(`No cache configuration found for key: ${key}`);
//       return null;
//     }

//     try {
//       const db = await this.initDB();
//       const transaction = db.transaction([config.store], 'readonly');
//       const store = transaction.objectStore(config.store);
//       const index = store.index('url');
      
//       return new Promise((resolve, reject) => {
//         const request = index.get(key);
        
//         request.onsuccess = () => {
//           const result = request.result;
          
//           if (!result) {
//             resolve(null);
//             return;
//           }

//           // Check if expired
//           if (Date.now() > result.expiry) {
//             console.log(`🗑️ Expired cache removed: ${key}`);
//             this.delete(key); // Don't await to avoid blocking
//             resolve(null);
//             return;
//           }

//           console.log(`📦 Cache hit: ${key}`);
//           resolve(result.data);
//         };
        
//         request.onerror = () => reject(request.error);
//       });
//     } catch (error) {
//       console.error(`❌ Error getting cache ${key}:`, error);
//       return null;
//     }
//   }

//   async delete(key: string): Promise<void> {
//     const config = CacheManager.CACHE_CONFIGS[key];
//     if (!config) return;

//     try {
//       const db = await this.initDB();
//       const transaction = db.transaction([config.store], 'readwrite');
//       const store = transaction.objectStore(config.store);
//       const index = store.index('url');
      
//       return new Promise((resolve, reject) => {
//         const getRequest = index.get(key);
        
//         getRequest.onsuccess = () => {
//           const result = getRequest.result;
//           if (result) {
//             const deleteRequest = store.delete(result.id);
//             deleteRequest.onsuccess = () => resolve();
//             deleteRequest.onerror = () => reject(deleteRequest.error);
//           } else {
//             resolve();
//           }
//         };
        
//         getRequest.onerror = () => reject(getRequest.error);
//       });
//     } catch (error) {
//       console.error(`❌ Error deleting cache ${key}:`, error);
//     }
//   }

//   // Specific cache methods for app data
//   async cacheUserProfile(userData: any): Promise<void> {
//     await this.set('USER_PROFILE', userData);
//   }

//   async getCachedUserProfile(): Promise<any | null> {
//     return await this.get('USER_PROFILE');
//   }

//   async cacheUserMembership(membership: any): Promise<void> {
//     await this.set('USER_MEMBERSHIP', membership);
//   }

//   async getCachedUserMembership(): Promise<any | null> {
//     return await this.get('USER_MEMBERSHIP');
//   }

//   async cacheUserAppointments(appointments: any): Promise<void> {
//     await this.set('USER_APPOINTMENTS', appointments);
//   }

//   async getCachedUserAppointments(): Promise<any | null> {
//     return await this.get('USER_APPOINTMENTS');
//   }

//   async cacheUserWorkouts(workouts: any): Promise<void> {
//     await this.set('USER_WORKOUTS', workouts);
//   }

//   async getCachedUserWorkouts(): Promise<any | null> {
//     return await this.get('USER_WORKOUTS');
//   }

//   async cacheUserTransactions(transactions: any): Promise<void> {
//     await this.set('USER_TRANSACTIONS', transactions);
//   }

//   async getCachedUserTransactions(): Promise<any | null> {
//     return await this.get('USER_TRANSACTIONS');
//   }

//   async cachePromotions(promotions: any): Promise<void> {
//     await this.set('PUBLIC_PROMOTIONS', promotions);
//   }

//   async getCachedPromotions(): Promise<any | null> {
//     return await this.get('PUBLIC_PROMOTIONS');
//   }

//   // Batch operations for complete user data
//   async cacheAllUserData(data: {
//     profile?: any;
//     membership?: any;
//     appointments?: any;
//     workouts?: any;
//     transactions?: any;
//   }): Promise<void> {
//     const promises: Promise<void>[] = [];

//     if (data.profile) promises.push(this.cacheUserProfile(data.profile));
//     if (data.membership) promises.push(this.cacheUserMembership(data.membership));
//     if (data.appointments) promises.push(this.cacheUserAppointments(data.appointments));
//     if (data.workouts) promises.push(this.cacheUserWorkouts(data.workouts));
//     if (data.transactions) promises.push(this.cacheUserTransactions(data.transactions));

//     try {
//       await Promise.all(promises);
//       console.log('✅ All user data cached successfully');
//     } catch (error) {
//       console.error('❌ Error caching user data:', error);
//       throw error;
//     }
//   }

//   async getCachedAllUserData(): Promise<{
//     profile: any;
//     membership: any;
//     appointments: any;
//     workouts: any;
//     transactions: any;
//   } | null> {
//     try {
//       const [profile, membership, appointments, workouts, transactions] = await Promise.all([
//         this.getCachedUserProfile(),
//         this.getCachedUserMembership(),
//         this.getCachedUserAppointments(),
//         this.getCachedUserWorkouts(),
//         this.getCachedUserTransactions()
//       ]);

//       // Return null if no essential data is cached
//       if (!profile && !membership) {
//         return null;
//       }

//       return {
//         profile,
//         membership,
//         appointments,
//         workouts,
//         transactions
//       };
//     } catch (error) {
//       console.error('❌ Error getting cached user data:', error);
//       return null;
//     }
//   }

//   // Clear cache operations
//   async clearExpiredCache(): Promise<void> {
//     try {
//       const db = await this.initDB();
//       const currentTime = Date.now();
      
//       for (const storeName of Object.values(CacheManager.STORES)) {
//         if (storeName === CacheManager.STORES.SYNC_QUEUE) continue; // Skip sync queue
        
//         const transaction = db.transaction([storeName], 'readwrite');
//         const store = transaction.objectStore(storeName);
//         const request = store.getAll();
        
//         await new Promise((resolve, reject) => {
//           request.onsuccess = () => {
//             const items = request.result;
//             const expiredItems = items.filter((item: CachedItem) => currentTime > item.expiry);
            
//             expiredItems.forEach((item: CachedItem) => {
//               store.delete(item.id!);
//             });
            
//             if (expiredItems.length > 0) {
//               console.log(`🗑️ Cleared ${expiredItems.length} expired items from ${storeName}`);
//             }
            
//             resolve(void 0);
//           };
          
//           request.onerror = () => reject(request.error);
//         });
//       }
//     } catch (error) {
//       console.error('❌ Error clearing expired cache:', error);
//     }
//   }

//   async clearAllCache(): Promise<void> {
//     try {
//       const db = await this.initDB();
      
//       for (const storeName of Object.values(CacheManager.STORES)) {
//         if (storeName === CacheManager.STORES.SYNC_QUEUE) continue; // Keep sync queue
        
//         const transaction = db.transaction([storeName], 'readwrite');
//         const store = transaction.objectStore(storeName);
        
//         await new Promise((resolve, reject) => {
//           const request = store.clear();
//           request.onsuccess = () => resolve(void 0);
//           request.onerror = () => reject(request.error);
//         });
//       }
      
//       console.log('🗑️ All cache cleared');
//     } catch (error) {
//       console.error('❌ Error clearing all cache:', error);
//       throw error;
//     }
//   }

//   async getCacheStats(): Promise<{
//     totalItems: number;
//     sizeByStore: Record<string, number>;
//   }> {
//     try {
//       const db = await this.initDB();
//       const stats = {
//         totalItems: 0,
//         sizeByStore: {} as Record<string, number>
//       };
      
//       for (const storeName of Object.values(CacheManager.STORES)) {
//         if (storeName === CacheManager.STORES.SYNC_QUEUE) continue;
        
//         const transaction = db.transaction([storeName], 'readonly');
//         const store = transaction.objectStore(storeName);
        
//         const count = await new Promise<number>((resolve, reject) => {
//           const request = store.count();
//           request.onsuccess = () => resolve(request.result);
//           request.onerror = () => reject(request.error);
//         });
        
//         stats.sizeByStore[storeName] = count;
//         stats.totalItems += count;
//       }
      
//       return stats;
//     } catch (error) {
//       console.error('❌ Error getting cache stats:', error);
//       return { totalItems: 0, sizeByStore: {} };
//     }
//   }
// }

// // Export singleton instance
// export const cacheManager = CacheManager.getInstance();