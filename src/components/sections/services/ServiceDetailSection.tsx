import React from "react";
import SectionTitle from "../../common/SectionTitle";
import { useParams } from "react-router-dom";
import HomeSlider from "../home/HomeSlider";
import TrainerList from "~/pages/user/trainner/TrainerList";

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  fullDescription: string[];
  image: string;
  benefits: string[];
  includedFeatures: string[];
  testimonial: {
    text: string;
    author: string;
    role: string;
  };
}

const ServiceDetailSection: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // This would typically come from an API or context
  const servicesData: Record<string, ServiceDetail> = {
    "personal-training": {
      id: "personal-training",
      title: "Huấn Luyện Cá Nhân",
      description:
        "Huấn luyện một-đối-một được điều chỉnh theo mục tiêu, mức độ thể lực và lịch trình cụ thể của bạn.",
      fullDescription: [
        "Dịch vụ huấn luyện cá nhân của chúng tôi cung cấp sự quan tâm cá nhân hóa và các kế hoạch tập luyện được thiết kế riêng cho bạn. Cho dù bạn mới bắt đầu hành trình thể dục hoặc đang tìm cách vượt qua giai đoạn khó khăn, các huấn luyện viên được chứng nhận của chúng tôi sẽ hướng dẫn bạn trong từng bước.",
        "Mỗi buổi tập được cấu trúc để tối đa hóa thời gian và nỗ lực của bạn, đảm bảo bạn đạt được kết quả mong muốn. Chúng tôi không chỉ tập trung vào việc tập luyện, mà còn tạo ra thói quen bền vững dẫn đến thành công lâu dài.",
      ],
      image: "/images/services/personal-training.jpg",
      benefits: [
        "Kế hoạch tập luyện được điều chỉnh theo mục tiêu của bạn",
        "Hướng dẫn chuyên gia về tư thế và kỹ thuật đúng",
        "Đánh giá tiến độ và điều chỉnh kế hoạch thường xuyên",
        "Tư vấn dinh dưỡng để bổ sung cho việc tập luyện",
        "Trách nhiệm giải trình và động lực để giữ bạn đúng hướng",
        "Lên lịch linh hoạt phù hợp với lối sống của bạn",
      ],
      includedFeatures: [
        "Đánh giá thể chất ban đầu và phiên xác định mục tiêu",
        "Chương trình tập luyện cá nhân hóa",
        "Hướng dẫn dinh dưỡng",
        "Theo dõi tiến độ thường xuyên",
        "Tiếp cận các khu vực tập luyện độc quyền",
        "Liên lạc trực tiếp với huấn luyện viên giữa các buổi tập",
      ],
      testimonial: {
        text: "Làm việc với huấn luyện viên cá nhân tại FittLife đã hoàn toàn thay đổi phương pháp tiếp cận với thể dục của tôi. Chương trình cá nhân hóa giải quyết nhu cầu cụ thể của tôi, và trách nhiệm giải trình giúp tôi duy trì tính nhất quán. Tôi đã đạt được kết quả mà tôi chưa từng nghĩ là có thể!",
        author: "Nguyễn Thị Hương",
        role: "Hội viên từ năm 2019",
      },
    },
    "nutrition-plans": {
      id: "nutrition-plans",
      title: "Kế Hoạch Dinh Dưỡng",
      description:
        "Chế độ ăn uống được cá nhân hóa để hỗ trợ các mục tiêu sức khỏe và thể hình của bạn.",
      fullDescription: [
        "Kế hoạch dinh dưỡng của chúng tôi được thiết kế riêng để bổ sung cho chế độ tập luyện của bạn và giúp bạn đạt được mục tiêu sức khỏe tổng thể. Các chuyên gia dinh dưỡng của chúng tôi sẽ phân tích chế độ ăn hiện tại của bạn, xác định các lĩnh vực cần cải thiện và tạo ra kế hoạch thực tế phù hợp với sở thích và lối sống của bạn.",
        "Chúng tôi tin rằng dinh dưỡng tốt không phải là về việc cực đoan hoặc thiếu thốn - mà là về việc tìm ra sự cân bằng bền vững giúp bạn cảm thấy tốt nhất và hỗ trợ các mục tiêu sức khỏe dài hạn của bạn.",
      ],
      image: "/images/services/nutrition-coaching.JPG",
      benefits: [
        "Kế hoạch dinh dưỡng được cá nhân hóa dựa trên nhu cầu và mục tiêu của bạn",
        "Hướng dẫn lựa chọn thực phẩm thông minh phù hợp với lối sống của bạn",
        "Chiến lược quản lý cân nặng hiệu quả và bền vững",
        "Tối ưu hóa năng lượng và hiệu suất thể thao",
        "Cách tiếp cận dinh dưỡng toàn diện cho sức khỏe lâu dài",
        "Giúp phát triển mối quan hệ lành mạnh với thực phẩm",
      ],
      includedFeatures: [
        "Đánh giá dinh dưỡng và phân tích chế độ ăn uống hiện tại",
        "Tư vấn dinh dưỡng 1-1 với chuyên gia có chứng chỉ",
        "Kế hoạch bữa ăn được cá nhân hóa với công thức phù hợp",
        "Hướng dẫn mua sắm thực phẩm và chuẩn bị bữa ăn",
        "Hỗ trợ liên tục và điều chỉnh kế hoạch khi cần",
        "Ứng dụng theo dõi dinh dưỡng và công cụ kỹ thuật số",
      ],
      testimonial: {
        text: "Kế hoạch dinh dưỡng từ FittLife đã mang lại sự thay đổi đáng kinh ngạc cho sức khỏe và mức năng lượng của tôi. Tôi học được cách ăn thông minh mà không cảm thấy bị giới hạn. Các bữa ăn dễ chuẩn bị, ngon miệng và phù hợp hoàn hảo với lịch trình bận rộn của tôi.",
        author: "Trần Văn Minh",
        role: "Hội viên từ năm 2021",
      },
    },
    // Additional service details would be defined here
  };

  const service = servicesData[id || ""] || {
    id: "",
    title: "Không Tìm Thấy Dịch Vụ",
    description: "",
    fullDescription: ["Thông tin dịch vụ không khả dụng."],
    image: "/images/services/default.jpg",
    benefits: [],
    includedFeatures: [],
    testimonial: { text: "", author: "", role: "" },
  };

  return (
    <div className="dark:bg-gray-900">
      <HomeSlider />
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <SectionTitle
            subtitle="DỊCH VỤ CỦA CHÚNG TÔI"
            title={service.title}
            description={service.description}
          />

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <img
                src={service.image}
                alt={service.title}
                className="h-auto w-full rounded-lg object-cover shadow-lg dark:shadow-gray-700"
              />
            </div>
            <div>
              {service.fullDescription.map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-6 text-gray-600 dark:text-gray-300"
                >
                  {paragraph}
                </p>
              ))}

              <h3 className="mb-4 mt-8 text-2xl font-bold text-gray-800 dark:text-white">
                Lợi Ích
              </h3>
              <ul className="space-y-2">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-600 dark:text-primary-400 mr-2 mt-1">
                      <i className="fas fa-check-circle"></i>
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-8 dark:bg-gray-800">
              <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
                Bao Gồm
              </h3>
              <ul className="space-y-3">
                {service.includedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-600 dark:text-primary-400 mr-2 mt-1">
                      <i className="fas fa-check"></i>
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {service.testimonial.text && (
              <div className="border-primary-600 bg-primary-50 dark:border-primary-400 rounded-lg border-l-4 p-8 dark:bg-gray-800">
                <div className="text-primary-600 dark:text-primary-400 mb-4">
                  <i className="fas fa-quote-left text-3xl"></i>
                </div>
                <p className="mb-6 italic text-gray-700 dark:text-gray-300">
                  {service.testimonial.text}
                </p>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">
                    {service.testimonial.author}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {service.testimonial.role}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {id === "personal-training" && (
          <div className="mt-16">
            <TrainerList />
          </div>
        )}
      </section>
    </div>
  );
};

export default ServiceDetailSection;
