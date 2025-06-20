import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faSearch,
  faBars,
  faTimes,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto flex items-center justify-between md:px-8 lg:px-12">
        {/* Logo */}
        <div className="flex min-h-[80px] items-center md:min-h-[100px] lg:min-h-[114px] lg:w-[380px]">
          <img
            src="/logo-nobg.png"
            alt="Gym Logo"
            className="h-auto w-[160px] sm:w-[180px] lg:w-[199px]"
          />
        </div>

        {/* Menu (Tablet & Desktop) */}
        <ul className="hidden items-center md:flex md:gap-[15px] md:text-base lg:min-h-[114px] lg:gap-[30px]">
          <li className="h-[114px]">
            <a
              href="#"
              className="text-[16px] font-semibold leading-[114px] text-white hover:text-gray-400 sm:text-[18px] lg:text-[20px]"
            >
              HOME
            </a>
          </li>

          {/* ABOUT US with dropdown */}
          <li className="group relative h-[114px]">
            <a
              href="#"
              className="relative flex items-center text-[16px] font-semibold leading-[114px] text-white hover:text-gray-400 sm:text-[18px] lg:text-[20px]"
            >
              ABOUT
              <FontAwesomeIcon icon={faChevronDown} className="ml-2 h-3 w-3" />
            </a>

            {/* Dropdown menu */}
            <ul className="invisible absolute left-0 top-full z-10 -ml-4 -mt-8 w-48 rounded-b-lg bg-[#87c232] opacity-0 shadow-lg transition-all duration-300 group-hover:visible group-hover:opacity-100">
              {[
                "OUR TRAINERS",
                "OUR PRICES",
                "SUCCESS STORIES",
                "TESTIMONIALS",
                "FAQ PAGE",
              ].map((item, index) => (
                <li key={index} className="group/item relative">
                  <a
                    href="#"
                    className="relative block border-b border-white px-4 py-3 text-white transition-all duration-300 hover:bg-[#a1d036]"
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 h-[2px] w-full scale-x-0 bg-white transition-transform duration-300 group-hover/item:scale-x-100"></span>
                  </a>
                </li>
              ))}
            </ul>
          </li>

          {/* CLASSES with dropdown */}
          <li className="group relative h-[114px]">
            <a
              href="#"
              className="relative flex items-center text-[16px] font-semibold leading-[114px] text-white hover:text-gray-400 sm:text-[18px] lg:text-[20px]"
            >
              CLASSES
              <FontAwesomeIcon icon={faChevronDown} className="ml-2 h-3 w-3" />
            </a>

            {/* Dropdown menu */}
            <ul className="invisible absolute left-0 top-full z-10 -ml-4 -mt-8 w-52 rounded-b-lg bg-[#87c232] opacity-0 shadow-lg transition-all duration-300 group-hover:visible group-hover:opacity-100">
              {["FITNESS", "CLASSES CALENDAR"].map((item, index) => (
                <li key={index} className="group/item relative">
                  <a
                    href="#"
                    className="relative block border-b border-white px-4 py-3 text-white transition-all duration-300 hover:bg-[#a1d036]"
                  >
                    {item}
                    {/* Hiệu ứng gạch chân trượt */}
                    <span className="absolute bottom-0 left-0 h-[2px] w-full scale-x-0 bg-white transition-transform duration-300 group-hover/item:scale-x-100"></span>
                  </a>
                </li>
              ))}
            </ul>
          </li>

          <li className="h-[114px]">
            <a
              href="#"
              className="text-[16px] font-semibold leading-[114px] text-white hover:text-gray-400 sm:text-[18px] lg:text-[20px]"
            >
              BLOG
            </a>
          </li>

          <li className="h-[114px]">
            <a
              href="#"
              className="text-[16px] font-semibold leading-[114px] text-white hover:text-gray-400 sm:text-[18px] lg:text-[20px]"
            >
              CONTACT US
            </a>
          </li>
        </ul>

        {/* Actions (Tablet & Desktop) */}
        <div className="hidden items-center space-x-4 sm:flex sm:space-x-6 md:ml-5">
          <button className="text-white hover:text-gray-400">
            <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
          </button>
          <div className="relative">
            <button className="text-white hover:text-gray-400">
              <FontAwesomeIcon icon={faShoppingCart} className="h-6 w-6" />
              <span className="absolute -right-2 -top-2 rounded-full bg-[#ffcd05] px-1.5 py-0.5 text-[10px] text-black">
                3
              </span>
            </button>
          </div>
        </div>

        <button className="block text-white hover:text-gray-400 sm:hidden">
          <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
        </button>

        {/* Hiển thị nút JOIN MEMBERSHIP chỉ trên Desktop */}
        <button className="hidden rounded bg-[#87c232] px-6 py-3 text-white hover:bg-[#76a82b] lg:block">
          JOIN MEMBERSHIP
        </button>

        {/* Hamburger Menu (Mobile & Tablet) */}
        <button
          className="text-white sm:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FontAwesomeIcon
            icon={isMenuOpen ? faTimes : faBars}
            className="h-6 w-6"
          />
        </button>
      </div>

      {/* Menu (Mobile) */}
      {isMenuOpen && (
        <div className="absolute left-0 top-[80px] z-50 w-full bg-gray-800 p-4 sm:hidden">
          <ul className="flex flex-col space-y-4 text-center">
            <li>
              <a href="#" className="text-lg text-white hover:text-gray-400">
                HOME
              </a>
            </li>

            {/* Mobile dropdown for ABOUT US */}
            <li className="relative">
              <button
                className="flex w-full items-center justify-center text-lg text-white hover:text-gray-400"
                onClick={(e) => {
                  e.preventDefault();
                  const submenu = e.currentTarget.nextElementSibling;
                  if (submenu) {
                    submenu.classList.toggle("hidden");
                  }
                }}
              >
                ABOUT US
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="ml-2 h-3 w-3"
                />
              </button>
              <ul className="mt-2 hidden rounded bg-gray-700 p-2">
                {[
                  "OUR TRAINERS",
                  "OUR PRICES",
                  "SUCCESS STORIES",
                  "TESTIMONIALS",
                  "FAQ PAGE",
                ].map((item, index) => (
                  <li key={index} className="group/item relative">
                    <a
                      href="#"
                      className="relative block border-b border-white px-4 py-3 text-white transition-all duration-300 hover:bg-[#a1d036]"
                    >
                      {item}
                      <span className="absolute bottom-0 left-0 h-[2px] w-full scale-x-0 bg-white transition-transform duration-300 group-hover/item:scale-x-100"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>

            {/* Mobile dropdown for CLASSES */}
            <li className="relative">
              <button
                className="flex w-full items-center justify-center text-lg text-white hover:text-gray-400"
                onClick={(e) => {
                  e.preventDefault();
                  const submenu = e.currentTarget.nextElementSibling;
                  if (submenu) {
                    submenu.classList.toggle("hidden");
                  }
                }}
              >
                CLASSES
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="ml-2 h-3 w-3"
                />
              </button>
              <ul className="mt-2 hidden rounded bg-gray-700 p-2">
                {["FITNESS & GYM", "CLASSES CALENDAR"].map((item, index) => (
                  <li key={index} className="group/item relative">
                    <a
                      href="#"
                      className="relative block border-b border-white px-4 py-3 text-white transition-all duration-300 hover:bg-[#a1d036]"
                    >
                      {item}
                      <span className="absolute bottom-0 left-0 h-[2px] w-full scale-x-0 bg-white transition-transform duration-300 group-hover/item:scale-x-100"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <a href="#" className="text-lg text-white hover:text-gray-400">
                BLOG
              </a>
            </li>

            <li>
              <a href="#" className="text-lg text-white hover:text-gray-400">
                CONTACT US
              </a>
            </li>

            {/* Nút JOIN MEMBERSHIP hiển thị trên Mobile */}
            <button className="mt-4 w-full rounded bg-[#87c232] px-6 py-3 text-white hover:bg-[#76a82b]">
              JOIN MEMBERSHIP
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
