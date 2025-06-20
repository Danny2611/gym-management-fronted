// import { CombinedSchedule } from "~/types/workout";
// import { ScheduleCard } from "~/components/user/appointments/ScheduleCard";
// import { formatDate, formatTime,  } from "~/utils/formatters";
// import { ActivityIcon, ClipboardIcon, ClockIcon, DumbbellIcon, InfoIcon, MapPinIcon, UserRoundIcon, XCircleIcon } from "lucide-react";
// import Button from "~/components/common/Button";

// export const renderScheduleCard = (schedule: CombinedSchedule) => {
//     // Xác định thông tin hiển thị dựa vào loại lịch
//     const time = schedule.timeStart || schedule.time || "";
//     const status = schedule.status;

//     // Xác định các class CSS dựa vào loại lịch và trạng thái
//     let statusBgColor = "";
//     let statusTextColor = "";
//     let cardBorderColor = "";
//     let cardBgColor = "";

//     switch (status) {
//       case "upcoming":
//         statusBgColor = "bg-blue-100 dark:bg-blue-900/30";
//         statusTextColor = "text-blue-800 dark:text-blue-200";
//         cardBorderColor = "border-l-4 border-l-blue-500";
//         cardBgColor = "bg-blue-50/50 dark:bg-blue-900/10";
//         break;
//       case "completed":
//         statusBgColor = "bg-green-100 dark:bg-green-900/30";
//         statusTextColor = "text-green-800 dark:text-green-200";
//         cardBorderColor = "border-l-4 border-l-green-500";
//         cardBgColor = "bg-green-50/50 dark:bg-green-900/10";
//         break;
//       case "missed":
//         statusBgColor = "bg-red-100 dark:bg-red-900/30";
//         statusTextColor = "text-red-800 dark:text-red-200";
//         cardBorderColor = "border-l-4 border-l-red-500";
//         cardBgColor = "bg-red-50/50 dark:bg-red-900/10";
//         break;
//       default:
//         statusBgColor = "bg-gray-100 dark:bg-gray-800";
//         statusTextColor = "text-gray-800 dark:text-gray-200";
//         cardBorderColor = "border-l-4 border-l-gray-500";
//         cardBgColor = "";
//     }

//     return (
//       <div className={`p-4 ${cardBorderColor} ${cardBgColor}`}>
//         <div className="flex justify-between">
//           <div className="flex">
//             {schedule.type === 'appointment' ? (
//               // PT Schedule info
//               <div className="mr-4 overflow-hidden rounded-full">
//                 {schedule.trainer_image ? (
//                   <img
//                     src={schedule.trainer_image}

//                     className="h-12 w-12 object-cover"
//                   />
//                 ) : (
//                   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
//                     <UserRoundIcon size={24} />
//                   </div>
//                 )}
//               </div>
//             ) : (
//               // Workout Schedule icon
//               <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white">
//                 <DumbbellIcon size={24} />
//               </div>
//             )}

//             <div>
//               <h3 className="font-bold text-gray-900 dark:text-white">
//                 {schedule.type === 'appointment'
//                   ? `Buổi tập PT: ${schedule.package_name || "Không có tên gói"}`
//                   : `Tập cá nhân: ${schedule.muscle_groups?.join(", ") || "Tất cả nhóm cơ"}`}
//               </h3>

//               {viewMode === "list" && (
//                 <p className="text-sm text-gray-600 dark:text-gray-300">
//                   {format(parseISO(schedule.date), "EEEE, dd/MM/yyyy", { locale: vi })}
//                 </p>
//               )}

//               <div className="mt-1 flex items-center space-x-2">
//                 <ClockIcon size={16} className="text-gray-500" />
//                 <span className="text-sm text-gray-600 dark:text-gray-300">

//                   {schedule.type === 'workout' && schedule.duration && ` (${schedule.duration} phút)`}
//                 </span>
//               </div>

//               {schedule.location && (
//                 <div className="mt-1 flex items-center space-x-2">
//                   <MapPinIcon size={16} className="text-gray-500" />
//                   <span className="text-sm text-gray-600 dark:text-gray-300">{schedule.location}</span>
//                 </div>
//               )}

//               {schedule.type === 'appointment' && schedule.trainer_name && (
//                 <div className="mt-1 flex items-center space-x-2">
//                   <UserRoundIcon size={16} className="text-gray-500" />
//                   <span className="text-sm text-gray-600 dark:text-gray-300">
//                     HLV: {schedule.trainer_name}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div>
//             <div className={`rounded-full px-3 py-1 text-xs font-medium ${statusBgColor} ${statusTextColor}`}>
//               {schedule.status === "upcoming" && "Sắp tới"}
//               {schedule.status === "completed" && "Đã hoàn thành"}
//               {schedule.status === "missed" && "Đã bỏ lỡ"}
//             </div>
//           </div>
//         </div>

//         {schedule.notes && (
//           <div className="mt-3 rounded-lg bg-gray-100 p-2 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
//             <div className="flex">
//               <ClipboardIcon size={16} className="mr-1 text-gray-500" />
//               <span className="font-semibold">Ghi chú:</span>
//             </div>
//             <p className="mt-1">{schedule.notes}</p>
//           </div>
//         )}

//         {schedule.type === 'workout' && schedule.exercises && schedule.exercises.length > 0 && (
//           <div className="mt-3">
//             <div className="flex items-center">
//               <ActivityIcon size={16} className="mr-1 text-gray-500" />
//               <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
//                 Bài tập ({schedule.exercises.length}):
//               </span>
//             </div>
//             <div className="mt-1 space-y-1">
//               {schedule.exercises.slice(0, 3).map((exercise, index) => (
//                 <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
//                   • {exercise.name} ({exercise.sets} x {exercise.reps})
//                 </div>
//               ))}
//               {schedule.exercises.length > 3 && (
//                 <div className="text-xs text-blue-600 dark:text-blue-400">
//                   + {schedule.exercises.length - 3} bài tập khác
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         <div className="mt-3 flex justify-end space-x-2">
//           {schedule.type === 'appointment' && (
//             <Button
//               size="small"
//               variant="outline"
//               className="text-xs"
//               onClick={() => navigate(`/member/pt-session/${schedule._id}`)}
//             >
//               <InfoIcon size={14} className="mr-1" />
//               Chi tiết
//             </Button>
//           )}

//           {schedule.type === 'workout' && (
//             <Button
//               size="small"
//               variant="outline"
//               className="text-xs"
//               onClick={() => navigate(`/member/workout/${schedule._id}`)}
//             >
//               <InfoIcon size={14} className="mr-1" />
//               Chi tiết
//             </Button>
//           )}

//           {schedule.status === "upcoming" && (
//             <Button
//               size="small"
//               variant="outline"
//               className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
//               // onClick={() => handleCancelSchedule(schedule)}
//             >
//               <XCircleIcon size={14} className="mr-1" />
//               Hủy lịch
//             </Button>
//           )}
//         </div>
//       </div>
//     );
//   };
