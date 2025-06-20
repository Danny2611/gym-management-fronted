import React from "react";
import { Helmet } from "react-helmet-async";
import Layout from "~/components/layout/Layout";
// import ContactHeader from "/components/sections/contact/ContactHeader";
import ContactInfo from "~/components/sections/contact/ContactInfo";
import ContactFormSection from "~/components/sections/contact/ContactFormSection";
import ContactFAQs from "~/components/sections/contact/ContactFAQs";
import CTABanner from "~/components/sections/contact/CTABanner";
import { FAQ } from "~/types/contact";
import HomeSlider from "~/components/sections/home/HomeSlider";

// Dữ liệu giả lập cho phần câu hỏi thường gặp
const MOCK_FAQS: FAQ[] = [
  {
    question: "Phòng gym mở cửa vào thời gian nào?",
    answer:
      "Chúng tôi mở cửa từ 6:00 sáng đến 10:00 tối từ thứ Hai đến thứ Sáu, và từ 8:00 sáng đến 8:00 tối vào cuối tuần.",
  },
  {
    question: "Tôi có thể tập với huấn luyện viên cá nhân không?",
    answer:
      "Có, chúng tôi có các buổi tập cùng HLV cá nhân được chứng nhận. Bạn có thể đăng ký trực tiếp tại quầy lễ tân hoặc qua ứng dụng di động.",
  },
  {
    question: "Tôi có được dùng thử miễn phí không?",
    answer:
      "Chúng tôi cung cấp 7 ngày tập thử miễn phí dành cho hội viên mới. Bạn có thể đăng ký trên website hoặc đến trực tiếp phòng tập.",
  },
  {
    question: "Làm sao để hủy hội viên?",
    answer:
      "Bạn có thể đến quầy lễ tân để điền form hủy, hoặc đăng nhập vào tài khoản trên website và làm theo hướng dẫn hủy.",
  },
  {
    question: "Có các lớp học nhóm không?",
    answer:
      "Có, chúng tôi có nhiều lớp học nhóm như yoga, đạp xe, HIIT, v.v. Bạn có thể xem lịch học trên website hoặc ứng dụng.",
  },
  {
    question: "Phòng tập có phòng tắm không?",
    answer:
      "Có, chúng tôi có phòng tắm đầy đủ với khăn tắm, dầu gội và sữa tắm miễn phí.",
  },
];

const Contact: React.FC = () => {
  return (
    <Layout>
      <Helmet>
        <title>Liên Hệ</title>
      </Helmet>
      <HomeSlider />
      <ContactInfo />
      <ContactFormSection
        title="Gửi tin nhắn cho chúng tôi"
        subtitle="Chúng tôi sẽ phản hồi sớm nhất có thể"
        location="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387190.2798897555!2d-74.25987155604412!3d40.69767006316378!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQxJzUyLjAiTiA3NMKwMTUnMjguNyJX!5e0!3m2!1sen!2sus!4v1614588395925!5m2!1sen!2sus"
      />
      <ContactFAQs
        title="Câu hỏi thường gặp"
        subtitle="Giải đáp thắc mắc về dịch vụ và phòng tập của chúng tôi"
        faqs={MOCK_FAQS}
      />
      <CTABanner />
    </Layout>
  );
};

export default Contact;
