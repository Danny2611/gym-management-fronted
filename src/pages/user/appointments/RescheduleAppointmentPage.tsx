import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  Info,
  ArrowLeft,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { trainerService } from "~/services/trainerService";
import { appointmentService } from "~/services/appointmentService";
import { Trainer } from "~/types/trainer";
import {
  AppointmentDetail,
  DailyAvailability,
  Location,
  TimeSlot,
} from "~/types/appointment";

const RescheduleAppointmentPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(
    null,
  );
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [availabilityData, setAvailabilityData] = useState<DailyAvailability[]>(
    [],
  );
  const [selectedDate, setSelectedDate] = useState<DailyAvailability | null>(
    null,
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [bookingNotes, setBookingNotes] = useState<string>("");
  const [bookingStatus, setBookingStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Default locations array to use as fallback
  const defaultLocations: Location[] = [
    { id: "main-room", name: "Phòng tập chính - Tầng 1", available: true },
    { id: "free-area", name: "Khu vực tự do tập luyện", available: true },
    { id: "yoga-room", name: "Phòng Yoga & Pilates", available: true },
    { id: "cardio-area", name: "Khu vực cardio", available: true },
    { id: "vip-room", name: "Phòng tập riêng VIP", available: true },
  ];

  // Create availability calendar based on trainer schedule
  const generateAvailabilityCalendar = (
    trainer: Trainer,
  ): DailyAvailability[] => {
    if (!trainer || !trainer.schedule) return [];

    const dayMap: { [key: number]: string } = {
      0: "Chủ nhật",
      1: "Thứ 2",
      2: "Thứ 3",
      3: "Thứ 4",
      4: "Thứ 5",
      5: "Thứ 6",
      6: "Thứ 7",
    };

    const shortDayMap: { [key: number]: string } = {
      0: "CN",
      1: "T2",
      2: "T3",
      3: "T4",
      4: "T5",
      5: "T6",
      6: "T7",
    };

    const availabilityByDay = new Map();

    // Filter days when trainer is available
    trainer.schedule.forEach((scheduleItem) => {
      if (
        scheduleItem.available &&
        scheduleItem.workingHours &&
        scheduleItem.workingHours.length > 0
      ) {
        availabilityByDay.set(
          scheduleItem.dayOfWeek,
          scheduleItem.workingHours.map((hour) => ({
            start: hour.start,
            end: hour.end,
            formattedTime: `${hour.start}-${hour.end}`,
          })),
        );
      }
    });

    // Create 14-day calendar starting from tomorrow
    const result: DailyAvailability[] = [];
    const today = new Date();
    today.setDate(today.getDate() + 1); // Start from tomorrow

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay(); // 0 = CN, 1 = T2, ...
      const timeSlots = availabilityByDay.get(dayOfWeek) || [];

      result.push({
        date: date.toISOString(),
        dayName: dayMap[dayOfWeek],
        dayOfMonth: date.getDate(),
        monthYear: date.toLocaleDateString("vi-VN", {
          month: "numeric",
          year: "numeric",
        }),
        shortDay: shortDayMap[dayOfWeek],
        formattedDate: date.toLocaleDateString("vi-VN"),
        isoDate: date.toISOString().split("T")[0], // Format YYYY-MM-DD for API
        available: timeSlots.length > 0,
        timeSlots,
      });
    }

    return result;
  };

  // Fetch appointment and trainer information
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!appointmentId) {
          setError("Thiếu thông tin lịch hẹn");
          return;
        }

        // Fetch appointment details
        const appointmentResponse =
          await appointmentService.getAppointmentById(appointmentId);

        if (appointmentResponse.success && appointmentResponse.data) {
          const appointmentData = appointmentResponse.data;
          console.log("Received appointment data:", appointmentData);
          setAppointment(appointmentData);
          setBookingNotes(appointmentData.notes || "");

          // Fetch trainer information
          if (appointmentData.trainer_id) {
            const trainerResponse = await trainerService.getTrainerById(
              appointmentData.trainer_id._id,
            );

            if (trainerResponse.success && trainerResponse.data) {
              setTrainer(trainerResponse.data);

              // Create availability calendar
              const availabilityCalendar = generateAvailabilityCalendar(
                trainerResponse.data,
              );
              setAvailabilityData(availabilityCalendar);

              // Auto-select first available date
              const firstAvailableDate = availabilityCalendar.find(
                (date) => date.available,
              );
              if (firstAvailableDate) {
                setSelectedDate(firstAvailableDate);
              }
            } else {
              setError("Không thể tải thông tin huấn luyện viên");
            }
          }

          // Initialize locations
          setLocations(defaultLocations);

          // Set current location as selected
          const currentLocation = defaultLocations.find(
            (loc) => loc.name === appointmentData.location,
          );
          if (currentLocation) {
            setSelectedLocation(currentLocation);
          }
        } else {
          setError("Không thể tải thông tin lịch hẹn");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi kết nối với máy chủ");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId]);

  // Handle reschedule submission
  const handleSubmitReschedule = async () => {
    if (
      !appointment ||
      !trainer ||
      !selectedDate ||
      !selectedTimeSlot ||
      !selectedLocation
    ) {
      setBookingStatus({
        success: false,
        message:
          "Vui lòng chọn đầy đủ ngày, giờ và địa điểm trước khi đổi lịch.",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data for API
      const rescheduleData = {
        appointmentId: appointment._id,
        date: selectedDate.isoDate,
        startTime: selectedTimeSlot.start,
        endTime: selectedTimeSlot.end,
        location: selectedLocation.name,
        notes: bookingNotes || undefined,
      };
      console.log("data of appoiment:", rescheduleData);
      // Call API to reschedule appointment
      const response =
        await appointmentService.rescheduleAppointment(rescheduleData);

      if (response.success) {
        setBookingStatus({
          success: true,
          message:
            "Đổi lịch hẹn thành công! Lịch hẹn mới của bạn đã được cập nhật.",
        });

        // Redirect after successful reschedule
        setTimeout(() => {
          navigate("/user/my-schedule");
        }, 2000);
      } else {
        setBookingStatus({
          success: false,
          message: response.message || "Đã xảy ra lỗi khi đổi lịch hẹn.",
        });
      }
    } catch (err) {
      setBookingStatus({
        success: false,
        message: "Đã xảy ra lỗi khi kết nối với máy chủ.",
      });
      console.error("Error rescheduling appointment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Count available days in calendar
  const availableDaysCount = useMemo(() => {
    return availabilityData.filter((day) => day.available).length;
  }, [availabilityData]);

  // Format date for display
  const formatDateFromISOString = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Format time for display
  const formatTimeObject = (timeObject: { start: string; end: string }) => {
    return `${timeObject.start}-${timeObject.end}`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !appointment || !trainer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400">
          <p>
            {error || "Không tìm thấy thông tin lịch hẹn hoặc huấn luyện viên"}
          </p>
          <button
            onClick={() => navigate("/user/my-schedule")}
            className="mt-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Quay lại lịch tập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/user/my-schedule")}
            className="mr-3 flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Đổi lịch hẹn
          </h1>
        </div>
      </div>

      {/* Current Appointment Info */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
        <h2 className="mb-2 text-lg font-medium text-blue-800 dark:text-blue-300">
          Thông tin lịch hẹn hiện tại
        </h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>
              Ngày: <strong>{formatDateFromISOString(appointment.date)}</strong>
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>
              Giờ: <strong>{formatTimeObject(appointment.time)}</strong>
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>
              Địa điểm: <strong>{appointment.location}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Date & Time Selection */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* Trainer Info */}
            <div className="mb-6 flex items-center rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
              <img
                src={
                  `${trainer.image}` ||
                  "/api/placeholder/400/320"
                }
                alt={trainer.name}
                className="mr-4 h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {trainer.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {trainer.specialization} • {trainer.experience} năm kinh
                  nghiệm
                </p>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-blue-500" />
                    {availableDaysCount} ngày có lịch trong 2 tuần tới
                  </span>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <Calendar className="mr-2 h-5 w-5" />
                Chọn ngày mới
              </h3>

              <div className="mb-2 flex items-center rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                <Info className="mr-2 h-5 w-5" />
                Chỉ hiển thị những ngày huấn luyện viên có lịch làm việc
              </div>

              <div className="grid grid-cols-7 gap-2">
                {availabilityData.map((date, index) => (
                  <div
                    key={index}
                    onClick={() => date.available && setSelectedDate(date)}
                    className={`cursor-pointer rounded-lg border p-2 text-center ${
                      !date.available
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-60 dark:border-gray-700 dark:bg-gray-800/50"
                        : selectedDate?.isoDate === date.isoDate
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="text-xs font-medium">{date.shortDay}</div>
                    <div className="my-1 text-base font-bold">
                      {date.dayOfMonth}
                    </div>
                    <div className="text-xs">
                      {date.available ? (
                        <span className="text-green-600 dark:text-green-400">
                          {date.timeSlots.length} slot
                        </span>
                      ) : (
                        <span className="text-gray-400">Không có lịch</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-6">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <Clock className="mr-2 h-5 w-5" />
                Chọn giờ mới
                {selectedDate && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    {selectedDate.formattedDate}
                  </span>
                )}
              </h3>

              {selectedDate ? (
                selectedDate.timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {selectedDate.timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-3 text-center ${
                          selectedTimeSlot?.formattedTime === slot.formattedTime
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                            : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {slot.formattedTime}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                    Không có lịch trống vào ngày đã chọn. Vui lòng chọn ngày
                    khác.
                  </div>
                )
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                  Vui lòng chọn ngày trước
                </div>
              )}
            </div>

            {/* Location Selection */}
            <div className="mb-6">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <MapPin className="mr-2 h-5 w-5" />
                Chọn địa điểm mới
              </h3>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() =>
                      location.available && setSelectedLocation(location)
                    }
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                      !location.available
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-60 dark:border-gray-700 dark:bg-gray-800/50"
                        : selectedLocation?.id === location.id
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="font-medium">{location.name}</span>
                    {selectedLocation?.id === location.id && (
                      <Check className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ghi chú cho buổi tập (tùy chọn):
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Ví dụ: mục tiêu, vùng cơ cần tập trung, yêu cầu đặc biệt..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
              Thông tin lịch hẹn mới
            </h3>

            <div className="mb-4 space-y-3">
              <div className="flex items-start">
                <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ngày:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedDate ? selectedDate.formattedDate : "Chưa chọn"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Giờ:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTimeSlot
                      ? selectedTimeSlot.formattedTime
                      : "Chưa chọn"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Địa điểm:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLocation ? selectedLocation.name : "Chưa chọn"}
                  </p>
                </div>
              </div>
            </div>

            {bookingStatus && (
              <div
                className={`mb-4 rounded-lg p-4 ${
                  bookingStatus.success
                    ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                <div className="flex items-center">
                  {bookingStatus.success ? (
                    <Check className="mr-2 h-5 w-5" />
                  ) : (
                    <AlertCircle className="mr-2 h-5 w-5" />
                  )}
                  {bookingStatus.message}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitReschedule}
              disabled={
                submitting ||
                !selectedDate ||
                !selectedTimeSlot ||
                !selectedLocation
              }
              className={`w-full rounded-lg px-4 py-2 font-medium text-white ${
                submitting ||
                !selectedDate ||
                !selectedTimeSlot ||
                !selectedLocation
                  ? "cursor-not-allowed bg-blue-400 dark:bg-blue-500"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              }`}
            >
              {submitting ? "Đang xử lý..." : "Xác nhận đổi lịch"}
            </button>

            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800/30 dark:bg-yellow-900/20 dark:text-yellow-300">
              <AlertCircle className="mb-1 h-5 w-5" />
              <p>
                Lưu ý: Bạn chỉ có thể đổi lịch hẹn trước ngày hẹn ít nhất 24
                giờ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleAppointmentPage;
