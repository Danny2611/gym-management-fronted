import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
} from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import NewsletterSignup from "../../common/NewsletterSignup";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0D2E4B] text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <Link to="/">
              <img
                src="/images/logo.png"
                alt="FittLife"
                className="mb-6 h-16 brightness-0 invert filter"
              />
            </Link>
            <p className="mb-6 text-gray-300">
             FittLife cam kết đồng hành cùng bạn trên hành trình chinh phục mục tiêu thể hình, với đội ngũ huấn luyện viên chuyên nghiệp và tư vấn dinh dưỡng tận tâm.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0CC6F0] transition-colors hover:bg-white hover:text-[#0CC6F0]"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0CC6F0] transition-colors hover:bg-white hover:text-[#0CC6F0]"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0CC6F0] transition-colors hover:bg-white hover:text-[#0CC6F0]"
              >
                <FaInstagram />
              </a>
              <a
                href="https://youtube.com"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0CC6F0] transition-colors hover:bg-white hover:text-[#0CC6F0]"
              >
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="relative mb-6 pb-4 text-xl font-bold after:absolute after:bottom-0 after:left-0 after:h-1 after:w-16 after:bg-[#0CC6F0] after:content-['']">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about-us"
                  className="inline-block text-gray-300 transition-colors hover:text-[#0CC6F0]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="inline-block text-gray-300 transition-colors hover:text-[#0CC6F0]"
                >
                  Our Services
                </Link>
              </li>
            
              <li>
                <Link
                  to="/blog"
                  className="inline-block text-gray-300 transition-colors hover:text-[#0CC6F0]"
                >
                  Latest News
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="inline-block text-gray-300 transition-colors hover:text-[#0CC6F0]"
                >
                  Contact Us
                </Link>
              </li>
             
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="relative mb-6 pb-4 text-xl font-bold after:absolute after:bottom-0 after:left-0 after:h-1 after:w-16 after:bg-[#0CC6F0] after:content-['']">
              Contact Info
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mr-3 mt-1 flex-shrink-0 text-[#0CC6F0]" />
                <span className="text-gray-300">
                  123 Linh Xuân, thành phố Thủ Đức, Hồ Chí Minh.
                </span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="mr-3 flex-shrink-0 text-[#0CC6F0]" />
                <span className="text-gray-300">+ (123) 456-7890 </span>
              </li>
              <li className="flex items-center">
                <IoMdMail className="mr-3 flex-shrink-0 text-[#0CC6F0]" />
                <span className="text-gray-300">info@fittlife.com</span>
              </li>
              <li className="flex items-start">
                <FaClock className="mr-3 mt-1 flex-shrink-0 text-[#0CC6F0]" />
                <div className="text-gray-300">
                  <p>Thứ 2 - Thứ 6: 6:00 AM - 9:00 PM</p>
                  <p>Thứ 7 - Chủ nhật: 8:00 AM - 6:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="relative mb-6 pb-4 text-xl font-bold after:absolute after:bottom-0 after:left-0 after:h-1 after:w-16 after:bg-[#0CC6F0] after:content-['']">
              Newsletter
            </h3>
            <p className="mb-6 text-gray-300">
             Theo dõi bản tin để không bỏ lỡ các tin tức và khuyến mãi hấp dẫn!
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 py-6">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row">
          <p className="mb-4 text-center text-gray-400 md:mb-0 md:text-left">
            © {currentYear} FittLife Fitness Center. All Rights Reserved.
          </p>
          <div className="flex space-x-4">
            <Link
              to="/terms"
              className="text-gray-400 transition-colors hover:text-[#0CC6F0]"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy-policy"
              className="text-gray-400 transition-colors hover:text-[#0CC6F0]"
            >
              Privacy Policy
            </Link>
            <Link
              to="/sitemap"
              className="text-gray-400 transition-colors hover:text-[#0CC6F0]"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
