// src/utils/offline.ts - Utilities để xử lý offline mode
import { toast } from 'react-hot-toast';

export interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = navigator.onLine;
  private offlineActions: OfflineAction[] = [];
  private listeners: Array<(isOnline: boolean) => void> = [];

  private constructor() {
    this.init();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private init() {
    // Lắng nghe sự kiện online/offline
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Load offline actions từ localStorage
    this.loadOfflineActions();
  }

  private handleOnline() {
    this.isOnline = true;
    this.notifyListeners();
    this.syncOfflineActions();
    toast.success('Đã kết nối internet! Đang đồng bộ dữ liệu...', {
      icon: '🌐',
      duration: 3000
    });
  }

  private handleOffline() {
    this.isOnline = false;
    this.notifyListeners();
    toast.error('Mất kết nối internet. Ứng dụng đang hoạt động ở chế độ offline.', {
      icon: '📱',
      duration: 4000
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public onStatusChange(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    // Cleanup function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  private loadOfflineActions() {
    try {
      const saved = localStorage.getItem('fitlife_offline_actions');
      this.offlineActions = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading offline actions:', error);
      this.offlineActions = [];
    }
  }

  private saveOfflineActions() {
    try {
      localStorage.setItem('fitlife_offline_actions', JSON.stringify(this.offlineActions));
    } catch (error) {
      console.error('Error saving offline actions:', error);
    }
  }

  public addOfflineAction(type: string, data: any) {
    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    this.offlineActions.push(action);
    this.saveOfflineActions();
    
    toast.success('Hành động đã được lưu và sẽ thực hiện khi có kết nối', {
      icon: '💾',
      duration: 3000
    });
  }

  private async syncOfflineActions() {
    if (!this.isOnline || this.offlineActions.length === 0) return;

    const actionsToSync = [...this.offlineActions];
    this.offlineActions = [];
    this.saveOfflineActions();

    for (const action of actionsToSync) {
      try {
        await this.executeOfflineAction(action);
        toast.success(`Đã đồng bộ: ${action.type}`, { icon: '✅' });
      } catch (error) {
        console.error('Error syncing action:', action, error);
        
        action.retryCount++;
        if (action.retryCount < 3) {
          this.offlineActions.push(action);
          toast.error(`Lỗi đồng bộ: ${action.type}. Sẽ thử lại...`, { icon: '⚠️' });
        } else {
          toast.error(`Không thể đồng bộ: ${action.type}`, { icon: '❌' });
        }
      }
    }

    if (this.offlineActions.length > 0) {
      this.saveOfflineActions();
    }
  }

  private async executeOfflineAction(action: OfflineAction): Promise<void> {
    const { type, data } = action;
    
    switch (type) {
      case 'UPDATE_PROFILE':
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;
        
      case 'BOOK_APPOINTMENT':
        await fetch('/api/user/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;
        
      case 'CANCEL_APPOINTMENT':
        await fetch(`/api/user/appointments/${data.id}`, {
          method: 'DELETE'
        });
        break;
        
      case 'UPDATE_WORKOUT':
        await fetch('/api/user/workout', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;
        
      default:
        console.warn('Unknown offline action type:', type);
    }
  }

  public getPendingActionsCount(): number {
    return this.offlineActions.length;
  }

  public clearOfflineActions() {
    this.offlineActions = [];
    this.saveOfflineActions();
  }
}

// Utility functions
export const offlineManager = OfflineManager.getInstance();

export const isOnline = (): boolean => offlineManager.getStatus();

export const executeWhenOnline = (callback: () => void) => {
  if (isOnline()) {
    callback();
  } else {
    const unsubscribe = offlineManager.onStatusChange((online) => {
      if (online) {
        callback();
        unsubscribe();
      }
    });
  }
};

// Hook để sử dụng trong React components
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(offlineManager.getStatus());
  const [pendingActions, setPendingActions] = React.useState(offlineManager.getPendingActionsCount());

  React.useEffect(() => {
    const unsubscribe = offlineManager.onStatusChange((online) => {
      setIsOnline(online);
      setPendingActions(offlineManager.getPendingActionsCount());
    });

    return unsubscribe;
  }, []);

  return {
    isOnline,
    pendingActions,
    addOfflineAction: offlineManager.addOfflineAction.bind(offlineManager),
    clearOfflineActions: offlineManager.clearOfflineActions.bind(offlineManager)
  };
};

// Cache utilities
export const getCachedData = async (key: string) => {
  try {
    const cache = await caches.open('fitlife-api-v1');
    const response = await cache.match(key);
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting cached data:', error);
  }
  return null;
};

export const setCachedData = async (key: string, data: any) => {
  try {
    const cache = await caches.open('fitlife-api-v1');
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(key, response);
  } catch (error) {
    console.error('Error setting cached data:', error);
  }
};

// Fetch wrapper with offline support
export const offlineFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    // Nếu là GET request và offline, thử lấy từ cache
    if (options.method === 'GET' || !options.method) {
      const cachedData = await getCachedData(url);
      if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-From-Cache': 'true' }
        });
      }
    }
    
    throw error;
  }
};

import React from 'react';