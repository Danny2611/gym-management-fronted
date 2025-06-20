// src/types/pwa.ts
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  showInstallPrompt: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

export interface PWAUpdateState {
  hasUpdate: boolean;
  isUpdating: boolean;
  newWorker: ServiceWorker | null;
}

export interface PWANetworkState {
  isOnline: boolean;
  connectionType?: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

// src/constants/notifications.ts
export const NOTIFICATION_TYPES = {
  SYSTEM: "system",
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  REMINDER: "reminder",
  ACHIEVEMENT: "achievement",
  SOCIAL: "social",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.SYSTEM]: "⚙️",
  [NOTIFICATION_TYPES.WORKOUT]: "💪",
  [NOTIFICATION_TYPES.NUTRITION]: "🥗",
  [NOTIFICATION_TYPES.REMINDER]: "⏰",
  [NOTIFICATION_TYPES.ACHIEVEMENT]: "🏆",
  [NOTIFICATION_TYPES.SOCIAL]: "👥",
};

export const NOTIFICATION_SOUNDS = {
  DEFAULT: "/sounds/notification.mp3",
  WORKOUT: "/sounds/workout.mp3",
  ACHIEVEMENT: "/sounds/achievement.mp3",
};
