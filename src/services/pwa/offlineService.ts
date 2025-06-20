// src/services/offlineApiService.ts - Service xử lý API calls với offline support
import { offlineManager, offlineFetch } from '~/utils/offline';

interface ApiResponse<T> {
  data: T;
  fromCache: boolean;
  timestamp: number;
}

interface OfflineApiOptions {
  cacheKey?: string;
  cacheDuration?: number; // minutes
  retryOnline?: boolean;
  fallbackData?: any;
}

class OfflineApiService {
  private static instance: OfflineApiService;
  private baseURL: string = '/api';

  private constructor() {}

  static getInstance(): OfflineApiService {
    if (!OfflineApiService.instance) {
      OfflineApiService.instance = new OfflineApiService();
    }
    return OfflineApiService.instance;
  }

  // Generic GET method với offline support
  async get<T>(
    endpoint: string, 
    options: OfflineApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = options.cacheKey || `cache_${endpoint}`;
    const cacheDuration = options.cacheDuration || 30; // 30 minutes default

    try {
      const response = await offlineFetch(url);
      const data = await response.json();
      
      // Kiểm tra nếu data từ cache
      const fromCache = response.headers.get('X-From-Cache') === 'true';
      
      if (!fromCache) {
        // Lưu vào localStorage với timestamp
        const cacheData = {
          data,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }

      return {
        data,
        fromCache,
        timestamp: Date.now()
      };

    } catch (error) {
      // Thử lấy từ localStorage cache
      const cached = this.getCachedData<T>(cacheKey, cacheDuration);
      if (cached) {
        return {
          data: cached.data,
          fromCache: true,
          timestamp: cached.timestamp
        };
      }

      // Nếu có fallback data
      if (options.fallbackData) {
        return {
          data: options.fallbackData,
          fromCache: true,
          timestamp: Date.now()
        };
      }

      throw error;
    }
  }

  // Generic POST method với offline queue
  async post<T>(
    endpoint: string, 
    data: any, 
    options: OfflineApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      return {
        data: responseData,
        fromCache: false,
        timestamp: Date.now()
      };

    } catch (error) {
      // Nếu offline, thêm vào queue
      if (!navigator.onLine && options.retryOnline) {
        offlineManager.addOfflineAction(`POST_${endpoint}`, data);
        
        return {
          data: { queued: true, message: 'Đã lưu để xử lý khi có kết nối' } as T,
          fromCache: false,
          timestamp: Date.now()
        };
      }

      throw error;
    }
  }

  // Generic PUT method
  async put<T>(
    endpoint: string, 
    data: any, 
    options: OfflineApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      return {
        data: responseData,
        fromCache: false,
        timestamp: Date.now()
      };

    } catch (error) {
      if (!navigator.onLine && options.retryOnline) {
        offlineManager.addOfflineAction(`PUT_${endpoint}`, data);
        
        return {
          data: { queued: true, message: 'Đã lưu để xử lý khi có kết nối' } as T,
          fromCache: false,
          timestamp: Date.now()
        };
      }

      throw error;
    }
  }

  // Generic DELETE method
  async delete<T>(
    endpoint: string, 
    options: OfflineApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      return {
        data: responseData,
        fromCache: false,
        timestamp: Date.now()
      };

    } catch (error) {
      if (!navigator.onLine && options.retryOnline) {
        offlineManager.addOfflineAction(`DELETE_${endpoint}`, {});
        
        return {
          data: { queued: true, message: 'Đã lưu để xử lý khi có kết nối' } as T,
          fromCache: false,
          timestamp: Date.now()
        };
      }

      throw error;
    }
  }

  // Lấy cached data từ localStorage
  private getCachedData<T>(cacheKey: string, maxAgeMinutes: number) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const ageMinutes = (Date.now() - timestamp) / (1000 * 60);

      if (ageMinutes > maxAgeMinutes) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return { data, timestamp };
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  // Clear cache
  clearCache(pattern?: string) {
    if (pattern) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  // Specific API methods cho FitLife app
  
  // User data
  async getUserMembershipInfo() {
    return this.get('/user/my-package/infor-membership', {
      cacheKey: 'user_membership',
      cacheDuration: 60,
      fallbackData: {
        membershipType: 'Premium',
        expiryDate: null,
        remainingDays: 0
      }
    });
  }

  async getUserPackageDetail(data: any) {
    return this.post('/user/my-package/detail', data, {
      cacheKey: 'user_package_detail',
      retryOnline: true
    });
  }

  // Transactions
  async getSuccessfulTransactions() {
    return this.get('/user/transaction/success', {
      cacheKey: 'user_transactions',
      cacheDuration: 30,
      fallbackData: []
    });
  }

  // Appointments
  async getNextWeekAppointments() {
    return this.get('/user/appointments/next-week', {
      cacheKey: 'user_appointments',
      cacheDuration: 15,
      fallbackData: []
    });
  }

  async bookAppointment(appointmentData: any) {
    return this.post('/user/appointments', appointmentData, {
      retryOnline: true
    });
  }

  async cancelAppointment(appointmentId: string) {
    return this.delete(`/user/appointments/${appointmentId}`, {
      retryOnline: true
    });
  }

  // Promotions
  async getPromotions() {
    return this.get('/public/promotions', {
      cacheKey: 'promotions',
      cacheDuration: 120, // Cache longer for promotions
      fallbackData: []
    });
  }

  // Workouts
  async getWeeklyWorkout() {
    return this.get('/user/workout/weekly', {
      cacheKey: 'weekly_workout',
      cacheDuration: 60,
      fallbackData: {
        workouts: [],
        totalSessions: 0,
        completedSessions: 0
      }
    });
  }

  async getNextWeekWorkout() {
    return this.get('/user/workout/next-week', {
      cacheKey: 'next_week_workout',
      cacheDuration: 60,
      fallbackData: []
    });
  }

  async updateWorkout(workoutData: any) {
    return this.put('/user/workout', workoutData, {
      retryOnline: true
    });
  }

  // Sync all offline data
  async syncAllData() {
    const promises = [
      this.getUserMembershipInfo(),
      this.getSuccessfulTransactions(),
      this.getNextWeekAppointments(),
      this.getPromotions(),
      this.getWeeklyWorkout(),
      this.getNextWeekWorkout()
    ];

    try {
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`Sync completed: ${successful} successful, ${failed} failed`);
      return { successful, failed };
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const offlineApiService = OfflineApiService.getInstance();

// Convenience hooks for React components
export const useOfflineApi = () => {
  return {
    api: offlineApiService,
    
    // Wrapper methods với error handling
    getUserData: async () => {
      try {
        const result = await offlineApiService.getUserMembershipInfo();
        return result;
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
    },

    getAppointments: async () => {
      try {
        const result = await offlineApiService.getNextWeekAppointments();
        return result;
      } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }
    },

    getWorkouts: async () => {
      try {
        const result = await offlineApiService.getWeeklyWorkout();
        return result;
      } catch (error) {
        console.error('Error fetching workouts:', error);
        throw error;
      }
    },

    syncAll: async () => {
      try {
        const result = await offlineApiService.syncAllData();
        return result;
      } catch (error) {
        console.error('Error syncing all data:', error);
        throw error;
      }
    }
  };
};