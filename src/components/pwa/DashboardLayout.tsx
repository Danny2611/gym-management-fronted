// // src/components/layout/DashboardLayout.tsx
// import React, { useState } from 'react';
// import { Outlet } from 'react-router-dom';
// import { Home, Dumbbell, Package, User} from 'lucide-react';
// import { HeaderPWA } from '~/components/pwa/layout/HeaderPWA';

// const DashboardLayoutNotification: React.FC = () => {
//   const [isNotificationListOpen, setIsNotificationListOpen] = useState(false);

//   // Navigation items cho user dashboard
//   const userNavItems = [
//     { path: '/user/dashboard', icon: Home, label: 'Trang chủ' },
//     { path: '/user/packages', icon: Package, label: 'Gói tập' },
//     { path: '/user/workout', icon: Dumbbell, label: 'Tập luyện' },
//     { path: '/user/profile', icon: User, label: 'Hồ sơ' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header with bottom navigation */}
//       <HeaderPWA
//         onNotificationClick={() => setIsNotificationListOpen(true)}
//         showBottomNav={true}
//         navItems={userNavItems}
//       />

//       {/* Main content */}
//       <main className="pb-20 md:ml-64 md:pb-4">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DashboardLayoutNotification;
