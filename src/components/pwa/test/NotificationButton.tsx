// // src/components/notifications/NotificationButton.tsx
// import React from 'react';
// import { Bell, BellOff } from 'lucide-react';
// import { usePushNotifications } from '../../hooks/usePushNotifications';

// interface NotificationButtonProps {
//   className?: string;
//   showLabel?: boolean;
// }

// export const NotificationButton: React.FC<NotificationButtonProps> = ({
//   className = '',
//   showLabel = false
// }) => {
//   const {
//     isSupported,
//     isSubscribed,
//     isPermissionGranted,
//     isLoading,
//     unreadCount,
//     requestPermission,
//     subscribeToNotifications,
//     unsubscribeFromNotifications
//   } = usePushNotifications();

//   const handleToggleNotifications = async () => {
//     if (!isSupported) {
//       alert('Trình duyệt của bạn không hỗ trợ push notifications');
//       return;
//     }

//     if (!isPermissionGranted) {
//       const granted = await requestPermission();
//       if (!granted) {
//         alert('Cần cấp quyền để nhận thông báo');
//         return;
//       }
//     }

//     if (isSubscribed) {
//       await unsubscribeFromNotifications();
//     } else {
//       await subscribeToNotifications();
//     }
//   };

//   if (!isSupported) {
//     return null;
//   }

//   return (
//     <button
//       onClick={handleToggleNotifications}
//       disabled={isLoading}
//       className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//         isSubscribed
//           ? 'bg-blue-600 hover:bg-blue-700 text-white'
//           : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//       } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
//     >
//       {isLoading ? (
//         <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
//       ) : isSubscribed ? (
//         <Bell className="w-5 h-5" />
//       ) : (
//         <BellOff className="w-5 h-5" />
//       )}

//       {showLabel && (
//         <span className="text-sm font-medium">
//           {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
//         </span>
//       )}

//       {isSubscribed && unreadCount > 0 && (
//         <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//           {unreadCount > 99 ? '99+' : unreadCount}
//         </span>
//       )}
//     </button>
//   );
// };
