// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import {
//   format,
//   startOfWeek,
//   startOfMonth,
//   endOfMonth,
//   addDays,
//   isSameDay,
//   isSameMonth,
//   parseISO,
// } from "date-fns";
// import { vi } from "date-fns/locale";
// import { FiChevronDown, FiLoader, FiCalendar, FiUser } from "react-icons/fi";
// import {
//   appointmentService,
//   MemberScheduleFilters,
// } from "~/services/appointmentService";
// import {
//   workoutService,
//   WorkoutScheduleFilters,
// } from "~/services/workoutService";
// import { trainerService } from "~/services/trainerService";
// import { Trainer } from "~/types/trainer";
// import { toast } from "react-toastify";

// // Import các component đã có
// import { CalendarNavigation } from "~/components/user/appointments/FilterButton";
// import { ScheduleCard } from "~/components/user/appointments/ScheduleCard";
// import { EmptyStateCard } from "~/components/user/appointments/EmptyStateCard";
// import { Schedule } from "~/types/schedule";
// import { CombinedSchedule, WorkoutSchedule } from "~/types/workout";
// import { formatDate, formatTime } from "~/utils/formatters";

// const PersonalSchedulePage: React.FC = () => {
//   // Current date and selected date state
//   const navigate = useNavigate();
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [filter, setFilter] = useState<string>("all");
//   const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
//   const [calendarType, setCalendarType] = useState<"week" | "month">("week");
//   const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
//   const [showCalendarOptions, setShowCalendarOptions] = useState(false);

//   // API related states
//   const [ptSchedules, setPtSchedules] = useState<Schedule[]>([]);
//   const [workoutSchedules, setWorkoutSchedules] = useState<WorkoutSchedule[]>(
//     [],
//   );
//   const [combinedSchedules, setCombinedSchedules] = useState<
//     CombinedSchedule[]
//   >([]);
//   const [trainers, setTrainers] = useState<Trainer[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Hiển thị lọc
//   const [showTypeFilter, setShowTypeFilter] = useState(false);
//   const [scheduleType, setScheduleType] = useState<
//     "all" | "appointment" | "workout"
//   >("all");

//   // Filter dropdown states
//   const [showStatusFilter, setShowStatusFilter] = useState(false);
//   const [showTrainerFilter, setShowTrainerFilter] = useState(false);
//   const [showTimeSlotFilter, setShowTimeSlotFilter] = useState(false);

//   // Time slots for filtering
//   const timeSlots = [
//     "Sáng (6:00-12:00)",
//     "Trưa (12:00-15:00)",
//     "Chiều (15:00-18:00)",
//     "Tối (18:00-22:00)",
//   ];

//   // Fetch PT schedules from API
//   const fetchPtSchedules = async () => {
//     try {
//       // Prepare filters
//       const filters: MemberScheduleFilters = {};
//       // Status filter
//       if (filter !== "all") {
//         filters.status = filter;
//       }

//       // Date range for calendar view
//       if (viewMode === "calendar") {
//         if (calendarType === "week") {
//           // For week view, set start and end date of the week
//           const startDay = startOfWeek(currentDate, { weekStartsOn: 1 });
//           const endDay = addDays(startDay, 6);
//           filters.startDate = format(startDay, "yyyy-MM-dd");
//           filters.endDate = format(endDay, "yyyy-MM-dd");
//         } else {
//           // For month view, set start and end date of the month
//           const monthStart = startOfMonth(currentDate);
//           const monthEnd = endOfMonth(currentDate);
//           filters.startDate = format(monthStart, "yyyy-MM-dd");
//           filters.endDate = format(monthEnd, "yyyy-MM-dd");
//         }
//       }

//       // Trainer filter
//       if (selectedTrainer) {
//         filters.trainerId = selectedTrainer;
//       }

//       // Time slot filter
//       if (selectedTimeSlot) {
//         filters.timeSlot = selectedTimeSlot;
//       }

//       const response = await appointmentService.getMemberSchedule(filters);
//       if (response.success && response.data) {
//         setPtSchedules(response.data);
//       } else {
//         setError(response.message || "Đã xảy ra lỗi khi lấy lịch tập");
//         toast.error(response.message || "Đã xảy ra lỗi khi lấy lịch tập");
//       }
//     } catch (err) {
//       setError("Đã xảy ra lỗi khi lấy lịch tập");
//       toast.error("Đã xảy ra lỗi khi lấy lịch tập");
//     }
//   };

//   // Fetch workout schedules from API
//   const fetchWorkoutSchedules = async () => {
//     try {
//       // Prepare filters
//       const filters: WorkoutScheduleFilters = {};

//       // Status filter mapping
//       if (filter !== "all") {
//         // Map PT status to workout status
//         switch (filter) {
//           case "upcoming":
//             filters.status = "upcoming";
//             break;
//           case "completed":
//             filters.status = "completed";
//             break;
//           case "missed":
//             filters.status = "missed";
//             break;
//         }
//       }

//       // Date range for calendar view (reuse the same logic)
//       if (viewMode === "calendar") {
//         if (calendarType === "week") {
//           const startDay = startOfWeek(currentDate, { weekStartsOn: 1 });
//           const endDay = addDays(startDay, 6);
//           filters.startDate = format(startDay, "yyyy-MM-dd");
//           filters.endDate = format(endDay, "yyyy-MM-dd");
//         } else {
//           const monthStart = startOfMonth(currentDate);
//           const monthEnd = endOfMonth(currentDate);
//           filters.startDate = format(monthStart, "yyyy-MM-dd");
//           filters.endDate = format(monthEnd, "yyyy-MM-dd");
//         }
//       }

//       const response = await workoutService.getMemberWorkoutSchedules(filters);
//       if (response.success && response.data) {
//         setWorkoutSchedules(response.data);
//       } else {
//         console.error(
//           response.message || "Đã xảy ra lỗi khi lấy lịch tập cá nhân",
//         );
//       }
//     } catch (err) {
//       console.error("Đã xảy ra lỗi khi lấy lịch tập cá nhân:", err);
//     }
//   };

//   // Combine schedules from both sources
//   const combineSchedules = () => {
//     const combined: CombinedSchedule[] = [];

//     // Transform PT schedules
//     ptSchedules.forEach((schedule) => {
//       combined.push({
//         _id: schedule.id,
//         type: "appointment",
//         date: schedule.date,
//         time: schedule.time,
//         location: schedule.location,
//         package_name: schedule.package_name,
//         notes: schedule.notes,
//         status: schedule.status,
//         trainer_name: schedule.trainer_name,
//         trainer_image: schedule.trainer_image,
//       });
//     });

//     // Transform workout schedules
//     workoutSchedules.forEach((workout) => {
//       combined.push({
//         _id: workout._id,
//         type: "workout",
//         date: workout.date,
//         timeStart: workout.timeStart,
//         duration: workout.duration,
//         muscle_groups: workout.muscle_groups,
//         exercises: workout.exercises,
//         location: workout.location,
//         status: workout.status,
//         notes: workout.notes,
//       });
//     });

//     // Sắp xếp theo ngày và giờ
//     combined.sort((a, b) => {
//       const dateA = new Date(`${a.date}T${a.timeStart}`);
//       const dateB = new Date(`${b.date}T${b.timeStart}`);
//       return dateA.getTime() - dateB.getTime();
//     });

//     setCombinedSchedules(combined);
//   };

//   // Fetch trainers from API
//   const fetchTrainers = async () => {
//     try {
//       const response = await trainerService.getAllTrainers();

//       if (response.success && response.data) {
//         setTrainers(response.data);
//       } else {
//         console.error("Không thể lấy danh sách huấn luyện viên");
//       }
//     } catch (err) {
//       console.error("Lỗi khi lấy danh sách huấn luyện viên:", err);
//     }
//   };

//   // Initial data loading
//   useEffect(() => {
//     fetchTrainers();
//     fetchData();
//   }, []);

//   // Fetch all data
//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Fetch all data in parallel
//       await Promise.all([fetchPtSchedules(), fetchWorkoutSchedules()]);
//     } catch (err) {
//       setError("Đã xảy ra lỗi khi lấy dữ liệu lịch tập");
//       toast.error("Đã xảy ra lỗi khi lấy dữ liệu lịch tập");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Combine schedules when either schedule list changes
//   useEffect(() => {
//     combineSchedules();
//   }, [ptSchedules, workoutSchedules]);

//   // Refetch when filters or dates change
//   useEffect(() => {
//     fetchPtSchedules();
//     fetchWorkoutSchedules();
//   }, [
//     filter,
//     selectedTrainer,
//     selectedTimeSlot,
//     currentDate,
//     calendarType,
//     viewMode,
//     scheduleType,
//   ]);

//   // Toggle view mode and close calendar options when switching to list view
//   const handleViewModeChange = (mode: "calendar" | "list") => {
//     setViewMode(mode);
//     if (mode === "list") {
//       setShowCalendarOptions(false);
//     }
//   };

//   // Toggle calendar options dropdown
//   const toggleCalendarOptions = () => {
//     setShowCalendarOptions(!showCalendarOptions);
//   };

//   // Generate dates for the week view
//   const generateWeekDays = () => {
//     const startDay = startOfWeek(currentDate, { weekStartsOn: 1 }); // Week starts on Monday
//     const weekDays = [];

//     for (let i = 0; i < 7; i++) {
//       weekDays.push(addDays(startDay, i));
//     }

//     return weekDays;
//   };

//   // Generate dates for month view
//   const generateMonthDays = () => {
//     const monthStart = startOfMonth(currentDate);
//     const monthEnd = endOfMonth(currentDate);
//     const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });

//     const days = [];
//     let day = startDate;

//     while (day <= monthEnd || days.length % 7 !== 0) {
//       days.push(day);
//       day = addDays(day, 1);
//     }

//     return days;
//   };

//   // Filter schedules based on selected date for calendar view
//   const getFilteredSchedules = () => {
//     let filtered = [...combinedSchedules];

//     // Filter by type if selected
//     if (scheduleType !== "all") {
//       filtered = filtered.filter((schedule) => schedule.type === scheduleType);
//     }

//     // Filter by date if in calendar view
//     if (viewMode === "calendar") {
//       const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
//       filtered = filtered.filter(
//         (schedule) => schedule.date === selectedDateStr,
//       );
//     }

//     return filtered;
//   };

//   // Check if a date has schedules
//   const hasSchedulesOnDate = (date: Date) => {
//     const dateStr = format(date, "yyyy-MM-dd");
//     return combinedSchedules.some((schedule) => {
//       // Áp dụng bộ lọc loại lịch nếu được chọn
//       if (scheduleType !== "all" && schedule.type !== scheduleType) {
//         return false;
//       }
//       return schedule.date === dateStr;
//     });
//   };

//   // Count schedules on a specific date
//   const countSchedulesOnDate = (date: Date) => {
//     const dateStr = format(date, "yyyy-MM-dd");
//     return combinedSchedules.filter((schedule) => {
//       // Áp dụng bộ lọc loại lịch nếu được chọn
//       if (scheduleType !== "all" && schedule.type !== scheduleType) {
//         return false;
//       }
//       return schedule.date === dateStr;
//     }).length;
//   };

//   // Count PT schedules on a specific date
//   const countPtSchedulesOnDate = (date: Date) => {
//     const dateStr = format(date, "yyyy-MM-dd");
//     return combinedSchedules.filter((schedule) => {
//       // Chỉ đếm lịch PT nếu đang xem tất cả hoặc chỉ xem lịch PT
//       if (scheduleType !== "all" && scheduleType !== "appointment") {
//         return false;
//       }
//       return schedule.date === dateStr && schedule.type === "appointment";
//     }).length;
//   };
//   // Count workout schedules on a specific date
//   const countWorkoutSchedulesOnDate = (date: Date) => {
//     const dateStr = format(date, "yyyy-MM-dd");
//     return combinedSchedules.filter((schedule) => {
//       // Chỉ đếm lịch tập cá nhân nếu đang xem tất cả hoặc chỉ xem lịch tập cá nhân
//       if (scheduleType !== "all" && scheduleType !== "workout") {
//         return false;
//       }
//       return schedule.date === dateStr && schedule.type === "workout";
//     }).length;
//   };
//   // Reset all filters
//   const resetFilters = () => {
//     setFilter("all");
//     setSelectedTrainer(null);
//     setSelectedTimeSlot(null);
//     setScheduleType("all");
//     setShowStatusFilter(false);
//     setShowTrainerFilter(false);
//     setShowTimeSlotFilter(false);
//     setShowTypeFilter(false);
//   };

//   // Close all dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = () => {
//       setShowCalendarOptions(false);
//       setShowStatusFilter(false);
//       setShowTrainerFilter(false);
//       setShowTimeSlotFilter(false);
//       setShowTypeFilter(false);
//     };

//     // Add listener but with a small delay to prevent immediate closure
//     document.addEventListener("click", handleClickOutside);

//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, []);

//   // Stop propagation for dropdown clicks to prevent immediate closure
//   const handleDropdownClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//   };

//   // Mark PT appointment as completed
//   const markPtAppointmentAsCompleted = async (appointmentId: string) => {
//     try {
//       setLoading(true);

//       const response =
//         await appointmentService.completeAppointment(appointmentId);

//       if (response.success) {
//         toast.success("Đã đánh dấu buổi tập với PT là hoàn thành");
//         fetchPtSchedules();
//       } else {
//         toast.error(
//           response.message || "Không thể đánh dấu hoàn thành lịch hẹn",
//         );
//       }
//     } catch (error) {
//       toast.error("Có lỗi xảy ra khi đánh dấu hoàn thành");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mark workout as completed
//   const markWorkoutAsCompleted = async (workoutId: string) => {
//     try {
//       setLoading(true);

//       const response = await workoutService.updateWorkoutScheduleStatus(
//         workoutId,
//         "completed",
//       );

//       if (response.success) {
//         toast.success("Đã đánh dấu buổi tập cá nhân là hoàn thành");
//         fetchWorkoutSchedules();
//       } else {
//         toast.error(
//           response.message || "Không thể đánh dấu hoàn thành lịch tập",
//         );
//       }
//     } catch (error) {
//       toast.error("Có lỗi xảy ra khi đánh dấu hoàn thành");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mark schedule as completed based on type
//   const markAsCompleted = (
//     scheduleId: string,
//     type: "appointment" | "workout",
//   ) => {
//     if (type === "appointment") {
//       markPtAppointmentAsCompleted(scheduleId);
//     } else {
//       markWorkoutAsCompleted(scheduleId);
//     }
//   };

//   // Navigate to reschedule page for PT appointment
//   const rescheduleAppointment = (id: string) => {
//     navigate(`/user/reschedule-appointment/${id}`);
//   };

//   // Navigate to edit workout page
//   const editWorkout = (id: string) => {
//     navigate(`/user/edit-workout/${id}`);
//   };

//   // View workout details
//   const viewWorkoutDetails = (id: string) => {
//     navigate(`/user/workout-details/${id}`);
//   };

//   const weekDays = generateWeekDays();
//   const monthDays = generateMonthDays();
//   const filteredSchedules = getFilteredSchedules();

//   // Set selected date to the first upcoming schedule when data is loaded
//   useEffect(() => {
//     if (combinedSchedules.length > 0) {
//       // Sắp xếp lịch theo thứ tự từ cũ đến mới
//       const sortedSchedules = [...combinedSchedules].sort(
//         (a, b) =>
//           new Date(`${a.date}T${a.timeStart}`).getTime() -
//           new Date(`${b.date}T${b.timeStart}`).getTime(),
//       );

//       // Tìm lịch sắp tới gần nhất (từ hôm nay trở đi)
//       const today = new Date();
//       const firstUpcomingSchedule =
//         sortedSchedules.find((schedule) => new Date(schedule.date) >= today) ||
//         sortedSchedules[0]; // Nếu không có thì lấy lịch cũ nhất

//       if (firstUpcomingSchedule) {
//         const firstScheduleDate = new Date(firstUpcomingSchedule.date);

//         // Chỉ cập nhật selectedDate nếu khác với giá trị hiện tại
//         if (!isSameDay(selectedDate, firstScheduleDate)) {
//           setSelectedDate(firstScheduleDate);
//         }

//         // Kiểm tra xem lịch có nằm trong view hiện tại không
//         const isInCurrentView =
//           calendarType === "week"
//             ? weekDays.some((day) => isSameDay(day, firstScheduleDate))
//             : monthDays.some((day) => isSameDay(day, firstScheduleDate));

//         // Nếu không nằm trong view hiện tại thì điều chỉnh currentDate
//         if (!isInCurrentView && !isSameMonth(currentDate, firstScheduleDate)) {
//           setCurrentDate(firstScheduleDate);
//         }
//       }
//     }
//   }, [combinedSchedules, calendarType]);

//   const startDayOfWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
//   const endDayOfWeek = addDays(startDayOfWeek, 6);

//   // Render schedule card based on type
//   const renderScheduleCard = (schedule: CombinedSchedule) => {
//     if (schedule.type === "appointment") {
//       // Convert to Schedule type to reuse ScheduleCard component
//       const ptSchedule: Schedule = {
//         id: schedule._id,
//         date: schedule.date,
//         time: schedule.time,
//         status: schedule.status,
//         location: schedule.location || "",
//         trainer_name: schedule.trainer_name || "",
//         trainer_image: schedule.trainer_image || "",
//         package_name: schedule.package_name || "",
//         notes: schedule.notes || "",
//       };

//       return (
//         <ScheduleCard
//           key={schedule._id}
//           schedule={ptSchedule}
//           onMarkCompleted={markPtAppointmentAsCompleted}
//           onReschedule={rescheduleAppointment}
//           isPtSession={true}
//         />
//       );
//     } else {
//       // Chuyển đổi sang định dạng cho lịch tập cá nhân
//       const workoutTime = schedule.timeStart ? schedule.timeStart : "00:00";

//       const statusText =
//         schedule.status === "upcoming"
//           ? "Sắp tới"
//           : schedule.status === "completed"
//             ? "Đã hoàn thành"
//             : "Đã lỡ";
//       const statusClass =
//         schedule.status === "upcoming"
//           ? "bg-blue-100 text-blue-800"
//           : schedule.status === "completed"
//             ? "bg-green-100 text-green-800"
//             : "bg-red-100 text-red-800";

//       return (
//         <div
//           key={schedule._id}
//           className="dark:hover:bg-gray-750 border-b border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700"
//         >
//           <div className="flex items-start">
//             <div className="mr-4 flex-shrink-0 rounded-full bg-gray-200 p-3 dark:bg-gray-700">
//               <FiCalendar className="h-6 w-6 text-gray-500 dark:text-gray-400" />
//             </div>

//             <div className="flex-grow">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold">Tập luyện cá nhân</h3>
//                 <span
//                   className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass}`}
//                 >
//                   {statusText}
//                 </span>
//               </div>

//               <div className="mt-2 grid grid-cols-2 gap-2">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Ngày:</p>
//                   <p>{formatDate(schedule.date)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">
//                     Thời gian:
//                   </p>
//                   <p>
//                     {schedule.timeStart
//                       ? formatTime(schedule.timeStart)
//                       : "Chưa xác định"}
//                     - ({schedule.duration} phút)
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Nhóm cơ:</p>
//                   <p>{schedule.muscle_groups?.join(", ") || "Không có"}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Địa điểm:</p>
//                   <p>{schedule.location || "Không có"}</p>
//                 </div>
//               </div>

//               {schedule.notes && (
//                 <div className="mt-2">
//                   <p className="text-sm font-medium text-gray-500">Ghi chú:</p>
//                   <p className="text-sm">{schedule.notes}</p>
//                 </div>
//               )}

//               {schedule.status !== "completed" && (
//                 <div className="mt-4 flex space-x-2">
//                   <button
//                     onClick={() => markWorkoutAsCompleted(schedule._id)}
//                     className="rounded-lg border border-green-500 bg-white px-3 py-1 text-sm font-medium text-green-500 hover:bg-green-50 dark:border-green-400 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
//                   >
//                     Hoàn thành
//                   </button>
//                   <button
//                     onClick={() => editWorkout(schedule._id)}
//                     className="rounded-lg border border-blue-500 bg-white px-3 py-1 text-sm font-medium text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
//                   >
//                     Chỉnh sửa
//                   </button>
//                   <button
//                     onClick={() => viewWorkoutDetails(schedule._id)}
//                     className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
//                   >
//                     Xem chi tiết
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       );
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <header className="mb-8">
//         <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
//           Lịch Tập Cá Nhân
//         </h1>
//         <p className="text-lg text-gray-600 dark:text-gray-400">
//           Quản lý lịch tập của bạn và theo dõi tiến độ tập luyện
//         </p>
//       </header>

//       {/* View toggle section */}
//       <div className="relative mb-6">
//         <div className="flex space-x-2">
//           <div className="relative">
//             <button
//               className={`flex items-center rounded-lg px-4 py-2 ${viewMode === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleViewModeChange("calendar");
//                 toggleCalendarOptions();
//               }}
//             >
//               Dạng lịch
//               <FiChevronDown className="ml-1 h-4 w-4" />
//             </button>

//             {/* Calendar type dropdown */}
//             {showCalendarOptions && viewMode === "calendar" && (
//               <div
//                 className="absolute z-10 mt-1 w-32 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
//                 onClick={handleDropdownClick}
//               >
//                 <button
//                   className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${calendarType === "week" ? "bg-blue-50 dark:bg-blue-900" : ""}`}
//                   onClick={() => {
//                     setCalendarType("week");
//                     setShowCalendarOptions(false);
//                   }}
//                 >
//                   Tuần
//                 </button>
//                 <button
//                   className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${calendarType === "month" ? "bg-blue-50 dark:bg-blue-900" : ""}`}
//                   onClick={() => {
//                     setCalendarType("month");
//                     setShowCalendarOptions(false);
//                   }}
//                 >
//                   Tháng
//                 </button>
//               </div>
//             )}
//           </div>

//           <button
//             className={`rounded-lg px-4 py-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
//             onClick={() => handleViewModeChange("list")}
//           >
//             Danh sách
//           </button>
//         </div>
//       </div>
//       {/* Advanced filters */}
//       <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
//         <div className="mb-2 flex items-center justify-between">
//           <h3 className="text-lg font-semibold">Bộ lọc nâng cao</h3>
//           <button
//             className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
//             onClick={resetFilters}
//           >
//             Đặt lại bộ lọc
//           </button>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//           {/* Type filter */}
//           <div className="relative">
//             <button
//               className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowTypeFilter(!showTypeFilter);
//                 setShowStatusFilter(false);
//                 setShowTrainerFilter(false);
//                 setShowTimeSlotFilter(false);
//               }}
//             >
//               <span>
//                 Loại lịch:{" "}
//                 {scheduleType === "all"
//                   ? "Tất cả"
//                   : scheduleType === "appointment"
//                     ? "Lịch với PT"
//                     : "Lịch tập cá nhân"}
//               </span>
//               <FiChevronDown className="h-4 w-4" />
//             </button>

//             {showTypeFilter && (
//               <div
//                 className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
//                 onClick={handleDropdownClick}
//               >
//                 <button
//                   className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => {
//                     setScheduleType("all");
//                     setShowTypeFilter(false);
//                   }}
//                 >
//                   Tất cả
//                 </button>
//                 <button
//                   className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => {
//                     setScheduleType("appointment");
//                     setShowTypeFilter(false);
//                   }}
//                 >
//                   Lịch với PT
//                 </button>
//                 <button
//                   className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => {
//                     setScheduleType("workout");
//                     setShowTypeFilter(false);
//                   }}
//                 >
//                   Lịch tập cá nhân
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Status filter */}
//           <div className="relative">
//             <button
//               className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowStatusFilter(!showStatusFilter);
//                 setShowTrainerFilter(false);
//                 setShowTimeSlotFilter(false);
//                 setShowTypeFilter(false);
//               }}
//             >
//               <span>
//                 Trạng thái:{" "}
//                 {filter === "all"
//                   ? "Tất cả"
//                   : filter === "upcoming"
//                     ? "Sắp tới"
//                     : filter === "completed"
//                       ? "Đã hoàn thành"
//                       : "Đã lỡ"}
//               </span>
//               <FiChevronDown className="h-4 w-4" />
//             </button>

//             {showStatusFilter && (
//               <div
//                 className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
//                 onClick={handleDropdownClick}
//               >
//                 <button
//                   className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => {
//                     setFilter("all");
//                     setShowStatusFilter(false);
//                   }}
//                 >
//                   Tất cả
//                 </button>
//                 <button
//                   className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => {
//                     setFilter("upcoming");
//                     setShowStatusFilter(false);
//                   }}
//                 >
//                   Sắp tới
//                 </button>
//                 <button
//                   className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => {
//                     setFilter("completed");
//                     setShowStatusFilter(false);
//                   }}
//                 >
//                   Đã hoàn thành
//                 </button>
//                 <button
//                   className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => {
//                     setFilter("missed");
//                     setShowStatusFilter(false);
//                   }}
//                 >
//                   Đã lỡ
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Trainer filter */}
//           <div className="relative">
//             <button
//               className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowTrainerFilter(!showTrainerFilter);
//                 setShowStatusFilter(false);
//                 setShowTimeSlotFilter(false);
//                 setShowTypeFilter(false);
//               }}
//             >
//               <span>
//                 Huấn luyện viên:{" "}
//                 {selectedTrainer === null
//                   ? "Tất cả"
//                   : trainers.find((t) => t._id === selectedTrainer)?.name ||
//                     "Không xác định"}
//               </span>
//               <FiChevronDown className="h-4 w-4" />
//             </button>

//             {showTrainerFilter && (
//               <div
//                 className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
//                 onClick={handleDropdownClick}
//               >
//                 <button
//                   className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => {
//                     setSelectedTrainer(null);
//                     setShowTrainerFilter(false);
//                   }}
//                 >
//                   Tất cả
//                 </button>
//                 {trainers.map((trainer) => (
//                   <button
//                     key={trainer._id}
//                     className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                     onClick={() => {
//                       setSelectedTrainer(trainer._id);
//                       setShowTrainerFilter(false);
//                     }}
//                   >
//                     {trainer.name}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Time slot filter */}
//           <div className="relative">
//             <button
//               className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowTimeSlotFilter(!showTimeSlotFilter);
//                 setShowStatusFilter(false);
//                 setShowTrainerFilter(false);
//                 setShowTypeFilter(false);
//               }}
//             >
//               <span>
//                 Khung giờ:{" "}
//                 {selectedTimeSlot === null ? "Tất cả" : selectedTimeSlot}
//               </span>
//               <FiChevronDown className="h-4 w-4" />
//             </button>

//             {showTimeSlotFilter && (
//               <div
//                 className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
//                 onClick={handleDropdownClick}
//               >
//                 <button
//                   className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => {
//                     setSelectedTimeSlot(null);
//                     setShowTimeSlotFilter(false);
//                   }}
//                 >
//                   Tất cả
//                 </button>
//                 {timeSlots.map((slot) => (
//                   <button
//                     key={slot}
//                     className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
//                     onClick={() => {
//                       setSelectedTimeSlot(slot);
//                       setShowTimeSlotFilter(false);
//                     }}
//                   >
//                     {slot}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Loading indicator */}
//       {loading && (
//         <div className="my-8 flex items-center justify-center">
//           <FiLoader className="mr-2 h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
//           <span className="text-gray-700 dark:text-gray-300">
//             Đang tải lịch tập...
//           </span>
//         </div>
//       )}

//       {/* Error message */}
//       {error && !loading && (
//         <div className="my-8 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
//           <p>{error}</p>
//           <button
//             className="mt-2 text-sm font-medium text-red-800 underline dark:text-red-200"
//             onClick={fetchData}
//           >
//             Thử lại
//           </button>
//         </div>
//       )}

//       {!loading && !error && (
//         <>
//           {viewMode === "calendar" && calendarType === "week" && (
//             <div className="mb-8">
//               {/* Sử dụng CalendarNavigation component */}
//               <CalendarNavigation
//                 currentDate={currentDate}
//                 onDateChange={setCurrentDate}
//                 type="week"
//                 startDay={startDayOfWeek}
//                 endDay={endDayOfWeek}
//               />

//               {/* Week day headers */}
//               <div className="mb-2 grid grid-cols-7 gap-2">
//                 {weekDays.map((day) => (
//                   <div
//                     key={day.toString()}
//                     className="py-2 text-center font-medium text-gray-700 dark:text-gray-300"
//                   >
//                     {format(day, "EEEE", { locale: vi })}
//                   </div>
//                 ))}
//               </div>

//               {/* Date cells */}
//               <div className="grid grid-cols-7 gap-2">
//                 {weekDays.map((day) => (
//                   <div
//                     key={day.toString()}
//                     className={`min-h-24 cursor-pointer rounded-lg border p-2 ${isSameDay(day, new Date()) ? "border-2 border-blue-500" : "border-gray-200 dark:border-gray-700"} ${isSameDay(day, selectedDate) ? "bg-blue-50 dark:bg-blue-900/30" : ""} ${hasSchedulesOnDate(day) ? "font-bold" : ""}`}
//                     onClick={() => setSelectedDate(day)}
//                   >
//                     <div className="mb-1 text-center text-gray-800 dark:text-gray-200">
//                       {format(day, "dd")}
//                     </div>
//                     {hasSchedulesOnDate(day) && (
//                       <div className="mt-1">
//                         <div className="rounded-full bg-blue-600 px-2 py-1 text-center text-xs text-white">
//                           {countSchedulesOnDate(day)} buổi tập
//                         </div>
//                         <div className="mt-1 flex flex-col space-y-1">
//                           {countPtSchedulesOnDate(day) > 0 && (
//                             <div className="rounded bg-green-100 p-1 text-xs text-green-800 dark:bg-green-900/50 dark:text-green-200">
//                               {countPtSchedulesOnDate(day)} với PT
//                             </div>
//                           )}
//                           {countWorkoutSchedulesOnDate(day) > 0 && (
//                             <div className="rounded bg-blue-100 p-1 text-xs text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
//                               {countWorkoutSchedulesOnDate(day)} cá nhân
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {viewMode === "calendar" && calendarType === "month" && (
//             <div className="mb-8">
//               {/* Sử dụng CalendarNavigation component */}
//               <CalendarNavigation
//                 currentDate={currentDate}
//                 onDateChange={setCurrentDate}
//                 type="month"
//               />

//               {/* Week day headers */}
//               <div className="mb-2 grid grid-cols-7 gap-2">
//                 {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
//                   <div
//                     key={day}
//                     className="py-2 text-center font-medium text-gray-700 dark:text-gray-300"
//                   >
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               {/* Date cells */}
//               <div className="grid grid-cols-7 gap-2">
//                 {monthDays.map((day) => (
//                   <div
//                     key={day.toString()}
//                     className={`cursor-pointer rounded-lg border p-2 ${isSameMonth(day, currentDate) ? "min-h-16" : "min-h-12 bg-gray-50 dark:bg-gray-900/50"} ${isSameDay(day, new Date()) ? "border-2 border-blue-500" : "border-gray-200 dark:border-gray-700"} ${isSameDay(day, selectedDate) ? "bg-blue-50 dark:bg-blue-900/30" : ""} ${!isSameMonth(day, currentDate) ? "text-gray-400 dark:text-gray-600" : "text-gray-800 dark:text-gray-200"} ${hasSchedulesOnDate(day) ? "font-bold" : ""}`}
//                     onClick={() => setSelectedDate(day)}
//                   >
//                     <div className="text-center">{format(day, "dd")}</div>
//                     {hasSchedulesOnDate(day) &&
//                       isSameMonth(day, currentDate) && (
//                         <div className="mt-1 flex justify-center space-x-1">
//                           {countPtSchedulesOnDate(day) > 0 && (
//                             <div
//                               className="h-2 w-2 rounded-full bg-green-600"
//                               title={`${countPtSchedulesOnDate(day)} buổi PT`}
//                             ></div>
//                           )}
//                           {countWorkoutSchedulesOnDate(day) > 0 && (
//                             <div
//                               className="h-2 w-2 rounded-full bg-blue-600"
//                               title={`${countWorkoutSchedulesOnDate(day)} buổi tập cá nhân`}
//                             ></div>
//                           )}
//                         </div>
//                       )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Schedule List */}
//           <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
//             <div className="bg-blue-600 p-4 text-white dark:bg-blue-800">
//               <h2 className="text-xl font-bold">
//                 {viewMode === "calendar"
//                   ? `Lịch tập ngày ${format(selectedDate, "dd/MM/yyyy", { locale: vi })}`
//                   : "Danh sách lịch tập"}
//               </h2>
//             </div>

//             {filteredSchedules.length > 0 ? (
//               <div className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {filteredSchedules.map((schedule) =>
//                   renderScheduleCard(schedule),
//                 )}
//               </div>
//             ) : (
//               <EmptyStateCard
//                 title="Không có lịch tập"
//                 message={
//                   viewMode === "calendar"
//                     ? `Không có lịch tập nào vào ngày ${format(selectedDate, "dd/MM/yyyy", { locale: vi })}`
//                     : "Không có lịch tập nào phù hợp với bộ lọc"
//                 }
//               />
//             )}
//           </div>

//           {/* Add button */}
//           <div className="mt-6 flex justify-end space-x-2">
//             <Link
//               to="/user/list-trainer"
//               className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
//             >
//               <FiUser className="mr-2 h-4 w-4" />
//               <span>Đặt lịch với PT</span>
//             </Link>

//             <Link
//               to="/user/workout"
//               className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition duration-200 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
//             >
//               <FiCalendar className="mr-2 h-4 w-4" />
//               <span>Tạo lịch tập cá nhân</span>
//             </Link>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };
// export default PersonalSchedulePage;
