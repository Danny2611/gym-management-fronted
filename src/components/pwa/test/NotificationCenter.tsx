// // src/components/pwa/NotificationCenter.tsx
// import React, { useState, useEffect } from 'react';
// import { Bell, Settings, X, Check, Trash2, RefreshCw } from 'lucide-react';
// import { Button } from '../../ui/button';
// import { Card } from '../../ui/card';
// import { Badge } from '../../ui/badge';
// import { Modal } from '../../ui/modal';
// import { Tabs } from '../../ui/tabs';
// import { usePushNotifications } from '../../../hooks/usePushNotifications';
// import { NotificationSettings } from '../NotificationSettings';
// import { NotificationList } from '../NotificationList';

// interface NotificationCenterProps {
//   className?: string;
// }

// export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');

//   const {
//     notifications,
//     unreadCount,
//     isLoading,
//     loadNotifications,
//     markAsRead,
//     markAllAsRead,
//     refreshSubscriptionStatus
//   } = usePushNotifications();

//   // Load notifications khi mở center
//   useEffect(() => {
//     if (isOpen) {
//       loadNotifications();
//     }
//   }, [isOpen, loadNotifications]);

//   const handleNotificationClick = async (notificationId: string) => {
//     const notification = notifications.find(n => n.id === notificationId);
//     if (notification && !notification.read_at) {
//       await markAsRead([notificationId]);
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     await markAllAsRead();
//   };

//   const handleRefresh = async () => {
//     await Promise.all([
//       loadNotifications(1),
//       refreshSubscriptionStatus()
//     ]);
//   };

//   const tabs = [
//     {
//       key: 'notifications' as const,
//       label: 'Thông báo',
//       badge: unreadCount > 0 ? unreadCount : undefined
//     },
//     {
//       key: 'settings' as const,
//       label: 'Cài đặt',
//       icon: Settings
//     }
//   ];

//   return (
//     <>
//       {/* Trigger Button */}
//       <div className={`relative ${className || ''}`}>
//         <Button
//           onClick={() => setIsOpen(true)}
//           variant="outline"
//           size="sm"
//           className="relative p-2"
//         >
//           <Bell className="h-4 w-4" />
//           {unreadCount > 0 && (
//             <Badge
//               className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 min-w-0"
//             >
//               {unreadCount > 99 ? '99+' : unreadCount}
//             </Badge>
//           )}
//         </Button>
//       </div>

//       {/* Notification Center Modal */}
//       <Modal
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//        // size="lg"
//         className="max-w-2xl"
//       >
//         <div className="flex flex-col h-full max-h-[80vh]">
//           {/* Header */}
//           <div className="flex items-center justify-between p-6 border-b border-gray-200">
//             <div className="flex items-center space-x-3">
//               <Bell className="h-6 w-6 text-blue-600" />
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   Trung tâm thông báo
//                 </h2>
//                 <p className="text-sm text-gray-600">
//                   Quản lý thông báo và cài đặt
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center space-x-2">
//               <Button
//                 onClick={handleRefresh}
//                 variant="outline"
//                 size="sm"
//                 disabled={isLoading}
//                 className="p-2"
//               >
//                 <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
//               </Button>

//               <Button
//                 onClick={() => setIsOpen(false)}
//                 variant="ghost"
//                 size="sm"
//                 className="p-2"
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="px-6 pt-4">
//             <Tabs
//                 value={activeTab}
//                 onValueChange={(value) => setActiveTab(value as "notifications" | "settings")}
//                 className="w-full"
//                 />

//           </div>

//           {/* Content */}
//           <div className="flex-1 overflow-hidden">
//             {activeTab === 'notifications' && (
//               <div className="p-6">
//                 {/* Actions */}
//                 {notifications.length > 0 && (
//                   <div className="flex items-center justify-between mb-4">
//                     <p className="text-sm text-gray-600">
//                       {notifications.length} thông báo
//                       {unreadCount > 0 && ` (${unreadCount} chưa đọc)`}
//                     </p>

//                     {unreadCount > 0 && (
//                       <Button
//                         onClick={handleMarkAllAsRead}
//                         variant="outline"
//                         size="sm"
//                         className="flex items-center space-x-2"
//                       >
//                         <Check className="h-4 w-4" />
//                         <span>Đánh dấu tất cả đã đọc</span>
//                       </Button>
//                     )}
//                   </div>
//                 )}

//                 {/* Notification List */}
//                 <div className="h-96 overflow-y-auto">
//                   <NotificationList
//                     // notifications={notifications}
//                     // onNotificationClick={handleNotificationClick}
//                     // isLoading={isLoading}
//                   />
//                 </div>
//               </div>
//             )}

//             {activeTab === 'settings' && (
//               <div className="p-6">
//                 <NotificationSettings />
//               </div>
//             )}
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// };
