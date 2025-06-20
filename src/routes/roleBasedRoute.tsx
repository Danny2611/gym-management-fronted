import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RoleBasedRouteProps {
  allowedRoles: string[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Use roleName for role checking instead of role ID
  const userRoleName = user?.roleName.toLowerCase();
  const allowed = allowedRoles
    .map((r) => r.toLowerCase())
    .includes(userRoleName as string);
  // Check if userRole is defined before using includes
  if (!allowed) {
    // ❌ Block access completely
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">
            403 - Forbidden
          </h2>
          <p className="mt-2 text-gray-600">
            Bạn không có quyền truy cập trang này.
          </p>
          <a
           href={
              userRoleName === "admin"
                ? "/admin/members"
                : "/user/dashboard"
            }

            className="mt-4 inline-block text-blue-600 underline"
          >
            Quay về trang chính
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleBasedRoute;
