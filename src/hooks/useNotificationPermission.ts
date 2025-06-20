// src/hooks/useNotificationPermission.ts
import { useState, useEffect, useCallback } from "react";

export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === "undefined") {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    permission,
    isGranted: permission === "granted",
    isDenied: permission === "denied",
    isDefault: permission === "default",
    requestPermission,
  };
};
