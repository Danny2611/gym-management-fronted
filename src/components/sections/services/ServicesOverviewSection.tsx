import React from "react";
import { motion } from "framer-motion";
import SectionTitle from "~/components/common/SectionTitle";
import ServiceCard from "~/components/common/ServiceCard";

const services = [
  {
    id: "pt-uu-tien",
    image: "/images/services/personal-training.jpg",
    title: "Huấn luyện viên cá nhân",
    description:
      "Được hỗ trợ 1-1 cùng HLV chuyên nghiệp, xây dựng lộ trình tập luyện phù hợp với mục tiêu cá nhân của bạn.",
    link: "/services/pt-uu-tien",
  },
  {
    id: "lop-nhom",
    image: "/images/services/group-fitness.JPG",
    title: "Lớp nhóm năng động",
    description:
      "Tham gia các lớp cardio, HIIT hoặc yoga cùng huấn luyện viên trong môi trường vui vẻ và đầy năng lượng.",
    link: "/services/lop-nhom",
  },
  {
    id: "dinh-duong",
    image: "/images/services/nutrition-coaching.JPG",
    title: "Tư vấn dinh dưỡng",
    description:
      "Tối ưu hiệu quả tập luyện với thực đơn dinh dưỡng cá nhân hóa phù hợp với thể trạng và mục tiêu.",
    link: "/services/dinh-duong",
  },
  {
    id: "khu-vuc-vip",
    image: "/images/services/strength-training.JPG",
    title: "Khu vực tập luyện cao cấp",
    description:
      "Tận hưởng không gian VIP, đầy đủ thiết bị hiện đại, spa, phòng hồi phục và nhiều tiện ích đặc quyền.",
    link: "/services/khu-vuc-vip",
  },
  {
    id: "yoga-thu-gian",
    image: "/images/services/yoga-relaxation.JPG",
    title: "Yoga và thư giãn",
    description:
      "Cân bằng cơ thể và tinh thần với các lớp yoga, thiền, và kéo giãn giúp giảm stress và cải thiện giấc ngủ.",
    link: "/services/yoga-thu-gian",
  },
  {
    id: "phuc-hoi-chuc-nang",
    image: "/images/services/rehab-training.JPG",
    title: "Phục hồi chức năng",
    description:
      "Chương trình phục hồi dành cho người bị chấn thương, đau lưng, đau khớp hoặc cần cải thiện vận động.",
    link: "/services/phuc-hoi-chuc-nang",
  },

  {
    id: "danh-gia-co-the",
    image: "/images/services/body-assessment.JPG",
    title: "Đánh giá cơ thể toàn diện",
    description:
      "Phân tích chỉ số cơ thể, mỡ, cơ và trao đổi chất để lập kế hoạch tập luyện hiệu quả và khoa học.",
    link: "/services/danh-gia-co-the",
  },
  {
    id: "spa-cao-cap",
    image: "/images/services/premium-spa.JPG",
    title: "Dịch vụ spa cao cấp",
    description:
      "Thư giãn sau buổi tập với các liệu trình massage, xông hơi, chăm sóc da chuyên sâu trong không gian sang trọng.",
    link: "/services/spa-cao-cap",
  },
];

const ServicesSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Dịch Vụ Nổi Bật"
          subtitle="NHỮNG GÌ CHÚNG TÔI CUNG CẤP"
          description="Khám phá các dịch vụ thể hình toàn diện giúp bạn đạt được mục tiêu sức khỏe và phong cách sống lý tưởng."
          centered
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              {...service}
              variants={itemVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
