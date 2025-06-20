import { SidebarProvider, useSidebar } from "../../contexts/SidebarContext";
import { Outlet } from "react-router";
import DashboardHeader from "./DashboardHeader";
import Backdrop from "./Backdrop";
import Sidebar from "./Sidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <Sidebar />

        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <DashboardHeader />
        <div className="max-w-(--breakpoint-2xl) mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SidebarProvider>
      <LayoutContent />
      {children} {/* ✅ Hiển thị các trang con */}
    </SidebarProvider>
  );
};

export default DashboardLayout;
