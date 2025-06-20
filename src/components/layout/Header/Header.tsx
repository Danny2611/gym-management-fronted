import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { BsFillTelephoneFill } from "react-icons/bs";

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";
import classNames from "classnames";
import { useScrollPosition } from "~/hooks/useScrollPosition";
import Button from "../../common/Button";
import RoleBasedDropdown from "~/components/dashboard/header/RoleBasedDropdown";
import { useAuth } from "~/contexts/AuthContext";
import { ThemeToggleButton } from "~/components/dashboard/common/ThemeToggleButton";
import LanguageSelector from "~/components/LanguageSelector";
import { useTranslation } from "react-i18next";




interface NavItem {
  name: string;
  path: string;
  children?: NavItem[];
}


const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const scrollPosition = useScrollPosition();
  //  const { isAuthenticated, user } = useAuth();
  const { isAuthenticated } = useAuth();

  
  const { t } = useTranslation();
const navItems: NavItem[] = [
   { name: t("header.nav.home"), path: "/" },
  {
     name: t("header.nav.about"),
    path: "/about-us",
  
  },
  {
   name: t("header.nav.services"),
    path: "/services",
    children: [
       { name: t("header.nav.pt"), path: "/services/personal-training" },
        { name: t("header.nav.class"), path: "/services" },
        { name: t("header.nav.nutrition"), path: "/services/nutrition-plans" },
    ],
  },
  // { name: "Schedule", path: "/schedule" },
  { name: t("header.nav.blog"), path: "/blog" },
    { name: t("header.nav.contact"), path: "/contact" },
];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

 
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={classNames(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        {
          "bg-white shadow-md dark:bg-gray-900 dark:shadow-gray-800":
            scrollPosition > 50 || mobileMenuOpen,
          "bg-gradient-to-b from-black/70 to-transparent":
            scrollPosition <= 50 && !mobileMenuOpen, // Changed from transparent to gradient
        },
      )}
    >
      {/* Top Bar - Only show on desktop */}
      <div className="hidden md:block">
        <div className="bg-[#111] py-5 text-white dark:bg-gray-950">
          <div className="container mx-auto flex items-center justify-between px-4">
            {/* Logo/Slogan */}
            <div className="hidden items-center md:flex">
              <span className="text-blue-600">⚡</span>
              <span className="ml-2 text-sm font-medium">
               {t('header.slogan')}
              </span>
            </div>

            {/* Center Contact */}
            <div className="mx-auto hidden items-center space-x-6 md:flex">
              <div className="flex items-center text-sm">
                <BsFillTelephoneFill className="mr-2 text-gray-400" />
                <span>{t('header.contact')}</span>
              </div>
              <div className="flex items-center text-sm">
                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                <span>{t('header.address')}</span>
              </div>
            </div>

            {/* Right Navigation */}
            <div className="hidden items-center space-x-6 md:flex">
               <Link
                to="/user/packages"
                 className="text-sm transition-colors hover:text-blue-600"
              >
                {t('header.join')}
              </Link>
                <LanguageSelector />
             
        <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
             <ThemeToggleButton />
</div>





            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        {!mobileMenuOpen && (
          <Link to="/" className="z-10">
            <img
              src="/logo-main-2.png"
              alt="FittLife"
              className="h-12 md:h-16"
              style={{
                filter:
                  scrollPosition <= 50 && !mobileMenuOpen
                    ? "brightness(0) invert(1)"
                    : "none",
              }}
            />
          </Link>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden items-center lg:flex">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.name} className="group relative">
                {item.children ? (
                  <>
                    <button
                      className={classNames(
                        "flex items-center text-lg font-semibold transition-colors",
                        {
                          "text-white hover:text-blue-400":
                            scrollPosition <= 50 && !mobileMenuOpen,
                          "text-[#0D2E4B] hover:text-blue-600 dark:text-white dark:hover:text-blue-400":
                            scrollPosition > 50 || mobileMenuOpen,
                        },
                      )}
                      onClick={() => {}}
                    >
                      {item.name}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div className="invisible absolute left-0 mt-2 w-48 rounded-md bg-white opacity-0 shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 group-hover:visible group-hover:opacity-100 dark:bg-gray-800">
                      <div className="py-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            className={({ isActive }) =>
                              classNames(
                                "block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-blue-900 dark:hover:text-blue-300",
                                {
                                  "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300":
                                    isActive,
                                },
                              )
                            }
                          >
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      classNames(
                        "relative text-lg font-semibold transition-colors",
                        {
                          "text-white hover:text-blue-400":
                            scrollPosition <= 50 &&
                            !mobileMenuOpen &&
                            !isActive,
                          "text-blue-400 after:absolute after:bottom-[-8px] after:left-0 after:h-1 after:w-full after:bg-blue-600":
                            scrollPosition <= 50 && !mobileMenuOpen && isActive,
                          "text-[#0D2E4B] hover:text-blue-600 dark:text-white dark:hover:text-blue-400":
                            scrollPosition > 50 ||
                            mobileMenuOpen ||
                            (isActive && scrollPosition > 50),
                          "text-blue-600 after:absolute after:bottom-[-8px] after:left-0 after:h-1 after:w-full after:bg-blue-600 dark:text-blue-400":
                            (isActive && scrollPosition > 50) ||
                            (isActive && mobileMenuOpen),
                        },
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          {isAuthenticated ? (
            <div className="ml-16">
              <RoleBasedDropdown />
            </div>
          ) : (
            <Button
              as={Link}
              to="/login"
              variant="primary"
              size="medium"
              className="ml-16 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
            {t('header.nav.login')}
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4 lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="z-10"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <HiOutlineX className="h-6 w-6 text-[#0D2E4B] dark:text-white" />
            ) : (
              <HiOutlineMenu
                className={classNames("h-6 w-6", {
                  "text-white": scrollPosition <= 50,
                  "text-[#0D2E4B] dark:text-white": scrollPosition > 50,
                })}
              />
            )}
          </button>

          {/* Login button for mobile */}
          {isAuthenticated ? (
            <div className="ml-4">
              <RoleBasedDropdown />
            </div>
          ) : (
            <Button
              as={Link}
              to="/login"
              variant="primary"
              size="small"
              className="ml-4 bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
             {t('header.nav.login')}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div
          className={classNames(
            "fixed inset-0 flex flex-col bg-white transition-all duration-300 dark:bg-gray-900 lg:hidden",
            {
              "visible opacity-100": mobileMenuOpen,
              "invisible opacity-0": !mobileMenuOpen,
            },
          )}
        >
          <div className="flex flex-1 flex-col items-center justify-center overflow-auto py-10">
            <ul className="w-full max-w-sm space-y-6 px-4">
              {navItems.map((item) => (
                <li key={item.name} className="w-full">
                  {item.children ? (
                    <div>
                      <button
                        className="flex w-full items-center justify-between text-left text-xl font-semibold text-[#0D2E4B] dark:text-white"
                        onClick={() => toggleDropdown(item.name)}
                      >
                        {item.name}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={classNames(
                            "h-4 w-4 transition-transform",
                            {
                              "rotate-180": activeDropdown === item.name,
                            },
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div
                        className={classNames(
                          "ml-4 mt-2 space-y-2 overflow-hidden transition-all duration-300",
                          {
                            "max-h-0 opacity-0": activeDropdown !== item.name,
                            "max-h-96 opacity-100":
                              activeDropdown === item.name,
                          },
                        )}
                      >
                        {item.children.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            className={({ isActive }) =>
                              classNames("block py-2 text-lg font-medium", {
                                "text-blue-600 dark:text-blue-400": isActive,
                                "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400":
                                  !isActive,
                              })
                            }
                            onClick={toggleMobileMenu}
                          >
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        classNames("block text-xl font-semibold", {
                          "text-blue-600 dark:text-blue-400": isActive,
                          "text-[#0D2E4B] hover:text-blue-600 dark:text-white dark:hover:text-blue-400":
                            !isActive,
                        })
                      }
                      onClick={toggleMobileMenu}
                    >
                      {item.name}
                    </NavLink>
                  )}
                </li>
              ))}

              <li className="mt-8 flex justify-center space-x-6">
                <a
                  href="https://facebook.com"
                  className="text-xl text-[#0D2E4B] hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://twitter.com"
                  className="text-xl text-[#0D2E4B] hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
                <a
                  href="https://instagram.com"
                  className="text-xl text-[#0D2E4B] hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              </li>

              {/* Mobile Contact Information */}
              <li className="mt-8 text-center">
                <div className="mb-2 flex items-center justify-center text-sm">
                  <BsFillTelephoneFill className="mr-2 text-blue-600 dark:text-blue-400" />
                  <span className="text-[#0D2E4B] dark:text-white">
                    + (123) 456-7890
                  </span>
                </div>
                <div className="flex items-center justify-center text-sm">
                  <FaMapMarkerAlt className="mr-2 text-blue-600 dark:text-blue-400" />
                  <span className="text-[#0D2E4B] dark:text-white">
                   123 Linh Xuân, thành phố Thủ Đức, Hồ Chí Minh.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
