import React from "react";
import Button from "../../common/Button";

const MembershipCTASection: React.FC = () => {
  return (
    <section className="bg-primary-600 relative overflow-hidden py-20 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-8 text-center md:mb-0 md:text-left">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Sẵn sàng bắt đầu hành trình luyện tập?
            </h2>
            <p className="max-w-2xl text-lg text-white/80">
              Tham gia cộng đồng của chúng tôi ngay hôm nay và thay đổi bản thân cùng đội ngũ huấn luyện viên chuyên nghiệp và cơ sở vật chất hiện đại. Chúng tôi có nhiều gói hội viên linh hoạt phù hợp với nhu cầu và lịch trình của bạn.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button variant="secondary" size="large">
              Xem các gói hội viên
            </Button>
            <Button
              variant="outline"
              size="large"
              className="hover:text-primary-600 border-white text-white hover:bg-white"
            >
              Đặt lịch tham quan miễn phí
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipCTASection;
