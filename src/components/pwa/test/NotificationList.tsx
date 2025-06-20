// // src/components/notifications/NotificationList.tsx
// import React, { useEffect, useState } from "react";
// import { X, Check, CheckCheck, Bell } from "lucide-react";
// import { usePushNotifications } from "../../../hooks/usePushNotifications";
// interface NotificationListProps {
//   isOpen: boolean;
//   onClose: () => void;
//   className?: string;
// }

// export const NotificationList: React.FC<NotificationListProps> = ({
//   isOpen,
//   onClose,
//   className = "",
// }) => {
//   const {
//     notifications,
//     unreadCount,
//     isSubscribed,
//     loadNotifications,
//     markAsRead,
//     markAllAsRead,
//   } = usePushNotifications();

//   const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
//     [],
//   );

//   useEffect(() => {
//     if (isOpen && isSubscribed) {
//       loadNotifications();
//     }
//   }, [isOpen, isSubscribed, loadNotifications]);

//   const handleMarkAsRead = async (notificationId: string) => {
//     await markAsRead([notificationId]);
//   };

//   const handleMarkSelectedAsRead = async () => {
//     if (selectedNotifications.length > 0) {
//       await markAsRead(selectedNotifications);
//       setSelectedNotifications([]);
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     await markAllAsRead();
//     setSelectedNotifications([]);
//   };

//   const toggleSelectNotification = (notificationId: string) => {
//     setSelectedNotifications((prev) =>
//       prev.includes(notificationId)
//         ? prev.filter((id) => id !== notificationId)
//         : [...prev, notificationId],
//     );
//   };

//   const formatDate = (date: Date) => {
//     return new Intl.DateTimeFormat("vi-VN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     }).format(new Date(date));
//   };

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case "workout":
//         return "💪";
//       case "nutrition":
//         return "🥗";
//       case "reminder":
//         return "⏰";
//       case "achievement":
//         return "🏆";
//       default:
//         return "📢";
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className={`fixed inset-0 z-50 ${className}`}>
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-black bg-opacity-50"
//         onClick={onClose}
//       />

//       {/* Panel */}
//       <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
//         <div className="flex h-full flex-col">
//           {/* Header */}
//           <div className="flex items-center justify-between border-b border-gray-200 p-4">
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
//               {unreadCount > 0 && (
//                 <p className="text-sm text-gray-500">
//                   {unreadCount} thông báo chưa đọc
//                 </p>
//               )}
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-lg p-2 transition-colors hover:bg-gray-100"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           {/* Actions */}
//           {notifications.length > 0 && (
//             <div className="flex items-center gap-2 border-b border-gray-100 p-4">
//               {selectedNotifications.length > 0 ? (
//                 <>
//                   <button
//                     onClick={handleMarkSelectedAsRead}
//                     className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
//                   >
//                     <Check className="h-4 w-4" />
//                     Đánh dấu đã đọc ({selectedNotifications.length})
//                   </button>
//                   <button
//                     onClick={() => setSelectedNotifications([])}
//                     className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
//                   >
//                     Bỏ chọn
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   onClick={handleMarkAllAsRead}
//                   className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
//                   disabled={unreadCount === 0}
//                 >
//                   <CheckCheck className="h-4 w-4" />
//                   Đánh dấu tất cả đã đọc
//                 </button>
//               )}
//             </div>
//           )}

//           {/* Notifications */}
//           <div className="flex-1 overflow-y-auto">
//             {!isSubscribed ? (
//               <div className="flex h-full flex-col items-center justify-center p-8 text-center">
//                 <Bell className="mb-4 h-12 w-12 text-gray-400" />
//                 <h3 className="mb-2 text-lg font-medium text-gray-900">
//                   Chưa bật thông báo
//                 </h3>
//                 <p className="mb-4 text-gray-500">
//                   Bật thông báo để nhận tin tức và cập nhật mới nhất
//                 </p>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="flex h-full flex-col items-center justify-center p-8 text-center">
//                 <Bell className="mb-4 h-12 w-12 text-gray-400" />
//                 <h3 className="mb-2 text-lg font-medium text-gray-900">
//                   Chưa có thông báo
//                 </h3>
//                 <p className="text-gray-500">
//                   Thông báo của bạn sẽ hiển thị ở đây
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-1">
//                 {notifications.map((notification) => (
//                   <div
//                     key={notification._id}
//                     className={`cursor-pointer border-b border-gray-100 p-4 hover:bg-gray-50 ${
//                       notification.status === "sent" ? "bg-blue-50" : ""
//                     } ${
//                       selectedNotifications.includes(notification._id)
//                         ? "bg-blue-100"
//                         : ""
//                     }`}
//                     onClick={() => toggleSelectNotification(notification._id)}
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className="flex-shrink-0">
//                         <span className="text-xl">
//                           {getNotificationIcon(notification.type)}
//                         </span>
//                       </div>

//                       <div className="min-w-0 flex-1">
//                         <div className="flex items-start justify-between">
//                           <h4 className="truncate text-sm font-medium text-gray-900">
//                             {notification.title}
//                           </h4>
//                           {notification.status === "sent" && (
//                             <div className="ml-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
//                           )}
//                         </div>

//                         <p className="mt-1 line-clamp-2 text-sm text-gray-600">
//                           {notification.message}
//                         </p>

//                         <div className="mt-2 flex items-center justify-between">
//                           <span className="text-xs text-gray-500">
//                             {formatDate(notification.created_at)}
//                           </span>

//                           {notification.status === "sent" && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleMarkAsRead(notification._id);
//                               }}
//                               className="text-xs text-blue-600 hover:text-blue-800"
//                             >
//                               Đánh dấu đã đọc
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
