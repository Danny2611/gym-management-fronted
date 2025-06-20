// // src/components/pwa/push-notification.tsx
// import React, { useEffect, useState } from "react";
// import { Bell } from "lucide-react";
// import { usePWA } from "~/hooks/usePWA";
// import { usePushNotifications } from "~/hooks/usePushNotifications";

// import { NotificationList } from "./test/NotificationList";
// import { PWAInstallPrompt } from "./PWAInstallPrompt";
// import { PWAUpdatePrompt } from "./PWAUpdatePrompt";

// interface PWAPushNotificationProps {
//   children: React.ReactNode;
// }

// export const PWAPushNotification: React.FC<PWAPushNotificationProps> = ({
//   children,
// }) => {
//   const [isNotificationListOpen, setIsNotificationListOpen] = useState(false);
//   const { isOnline } = usePWA();
//   const {
//     isSupported: isNotificationSupported,
//     isSubscribed,
//     unreadCount,
//   } = usePushNotifications();

//   useEffect(() => {
//     // Listen for messages from service worker
//     if ("serviceWorker" in navigator) {
//       navigator.serviceWorker.addEventListener("message", (event) => {
//         if (event.data && event.data.type === "NAVIGATE") {
//           // Handle navigation from notification click
//           window.history.pushState(null, "", event.data.url);
//         }
//       });
//     }
//   }, []);

//   return (
//     <>
//       {/* Offline indicator */}
//       {!isOnline && (
//         <div className="fixed left-0 right-0 top-0 z-50 bg-red-500 py-2 text-center text-sm text-white">
//           Bạn đang offline. Một số tính năng có thể bị hạn chế.
//         </div>
//       )}

//       {/* Main content with offline padding */}
//       <div className={!isOnline ? "pt-10" : ""}>{children}</div>

//       {/* PWA Install Prompt */}
//       <PWAInstallPrompt />

//       {/* PWA Update Prompt */}
//       <PWAUpdatePrompt />

//       {/* Notification List */}
//       <NotificationList
//         isOpen={isNotificationListOpen}
//         onClose={() => setIsNotificationListOpen(false)}
//       />

//       {/* Floating Notification Button - chỉ hiện khi có thông báo */}
//       {isNotificationSupported && isSubscribed && unreadCount > 0 && (
//         <button
//           onClick={() => setIsNotificationListOpen(true)}
//           className="fixed bottom-24 right-4 z-40 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700 md:bottom-6"
//         >
//           <Bell className="h-6 w-6" />
//           <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
//             {unreadCount > 99 ? "99+" : unreadCount}
//           </span>
//         </button>
//       )}
//     </>
//   );
// };
