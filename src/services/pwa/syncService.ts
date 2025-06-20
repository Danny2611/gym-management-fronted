export interface SyncAction {
  id?: number;
  type: string;
  data: any;
  timestamp: number;
  retryCount?: number;
}

export class SyncService {
  private static dbName = "FitLifeOfflineDB";
  private static version = 1;

  static async addToSyncQueue(
    action: Omit<SyncAction, "id" | "timestamp">,
  ): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");

      const syncAction: SyncAction = {
        ...action,
        timestamp: Date.now(),
        retryCount: 0,
      };

      return new Promise((resolve, reject) => {
        const request = store.add(syncAction);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error adding to sync queue:", error);
      throw error;
    }
  }

  static async processSyncQueue(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(["sync_queue"], "readonly");
      const store = transaction.objectStore("sync_queue");

      const request = store.getAll();
      request.onsuccess = async () => {
        const actions = request.result;

        for (const action of actions) {
          try {
            await this.processAction(action);
            await this.removeFromSyncQueue(action.id!);
          } catch (error) {
            console.error("Error processing sync action:", error);
            await this.updateRetryCount(action.id!, action.retryCount! + 1);
          }
        }
      };
    } catch (error) {
      console.error("Error processing sync queue:", error);
    }
  }

  private static async processAction(action: SyncAction): Promise<void> {
    switch (action.type) {
      case "UPDATE_PROFILE":
        // await userService.updateProfile(action.data);
        console.log("Syncing profile update:", action.data);
        break;

      case "BOOK_APPOINTMENT":
        // await appointmentService.bookAppointment(action.data);
        console.log("Syncing appointment booking:", action.data);
        break;

      case "CANCEL_APPOINTMENT":
        // await appointmentService.cancelAppointment(action.data.id);
        console.log("Syncing appointment cancellation:", action.data);
        break;

      default:
        console.warn("Unknown sync action type:", action.type);
    }
  }

  private static async removeFromSyncQueue(id: number): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(["sync_queue"], "readwrite");
    const store = transaction.objectStore("sync_queue");

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private static async updateRetryCount(
    id: number,
    retryCount: number,
  ): Promise<void> {
    if (retryCount > 3) {
      // Remove after 3 failed attempts
      await this.removeFromSyncQueue(id);
      return;
    }

    const db = await this.openDB();
    const transaction = db.transaction(["sync_queue"], "readwrite");
    const store = transaction.objectStore("sync_queue");

    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const action = getRequest.result;
      if (action) {
        action.retryCount = retryCount;
        store.put(action);
      }
    };
  }

  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

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
  }
}
