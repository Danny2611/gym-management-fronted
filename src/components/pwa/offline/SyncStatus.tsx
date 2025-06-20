// src/components/pwa/SyncStatus.tsx
import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Alert, AlertDescription } from "../../ui/alert";

export type SyncStatus = "idle" | "syncing" | "success" | "error" | "pending";

interface SyncItem {
  id: string;
  type: "appointment" | "profile" | "membership" | "notification";
  status: SyncStatus;
  lastSync?: Date;
  error?: string;
  data?: any;
}

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  className = "",
  showDetails = true,
}) => {
  const [syncItems, setSyncItems] = useState<SyncItem[]>([]);
  const [overallStatus, setOverallStatus] = useState<SyncStatus>("idle");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Khởi tạo sync items từ localStorage hoặc IndexedDB
    loadSyncItems();

    // Listen for sync events
    const handleSyncEvent = (event: CustomEvent) => {
      updateSyncItem(event.detail);
    };

    window.addEventListener("sync-update", handleSyncEvent as EventListener);

    return () => {
      window.removeEventListener(
        "sync-update",
        handleSyncEvent as EventListener,
      );
    };
  }, []);

  const loadSyncItems = () => {
    // Giả lập dữ liệu sync items
    const mockItems: SyncItem[] = [
      {
        id: "1",
        type: "appointment",
        status: "success",
        lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: "2",
        type: "profile",
        status: "pending",
        lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        id: "3",
        type: "notification",
        status: "error",
        error: "Network timeout",
        lastSync: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
    ];

    setSyncItems(mockItems);
    updateOverallStatus(mockItems);
  };

  const updateSyncItem = (updatedItem: Partial<SyncItem> & { id: string }) => {
    setSyncItems((prev) => {
      const newItems = prev.map((item) =>
        item.id === updatedItem.id
          ? { ...item, ...updatedItem, lastSync: new Date() }
          : item,
      );
      updateOverallStatus(newItems);
      return newItems;
    });
  };

  const updateOverallStatus = (items: SyncItem[]) => {
    const hasError = items.some((item) => item.status === "error");
    const hasPending = items.some((item) => item.status === "pending");
    const isSyncing = items.some((item) => item.status === "syncing");

    setPendingCount(items.filter((item) => item.status === "pending").length);

    if (isSyncing) {
      setOverallStatus("syncing");
    } else if (hasError) {
      setOverallStatus("error");
    } else if (hasPending) {
      setOverallStatus("pending");
    } else {
      setOverallStatus("success");
      setLastSyncTime(new Date());
    }
  };

  const handleSync = async (itemId?: string) => {
    if (itemId) {
      // Sync specific item
      updateSyncItem({ id: itemId, status: "syncing" });

      // Simulate sync process
      setTimeout(() => {
        updateSyncItem({
          id: itemId,
          status: Math.random() > 0.8 ? "error" : "success",
          error: Math.random() > 0.8 ? "Sync failed" : undefined,
        });
      }, 2000);
    } else {
      // Sync all items
      setOverallStatus("syncing");
      syncItems.forEach((item) => {
        updateSyncItem({ id: item.id, status: "syncing" });
      });

      // Simulate sync process
      setTimeout(() => {
        syncItems.forEach((item) => {
          updateSyncItem({
            id: item.id,
            status: Math.random() > 0.8 ? "error" : "success",
            error: Math.random() > 0.8 ? "Sync failed" : undefined,
          });
        });
      }, 3000);
    }
  };

  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case "syncing":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: SyncStatus) => {
    switch (status) {
      case "syncing":
        return "Đang đồng bộ...";
      case "success":
        return "Đã đồng bộ";
      case "error":
        return "Lỗi đồng bộ";
      case "pending":
        return "Chờ đồng bộ";
      default:
        return "Chưa đồng bộ";
    }
  };

  const getTypeText = (type: SyncItem["type"]) => {
    switch (type) {
      case "appointment":
        return "Lịch hẹn";
      case "profile":
        return "Hồ sơ";
      case "membership":
        return "Gói tập";
      case "notification":
        return "Thông báo";
      default:
        return "Dữ liệu";
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} giờ trước`;

    return date.toLocaleDateString("vi-VN");
  };

  if (!showDetails && overallStatus === "success") {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(overallStatus)}
            <div>
              <h3 className="font-medium text-gray-900">Trạng thái đồng bộ</h3>
              <p className="text-sm text-gray-600">
                {getStatusText(overallStatus)}
                {lastSyncTime && overallStatus === "success" && (
                  <span> • Lần cuối: {formatLastSync(lastSyncTime)}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {pendingCount > 0 && (
              <Badge color="warning">{pendingCount} chờ</Badge>
            )}

            <Button
              onClick={() => handleSync()}
              disabled={overallStatus === "syncing"}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
              <RefreshCw
                className={`h-4 w-4 ${overallStatus === "syncing" ? "animate-spin" : ""}`}
              />
              <span>Đồng bộ</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {overallStatus === "error" && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Có lỗi xảy ra khi đồng bộ dữ liệu. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Detailed Sync Items */}
      {showDetails && (
        <Card className="p-4">
          <h4 className="mb-3 font-medium text-gray-900">Chi tiết đồng bộ</h4>
          <div className="space-y-3">
            {syncItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getTypeText(item.type)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {getStatusText(item.status)}
                      {item.lastSync && (
                        <span> • {formatLastSync(item.lastSync)}</span>
                      )}
                    </p>
                    {item.error && (
                      <p className="mt-1 text-xs text-red-600">
                        Lỗi: {item.error}
                      </p>
                    )}
                  </div>
                </div>

                {(item.status === "error" ||
                  item.status === "pending" ||
                  item.status === "syncing") && (
                  <Button
                    onClick={() => handleSync(item.id)}
                    disabled={item.status === "syncing"}
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Thử lại
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
