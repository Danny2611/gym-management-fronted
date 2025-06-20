import React, { useEffect, useState } from "react";
import SectionTitle from "../../common/SectionTitle";
import Button from "../../common/Button";
import { motion } from "framer-motion";
import { packageService } from "~/services/packageService";
import { Package } from "~/types/package";
import { formatCurrency, formatTime } from "~/utils/formatters";
import { Link } from "react-router-dom";

const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await packageService.getAllPackages({
          status: "active",
        });

        if (response) {
          if (Array.isArray(response)) {
            setPackages(response);
          } else if (response.data && Array.isArray(response.data)) {
            setPackages(response.data);
          } else if (response.success && response.data) {
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

  // Render loading state
  if (isLoading) {
    return (
      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            Đang tải danh sách gói tập...
          </p>
        </div>
      </section>
    );
  }

  // Render error state
  if (error) {
    return (
      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white"
          >
            Thử lại
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="CÁC GÓI HỘI VIÊN"
          title="Chọn gói tập phù hợp cho hành trình của bạn"
          description="Chúng tôi cung cấp nhiều gói linh hoạt để đáp ứng nhu cầu và mục tiêu tập luyện của bạn."
        />

        {/* Toggle button cho light mode và dark mode */}
        <div className="mb-12 mt-8 flex justify-center">
          <div className="inline-flex rounded-full bg-gray-100 p-1 shadow-sm dark:bg-gray-800">
            <button
              className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Theo tháng
            </button>
            <button
              className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                billingCycle === "annual"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => setBillingCycle("annual")}
            >
              Theo năm (Tiết kiệm 20%)
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {packages.map((pkg) => {
            const isPopular = pkg.popular ?? false;
            const price =
              billingCycle === "annual"
                ? Math.round(pkg.price * 12 * 0.8)
                : pkg.price;

            return (
              <motion.div
                key={pkg._id}
                whileHover={{ y: -10 }}
                className={`relative overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800 ${
                  isPopular ? "border-2 border-blue-600" : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    PHỔ BIẾN NHẤT
                  </div>
                )}
                <div className="flex h-full flex-col p-8">
                  <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
                    {pkg.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(price)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {billingCycle === "annual"
                        ? " /năm"
                        : ` /${pkg.duration} ngày`}
                    </span>
                  </div>

                  {/* Thêm min-height cho phần benefits để đảm bảo các nút đều nhau */}
                  <ul className="mb-8 flex-grow space-y-3 text-gray-700 dark:text-gray-300">
                    {pkg.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 mt-1 text-green-500">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Link
                      to={`/user/packages-register/${pkg._id}`}
                      className="block w-full"
                    >
                      <button
                        className={`w-full rounded-lg px-4 py-2 font-medium transition-colors ${
                          isPopular
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                      >
                        Đăng ký ngay
                      </button>
                    </Link>
                    <Link
                      to={`/user/package-detail/${pkg._id}`}
                      className="mt-2 block w-full"
                    >
                      <button className="w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                        Xem chi tiết
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-gray-600 dark:text-gray-300">
          <p>
            Không chắc nên chọn gói nào?{" "}
            <a href="#" className="font-medium text-blue-600 hover:underline">
              Liên hệ chúng tôi
            </a>{" "}
            để được tư vấn miễn phí.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
