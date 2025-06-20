// import React, { useState } from "react";
// import { Schedule } from "~/types/schedule";

// interface ScheduleCardProps {
//   schedule: Schedule;
//   onMarkCompleted?: (id: string, endTime: string, date: string) => void;
//   onViewDetails?: (id: string) => void;
//   onReschedule?: (id: string) => void;
//   isPtSession?: boolean;
// }

// export const ScheduleCard: React.FC<ScheduleCardProps> = ({
//   schedule,
//   onMarkCompleted,
//   onReschedule,
//   isPtSession,
// }) => {
//   const [showTooltip, setShowTooltip] = useState(false);

//   // Extract the end time from the time field or use default (1 hour later)
//   const getEndTime = () => {
//     // Nếu đã có end time thì trả về luôn
//     if (schedule.time.endTime) return schedule.time.endTime;

//     // Nếu không có end time, ước tính nó là 1 giờ sau start time
//     const [hour, minute] = schedule.time.startTime.split(':').map(Number);
//     const endDate = new Date();
//     endDate.setHours(hour + 1, minute, 0, 0);

//     // Trả về chuỗi HH:MM đã chuẩn hóa (2 chữ số)
//     return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
//   };

//   // Check if appointment can be marked as completed
//   const canMarkCompleted = () => {
//     // Must be in "upcoming" status (which corresponds to "confirmed" in backend)
//     if (schedule.status !== "upcoming") return false;

//     const now = new Date();
//     const [endHour, endMinute] = getEndTime().split(':').map(Number);
//     const appointmentEnd = new Date(schedule.date);
//     appointmentEnd.setHours(endHour, endMinute, 0, 0);

//     // Calculate latest allowed time (23:59:59 of the day after appointment)
//     const latestAllowedTime = new Date(schedule.date);
//     latestAllowedTime.setDate(latestAllowedTime.getDate() + 1);
//     latestAllowedTime.setHours(23, 59, 59, 999);

//     // Can only mark completed if current time is after end time and before the deadline
//     return now >= appointmentEnd && now <= latestAllowedTime;
//   };

//   // Get reason why it can't be marked as completed
//   const getCompletionBlockReason = () => {
//     if (schedule.status !== "upcoming") {
//       return "Chỉ lịch tập có trạng thái 'Sắp tới' mới có thể đánh dấu hoàn thành";
//     }

//     const now = new Date();
//     const [endHour, endMinute] = getEndTime().split(':').map(Number);
//     const appointmentEnd = new Date(schedule.date);
//     appointmentEnd.setHours(endHour, endMinute, 0, 0);

//     // Calculate latest allowed time (23:59:59 of the day after appointment)
//     const latestAllowedTime = new Date(schedule.date);
//     latestAllowedTime.setDate(latestAllowedTime.getDate() + 1);
//     latestAllowedTime.setHours(23, 59, 59, 999);

//     if (now < appointmentEnd) {
//       return "Chỉ có thể đánh dấu hoàn thành sau khi buổi tập kết thúc";
//     }

//     if (now > latestAllowedTime) {
//       return "Đã quá thời gian cho phép cập nhật hoàn thành buổi tập (trước 23:59 của ngày sau buổi tập)";
//     }

//     return "";
//   };

//   return (
//     <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
//       <div className="flex items-start">
//         <div
//           className={`mr-4 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full ${
//             schedule.status === "upcoming"
//               ? "bg-blue-100 text-blue-600"
//               : schedule.status === "completed"
//                 ? "bg-green-100 text-green-600"
//                 : "bg-red-100 text-red-600"
//           } `}
//         >
//           {schedule.trainer_image ? (
//             <img
//               src={
//                 `http://localhost:5000/public/${schedule.trainer_image}` ||
//                 "/api/placeholder/400/400"
//               }
//               alt="Huấn luyện viên"
//               className="h-full w-full rounded-full object-cover"
//             />
//           ) : (
//             <div className="text-2xl font-bold">
//               {schedule.time.startTime} - {schedule.time.endTime}
//             </div>
//           )}
//         </div>

//         <div className="flex-1">
//           <div className="flex justify-between">
//             <div>
//               <span className="text-sm text-gray-500 dark:text-gray-400">
//                 {schedule.date} - Thời gian: {schedule.time.startTime} đến {schedule.time.endTime}
//               </span>
//               <h3 className="mt-1 text-lg font-semibold">
//                 {schedule.package_name}
//               </h3>
//               <p className="text-gray-700 dark:text-gray-300">
//                 {schedule.location}
//               </p>
//             </div>
//             <div>
//               <span
//                 className={`rounded-full px-3 py-1 text-xs font-medium ${
//                   schedule.status === "upcoming"
//                     ? "bg-blue-100 text-blue-800"
//                     : schedule.status === "completed"
//                       ? "bg-green-100 text-green-800"
//                       : "bg-red-100 text-red-800"
//                 } `}
//               >
//                 {schedule.status === "upcoming"
//                   ? "Sắp tới"
//                   : schedule.status === "completed"
//                     ? "Đã hoàn thành"
//                     : "Đã lỡ"}
//               </span>
//             </div>
//           </div>

//           {schedule.trainer_name && (
//             <div className="mt-2 flex items-center">
//               <span className="mr-1 text-sm text-gray-600 dark:text-gray-400">
//                 HLV:
//               </span>
//               <span className="font-medium">{schedule.trainer_name}</span>
//             </div>
//           )}

//           {schedule.notes && (
//             <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
//               {schedule.notes}
//             </p>
//           )}

//           <div className="mt-3 flex flex-wrap gap-2">
//             {schedule.status === "upcoming" && onMarkCompleted && (
//               <div className="relative">
//                 <button
//                   className={`rounded px-3 py-1 text-sm text-white ${
//                     canMarkCompleted()
//                       ? "bg-blue-500 hover:bg-blue-600"
//                       : "bg-gray-400 cursor-not-allowed"
//                   }`}
//                   onClick={() => {
//                     if (canMarkCompleted() && onMarkCompleted) {
//                       onMarkCompleted(schedule.id, getEndTime(), schedule.date);
//                     } else {
//                       setShowTooltip(true);
//                       setTimeout(() => setShowTooltip(false), 5000); // Hide after 5 seconds
//                     }
//                   }}
//                   onMouseEnter={() => {
//                     if (!canMarkCompleted()) setShowTooltip(true);
//                   }}
//                   onMouseLeave={() => setShowTooltip(false)}
//                 >
//                   Đánh dấu hoàn thành
//                 </button>
//                 {showTooltip && !canMarkCompleted() && (
//                   <div className="absolute bottom-full left-0 mb-2 w-64 rounded bg-gray-800 p-2 text-xs text-white shadow-lg">
//                     {getCompletionBlockReason()}
//                   </div>
//                 )}
//               </div>
//             )}
//             {schedule.status === "upcoming" && onReschedule && (
//               <button
//                 className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
//                 onClick={() => onReschedule(schedule.id)}
//               >
//                 Đổi lịch
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
