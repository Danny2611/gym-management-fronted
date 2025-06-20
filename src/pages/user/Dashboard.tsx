import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ComponentCard from "~/components/dashboard/common/ComponentCard";
import Avatar from "~/components/dashboard/ui/avatar/Avatar";
import MembershipDetailsModal from "~/components/user/memberships/MembershipDetailsModal";
import WeeklyWorkoutChart from "~/components/user/progresses/WeeklyWorkoutChart";
import Spinner from "./Spinner";

import { membershipService } from "~/services/membershipService";
import { transactionService } from "~/services/transactionService";
import { appointmentService } from "~/services/appointmentService";
import { promotionService } from "~/services/promotionService";
import { workoutService } from "~/services/workoutService";
import { paymentService } from "~/services/paymentService";

// Import offline utilities
import { useOffline } from "~/hooks/useOffline";


import { toast } from "sonner";
import { formatDateToday, formatTime } from "~/utils/formatters";

import { MembershipDetailsResponse, MembershipWithRemainingData } from "~/types/membership";
import { RecentTransactionDTO } from "~/types/transaction";
import { PromotionResponse } from "~/types/promotion";
import { ScheduleItem } from "~/types/schedule";
import { CacheManager } from "~/utils/cache";

// Interface for Weekly Workout data
interface WeeklyWorkout {
  name: string;
  sessions: number;
  duration: number;
  target?: number;
}

// Offline Status Banner Component
const OfflineStatusBanner = ({ 
  isOnline, 
  pendingRequests, 
  lastSync 
}: { 
  isOnline: boolean; 
  pendingRequests: number; 
  lastSync: Date | null; 
}) => {
  if (isOnline && pendingRequests === 0) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-3 text-sm text-center ${
      isOnline 
        ? 'bg-yellow-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      {!isOnline ? (
        <>
          <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
          Chế độ offline - Một số tính năng có thể bị hạn chế
        </>
      ) : pendingRequests > 0 ? (
        <>
          <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
          Đang đồng bộ {pendingRequests} yêu cầu...
          {lastSync && (
            <span className="ml-2 text-xs opacity-75">
              (Lần cuối: {lastSync.toLocaleTimeString()})
            </span>
          )}
        </>
      ) : null}
    </div>
  );
};

// Cache Status Indicator Component
const CacheStatusIndicator = ({ 
  isUsingCache, 
  cacheAge 
}: { 
  isUsingCache: boolean; 
  cacheAge?: number; 
}) => {
  if (!isUsingCache) return null;

  const getAgeText = (age: number) => {
    const minutes = Math.floor(age / (1000 * 60));
    if (minutes < 1) return 'vừa cập nhật';
    if (minutes === 1) return '1 phút trước';
    return `${minutes} phút trước`;
  };

  return (
    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
      Dữ liệu từ bộ nhớ đệm {cacheAge ? `(${getAgeText(cacheAge)})` : ''}
    </div>
  );
};

// Badge component for statuses
const Badge = ({
  type,
  text,
}: {
  type: "success" | "warning" | "error" | "info";
  text: string;
}) => {
  const colorClasses = {
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[type]}`}>
      {text}
    </span>
  );
};

// Helper functions
const getPackageBadgeType = (category: string): "success" | "warning" | "error" | "info" => {
  switch (category.toLowerCase()) {
    case "premium":
    case "platinum":
    case "vip":
      return "success";
    case "fitness":
      return "info";
    case "basic":
      return "warning";
    default:
      return "info";
  }
};

const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const Dashboard: React.FC = () => {
  // Offline hook
  const {
    isOnline,
    isOfflineMode,
    pendingRequests,
    lastSync,
    fetchWithCache,
    offlineAwareFetch,
    queueOfflineRequest,
    syncOfflineData,
    clearOfflineData,
    getCacheStats
  } = useOffline();

  const [membershipDetails, setMembershipDetails] = useState<MembershipDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCache, setIsUsingCache] = useState<boolean>(false);
  const [cacheAge, setCacheAge] = useState<number | undefined>(undefined);

  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const navigate = useNavigate();

  // State for membership modal
  const [selectedMembership, setSelectedMembership] = useState<MembershipWithRemainingData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State for combined upcoming schedule
  const [upcomingSchedule, setUpcomingSchedule] = useState<ScheduleItem[]>([]);
  
  // State for recent transactions
  const [recentTransactions, setRecentTransactions] = useState<RecentTransactionDTO[]>([]);
  
  // State for weekly workout data
  const [weeklyWorkoutData, setWeeklyWorkoutData] = useState<WeeklyWorkout[]>([
    { name: "T2", sessions: 0, duration: 0, target: 0 },
    { name: "T3", sessions: 0, duration: 0, target: 0 },
    { name: "T4", sessions: 0, duration: 0, target: 0 },
    { name: "T5", sessions: 0, duration: 0, target: 0 },
    { name: "T6", sessions: 0, duration: 0, target: 0 },
    { name: "T7", sessions: 0, duration: 0, target: 0 },
    { name: "CN", sessions: 0, duration: 0, target: 0 },
  ]);

  // Enhanced payment handler with offline support
  const handlePayment = async (packageId: string) => {
    if (!isOnline) {
      toast.error("Không thể thanh toán khi offline. Vui lòng kiểm tra kết nối mạng.");
      return;
    }

    try {
      // Step 1: Register for the package
      const registerResponse = await paymentService.registerPackage(packageId);

      if (!registerResponse.success) {
        toast.error(registerResponse.message || "Lỗi khi đăng ký gói tập");
        return;
      }

      // Step 2: Create MoMo payment request
      const paymentResponse = await paymentService.createMoMoPayment(packageId);

      if (!paymentResponse.success || !paymentResponse.data) {
        toast.error(paymentResponse.message || "Lỗi khi tạo yêu cầu thanh toán");
        return;
      }

      // Save payment info for later use (using in-memory storage for offline compatibility)
      const paymentData = {
        paymentId: paymentResponse.data.paymentId,
        transactionId: paymentResponse.data.transactionId,
        amount: paymentResponse.data.amount,
        expireTime: paymentResponse.data.expireTime,
        packageId: packageId,
      };

      // Store in cache instead of localStorage for offline compatibility
      await CacheManager.setData('currentPayment', paymentData, 24 * 60 * 60 * 1000); // 24 hours

      // Redirect to MoMo payment page
      window.location.href = paymentResponse.data.payUrl;
    } catch (err) {
      console.error("Lỗi khi xử lý đăng ký:", err);
      toast.error("Đã xảy ra lỗi không mong muốn");
    }
  };

  // Enhanced pause membership with offline support
  const handlePauseMembership = async (id: string) => {
  try {
    if (!isOnline) {
      // Queue request for offline
      await queueOfflineRequest(
        `/api/user/my-package/pause`,
        'PATCH',
        {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        { membershipId: id }
      );
      toast.success("Yêu cầu tạm dừng đã được lưu. Sẽ được xử lý khi có mạng.");
      setIsModalOpen(false);
      return;
    }

    const response = await membershipService.pauseMembership(id);
    if (response.success) {
      fetchData();
      toast.success("Tạm dừng gói tập thành công");
      setIsModalOpen(false);
    } else {
      toast.error(response.message || "Không thể tạm dừng gói tập");
    }
  } catch (error) {
    console.error("Lỗi khi tạm dừng gói tập:", error);
    toast.error("Đã xảy ra lỗi khi tạm dừng gói tập");
  }
};


  // Enhanced resume membership with offline support
 const handleResumeMembership = async (id: string) => {
  try {
    if (!isOnline) {
      // Queue request for offline
      await queueOfflineRequest(
        `/api/user/my-package/resume`,
        'PATCH',
        {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        { membershipId: id }
      );
      toast.success("Yêu cầu tiếp tục đã được lưu. Sẽ được xử lý khi có mạng.");
      setIsModalOpen(false);
      return;
    }

    const response = await membershipService.resumeMembership(id);
    if (response.success) {
      fetchData();
      toast.success("Tiếp tục gói tập thành công");
      setIsModalOpen(false);
    } else {
      toast.error(response.message || "Không thể tiếp tục gói tập");
    }
  } catch (error) {
    console.error("Lỗi khi tiếp tục gói tập:", error);
    toast.error("Đã xảy ra lỗi khi tiếp tục gói tập");
  }
};

  // Enhanced view membership details with offline support
  const handleViewDetails = async (id: string) => {
    try {
      // Try to get from cache first if offline
      let response;
      if (isOfflineMode) {
        const cachedData = await CacheManager.getData(`membership-${id}`);
        if (cachedData) {
          setSelectedMembership(cachedData);
          setIsModalOpen(true);
          return;
        }
      }

      response = await membershipService.getMembershipById(id);
      if (response.success && response.data) {
        // Cache the result
        await CacheManager.setData(`membership-${id}`, response.data, 10 * 60 * 1000); // 10 minutes
        setSelectedMembership(response.data);
        setIsModalOpen(true);
      } else {
        toast.error("Vui lòng đăng ký gói tập");
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết gói tập:", error);
      if (isOfflineMode) {
        toast.error("Không có dữ liệu offline cho gói tập này");
      } else {
        toast.error("Đã xảy ra lỗi khi tải chi tiết gói tập");
      }
    }
  };

  // Get badge type based on status
  const getStatusBadgeType = (status: string): "success" | "warning" | "error" | "info" => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "đã xác nhận":
        return "success";
      case "pending":
      case "chờ xác nhận":
        return "info";
      case "cancelled":
      case "đã hủy":
        return "error";
      default:
        return "warning";
    }
  };

  // Format status for display
  const formatStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Chờ xác nhận";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Enhanced data fetching with offline support
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setIsUsingCache(false);
    setCacheAge(undefined);

    try {
      let usedCache = false;
      let oldestCacheTimestamp = Date.now();

      // Fetch membership details with cache
      try {
        const membershipResponse = await fetchWithCache(
          () => membershipService.getInforMembershipDetails(),
          'membership-details',
          CacheManager['CACHE_DURATION']?.MEMBERSHIP || 5 * 60 * 1000
        );

        if (membershipResponse.success && membershipResponse.data) {
          setMembershipDetails(membershipResponse.data);
          
          // Check if data came from cache
          const cachedData = await CacheManager.getCachedMembershipDetails();
          if (cachedData && !isOnline) {
            usedCache = true;
            // Calculate cache age (this is simplified, in real implementation you'd store timestamp)
            oldestCacheTimestamp = Math.min(oldestCacheTimestamp, Date.now() - (5 * 60 * 1000));
          }
        } else {
          setError(membershipResponse.message || "Không thể tải thông tin hội viên");
        }
      } catch (err) {
        console.error("Error fetching membership details:", err);
        // Try to get cached data as fallback
        const cachedData = await CacheManager.getCachedMembershipDetails();
        if (cachedData) {
          setMembershipDetails(cachedData);
          usedCache = true;
        }
      }

      // Fetch weekly workout data with cache
      try {
        const weeklyStatsResponse = await fetchWithCache(
          () => workoutService.getWeeklyWorkoutStats(),
          'weekly-workout',
          CacheManager['CACHE_DURATION']?.WORKOUT || 2 * 60 * 1000
        );

        if (weeklyStatsResponse.success && weeklyStatsResponse.data) {
          setWeeklyWorkoutData(weeklyStatsResponse.data);
          
          // Check cache usage
          const cachedData = await CacheManager.getCachedWeeklyWorkout();
          if (cachedData && !isOnline) {
            usedCache = true;
            oldestCacheTimestamp = Math.min(oldestCacheTimestamp, Date.now() - (2 * 60 * 1000));
          }
        }
      } catch (err) {
        console.error("Error fetching weekly workout:", err);
        const cachedData = await CacheManager.getCachedWeeklyWorkout();
        if (cachedData) {
          setWeeklyWorkoutData(cachedData);
          usedCache = true;
        }
      }

      // Fetch upcoming schedule with cache
      try {
        let combinedSchedule: ScheduleItem[] = [];

        // Fetch workouts
        const upcomingWorkoutsData = await fetchWithCache(
          () => workoutService.getUpcomingWorkouts(),
          'upcoming-workouts',
          CacheManager['CACHE_DURATION']?.WORKOUT || 2 * 60 * 1000
        );

        if (upcomingWorkoutsData.success && upcomingWorkoutsData.data) {
          const workouts = upcomingWorkoutsData.data.map((workout) => ({
            ...workout,
            type: "workout" as const,
            name: "Cá nhân",
          }));
          combinedSchedule = [...combinedSchedule, ...workouts];
        }

        // Fetch appointments
        const upcomingAppointmentData = await fetchWithCache(
          () => appointmentService.getUpcomingAppointment(),
          'upcoming-appointments',
          CacheManager['CACHE_DURATION']?.WORKOUT || 2 * 60 * 1000
        );

        if (upcomingAppointmentData.success && upcomingAppointmentData.data) {
          const appointments = upcomingAppointmentData.data.map((appointment) => ({
            ...appointment,
            type: "appointment" as const,
            name: "Tập với PT",
          }));
          combinedSchedule = [...combinedSchedule, ...appointments];
        }

        // Sort by date and time
        combinedSchedule.sort((a, b) => {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          return new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime();
        });

        setUpcomingSchedule(combinedSchedule);

        // Check cache usage for schedule data
        const cachedWorkouts = await CacheManager.getCachedUpcomingWorkouts();
        const cachedAppointments = await CacheManager.getCachedUpcomingAppointments();
        if ((cachedWorkouts || cachedAppointments) && !isOnline) {
          usedCache = true;
        }
      } catch (err) {
        console.error("Error fetching upcoming schedule:", err);
      }

      // Fetch recent transactions with cache
      try {
        const transactionResponse = await fetchWithCache(
          () => transactionService.getRecentSuccessfulTransactions(),
          'recent-transactions',
          CacheManager['CACHE_DURATION']?.TRANSACTION || 10 * 60 * 1000
        );

        if (transactionResponse.success && transactionResponse.data) {
          setRecentTransactions(transactionResponse.data);
          
          const cachedData = await CacheManager.getCachedTransactions();
          if (cachedData && !isOnline) {
            usedCache = true;
            oldestCacheTimestamp = Math.min(oldestCacheTimestamp, Date.now() - (10 * 60 * 1000));
          }
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        const cachedData = await CacheManager.getCachedTransactions();
        if (cachedData) {
          setRecentTransactions(cachedData);
          usedCache = true;
        }
      }

      // Fetch promotions with cache
      try {
        const responsePromotion = await fetchWithCache(
          () => promotionService.getAllActivePromotions(),
          'promotions',
          CacheManager['CACHE_DURATION']?.PROMOTION || 30 * 60 * 1000
        );

        if (responsePromotion.success && responsePromotion.data) {
          setPromotions(responsePromotion.data);
          
          const cachedData = await CacheManager.getCachedPromotions();
          if (cachedData && !isOnline) {
            usedCache = true;
            oldestCacheTimestamp = Math.min(oldestCacheTimestamp, Date.now() - (30 * 60 * 1000));
          }
        }
      } catch (err) {
        console.error("Error fetching promotions:", err);
        const cachedData = await CacheManager.getCachedPromotions();
        if (cachedData) {
          setPromotions(cachedData);
          usedCache = true;
        }
      }

      // Set cache status
      if (usedCache) {
        setIsUsingCache(true);
        setCacheAge(Date.now() - oldestCacheTimestamp);
      }

      // Show appropriate messages
      if (isOfflineMode && usedCache) {
        toast.info("Đang hiển thị dữ liệu đã lưu (chế độ offline)");
      } else if (!isOnline && !usedCache) {
        toast.warning("Không có dữ liệu offline. Vui lòng kết nối mạng.");
      }

    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      console.error("Error fetching data:", err);
      
      if (isOfflineMode) {
        toast.error("Lỗi tải dữ liệu offline. Một số thông tin có thể không khả dụng.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manual sync function
  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error("Không thể đồng bộ khi offline");
      return;
    }

    toast.info("Đang đồng bộ dữ liệu...");
    try {
      await syncOfflineData();
      await fetchData();
      toast.success("Đồng bộ dữ liệu thành công");
    } catch (error) {
      toast.error("Lỗi khi đồng bộ dữ liệu");
    }
  };

  // Clear offline data function
  const handleClearCache = async () => {
    try {
      await clearOfflineData();
      toast.success("Đã xóa dữ liệu offline");
      if (isOnline) {
        fetchData();
      }
    } catch (error) {
      toast.error("Lỗi khi xóa dữ liệu offline");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh when coming back online
  useEffect(() => {
    if (isOnline && !isLoading) {
      // Small delay to ensure network is stable
      const timer = setTimeout(() => {
        fetchData();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  // Navigate to full schedule
  const goToFullSchedule = () => {
    navigate("/user/my-schedule");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
        <span className="ml-2">
          {isOfflineMode ? "Đang tải dữ liệu offline..." : "Đang tải..."}
        </span>
      </div>
    );
  }

  if (error && !isUsingCache) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-center mb-4">
          <p className="text-lg font-semibold">Có lỗi xảy ra</p>
          <p>{error}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!isOnline}
          >
            Thử lại
          </button>
          {!isOnline && (
            <button
              onClick={handleClearCache}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Xóa cache
            </button>
          )}
        </div>
      </div>
    );
  }


  return (
    <>
       {/* Offline Status Banner */}
      <OfflineStatusBanner 
        isOnline={isOnline} 
        pendingRequests={pendingRequests} 
        lastSync={lastSync} 
      />

      <div className="container mx-auto px-4 py-8">

        {/* Cache Status and Controls */}
        {(isUsingCache || !isOnline || pendingRequests > 0) && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                {isUsingCache && (
                  <CacheStatusIndicator isUsingCache={isUsingCache} cacheAge={cacheAge} />
                )}
                {!isOnline && (
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    🔄 Chế độ offline - Dữ liệu có thể không mới nhất
                  </p>
                )}
                {pendingRequests > 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    📤 Có {pendingRequests} yêu cầu chờ đồng bộ
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {isOnline && (
                  <button
                    onClick={handleManualSync}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Đồng bộ
                  </button>
                )}
                <button
                  onClick={handleClearCache}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Xóa cache
                </button>
              </div>
            </div>
          </div>
        )}

      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard Hội Viên
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Thông tin tài khoản hội viên */}
        <ComponentCard title="Thông tin hội viên" className="lg:col-span-1">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          ) : membershipDetails ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={
                      membershipDetails.member_avatar
                        ? `http://localhost:5000/${membershipDetails.member_avatar}`
                        : "/api/placeholder/400/400"
                    }
                    alt={membershipDetails.member_name}
                    name={membershipDetails.member_name}
                    size="xl"
                    className="border-2 border-blue-100"
                  />
                  <span className="font-medium">
                    {membershipDetails.member_name}
                  </span>
                </div>
                <Badge
                  type={getPackageBadgeType(membershipDetails.package_category)}
                  text={capitalizeFirstLetter(
                    membershipDetails.package_category,
                  )}
                />
              </div>
              <div className="mt-2 space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Gói tập hiện tại:
                  </span>
                  <span className="font-medium">
                    {membershipDetails.package_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Thời hạn còn lại:
                  </span>
                  <span className="font-medium">
                    {membershipDetails.days_remaining} ngày
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Buổi tập còn lại:
                  </span>
                  <span className="font-medium">
                    {membershipDetails.sessions_remaining}/
                    {membershipDetails.total_sessions} buổi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {membershipDetails.status === "null" ? (
                  <button
                    className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    onClick={() => navigate("/user/packages")}
                  >
                    Đăng ký gói tập
                  </button>
                ) : (
                  <button
                    className={`rounded-lg px-4 py-2 text-white ${membershipDetails.status === "expired" ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-gray-400"}`}
                    disabled={membershipDetails.status !== "expired"}
                    onClick={() => handlePayment(membershipDetails.package_id)}
                  >
                    Gia hạn gói tập
                  </button>
                )}

                <button
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() =>
                    handleViewDetails(membershipDetails.membership_id)
                  }
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Bạn chưa đăng ký gói tập nào
            </div>
          )}
        </ComponentCard>

        {/* Lịch tập sắp tới */}
        <ComponentCard
          title="Lịch tập sắp tới"
          className="lg:col-span-2"
          desc="Các buổi tập được lên lịch trong thời gian tới"
        >
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : upcomingSchedule.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Ngày & Giờ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Loại buổi tập
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Địa điểm
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {upcomingSchedule.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <div className="font-medium">
                            {formatDateToday(new Date(item.date))}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {formatTime(new Date(item.timeStart))}
                            {item.timeEnd
                              ? ` - ${formatTime(new Date(item.timeEnd))}`
                              : ""}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          {item.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          {item.location || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <Badge
                            type={getStatusBadgeType(item.status)}
                            text={formatStatus(item.status)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={goToFullSchedule}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Xem tất cả lịch tập →
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">
              Bạn chưa có lịch tập nào sắp tới
            </div>
          )}
        </ComponentCard>

        {/* Buổi tập trong tuần - Kết hợp từ ProgressPage */}
        <WeeklyWorkoutChart
          weeklyWorkoutData={weeklyWorkoutData}
          className="lg:col-span-3"
        />

        {/* Giao dịch gần đây */}
        <ComponentCard title="Giao dịch gần đây" className="lg:col-span-1">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.packageName || "Thanh toán"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {transaction.amount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                Không có giao dịch nào gần đây
              </div>
            )}
          </div>

          {recentTransactions.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => navigate("/user/transactions")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Xem tất cả giao dịch →
              </button>
            </div>
          )}
        </ComponentCard>

        {/* Thông báo và nhắc nhở */}
        <ComponentCard title="Thông báo" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-900/20">
              <h4 className="mb-1 font-medium text-yellow-700 dark:text-yellow-400">
                Gói tập sắp hết hạn
              </h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">
                Gói tập của bạn sẽ hết hạn sau 45 ngày. Gia hạn ngay để nhận ưu
                đãi 15%.
              </p>
              <button className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300">
                Gia hạn ngay
              </button>
            </div>

            <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:border-blue-600 dark:bg-blue-900/20">
              <h4 className="mb-1 font-medium text-blue-700 dark:text-blue-400">
                Sự kiện sắp diễn ra
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Workshop "Dinh dưỡng cho người tập gym" sẽ diễn ra vào
                20/03/2025.
              </p>
              <button className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Đăng ký tham gia
              </button>
            </div>

            <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:border-green-600 dark:bg-green-900/20">
              <h4 className="mb-1 font-medium text-green-700 dark:text-green-400">
                Chạm mốc thành tựu
              </h4>
              <p className="text-sm text-green-600 dark:text-green-300">
                Chúc mừng! Bạn đã hoàn thành 50 buổi tập tại phòng gym.
              </p>
              <button className="mt-2 text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                Xem thành tựu
              </button>
            </div>
          </div>
        </ComponentCard>

        {/* Khuyến mãi */}
        {promotions.length > 0 && (
          <ComponentCard title="Đề xuất & Khuyến mãi" className="lg:col-span-1">
            <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
              <h4 className="mb-2 text-lg font-bold">{promotions[0].name}</h4>

              <ul className="mb-4 space-y-1 text-sm text-white/90">
                {promotions[0].applicable_packages[0].benefits.map(
                  (data, index) => (
                    <li className="flex items-center gap-2" key={index}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {data}
                    </li>
                  ),
                )}
              </ul>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-white/80">Chỉ từ</span>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      promotions[0].applicable_packages[0].price *
                        (1 - promotions[0].discount / 100),
                    ).toLocaleString()}
                    đ
                  </p>
                </div>

                <button
                  className="rounded-lg bg-white px-4 py-2 font-medium text-blue-600 hover:bg-blue-50"
                  onClick={() =>
                    navigate(
                      `/user/packages-register/${promotions[0].applicable_packages[0]._id}`,
                    )
                  }
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </ComponentCard>
        )}

        {/* Truy cập nhanh */}
        <ComponentCard title="Truy cập nhanh" className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button
              className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              onClick={() => navigate("/user/workout")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-blue-600 dark:text-blue-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Tạo lịch tập
              </span>
            </button>

            <button
              className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              onClick={() => navigate("/user/list-trainer")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-purple-600 dark:text-purple-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Hẹn với PT
              </span>
            </button>

            <button
              className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              onClick={() => navigate("/user/progress")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-green-600 dark:text-green-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Xem tiến độ
              </span>
            </button>

            <button
              className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              onClick={() => navigate("/user/packages")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-orange-600 dark:text-orange-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m6-6H6"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Mua gói tập
              </span>
            </button>

            <button
              className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              onClick={() => navigate("/user/transactions")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-teal-600 dark:text-teal-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Xem giao dịch
              </span>
            </button>

            <button className="flex flex-col items-center rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mb-2 h-8 w-8 text-gray-600 dark:text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span className="text-center text-sm font-medium">
                Cài đặt tài khoản
              </span>
            </button>
          </div>
        </ComponentCard>
      </div>

      {/* Modal xem chi tiết */}
      {selectedMembership && (
        <MembershipDetailsModal
          membership={selectedMembership}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPause={handlePauseMembership}
          onResume={handleResumeMembership}
        />
      )}
    </div>
    </>
    
  );
};

export default Dashboard;
