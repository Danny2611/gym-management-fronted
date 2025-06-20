// Route admin: quản lý hội viên, gói tập, báo cáo.

import DashboardLayoutAdmin from "~/components/layout/DashboardLayoutAdmin";

import RoleBasedRoute from "./roleBasedRoute";
import MemberManagement from "~/pages/admin/Members/MemberList";
import MembershipList from "~/pages/admin/Members/MembershipList";
import PackageManagement from "~/pages/admin/Packages/PackageManagement";
import TrainerManagement from "~/pages/admin/Trainers/TrainerManagement";
import AppointmentManagement from "~/pages/admin/Appointment/AppointmentManagement";
import PromotionManagement from "~/pages/admin/Promotions/PromotionManagement";
import PaymentManagement from "~/pages/admin/Payments/PaymentManagement";
import Dashboard from "~/pages/admin/Reports/Dashboard";
import MembershipReport from "~/pages/admin/Reports/MembershipReport";
import RevenueReport from "~/pages/admin/Reports/RevenueReport";

const adminRoutes = {
  path: "admin",
  element: <RoleBasedRoute allowedRoles={["admin"]} />,
  children: [
    {
      element: <DashboardLayoutAdmin />,
      children: [
        // { path: "dashboard", element: <Dashboard /> },
        { path: "members", element: <MemberManagement /> },
        { path: "memberships", element: <MembershipList /> },
        { path: "packages", element: <PackageManagement /> },
        { path: "trainers", element: <TrainerManagement /> },
        { path: "appointments", element: <AppointmentManagement /> },
        { path: "promotions", element: <PromotionManagement /> },
        { path: "transactions", element: <PaymentManagement /> },

        { path: "reports/dashboard", element: <Dashboard /> },
        { path: "reports/members", element: <MembershipReport /> },
        { path: "reports/revenues", element: <RevenueReport /> },
      ],
    },
  ],
};

export default adminRoutes;
