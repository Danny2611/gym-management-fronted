// # Route offline:trang offline, dữ liệu được cache
export const offlineRoutesToCache = [
  {
    method: "GET",
    url: "/api/user/my-package/infor-membership",
  },
  {
    method: "POST",
    url: "/api/user/my-package/detail", // xử lý đặc biệt vì body dynamic
  },
  {
    method: "GET",
    url: "/api/user/transaction/success",
  },
  {
    method: "GET",
    url: "/api/user/appointments/next-week",
  },
  {
    method: "GET",
    url: "/api/public/promotions",
  },
  {
    method: "GET",
    url: "/api/user/workout/weekly",
  },
  {
    method: "GET",
    url: "/api/user/workout/next-week",
  },
];
