// import React from 'react';
// import { Navigate, Outlet, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const ProtectedRoute: React.FC = () => {
//   const { isAuthenticated, isLoading, user } = useAuth();
//   const location = useLocation();

//   if (isLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // Redirect users to their appropriate dashboards based on role
//   if (user) {
//     const currentPath = location.pathname;
//     // If accessing root protected area, redirect to role-specific dashboard
//     if (currentPath === '/' || currentPath === '') {
//       const redirectPath = user.role.toLowerCase() === 'admin' ? '/admin/dashboard' : '/user/dashboard';
//       return <Navigate to={redirectPath} replace />;
//     }
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;
