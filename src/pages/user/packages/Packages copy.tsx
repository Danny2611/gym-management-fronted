import React, { useState, useEffect } from "react";
import { packageService } from "~/services/packageService";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Package } from "~/types/package";
import { promotionService } from "~/services/promotionService";
import { PromotionResponse } from "~/types/promotion";

interface FilterButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  children,
  isActive,
  onClick,
}) => (
  <button
    className={`rounded-full px-4 py-2 text-sm ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

interface PriceTagProps {
  price: number;
}

const PriceTag: React.FC<PriceTagProps> = ({ price }) => (
  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
    {new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)}
  </div>
);

interface PackageCardProps {
  pack: Package;
}

const PackageCard: React.FC<PackageCardProps> = ({ pack }) => (
  <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-lg dark:border-gray-700">
    <div className="bg-blue-600 p-4 text-white">
      <h3 className="text-xl font-bold">{pack.name}</h3>
    </div>
    <div className="flex flex-1 flex-col p-6">
      <PriceTag price={pack.price} />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Thời hạn: {pack.duration} ngày
      </p>
      <p className="mt-4 text-gray-700 dark:text-gray-300">
        {pack.description}
      </p>

      <div className="mt-4 flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Quyền lợi:
        </h4>
        <ul className="mt-2 space-y-2">
          {pack.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-green-500">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <button className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
          <Link to={`/user/packages-register/${pack._id}`}>
            Đăng ký gói tập ngay
          </Link>
        </button>
        <button className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
          <Link to={`/user/package-detail/${pack._id}`}>Xem chi tiết</Link>
        </button>
      </div>
    </div>
  </div>
);

const PackagesPage = () => {
  const [filter, setFilter] = useState<Package["category"] | "all">("all");
  const [packages, setPackages] = useState<Package[]>([]);
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate(); // Thêm hook useNavigate
  // Dữ liệu FAQ giữ nguyên
  const packageFAQs = [
    {
      id: 1,
      question: "Làm thế nào để chọn gói tập phù hợp?",
      answer:
        "Việc chọn gói tập phù hợp phụ thuộc vào mục tiêu tập luyện, ngân sách và thời gian của bạn. Nếu bạn mới bắt đầu, gói Cơ Bản là lựa chọn tốt. Nếu bạn muốn kết quả nhanh hơn, gói Premium hoặc Platinum với PT sẽ phù hợp hơn.",
    },
    {
      id: 2,
      question: "Tôi có thể hủy gói tập giữa chừng được không?",
      answer:
        "Gói tập có thể được hoàn trả một phần nếu bạn hủy trong vòng 7 ngày kể từ ngày đăng ký. Sau thời gian đó, chúng tôi không hoàn tiền nhưng bạn có thể chuyển nhượng gói tập cho người khác hoặc tạm dừng trong trường hợp đặc biệt.",
    },
    {
      id: 3,
      question: "Gói tập có tự động gia hạn không?",
      answer:
        "Không, gói tập không tự động gia hạn trừ khi bạn đăng ký tính năng tự động gia hạn. Chúng tôi sẽ gửi thông báo trước khi gói tập của bạn hết hạn để bạn có thể quyết định gia hạn.",
    },
  ];

  // Fetch packages when component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await packageService.getAllPackages({
          status: "active",
        });

        const responsePromotion =
          await promotionService.getAllActivePromotions();
        if (responsePromotion.success && responsePromotion.data) {
          setPromotions(responsePromotion.data);
        }

        // console.log("responsePromotion from API:", responsePromotion);

        // Kiểm tra cấu trúc response thực tế
        if (response) {
          // Nếu response trực tiếp là mảng packages
          if (Array.isArray(response)) {
            setPackages(response);
          }
          // Nếu response có thuộc tính data
          else if (response.data && Array.isArray(response.data)) {
            setPackages(response.data);
          }
          // Nếu response có thuộc tính success và data
          else if (response.success && response.data) {
            setPackages(response.data);
          } else {
            setError("Invalid response format");
          }
        } else {
          setError("No packages found");
        }
      } catch (err) {
        setError("An error occurred while fetching packages");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Lọc gói tập theo category
  const filteredPackages =
    filter === "all" ? packages : packages.filter((p) => p.category === filter);

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Đang tải danh sách gói tập...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Danh sách gói tập
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Khám phá các gói tập phù hợp với mục tiêu và ngân sách của bạn
        </p>
      </header>

      {/* Banner giới thiệu */}
      <div className="mb-8 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700">
        <div className="flex flex-col items-start justify-between p-8 md:flex-row md:items-center">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="mb-2 text-2xl font-bold text-white">
              Đăng ký ngay hôm nay!
            </h2>
            <p className="mb-4 text-blue-100">
              Nhận ưu đãi giảm 20% cho tất cả các gói tập khi đăng ký trong
              tháng 3/2025
            </p>
            <button className="rounded-full bg-white px-6 py-2 font-medium text-blue-700 shadow-md transition-all hover:shadow-lg">
              Xem ưu đãi
            </button>
          </div>
          <div className="rounded-lg bg-blue-800 bg-opacity-40 p-4 text-white">
            <p className="mb-2 font-medium">Mã giảm giá:</p>
            <div className="text-2xl font-bold tracking-wider">SPRING2025</div>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterButton
          isActive={filter === "all"}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </FilterButton>
        <FilterButton
          isActive={filter === "basic"}
          onClick={() => setFilter("basic")}
        >
          Gói cơ bản
        </FilterButton>
        <FilterButton
          isActive={filter === "premium"}
          onClick={() => setFilter("premium")}
        >
          Gói cao cấp
        </FilterButton>
        <FilterButton
          isActive={filter === "fitness"}
          onClick={() => setFilter("fitness")}
        >
          Gói Fitness
        </FilterButton>
      </div>

      {/* Danh sách gói tập */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPackages.map((pack) => (
          <PackageCard key={pack._id} pack={pack} />
        ))}
      </div>

      {/* Phần FAQ */}
      <section className="mb-12 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Câu hỏi thường gặp
        </h2>
        <div className="space-y-4">
          {packageFAQs.map((faq) => (
            <div
              key={faq.id}
              className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
            >
              <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                {faq.question}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Xem thêm câu hỏi →
          </button>
        </div>
      </section>

      {/* Liên hệ */}
      <section className="rounded-lg bg-blue-50 p-6 text-center dark:bg-blue-900/30">
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Cần hỗ trợ thêm?
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Nếu bạn cần tư vấn thêm để chọn gói tập phù hợp, hãy liên hệ với chúng
          tôi
        </p>
        <button className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700">
          Tư vấn miễn phí
        </button>
      </section>
    </div>
  );
};

export default PackagesPage;
