// import React from "react";
// import { Routes as RouterRoutes, Route } from "react-router-dom";
// import publicRoutes from "./publicRoutes";
// import userRoutes from "./userRoutes";
// import Layout from "../components/layout/Layout";

// const Routes = () => {
//   return (
//     <RouterRoutes>
//       <Route path="/" element={<Layout />}>
//         {publicRoutes.map((route, index) => (
//           <Route
//             key={index}
//             path={route.path}
//             element={route.element}
//           />
//         ))}
//       </Route>

//       <Route path={userRoutes.path} element={userRoutes.element}>
//         {userRoutes.children.map((layoutRoute, index) => (
//           <Route key={index} element={layoutRoute.element}>
//             {layoutRoute.children.map((route, childIndex) => (
//               <Route
//                 key={`${index}-${childIndex}`}
//                 path={`${userRoutes.path}/${route.path}`}
//                 element={route.element}
//               />
//             ))}
//           </Route>
//         ))}
//       </Route>
//     </RouterRoutes>
//   );
// };

// export default Routes;

// Routes.tsx
import { useRoutes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import publicRoutes from "./publicRoutes";
import userRoutes from "./userRoutes";
import adminRoutes from "./adminRoutes";

const Routes = () => {
  // Sử dụng useRoutes hook để định nghĩa routes
  const element = useRoutes([
    {
      path: "/",
      element: <Layout />,
      children: publicRoutes,
    },
    userRoutes,
    adminRoutes,
  ]);

  return element;
};

export default Routes;
