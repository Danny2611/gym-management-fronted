// // src/components/pwa/NotificationList.tsx
// import React, { useState, useEffect } from 'react';
// import { Bell, X, Check, Clock, AlertCircle, Gift, Calendar, Dumbbell } from 'lucide-react';

// import { usePushNotifications } from '~/hooks/usePushNotifications';
// import { NotificationData } from '~/services/pwa/pushNotificationService';
// import { Badge } from '../ui/badge';
// import { Button } from '../ui/button';
// import { Card } from '../ui/card';

// const getNotificationIcon = (type: NotificationData['type']) => {
//   switch (type) {
//     case 'reminder':
//       return <Clock className="h-5 w-5 text-blue-500" />;
//     case 'promotion':
//       return <Gift className="h-5 w-5 text-green-500" />;
//     case 'appointment':
//       return <Calendar className="h-5 w-5 text-purple-500" />;
//     case 'membership':
//       return <Dumbbell className="h-5 w-5 text-orange-500" />;
//     case 'system':
//       return <AlertCircle className="h-5 w-5 text-red-500" />;
//     default:
//       return <Bell className="h-5 w-5 text-gray-500" />;
//   }
// };

// const getNotificationTypeText = (type: NotificationData['type']) => {
//   switch (type) {
//     case 'reminder':
//       return 'Nhắc nhở';
//     case 'promotion':
//       return 'Khuyến mãi';
//     case 'appointment':
//       return 'Lịch hẹn';
//     case 'membership':
//       return 'Gói tập';
//     case 'system':
//       return 'Hệ thống';
//     default:
//       return 'Thông báo';
//   }
// };

// export const NotificationList: React.FC = () => {
//   const {
//     notifications,
//     unreadCount,
//     isLoading,
//     loadNotifications,
//     markAsRead,
//     markAllAsRead
//   } = usePushNotifications();

//   const [page, setPage] = useState(1);
//   const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

//   useEffect(() => {
//     loadNotifications(1);
//   }, [loadNotifications]);

//   const handleLoadMore = () => {
//     const nextPage = page + 1;
//     setPage(nextPage);
//     loadNotifications(nextPage);
//   };

//   const handleSelectNotification = (id: string, isSelected: boolean) => {
//     if (isSelected) {
//       setSelectedNotifications(prev => [...prev, id]);
//     } else {
//       setSelectedNotifications(prev => prev.filter(notId => notId !== id));
//     }
//   };

//   const handleMarkSelectedAsRead = async () => {
//     if (selectedNotifications.length > 0) {
//       await markAsRead(selectedNotifications);
//       setSelectedNotifications([]);
//     }
//   };

//   const handleMarkAsRead = async (notificationId: string) => {
//     await markAsRead([notificationId]);
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now.getTime() - date.getTime();
//     const diffMins = Math.floor(diffMs / (1000 * 60));
//     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//     if (diffMins < 1) return 'Vừa xong';
//     if (diffMins < 60) return `${diffMins} phút trước`;
//     if (diffHours < 24) return `${diffHours} giờ trước`;
//     if (diffDays < 7) return `${diffDays} ngày trước`;

//     return date.toLocaleDateString('vi-VN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   };

//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <Bell className="h-6 w-6 text-blue-600" />
//           <h2 className="text-xl font-semibold text-gray-900">Thông báo</h2>
//           {unreadCount > 0 && (
//             <Badge variant="destructive" className="px-2 py-1">
//               {unreadCount}
//             </Badge>
//           )}
//         </div>

//         <div className="flex items-center space-x-2">
//           {selectedNotifications.length > 0 && (
//             <Button
//               onClick={handleMarkSelectedAsRead}
//               size="sm"
//               variant="outline"
//               className="flex items-center space-x-1"
//             >
//               <Check className="h-4 w-4" />
//               <span>Đánh dấu đã đọc ({selectedNotifications.length})</span>
//             </Button>
//           )}

//           {unreadCount > 0 && (
//             <Button
//               onClick={markAllAsRead}
//               size="sm"
//               className="flex items-center space-x-1"
//             >
//               <Check className="h-4 w-4" />
//               <span>Đọc tất cả</span>
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Notification List */}
//       <div className="space-y-3">
//         {notifications.length === 0 && !isLoading ? (
//           <Card className="p-8 text-center">
//             <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//             <h3 className="text-lg font-medium text-gray-900 mb-1">
//               Chưa có thông báo
//             </h3>
//             <p className="text-gray-500">
//               Các thông báo sẽ xuất hiện tại đây khi có cập nhật mới
//             </p>
//           </Card>
//         ) : (
//           notifications.map((notification) => (
//             <Card
//               key={notification.id}
//               className={`p-4 cursor-pointer transition-all hover:shadow-md ${
//                 !notification.read_at ? 'bg-blue-50 border-blue-200' : 'bg-white'
//               }`}
//             >
//               <div className="flex items-start space-x-3">
//                 {/* Checkbox */}
//                 <input
//                   type="checkbox"
//                   checked={selectedNotifications.includes(notification.id)}
//                   onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
//                   className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />

//                 {/* Icon */}
//                 <div className="flex-shrink-0">
//                   {getNotificationIcon(notification.type)}
//                 </div>

//                 {/* Content */}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-2 mb-1">
//                         <h4 className={`text-sm font-medium ${
//                           !notification.read_at ? 'text-gray-900' : 'text-gray-700'
//                         }`}>
//                           {notification.title}
//                         </h4>
//                         <Badge variant="secondary" >
//                           {getNotificationTypeText(notification.type)}
//                         </Badge>
//                         {!notification.read_at && (
//                           <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                         )}
//                       </div>

//                       <p className={`text-sm ${
//                         !notification.read_at ? 'text-gray-800' : 'text-gray-600'
//                       }`}>
//                         {notification.message}
//                       </p>

//                       <p className="text-xs text-gray-500 mt-1">
//                         {formatDate(notification.created_at)}
//                       </p>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex items-center space-x-1 ml-2">
//                       {!notification.read_at && (
//                         <Button
//                           onClick={() => handleMarkAsRead(notification.id)}
//                           size="sm"
//                           variant="ghost"
//                           className="p-1 h-8 w-8"
//                         >
//                           <Check className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </Card>
//           ))
//         )}
//       </div>

//       {/* Load More Button */}
//       {notifications.length > 0 && (
//         <div className="text-center">
//           <Button
//             onClick={handleLoadMore}
//             disabled={isLoading}
//             variant="outline"
//             className="w-full sm:w-auto"
//           >
//             {isLoading ? 'Đang tải...' : 'Tải thêm'}
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };
