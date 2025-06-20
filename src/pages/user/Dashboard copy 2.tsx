// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// // Import offline hook
// import { useOffline } from "~/hooks/useOffline";
// import { backgroundSync } from "~/utils/backgroundSync";

// import ComponentCard from "~/components/dashboard/common/ComponentCard";
// import Avatar from "~/components/dashboard/ui/avatar/Avatar";
// import MembershipDetailsModal from "~/components/user/memberships/MembershipDetailsModal";
// import WeeklyWorkoutChart from "~/components/user/progresses/WeeklyWorkoutChart";
// import Spinner from "./Spinner";

// import { membershipService } from "~/services/membershipService";
// import { transactionService } from "~/services/transactionService";
// import { appointmentService } from "~/services/appointmentService";
// import { promotionService } from "~/services/promotionService";
// import { workoutService } from "~/services/workoutService";
// import { paymentService } from "~/services/paymentService";

// import { toast } from "sonner";
// import { formatTime } from "~/utils/formatters";

// import { MembershipDetailsResponse, MembershipWithRemainingData } from "~/types/membership";
// import { RecentTransactionDTO } from "~/types/transaction";
// import { PromotionResponse } from "~/types/promotion";

// // Interface for combined upcoming schedule items
// interface ScheduleItem {
//   date: Date;
//   timeStart: Date;
//   timeEnd?: Date;
//   location?: string;
//   status: string;
//   type: "workout" | "appointment";
//   name?: string;
// }

// // Interface for Weekly Workout data
// interface WeeklyWorkout {
//   name: string;
//   sessions: number;
//   duration: number;
//   target?: number;
// }

// // Offline Status Indicator Component
// const OfflineIndicator = ({ 
//   isOnline, 
//   isLoading, 
//   lastSyncTime, 
//   onSync 
// }: {
//   isOnline: boolean;
//   isLoading: boolean;
//   lastSyncTime: Date | null;
//   onSync: () => void;
// }) => {
//   return (
//     <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
//       isOnline ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
//     }`}>
//       <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
//       <span className="font-medium">
//         {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
//       </span>
      
//       {lastSyncTime && (
//         <span className="text-xs opacity-75">
//           • Đồng bộ lần cuối: {lastSyncTime.toLocaleTimeString('vi-VN')}
//         </span>
//       )}
      
//       {!isOnline && (
//         <button
//           onClick={onSync}
//           disabled={isLoading}
//           className="ml-2 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 disabled:opacity-50"
//         >
//           {isLoading ? 'Đang đồng bộ...' : 'Đồng bộ'}
//         </button>
//       )}
//     </div>
//   );
// };

// // Data Source Indicator
// const DataSourceIndicator = ({ isOfflineData }: { isOfflineData: boolean }) => {
//   if (!isOfflineData) return null;
  
//   return (
//     <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
//       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
//         <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//       </svg>
//       Dữ liệu ngoại tuyến
//     </div>
//   );
// };

// // Badge component for statuses
// const Badge = ({
//   type,
//   text,
// }: {
//   type: "success" | "warning" | "error" | "info";
//   text: string;
// }) => {
//   const colorClasses = {
//     success:
//       "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
//     warning:
//       "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
//     error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
//     info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
//   };

//   return (
//     <span
//       className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[type]}`}
//     >
//       {text}
//     </span>
//   );
// };

// // Helper functions
// const getPackageBadgeType = (
//   category: string,
// ): "success" | "warning" | "error" | "info" => {
//   switch (category.toLowerCase()) {
//     case "premium":
//     case "platinum":
//     case "vip":
//       return "success";
//     case "fitness":
//       return "info";
//     case "basic":
//       return "warning";
//     default:
//       return "info";
//   }
// };

// const capitalizeFirstLetter = (string: string): string => {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// };

// const Dashboard: React.FC = () => {
//   // Initialize offline hook
//   const { state, userData, refreshData, syncPendingChanges, clearCache, getCacheStats } = useOffline();
  
//   // Original states
//   const [membershipDetails, setMembershipDetails] = useState<MembershipDetailsResponse | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
//   const navigate = useNavigate();

//   // State for membership modal
//   const [selectedMembership, setSelectedMembership] = useState<MembershipWithRemainingData | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

//   // State for combined upcoming schedule
//   const [upcomingSchedule, setUpcomingSchedule] = useState<ScheduleItem[]>([]);
//   // State for recent transactions
//   const [recentTransactions, setRecentTransactions] = useState<RecentTransactionDTO[]>([]);
//   // State for weekly workout data
//   const [weeklyWorkoutData, setWeeklyWorkoutData] = useState<WeeklyWorkout[]>([
//     { name: "T2", sessions: 0, duration: 0, target: 0 },
//     { name: "T3", sessions: 0, duration: 0, target: 0 },
//     { name: "T4", sessions: 0, duration: 0, target: 0 },
//     { name: "T5", sessions: 0, duration: 0, target: 0 },
//     { name: "T6", sessions: 0, duration: 0, target: 0 },
//     { name: "T7", sessions: 0, duration: 0, target: 0 },
//     { name: "CN", sessions: 0, duration: 0, target: 0 },
//   ]);

//   // Handle payment - Queue for offline support
//   const handlePayment = async (packageId: string) => {
//     try {
//       if (!state.isOnline) {
//         // Queue payment request for when online
//         await backgroundSync.queueRequest('/api/payment/register', 'POST', { packageId }, {
//           priority: 'high',
//           action: 'Đăng ký gói tập'
//         });
//         toast.info('Yêu cầu đã được lưu. Sẽ xử lý khi có kết nối mạng.');
//         return;
//       }

//       // Step 1: Register for the package
//       const registerResponse = await paymentService.registerPackage(packageId);

//       if (!registerResponse.success) {
//         toast.error(registerResponse.message || "Lỗi khi đăng ký gói tập");
//         return;
//       }

//       // Step 2: Create MoMo payment request
//       const paymentResponse = await paymentService.createMoMoPayment(packageId);

//       if (!paymentResponse.success || !paymentResponse.data) {
//         toast.error(paymentResponse.message || "Lỗi khi tạo yêu cầu thanh toán");
//         return;
//       }

//       // Save payment info to localStorage for later use
//       localStorage.setItem(
//         "currentPayment",
//         JSON.stringify({
//           paymentId: paymentResponse.data.paymentId,
//           transactionId: paymentResponse.data.transactionId,
//           amount: paymentResponse.data.amount,
//           expireTime: paymentResponse.data.expireTime,
//           packageId: packageId,
//         }),
//       );

//       // Redirect to MoMo payment page
//       window.location.href = paymentResponse.data.payUrl;
//     } catch (err) {
//       console.error("Lỗi khi xử lý đăng ký:", err);
//       toast.error("Đã xảy ra lỗi không mong muốn");
//     }
//   };

//   // Handle pause membership - Queue for offline support
//   const handlePauseMembership = async (id: string) => {
//     try {
//       if (!state.isOnline) {
//         await backgroundSync.queueRequest(`/api/user/memberships/${id}/pause`, 'PUT', null, {
//           priority: 'medium',
//           action: 'Tạm dừng gói tập'
//         });
//         toast.info('Yêu cầu tạm dừng đã được lưu. Sẽ xử lý khi có kết nối mạng.');
//         setIsModalOpen(false);
//         return;
//       }

//       const response = await membershipService.pauseMembership(id);
//       if (response.success) {
//         await refreshData();
//         toast.success("Tạm dừng gói tập thành công");
//         setIsModalOpen(false);
//       } else {
//         toast.error(response.message || "Không thể tạm dừng gói tập");
//       }
//     } catch (error) {
//       console.error("Lỗi khi tạm dừng gói tập:", error);
//       toast.error("Đã xảy ra lỗi khi tạm dừng gói tập");
//     }
//   };

//   // Handle resume membership - Queue for offline support
//   const handleResumeMembership = async (id: string) => {
//     try {
//       if (!state.isOnline) {
//         await backgroundSync.queueRequest(`/api/user/memberships/${id}/resume`, 'PUT', null, {
//           priority: 'medium',
//           action: 'Tiếp tục gói tập'
//         });
//         toast.info('Yêu cầu tiếp tục đã được lưu. Sẽ xử lý khi có kết nối mạng.');
//         setIsModalOpen(false);
//         return;
//       }

//       const response = await membershipService.resumeMembership(id);
//       if (response.success) {
//         await refreshData();
//         toast.success("Tiếp tục gói tập thành công");
//         setIsModalOpen(false);
//       } else {
//         toast.error(response.message || "Không thể tiếp tục gói tập");
//       }
//     } catch (error) {
//       console.error("Lỗi khi tiếp tục gói tập:", error);
//       toast.error("Đã xảy ra lỗi khi tiếp tục gói tập");
//     }
//   };

//   // Handle view membership details
//   const handleViewDetails = async (id: string) => {
//     try {
//       const response = await membershipService.getMembershipById(id);
//       if (response.success && response.data) {
//         setSelectedMembership(response.data);
//         setIsModalOpen(true);
//       } else {
//         toast.error("Vui lòng đăng ký gói tập");
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải chi tiết gói tập:", error);
//       toast.error("Đã xảy ra lỗi khi tải chi tiết gói tập");
//     }
//   };

//   // Handle manual sync
//   const handleManualSync = async () => {
//     try {
//       await syncPendingChanges();
//       await refreshData();
//       toast.success('Đồng bộ thành công!');
//     } catch (error) {
//       console.error('Lỗi đồng bộ:', error);
//       toast.error('Lỗi khi đồng bộ dữ liệu');
//     }
//   };

//   // Format date for display
//   const formatDate = (date: Date): string => {
//     const today = new Date();
//     const tomorrow = new Date();
//     tomorrow.setDate(today.getDate() + 1);

//     if (date.toDateString() === today.toDateString()) {
//       return "Hôm nay";
//     } else if (date.toDateString() === tomorrow.toDateString()) {
//       return "Ngày mai";
//     } else {
//       return date.toLocaleDateString("vi-VN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//       });
//     }
//   };

//   // Get badge type based on status
//   const getStatusBadgeType = (
//     status: string,
//   ): "success" | "warning" | "error" | "info" => {
//     switch (status.toLowerCase()) {
//       case "confirmed":
//       case "đã xác nhận":
//         return "success";
//       case "pending":
//       case "chờ xác nhận":
//         return "info";
//       case "cancelled":
//       case "đã hủy":
//         return "error";
//       default:
//         return "warning";
//     }
//   };

//   // Format status for display
//   const formatStatus = (status: string): string => {
//     switch (status.toLowerCase()) {
//       case "confirmed":
//         return "Đã xác nhận";
//       case "pending":
//         return "Chờ xác nhận";
//       case "cancelled":
//         return "Đã hủy";
//       default:
//         return status;
//     }
//   };

//   // Load data from offline hook or fallback to API
//   const fetchData = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       // Use offline hook data if available
//       if (userData) {
//         // Use cached data from offline hook
//         if (userData.membership) {
//           setMembershipDetails(userData.membership);
//         }

//         if (userData.workouts) {
//           setWeeklyWorkoutData(userData.workouts);
//         }

//         if (userData.appointments) {
//           // Combine appointments and workouts for schedule
//           let combinedSchedule: ScheduleItem[] = [];
          
//           // Process appointments
//           const appointments = userData.appointments.map((appointment: any) => ({
//             ...appointment,
//             type: "appointment" as const,
//             name: "Tập với PT",
//           }));
//           combinedSchedule = [...combinedSchedule, ...appointments];

//           // Sort by date and time
//           combinedSchedule.sort((a, b) => {
//             const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
//             if (dateCompare !== 0) return dateCompare;
//             return new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime();
//           });

//           setUpcomingSchedule(combinedSchedule);
//         }

//         if (userData.transactions) {
//           setRecentTransactions(userData.transactions);
//         }

//         if (userData.promotions) {
//           setPromotions(userData.promotions);
//         }
//       } else if (state.isOnline) {
//         // Fallback to direct API calls if no cached data and online
//         // Fetch membership details
//         const membershipResponse = await membershipService.getInforMembershipDetails();
//         if (membershipResponse.success && membershipResponse.data) {
//           setMembershipDetails(membershipResponse.data);
//         } else {
//           setError(membershipResponse.message || "Không thể tải thông tin hội viên");
//         }

//         // Fetch other data...
//         const weeklyStatsResponse = await workoutService.getWeeklyWorkoutStats();
//         if (weeklyStatsResponse.success && weeklyStatsResponse.data) {
//           setWeeklyWorkoutData(weeklyStatsResponse.data);
//         }

//         // Continue with other API calls as needed...
//       } else {
//         // Offline and no cached data
//         setError("Không có dữ liệu ngoại tuyến. Vui lòng kết nối mạng để tải dữ liệu.");
//       }
//     } catch (err) {
//       setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
//       console.error("Error fetching data:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Navigate to full schedule
//   const goToFullSchedule = () => {
//     navigate("/user/my-schedule");
//   };

//   // Update loading state based on offline hook
//   useEffect(() => {
//     setIsLoading(state.isLoading);
//   }, [state.isLoading]);

//   // Load data when offline state changes
//   useEffect(() => {
//     fetchData();
//   }, [userData, state.isOnline]);

//   // Show loading spinner
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Spinner />
//       </div>
//     );
//   }

//   // Show error state
//   if (error && !userData) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
//         <p className="text-red-600 text-center">{error}</p>
//         <button 
//           onClick={handleManualSync}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           Thử lại
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Offline Status Indicator */}
//       <OfflineIndicator 
//         isOnline={state.isOnline}
//         isLoading={state.isLoading}
//         lastSyncTime={state.lastSyncTime}
//         onSync={handleManualSync}
//       />

//       {/* Membership Section */}
//       <ComponentCard title="Thông tin hội viên">
//         <div className="flex justify-between items-start">
//           <DataSourceIndicator isOfflineData={!state.isOnline && state.hasOfflineData} />
//         </div>
        
//         {membershipDetails ? (
//           <div className="space-y-4">
//             {/* Membership content */}
//             <div className="flex items-center space-x-4">
//               <Avatar
//                 src={membershipDetails.avatar || "/api/placeholder/64/64"}
//                 alt={membershipDetails.fullName}
//                 size="lg"
//               />
//               <div className="flex-1">
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                   {membershipDetails.fullName}
//                 </h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   {membershipDetails.email}
//                 </p>
//                 {membershipDetails.phoneNumber && (
//                   <p className="text-sm text-gray-600 dark:text-gray-400">
//                     {membershipDetails.phoneNumber}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Membership details */}
//             {membershipDetails.memberships && membershipDetails.memberships.length > 0 ? (
//               <div className="space-y-3">
//                 {membershipDetails.memberships.map((membership) => (
//                   <div key={membership.id} className="border rounded-lg p-4">
//                     <div className="flex justify-between items-start mb-3">
//                       <div>
//                         <h4 className="font-medium text-gray-900 dark:text-white">
//                           {membership.packageName}
//                         </h4>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {membership.gymName}
//                         </p>
//                       </div>
//                       <div className="flex space-x-2">
//                         <Badge
//                           type={getPackageBadgeType(membership.category)}
//                           text={capitalizeFirstLetter(membership.category)}
//                         />
//                         <Badge
//                           type={membership.status === 'active' ? 'success' : 'warning'}
//                           text={membership.status === 'active' ? 'Đang hoạt động' : capitalizeFirstLetter(membership.status)}
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div>
//                         <span className="text-gray-600 dark:text-gray-400">Ngày bắt đầu:</span>
//                         <p className="font-medium">
//                           {new Date(membership.startDate).toLocaleDateString('vi-VN')}
//                         </p>
//                       </div>
//                       <div>
//                         <span className="text-gray-600 dark:text-gray-400">Ngày kết thúc:</span>
//                         <p className="font-medium">
//                           {new Date(membership.endDate).toLocaleDateString('vi-VN')}
//                         </p>
//                       </div>
//                       <div>
//                         <span className="text-gray-600 dark:text-gray-400">Số buổi còn lại:</span>
//                         <p className="font-medium text-blue-600">
//                           {membership.remainingSessions}
//                         </p>
//                       </div>
//                       <div>
//                         <span className="text-gray-600 dark:text-gray-400">Tổng buổi:</span>
//                         <p className="font-medium">
//                           {membership.totalSessions}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex space-x-2 mt-4">
//                       <button
//                         onClick={() => handleViewDetails(membership.id)}
//                         className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//                         disabled={!state.isOnline}
//                       >
//                         Xem chi tiết
//                       </button>
                      
//                       {membership.status === 'active' && (
//                         <button
//                           onClick={() => handlePauseMembership(membership.id)}
//                           className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
//                           disabled={!state.isOnline}
//                         >
//                           Tạm dừng
//                         </button>
//                       )}
                      
//                       {membership.status === 'paused' && (
//                         <button
//                           onClick={() => handleResumeMembership(membership.id)}
//                           className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
//                         >
//                           Tiếp tục
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-gray-600 dark:text-gray-400 mb-4">
//                   Bạn chưa có gói tập nào
//                 </p>
//                 <button
//                   onClick={() => navigate('/user/packages')}
//                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//                   disabled={!state.isOnline}
//                 >
//                   Đăng ký gói tập
//                 </button>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <p className="text-gray-600 dark:text-gray-400">
//               {!state.isOnline ? 'Không có dữ liệu ngoại tuyến' : 'Không thể tải thông tin hội viên'}
//             </p>
//           </div>
//         )}
//       </ComponentCard>

//       {/* Weekly Workout Chart */}
//       <ComponentCard title="Thống kê tập luyện tuần">
//         <DataSourceIndicator isOfflineData={!state.isOnline && state.hasOfflineData} />
//         <WeeklyWorkoutChart data={weeklyWorkoutData} />
//       </ComponentCard>

//       {/* Upcoming Schedule */}
//       <ComponentCard 
//         title="Lịch trình sắp tới" 
//         action={
//           <button
//             onClick={goToFullSchedule}
//             className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
//             disabled={!state.isOnline}
//           >
//             Xem tất cả
//           </button>
//         }
//       >
//         <DataSourceIndicator isOfflineData={!state.isOnline && state.hasOfflineData} />
        
//         {upcomingSchedule.length > 0 ? (
//           <div className="space-y-3">
//             {upcomingSchedule.slice(0, 5).map((item, index) => (
//               <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="text-center">
//                     <p className="text-xs text-gray-500">{formatDate(new Date(item.date))}</p>
//                     <p className="font-medium">
//                       {formatTime(new Date(item.timeStart))}
//                       {item.timeEnd && ` - ${formatTime(new Date(item.timeEnd))}`}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="font-medium">{item.name}</p>
//                     {item.location && (
//                       <p className="text-sm text-gray-600">{item.location}</p>
//                     )}
//                   </div>
//                 </div>
//                 <Badge
//                   type={getStatusBadgeType(item.status)}
//                   text={formatStatus(item.status)}
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <p className="text-gray-600 dark:text-gray-400">
//               Không có lịch trình nào trong thời gian tới
//             </p>
//           </div>
//         )}
//       </ComponentCard>

//       {/* Recent Transactions */}
//       <ComponentCard title="Giao dịch gần đây">
//         <DataSourceIndicator isOfflineData={!state.isOnline && state.hasOfflineData} />
        
//         {recentTransactions.length > 0 ? (
//           <div className="space-y-3">
//             {recentTransactions.slice(0, 5).map((transaction) => (
//               <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
//                 <div>
//                   <p className="font-medium">{transaction.packageName}</p>
//                   <p className="text-sm text-gray-600">
//                     {new Date(transaction.transactionDate).toLocaleDateString('vi-VN')}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-semibold text-green-600">
//                     {transaction.amount.toLocaleString('vi-VN')} ₫
//                   </p>
//                   <Badge type="success" text="Thành công" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <p className="text-gray-600 dark:text-gray-400">
//               Chưa có giao dịch nào
//             </p>
//           </div>
//         )}
//       </ComponentCard>

//     {/* Promotions */}
//       {promotions.length > 0 && (
//         <ComponentCard title="Khuyến mãi đặc biệt">
//           <DataSourceIndicator isOfflineData={!state.isOnline && state.hasOfflineData} />
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {promotions.slice(0, 4).map((promotion) => (
//               <div key={promotion.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
//                 <h4 className="font-semibold text-gray-900 mb-2">{promotion.title}</h4>
//                 <p className="text-sm text-gray-600 mb-3">{promotion.description}</p>
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-bold text-blue-600">
//                     -{promotion.discount}%
//                   </span>
//                   <button
//                     onClick={() => navigate('/user/packages')}
//                     className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
//                     disabled={!state.isOnline}
//                   >
//                     Xem chi tiết
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </ComponentCard>
//       )}

//       {/* Quick Access Menu */}
//       <ComponentCard title="Truy cập nhanh">
//         <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
//           <button
//             className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
//             onClick={() => navigate("/user/workout")}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={1.5}
//               stroke="currentColor"
//               className="mb-2 h-8 w-8 text-blue-600 dark:text-blue-400"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
//               />
//             </svg>
//             <span className="text-center text-sm font-medium">
//               Tạo lịch tập
//             </span>
//           </button>

//           <button
//             className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
//             onClick={() => navigate("/user/list-trainer")}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={1.5}
//               stroke="currentColor"
//               className="mb-2 h-8 w-8 text-purple-600 dark:text-purple-400"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
//               />
//             </svg>
//             <span className="text-center text-sm font-medium">
//               Hẹn với PT
//             </span>
//           </button>

//           <button
//             className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
//             onClick={() => navigate("/user/progress")}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={1.5}
//               stroke="currentColor"
//               className="mb-2 h-8 w-8 text-green-600 dark:text-green-400"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
//               />
//             </svg>
//             <span className="text-center text-sm font-medium">
//               Xem tiến độ
//             </span>
//           </button>

//           <button
//             className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
//             onClick={() => navigate("/user/packages")}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={1.5}
//               stroke="currentColor"
//               className="mb-2 h-8 w-8 text-orange-600 dark:text-orange-400"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M12 6v12m6-6H6"
//               />
//             </svg>
//             <span className="text-center text-sm font-medium">
//               Mua gói tập
//             </span>
//           </button>
//         </div>
//       </ComponentCard>

//       {/* Notifications */}
//       <ComponentCard title="Thông báo & Nhắc nhở">
//         <div className="space-y-4">
//           <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-900/20">
//             <h4 className="mb-1 font-medium text-yellow-700 dark:text-yellow-400">
//               Gói tập sắp hết hạn
//             </h4>
//             <p className="text-sm text-yellow-600 dark:text-yellow-300">
//               Gói tập của bạn sẽ hết hạn sau 45 ngày. Gia hạn ngay để nhận ưu đãi 15%.
//             </p>
//             <button 
//               className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
//               onClick={() => navigate('/user/packages')}
//             >
//               Gia hạn ngay
//             </button>
//           </div>

//           <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/20">
//             <h4 className="mb-1 font-medium text-blue-700 dark:text-blue-400">
//               Sự kiện sắp diễn ra
//             </h4>
//             <p className="text-sm text-blue-600 dark:text-blue-300">
//               Workshop "Dinh dưỡng cho người tập gym" sẽ diễn ra vào 20/03/2025.
//             </p>
//             <button className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
//               Đăng ký tham gia
//             </button>
//           </div>

//           <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:border-green-600 dark:bg-green-900/20">
//             <h4 className="mb-1 font-medium text-green-700 dark:text-green-400">
//               Chạm mốc thành tựu
//             </h4>
//             <p className="text-sm text-green-600 dark:text-green-300">
//               Chúc mừng! Bạn đã hoàn thành 50 buổi tập tại phòng gym.
//             </p>
//             <button className="mt-2 text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
//               Xem thành tựu
//             </button>
//           </div>
//         </div>
//       </ComponentCard>

//       {/* Membership Details Modal */}
//       {selectedMembership && (
//         <MembershipDetailsModal
//           membership={selectedMembership}
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           onPause={handlePauseMembership}
//           onResume={handleResumeMembership}
//         />
//       )}
//     </div>
//   );
// };