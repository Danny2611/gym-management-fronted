// userRoutes.js
import Profile from "~/pages/user/Profile";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/user/Dashboard";
import ChangePassword from "~/pages/user/ChangePassword";
import PackagesPage from "~/pages/user/packages/Packages";
import MyPackagesPage from "~/pages/user/memberships/Memberships";
import PersonalSchedulePage from "~/pages/user/schedules/PersonalSchedulePage";
import RoleBasedRoute from "./roleBasedRoute";
import PackageDetailPage from "~/pages/user/packages/PackageDetail";
import PackageRegistrationPage from "~/pages/user/packages/PackageRegistrationPage";
import PaymentStatusPage from "~/pages/user/packages/PaymentStatusPage";
import TrainerList from "~/pages/user/trainner/TrainerList";
import BookingPage from "~/pages/user/appointments/BookingPage";
import ManageAppointments from "~/pages/user/appointments/ManageAppointments";
import RescheduleAppointmentPage from "~/pages/user/appointments/RescheduleAppointmentPage";
import TransactionHistory from "~/pages/user/transactions/TransactionHistory";
import CreateWorkoutPage from "~/pages/user/workoutSchedule/CreateWorkoutPage";
import ProgressPage from "~/pages/user/progress/ProgressPage";
import { PWAInstallPrompt } from "~/components/pwa/PWAInstallPrompt";
import NotificationsPage from "~/pages/user/notifications/NotificationsPage";

const userRoutes = {
  path: "user",
  element: <RoleBasedRoute allowedRoles={["member"]} />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { path: "dashboard", element: <Dashboard /> },
        // Settings routes
        {
          path: "settings",
          children: [
            // { path: "notifications", element:  },
          ],
        },

        { path: "profile", element: <Profile /> },
        { path: "change-password", element: <ChangePassword /> },
        { path: "packages", element: <PackagesPage /> },
        { path: "package-detail/:id", element: <PackageDetailPage /> },
        { path: "packages-register/:id", element: <PackageRegistrationPage /> },
        {
          path: "payment",
          children: [
            { path: "success", element: <PaymentStatusPage /> },
            { path: "failed", element: <PaymentStatusPage /> },
          ],
        },
        { path: "my-packages", element: <MyPackagesPage /> },

        // apointment
        { path: "list-trainer", element: <TrainerList /> },
        { path: "book-appointment/:trainerId", element: <BookingPage /> },
        { path: "manage-appointment", element: <ManageAppointments /> },
        {
          path: "reschedule-appointment/:appointmentId",
          element: <RescheduleAppointmentPage />,
        },

        // schedule
        { path: "my-schedule", element: <PersonalSchedulePage /> },
        //workoutSchedule:
        { path: "workout", element: <CreateWorkoutPage /> },
        //transactions
        { path: "transactions", element: <TransactionHistory /> },
        { path: "progress", element: <ProgressPage /> },

        // notification
          { path: "notifications", element: < NotificationsPage/>},

        { path: "install-pwa", element: <PWAInstallPrompt /> },
      ],
    },
  ],
};

export default userRoutes;
