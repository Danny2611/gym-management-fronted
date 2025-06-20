import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  Calendar,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { packageService } from "~/services/packageService";

// Bổ sung định nghĩa interface PackageWithDetails
interface PackageWithDetails {
  _id?: string; // thường sẽ có khi lấy từ DB
  name: string;
  max_members?: number;
  price: number;
  duration: number;
  description?: string;
  benefits: string[];
  status: "active" | "inactive";
  category?: "basic" | "premium" | "fitness" | "platinum" | "vip";
  created_at: string; // ISO date string khi truyền từ backend
  deleted_at?: string;
  updated_at: string;
  popular?: boolean;
  training_sessions: number;
  session_duration: number;
  details?: {
    _id: string;
    package_id: string;
    schedule: string[];
    training_areas: string[];
    additional_services: string[];
    status: "active" | "inactive";
  };
}

const PackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [packageDetail, setPackageDetail] = useState<PackageWithDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "benefits" | "schedule" | "areas"
  >("benefits");

  useEffect(() => {
    const fetchPackageDetail = async () => {
      if (!id) {
        setError("No package ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await packageService.getPackageById(id);
        console.log("API Response:", response); // Kiểm tra response

        if (response.success && response.data) {
          setPackageDetail(response.data);
        } else {
          setError("Failed to fetch package details");
        }
      } catch (err) {
        setError("An error occurred while fetching package details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageDetail();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Đang tải chi tiết gói tập...</p>
      </div>
    );
  }

  // Error state
  if (error || !packageDetail) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>{error || "Không tìm thấy thông tin gói tập"}</p>
        <button
          onClick={() => navigate("/user/packages")}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white"
        >
          Quay lại danh sách gói tập
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate("/user/packages")}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ChevronLeft className="mr-2" />
          Quay lại danh sách gói tập
        </button>
        {packageDetail.popular == true && (
          <div className="flex items-center space-x-2">
            <Star className="text-yellow-500" fill="currentColor" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Gói được đề xuất
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column - Package Overview */}
        <div>
          <div className="mb-6 rounded-lg bg-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{packageDetail.name}</h1>
            <div className="mt-4 flex items-center space-x-4">
              {packageDetail.duration && (
                <div className="flex items-center">
                  <Calendar className="mr-2" />
                  <span>{packageDetail.duration} ngày</span>
                </div>
              )}
              {packageDetail.max_members && (
                <div className="flex items-center">
                  <Users className="mr-2" />
                  <span>Tối đa {packageDetail.max_members} thành viên</span>
                </div>
              )}
            </div>
          </div>

          {/* Price and Description */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(packageDetail.price)}
            </div>
            {packageDetail.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {packageDetail.description}
              </p>
            )}
          </div>

          {/* Section Tabs */}
          <div className="mb-6 flex space-x-4 border-b pb-2">
            <button
              className={`pb-2 ${activeSection === "benefits" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveSection("benefits")}
            >
              Quyền lợi
            </button>
            {packageDetail.details?.schedule && (
              <button
                className={`pb-2 ${activeSection === "schedule" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                onClick={() => setActiveSection("schedule")}
              >
                Lịch tập
              </button>
            )}
            {packageDetail.details?.training_areas && (
              <button
                className={`pb-2 ${activeSection === "areas" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                onClick={() => setActiveSection("areas")}
              >
                Khu vực tập
              </button>
            )}
          </div>

          {/* Conditional Content Sections */}
          {activeSection === "benefits" && (
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Các quyền lợi bạn sẽ nhận được
              </h3>
              <ul className="space-y-3">
                {packageDetail.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="mr-3 text-green-500" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === "schedule" && packageDetail.details?.schedule && (
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Thông tin lịch tập
              </h3>
              <ul className="space-y-3">
                {packageDetail.details.schedule.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <Clock className="mr-3 text-blue-500" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === "areas" &&
            packageDetail.details?.training_areas && (
              <div>
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                  Các khu vực tập
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {packageDetail.details.training_areas.map((area, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-gray-100 p-3 text-center text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Right Column - Additional Services & Registration */}
        <div>
          {packageDetail.details?.additional_services && (
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Dịch vụ bổ sung
              </h3>
              <ul className="space-y-3">
                {packageDetail.details.additional_services.map(
                  (service, index) => (
                    <li
                      key={index}
                      className="flex items-center text-gray-600 dark:text-gray-400"
                    >
                      <CheckCircle className="mr-3 text-blue-500" size={20} />
                      {service}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <button className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-700">
              <Link to={`/user/packages-register/${packageDetail._id}`}>
                Đăng ký gói tập ngay
              </Link>
            </button>
            <button className="mt-4 w-full rounded-lg border border-blue-600 px-6 py-3 text-lg font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400">
              Đặt lịch tư vấn
            </button>
          </div>

          <div className="mt-8 rounded-lg bg-blue-50 p-6 text-center dark:bg-blue-900/30">
            <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              Ưu đãi đặc biệt
            </h4>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Giảm 20% cho đăng ký trong tháng 3/2025. Sử dụng mã: SPRING2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailPage;
