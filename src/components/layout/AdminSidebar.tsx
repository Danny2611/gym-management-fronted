import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../../contexts/SidebarContext";

// Import các icon từ react-icons
import {
  FiUsers,
  FiPackage,
  FiChevronDown,
  FiCalendar,
  FiDollarSign,
  FiPercent,
  FiBarChart2,
  FiSettings,
  FiMoreHorizontal,
  FiBell,
  FiFileText,
  FiUserCheck,
} from "react-icons/fi";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Các mục chính dành cho admin phòng gym theo đề cương
const navItems: NavItem[] = [
  // {
  //   icon: <FiHome className="h-5 w-5" />,
  //   name: "Dashboard",
  //   path: "/admin/dashboard",
  // },
  {
    icon: <FiUsers className="h-5 w-5" />,
    name: "Quản lý hội viên",
    subItems: [
      { name: "Danh sách người dùng", path: "/admin/members" },
      { name: "Danh sách hội viên", path: "/admin/memberships" },
      // { name: "Thêm hội viên mới", path: "/admin/members/add", new: true },
      // { name: "Thành viên hết hạn", path: "/admin/members/expired" },
      // { name: "Thành viên mới", path: "/admin/members/new" },
    ],
  },
  {
    icon: <FiPackage className="h-5 w-5" />,
    name: "Quản lý gói tập",
    subItems: [
      { name: "Danh sách gói tập", path: "/admin/packages" },
      // { name: "Thêm gói tập mới", path: "/admin/packages/add" },
      // { name: "Gói đang khuyến mãi", path: "/admin/packages/promotion" },
    ],
  },
  {
    icon: <FiUserCheck className="h-5 w-5" />,
    name: "Quản lý PT",
    subItems: [
      { name: "Danh sách PT", path: "/admin/trainers" },
      // { name: "Lịch trình PT", path: "/admin/trainers/schedules" },
      // { name: "Thêm PT mới", path: "/admin/trainers/add" },
    ],
  },
  {
    icon: <FiCalendar className="h-5 w-5" />,
    name: "Lịch hẹn",
    subItems: [
      { name: "Tất cả lịch hẹn", path: "/admin/appointments" },
      // { name: "Lịch hẹn chờ duyệt", path: "/admin/appointments/pending" },
      // { name: "Lịch hẹn đã xác nhận", path: "/admin/appointments/confirmed" },
    ],
  },
  {
    icon: <FiDollarSign className="h-5 w-5" />,
    name: "Giao dịch",
    subItems: [
      { name: "Lịch sử giao dịch", path: "/admin/transactions" },
      // { name: "Giao dịch mới", path: "/admin/transactions/add" },
      // { name: "Giao dịch gần đây", path: "/admin/transactions/recent" },
    ],
  },
  {
    icon: <FiPercent className="h-5 w-5" />,
    name: "Khuyến mãi",
    subItems: [
      { name: "Danh sách khuyến mãi", path: "/admin/promotions" },
      // { name: "Thêm khuyến mãi", path: "/admin/promotions/add" },
      // { name: "Khuyến mãi đang chạy", path: "/admin/promotions/active" },
    ],
  },
  {
    icon: <FiBarChart2 className="h-5 w-5" />,
    name: "Báo cáo & Thống kê",

    subItems: [
      { name: "Tổng quan", path: "/admin/reports/dashboard" },
      { name: "Doanh thu", path: "/admin/reports/revenues" },
      { name: "Hội viên", path: "/admin/reports/members" },
      // { name: "Gói tập", path: "/admin/reports/packages" },
      // { name: "Xuất báo cáo", path: "/admin/reports/export", pro: true },
    ],
  },
];

// Các mục phụ
const othersItems: NavItem[] = [
  {
    icon: <FiBell className="h-5 w-5" />,
    name: "Thông báo hệ thống",
    path: "/admin/system-notifications",
  },
  {
    icon: <FiFileText className="h-5 w-5" />,
    name: "Nội dung trang web",
    path: "/admin/content-management",
  },
  {
    icon: <FiSettings className="h-5 w-5" />,
    name: "Cài đặt hệ thống",
    path: "/admin/settings",
  },
];

const AdminSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={nav.name} className="group">
          {nav.subItems ? (
            <div>
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`flex w-full items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "bg-purple-50 text-blue-600 dark:bg-blue-900/20 dark:text-purple-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800/50"
                } ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-between"
                }`}
              >
                <div className="flex items-center">
                  <span
                    className={`flex-shrink-0 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "text-blue-600 dark:text-purple-400"
                        : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="ml-3 font-medium">{nav.name}</span>
                  )}
                </div>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <FiChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-blue-600 dark:text-purple-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                )}
              </button>
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    height:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                    opacity:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? 1
                        : 0,
                  }}
                >
                  <ul className="mb-2 mt-1 space-y-1 pl-11 pr-3">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive(subItem.path)
                              ? "bg-purple-50 text-blue-600 dark:bg-blue-900/20 dark:text-purple-400"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/40 dark:hover:text-gray-100"
                          }`}
                        >
                          <span>{subItem.name}</span>
                          <div className="flex items-center gap-1">
                            {subItem.new && (
                              <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-purple-900/30 dark:text-purple-400">
                                pro
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive(nav.path)
                    ? "bg-purple-50 text-blue-600 dark:bg-blue-900/20 dark:text-purple-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800/50"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive(nav.path)
                      ? "text-blue-600 dark:text-purple-400"
                      : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="ml-3 font-medium">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0 ${
        isExpanded || isMobileOpen
          ? "w-[280px]"
          : isHovered
            ? "w-[280px]"
            : "w-[80px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo section */}
      <div
        className={`flex items-center px-5 py-6 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-12 w-12 dark:hidden"
                  src="/logo-main-2.png"
                  alt="Logo"
                />
                <img
                  className="hidden h-12 w-12 dark:block"
                  src="/logo-main-2.png"
                  alt="Logo"
                />
              </div>
              <span className="ml-3 text-lg font-bold leading-tight text-blue-600 dark:text-blue-400">
                Quản lí hệ thống
              </span>
            </div>
          ) : (
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 dark:hidden"
                src="/logo-main-2.png"
                alt="Logo"
              />
              <img
                className="hidden h-10 w-10 dark:block"
                src="/logo-main-2.png"
                alt="Logo"
              />
            </div>
          )}
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gray-200 dark:bg-gray-800"></div>

      {/* Navigation */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-5">
        <nav className="flex flex-col gap-6">
          <div>
            <h2
              className={`mb-3 ${
                !isExpanded && !isHovered ? "lg:text-center" : "px-2"
              } text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Quản trị hệ thống"
              ) : (
                <FiMoreHorizontal className="mx-auto h-5 w-5" />
              )}
            </h2>
            {renderMenuItems(navItems, "main")}
          </div>

          <div className="pt-2">
            <h2
              className={`mb-3 ${
                !isExpanded && !isHovered ? "lg:text-center" : "px-2"
              } text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Hệ thống"
              ) : (
                <FiMoreHorizontal className="mx-auto h-5 w-5" />
              )}
            </h2>
            {renderMenuItems(othersItems, "others")}
          </div>
        </nav>
      </div>

      {/* Status section */}
      {(isExpanded || isHovered || isMobileOpen) && (
        <>
          <div className="mx-5 h-px bg-gray-200 dark:bg-gray-800"></div>
          <div className="p-4">
            <div className="rounded-xl bg-purple-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-1 font-medium text-purple-700 dark:text-purple-400">
                    Trạng thái hệ thống
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    PWA đang hoạt động
                  </p>
                </div>
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
              </div>
              <Link
                to="/admin/system-status"
                className="mt-3 flex w-full items-center justify-center rounded-lg bg-purple-600 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
              >
                Kiểm tra hệ thống
              </Link>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default AdminSidebar;
