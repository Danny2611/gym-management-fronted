// // src/components/notifications/NotificationToggle.tsx
// import React from 'react';
// import { Bell, BellOff } from 'lucide-react';
// import { usePushNotifications } from '../../hooks/usePushNotifications';

// interface NotificationToggleProps {
//   className?: string;
//   showLabel?: boolean;
// }

// export const NotificationToggle: React.FC<NotificationToggleProps> = ({
//   className = '',
//   showLabel = true,
// }) => {
//   const {
//     isSupported,
//     isSubscribed,
//     isPermissionGranted,
//     isLoading,
//     subscribeToNotifications,
//     unsubscribeFromNotifications,
//   } = usePushNotifications();

//   const handleToggleNotifications = async () => {
//     if (isLoading) return;

//     try {
//       if (isSubscribed) {
//         await unsubscribeFromNotifications();
//       } else {
//         await subscribeToNotifications();
//       }
//     } catch (error) {
//       console.error('Failed to toggle notifications:', error);
//     }
//   };

//   if (!isSupported) return null;

//   const buttonLabel = isLoading
//     ? 'Đang xử lý...'
//     : isSubscribed
//     ? 'Tắt thông báo'
//     : 'Bật thông báo';

//   const isDisabled = isLoading || !isPermissionGranted;

//   const baseStyle = `
//     flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
//     ${isSubscribed
//       ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
//       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
//     ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
//     ${className}
//   `;

//   return (
//     <button
//       onClick={handleToggleNotifications}
//       disabled={isDisabled}
//       className={baseStyle}
//     >
//       {isLoading ? (
//         <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
//       ) : isSubscribed ? (
//         <Bell className="w-5 h-5" />
//       ) : (
//         <BellOff className="w-5 h-5" />
//       )}

//       {showLabel && <span className="text-sm font-medium">{buttonLabel}</span>}
//     </button>
//   );
// };

// // // Component đơn giản hơn cho header
// // export const NotificationButton: React.FC = () => {
// //   return <NotificationToggle className="p-2" showLabel={false} />;
// // };
