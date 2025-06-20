import React from "react";
import SectionTitle from "../../common/SectionTitle";
import { Disclosure, Transition } from "@headlessui/react";
import Button from "../../common/Button";
import ContactFAQs from "../contact/ContactFAQs";

interface FAQ {
  question: string;
  answer: string;
}

const FAQSection: React.FC = () => {
  const faqs: FAQ[] = [
    {
      question: "Giờ mở cửa phòng gym như thế nào?",
      answer:
        "Chúng tôi mở cửa từ Thứ Hai đến Thứ Sáu, 5:00 sáng đến 11:00 tối. Cuối tuần mở từ 7:00 sáng đến 9:00 tối. Giờ hoạt động vào các dịp lễ sẽ được thông báo trước.",
    },
    {
      question: "Tôi có cần mang theo thiết bị tập luyện không?",
      answer:
        "Không, phòng tập đã trang bị đầy đủ thiết bị cần thiết. Chúng tôi cung cấp khăn tập, tuy nhiên bạn nên mang theo chai nước cá nhân. Chúng tôi có máy lọc nước tại chỗ.",
    },
    {
      question: "Hủy hội viên có mất phí không?",
      answer:
        "Với hội viên theo tháng, cần thông báo trước 30 ngày và không mất thêm phí. Với hội viên năm, có thể bị tính phí nếu hủy sớm trước thời hạn hợp đồng. Vui lòng xem điều khoản hợp đồng để biết chi tiết.",
    },
    {
      question: "Phòng gym có dịch vụ giữ trẻ không?",
      answer:
        "Có, chúng tôi cung cấp dịch vụ giữ trẻ vào một số khung giờ nhất định trong tuần. Có thu phí nhỏ và nên đặt trước vào giờ cao điểm.",
    },
    {
      question: "Tôi có thể tạm ngưng hội viên không?",
      answer:
        "Có thể. Hội viên được phép tạm ngưng từ 1 đến 3 tháng mỗi năm, có áp dụng phí duy trì nhỏ hàng tháng. Liên hệ bộ phận hỗ trợ để biết thêm chi tiết.",
    },
    {
      question: "Đăng ký lớp học nhóm như thế nào?",
      answer:
        "Bạn có thể đăng ký qua website, ứng dụng di động hoặc tại quầy lễ tân. Chúng tôi khuyến khích đặt chỗ sớm vì các lớp phổ biến thường hết chỗ nhanh. Hội viên cao cấp có quyền đặt chỗ ưu tiên.",
    },
  ];

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <SectionTitle
          // subtitle="CÂU HỎI THƯỜNG GẶP"
          title="Giải đáp thắc mắc của bạn"
          // description="Những câu hỏi phổ biến liên quan đến dịch vụ, gói tập và chính sách của chúng tôi."
        />

        
         <ContactFAQs
        title="Câu hỏi thường gặp"
        subtitle="Những câu hỏi phổ biến liên quan đến dịch vụ, gói tập và chính sách của chúng tôi."
        faqs={faqs}
      />
        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Không tìm thấy câu trả lời bạn cần?
          </p>
          <Button variant="primary" size="large">
            Liên hệ với chúng tôi
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
