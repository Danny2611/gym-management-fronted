import React from "react";
import Button from "../../common/Button";
import { Link } from "react-router-dom";

interface CTABannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
}

const CTABanner: React.FC<CTABannerProps> = ({
  title = "Bạn đã sẵn sàng thay đổi bản thân?",
  subtitle = "Gia nhập Fittlife ngay hôm nay để rèn luyện sức khỏe cùng đội ngũ huấn luyện viên chuyên nghiệp và trang thiết bị hiện đại.",
  buttonText = "Đăng ký ngay",
  buttonLink = "/user/packages",
  backgroundImage,
}) => {
  return (
    <div
      className="bg-cover bg-center py-20"
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage})`
          : 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("/images/contact/cta-background.jpg")',
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-200">
          {subtitle}
        </p>
        <Link to={buttonLink}>
          <Button size="large" variant="primary">
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CTABanner;
