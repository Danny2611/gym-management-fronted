import {
  NOTIFICATION_SOUNDS,
  NOTIFICATION_TYPES,
  NotificationType,
} from "~/types/pwa";

export const formatNotificationTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels = {
    [NOTIFICATION_TYPES.SYSTEM]: "Hệ thống",
    [NOTIFICATION_TYPES.WORKOUT]: "Tập luyện",
    [NOTIFICATION_TYPES.NUTRITION]: "Dinh dưỡng",
    [NOTIFICATION_TYPES.REMINDER]: "Nhắc nhở",
    [NOTIFICATION_TYPES.ACHIEVEMENT]: "Thành tích",
    [NOTIFICATION_TYPES.SOCIAL]: "Xã hội",
  };

  return labels[type] || "Khác";
};

export const createNotificationSound = (
  type: NotificationType = NOTIFICATION_TYPES.SYSTEM,
) => {
  try {
    const soundUrl =
      NOTIFICATION_SOUNDS[
        type.toUpperCase() as keyof typeof NOTIFICATION_SOUNDS
      ] || NOTIFICATION_SOUNDS.DEFAULT;
    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    return audio;
  } catch (error) {
    console.warn("Could not create notification sound:", error);
    return null;
  }
};

export const playNotificationSound = (
  type: NotificationType = NOTIFICATION_TYPES.SYSTEM,
) => {
  const audio = createNotificationSound(type);
  if (audio) {
    audio.play().catch((error) => {
      console.warn("Could not play notification sound:", error);
    });
  }
};
