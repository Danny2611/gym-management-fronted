// src/contexts/OfflineContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface OfflineContextType {
  isOnline: boolean;
  hasOfflineData: boolean;
  offlineMessage: string;
  syncPending: boolean;
  lastSyncTime: Date | null;
  syncOfflineData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  getOfflineData: <T>(key: string) => Promise<T | null>;
  setOfflineData: <T>(key: string, data: T) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [syncPending, setSyncPending] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [offlineMessage, setOfflineMessage] = useState("");

  // Detect online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineMessage("");

      // Auto sync when coming back online
      if (hasOfflineData && !syncPending) {
        syncOfflineData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineMessage(
        "Bạn đang ở chế độ offline. Một số tính năng có thể bị hạn chế.",
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [hasOfflineData, syncPending]);

  // Check for offline data on startup
  useEffect(() => {
    checkOfflineData();
    loadLastSyncTime();
  }, []);

  const checkOfflineData = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(["offline_data"], "readonly");
      const store = transaction.objectStore("offline_data");
      const request = store.count();

      request.onsuccess = () => {
        setHasOfflineData(request.result > 0);
      };
    } catch (error) {
      console.error("Error checking offline data:", error);
    }
  };

  const loadLastSyncTime = () => {
    const lastSync = localStorage.getItem("lastSyncTime");
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
  };

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("FitLifeOfflineDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("offline_data")) {
          db.createObjectStore("offline_data", { keyPath: "key" });
        }

        if (!db.objectStoreNames.contains("sync_queue")) {
          db.createObjectStore("sync_queue", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };
    });
  };

  const getOfflineData = async <T,>(key: string): Promise<T | null> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(["offline_data"], "readonly");
      const store = transaction.objectStore("offline_data");

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error getting offline data:", error);
      return null;
    }
  };

  const setOfflineData = async <T,>(key: string, data: T): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(["offline_data"], "readwrite");
      const store = transaction.objectStore("offline_data");

      return new Promise((resolve, reject) => {
        const request = store.put({
          key,
          data,
          timestamp: Date.now(),
        });
        request.onsuccess = () => {
          setHasOfflineData(true);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error setting offline data:", error);
      throw error;
    }
  };

  const syncOfflineData = async (): Promise<void> => {
    if (syncPending || !isOnline) return;

    setSyncPending(true);

    try {
      const db = await openDB();
      const transaction = db.transaction(["sync_queue"], "readonly");
      const store = transaction.objectStore("sync_queue");

      const request = store.getAll();
      request.onsuccess = async () => {
        const pendingActions = request.result;

        // Process each pending action
        for (const action of pendingActions) {
          try {
            await processSyncAction(action);
            // Remove from queue after successful sync
            await removeSyncAction(action.id);
          } catch (error) {
            console.error("Error syncing action:", error);
          }
        }

        // Update last sync time
        const now = new Date();
        setLastSyncTime(now);
        localStorage.setItem("lastSyncTime", now.toISOString());

        setSyncPending(false);
      };
    } catch (error) {
      console.error("Error syncing offline data:", error);
      setSyncPending(false);
    }
  };

  const processSyncAction = async (action: any): Promise<void> => {
    // This would contain logic to sync different types of actions
    // e.g., updating profile, booking appointments, etc.
    console.log("Processing sync action:", action);

    // Example: Sync profile update
    if (action.type === "UPDATE_PROFILE") {
      // Make API call to update profile
      // await updateProfile(action.data);
    }

    // Example: Sync appointment booking
    if (action.type === "BOOK_APPOINTMENT") {
      // Make API call to book appointment
      // await bookAppointment(action.data);
    }
  };

  const removeSyncAction = async (actionId: number): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");

      return new Promise((resolve, reject) => {
        const request = store.delete(actionId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error removing sync action:", error);
    }
  };

  const clearOfflineData = async (): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(
        ["offline_data", "sync_queue"],
        "readwrite",
      );

      const offlineStore = transaction.objectStore("offline_data");
      const syncStore = transaction.objectStore("sync_queue");

      await Promise.all([
        new Promise((resolve, reject) => {
          const request = offlineStore.clear();
          request.onsuccess = () => resolve(true);
          request.onerror = () => reject(request.error);
        }),
        new Promise((resolve, reject) => {
          const request = syncStore.clear();
          request.onsuccess = () => resolve(true);
          request.onerror = () => reject(request.error);
        }),
      ]);

      setHasOfflineData(false);
      setLastSyncTime(null);
      localStorage.removeItem("lastSyncTime");
    } catch (error) {
      console.error("Error clearing offline data:", error);
      throw error;
    }
  };

  const value: OfflineContextType = {
    isOnline,
    hasOfflineData,
    offlineMessage,
    syncPending,
    lastSyncTime,
    syncOfflineData,
    clearOfflineData,
    getOfflineData,
    setOfflineData,
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
};

// Custom hook to use offline context
export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within OfflineProvider");
  }
  return context;
};
