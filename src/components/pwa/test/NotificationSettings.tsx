// import React from 'react';
// import { Bell, BellOff, Settings, Send } from 'lucide-react';

// import { usePushNotifications } from '~/hooks/usePushNotifications';
// import { Card } from '../ui/card';
// import Badge from '../ui/badge/Badge';

// import Button from '../ui/button/Button';
// import { Alert, AlertDescription } from '../ui/alert';

// export const NotificationSettings: React.FC = () => {
//   const {
//     isSupported,
//     isSubscribed,
//     permission,
//     isLoading,
//     error,
//     subscribe,
//     unsubscribe,
//     requestPermission,
//     sendTestNotification
//   } = usePushNotifications();

//   const handleToggleSubscription = async () => {
//     if (isSubscribed) {
//       await unsubscribe();
//     } else {
//       if (permission !== 'granted') {
//         const newPermission = await requestPermission();
//         if (newPermission !== 'granted') {
//           return;
//         }
//       }
//       await subscribe();
//     }
//   };

//   const handleTestNotification = async () => {
//     try {
//       await sendTestNotification(
//         'Test Notification',
//         'Đây là thông báo thử nghiệm từ FitLife!'
//       );
//     } catch (err) {
//       console.error('Test notification failed:', err);
//     }
//   };

//   if (!isSupported) {
//     return (
//       <Card className="p-6">
//         <div className="flex items-center space-x-3">
//           <BellOff className="h-6 w-6 text-gray-400" />
//           <div>
//             <h3 className="font-semibold text-gray-900">Thông báo đẩy</h3>
//             <p className="text-sm text-gray-600">
//               Trình duyệt của bạn không hỗ trợ thông báo đẩy
//             </p>
//           </div>
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <Card className="p-6">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center space-x-3">
//           <Bell className="h-6 w-6 text-blue-600" />
//           <div>
//             <h3 className="font-semibold text-gray-900">Thông báo đẩy</h3>
//             <p className="text-sm text-gray-600">
//               Nhận thông báo về lịch tập, khuyến mãi và cập nhật quan trọng
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center space-x-2">
//           <Badge color={isSubscribed ? 'success' : 'primary'}>
//             {isSubscribed ? 'Đang bật' : 'Đang tắt'}
//           </Badge>
//           <Badge color={permission === 'granted' ? 'success' : 'warning'}>
//             {permission === 'granted' ? 'Đã cấp quyền' :
//              permission === 'denied' ? 'Từ chối' : 'Chờ cấp quyền'}
//           </Badge>
//         </div>
//       </div>

//       {error && (
//         <Alert className="mb-4" variant="destructive">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       {permission === 'denied' && (
//         <Alert className="mb-4" variant="destructive">
//           <AlertDescription>
//             Bạn đã từ chối quyền thông báo. Vào cài đặt trình duyệt để bật lại.
//           </AlertDescription>
//         </Alert>
//       )}

//       <div className="flex space-x-3">
//         <Button
//           onClick={handleToggleSubscription}
//           disabled={isLoading || permission === 'denied'}
//           className={`flex items-center space-x-2 ${
//             isSubscribed
//               ? 'bg-red-600 hover:bg-red-700'
//               : 'bg-blue-600 hover:bg-blue-700'
//           }`}
//         >
//           {isSubscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
//           <span>{isSubscribed ? 'Tắt thông báo' : 'Bật thông báo'}</span>
//         </Button>

//         {isSubscribed && (
//           <Button
//             onClick={handleTestNotification}
//             variant="outline"
//             disabled={isLoading}
//             className="flex items-center space-x-2"
//           >
//             <Send className="h-4 w-4" />
//             <span>Thử nghiệm</span>
//           </Button>
//         )}
//       </div>

//       <div className="mt-4 pt-4 border-t border-gray-200">
//         <div className="flex items-center space-x-2 text-sm text-gray-600">
//           <Settings className="h-4 w-4" />
//           <span>Các loại thông báo:</span>
//         </div>
//         <ul className="mt-2 space-y-1 text-sm text-gray-600 ml-6">
//           <li>• Nhắc nhở lịch tập và hẹn với PT</li>
//           <li>• Thông báo gói tập sắp hết hạn</li>
//           <li>• Khuyến mãi và ưu đãi đặc biệt</li>
//           <li>• Cập nhật lịch tập và thông tin quan trọng</li>
//         </ul>
//       </div>
//     </Card>
//   );
// };
