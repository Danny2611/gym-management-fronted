import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { trainerService } from "~/services/trainerService";
import { membershipService } from "~/services/membershipService";
import { Trainer } from "~/types/trainer";
import { useNavigate } from "react-router-dom";
import TrainerCard from "./TrainerCard";
import { toast } from "sonner";
import "./style.css";
const TrainerList: React.FC = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);

  const specializations = Array.from(
    new Set(trainers.map((trainer) => trainer.specialization).filter(Boolean)),
  );

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const response = await trainerService.getAllTrainers();

        if (response.success && response.data) {
          setTrainers(response.data);
        } else {
          setError(
            response.message || "Không thể tải danh sách huấn luyện viên",
          );
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải danh sách huấn luyện viên");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trainer.bio || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      specialtyFilter === "" ||
      (trainer.specialization || "")
        .toLowerCase()
        .includes(specialtyFilter.toLowerCase());

    return matchesSearch && matchesSpecialty;
  });
  const showNavigateToast = (message: string, path: string) => {
    toast.custom(
      (t) => (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-gray-600 dark:bg-gray-700">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {message}
          </p>
          <button
            onClick={() => {
              toast.dismiss(t);
              navigate(path);
            }}
            className="mt-2 rounded bg-blue-600 px-3 py-1 text-white transition-colors hover:bg-blue-700"
          >
            Đi đến đăng ký
          </button>
        </div>
      ),
      {
        duration: 4000,
        position: "top-center",
      },
    );
  };

  const handleBookTrainer = async (trainerId: string) => {
    try {
      setIsCheckingMembership(true);

      const membershipResponse = await membershipService.getMemberships();

      if (
        !membershipResponse.success ||
        !membershipResponse.data ||
        membershipResponse.data.length === 0
      ) {
        showNavigateToast(
          "Bạn cần đăng ký gói tập trước khi đặt lịch hẹn với huấn luyện viên.",
          "/user/packages",
        );
        return;
      }

      const activeMemberships = membershipResponse.data.filter(
        (membership) => membership.status === "active",
      );

      if (activeMemberships.length === 0) {
        showNavigateToast(
          "Bạn không có gói tập nào đang hoạt động. Vui lòng đăng ký gói tập mới.",
          "/user/packages",
        );

        return;
      }

      const hasAvailableSessions = activeMemberships.some(
        (membership) =>
          membership.package_id.training_sessions &&
          membership.package_id.training_sessions > 0,
      );

      if (!hasAvailableSessions) {
        showNavigateToast(
          "Gói tập hiện tại của bạn không bao gồm buổi tập cá nhân với huấn luyện viên. Vui lòng nâng cấp gói tập.",
          "/user/packages",
        );
        return;
      }

      navigate(`/user/book-appointment/${trainerId}`);
    } catch (error) {
      console.error("Lỗi khi kiểm tra thông tin gói tập:", error);
      toast.error(
        "Đã xảy ra lỗi khi kiểm tra thông tin gói tập. Vui lòng thử lại sau.",
      );
    } finally {
      setIsCheckingMembership(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Huấn Luyện Viên
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Lựa chọn huấn luyện viên phù hợp với mục tiêu tập luyện của bạn. Đội
          ngũ PT chuyên nghiệp sẽ giúp bạn đạt được kết quả tối ưu.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 md:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="">Tất cả chuyên môn</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec as string}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      ) : filteredTrainers.length > 0 ? (
        <div className="space-y-6">
          {filteredTrainers.map((trainer) => (
            <TrainerCard
              key={trainer._id}
              trainer={trainer}
              onBookTrainer={() => handleBookTrainer(trainer._id)}
              isBooking={isCheckingMembership}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Không tìm thấy huấn luyện viên phù hợp. Vui lòng thử lại với tiêu
            chí khác.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainerList;
