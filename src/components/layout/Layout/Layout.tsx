import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { ScrollToTop } from "../../common/ScrollToTop";

interface LayoutProps {
  children?: React.ReactNode; // Cho phép children không bắt buộc
  transparentHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  // transparentHeader = false,
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop /> {/* Đặt ngay đây để đảm bảo hoạt động trên mọi trang */}
      <Header />
      <main className="flex-grow">
        {children || <Outlet />} {/* Nếu không có children, render <Outlet> */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
