import React from "react";
import { useAuth } from "~/contexts/AuthContext";
import UserDropdown from "./UserDropdown";
import AdminDropdown from "./AdminDropdown";

const RoleBasedDropdown: React.FC = () => {
  const { user } = useAuth();
  // console.log("user", user);
  // Determine which dropdown to display based on user role
  if (user && user.roleName.toLowerCase() === "admin") {
    return <AdminDropdown />;
  }

  return <UserDropdown />;
};

export default RoleBasedDropdown;
