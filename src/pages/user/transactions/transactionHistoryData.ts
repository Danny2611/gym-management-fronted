// Dữ liệu mẫu cho lịch sử giao dịch
const transactionHistoryData = [
  {
    _id: "6517a2b1c6c2d3c7e8f9a1b2",
    member_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b0",
      name: "Nguyễn Văn A",
      image: "/placeholder-avatar.jpg",
    },
    package_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b1",
      name: "Gói Premium 6 tháng",
      price: 2500000,
    },
    amount: 2500000,
    status: "completed",
    paymentMethod: "bank_transfer",
    transactionId: "BT78952631",
    paymentInfo: {
      phoneNumber: "********789",
    },
    created_at: new Date("2025-03-15T10:30:00"),
    updated_at: new Date("2025-03-15T10:35:00"),
  },
  {
    _id: "6517a2b1c6c2d3c7e8f9a1b3",
    member_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b0",
      name: "Nguyễn Văn A",
      image: "/placeholder-avatar.jpg",
    },
    package_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b4",
      name: "Dịch vụ PT cá nhân",
      price: 350000,
    },
    amount: 350000,
    status: "completed",
    paymentMethod: "momo",
    transactionId: "MM65892341",
    paymentInfo: {
      phoneNumber: "********789",
    },
    created_at: new Date("2025-03-05T14:20:00"),
    updated_at: new Date("2025-03-05T14:22:00"),
  },
  {
    _id: "6517a2b1c6c2d3c7e8f9a1b4",
    member_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b0",
      name: "Nguyễn Văn A",
      image: "/placeholder-avatar.jpg",
    },
    package_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b5",
      name: "Nước uống protein",
      price: 85000,
    },
    amount: 85000,
    status: "completed",
    paymentMethod: "cash",
    transactionId: "CS12345678",
    paymentInfo: {
      phoneNumber: "********789",
    },
    created_at: new Date("2025-03-10T18:15:00"),
    updated_at: new Date("2025-03-10T18:15:00"),
  },
  {
    _id: "6517a2b1c6c2d3c7e8f9a1b5",
    member_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b0",
      name: "Nguyễn Văn A",
      image: "/placeholder-avatar.jpg",
    },
    package_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b6",
      name: "Đánh giá y tế",
      price: 150000,
    },
    amount: 150000,
    status: "pending",
    paymentMethod: "bank_transfer",
    transactionId: "BT98765432",
    paymentInfo: {
      phoneNumber: "********789",
    },
    created_at: new Date("2025-04-01T09:45:00"),
    updated_at: new Date("2025-04-01T09:45:00"),
  },
  {
    _id: "6517a2b1c6c2d3c7e8f9a1b6",
    member_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b0",
      name: "Nguyễn Văn A",
      image: "/placeholder-avatar.jpg",
    },
    package_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b7",
      name: "Phí đổi lịch",
      price: 50000,
    },
    amount: 50000,
    status: "completed",
    paymentMethod: "momo",
    transactionId: "MM32165498",
    paymentInfo: {
      phoneNumber: "********789",
    },
    created_at: new Date("2025-02-25T16:30:00"),
    updated_at: new Date("2025-02-25T16:32:00"),
  },
  {
    _id: "6517a2b1c6c2d3c7e8f9a1b7",
    member_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b0",
      name: "Nguyễn Văn A",
      image: "/placeholder-avatar.jpg",
    },
    package_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b8",
      name: "Gói Standard 3 tháng",
      price: 1500000,
    },
    amount: 1500000,
    status: "cancelled",
    paymentMethod: "bank_transfer",
    transactionId: "BT45678912",
    paymentInfo: {
      phoneNumber: "********789",
    },
    created_at: new Date("2024-12-10T11:20:00"),
    updated_at: new Date("2024-12-10T11:40:00"),
  },
  {
    _id: "6517a2b1c6c2d3c7e8f9a1b8",
    member_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b0",
      name: "Nguyễn Văn A",
      image: "/placeholder-avatar.jpg",
    },
    package_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b9",
      name: "Sản phẩm dinh dưỡng",
      price: 325000,
    },
    amount: 325000,
    status: "completed",
    paymentMethod: "cash",
    transactionId: "CS87654321",
    paymentInfo: {},
    created_at: new Date("2025-01-20T14:50:00"),
    updated_at: new Date("2025-01-20T14:50:00"),
  },
  {
    _id: "6517a2b1c6c2d3c7e8f9a1b9",
    member_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b0",
      name: "Nguyễn Văn A",
      image: "/placeholder-avatar.jpg",
    },
    package_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0c0",
      name: "Thuê tủ đồ 1 tháng",
      price: 100000,
    },
    amount: 100000,
    status: "completed",
    paymentMethod: "momo",
    transactionId: "MM14785236",
    paymentInfo: {
      phoneNumber: "********789",
    },
    created_at: new Date("2025-03-01T10:15:00"),
    updated_at: new Date("2025-03-01T10:17:00"),
  },
  {
    _id: "6517a2b1c6c2d3c7e8f9a1c0",
    member_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0b0",
      name: "Nguyễn Văn A",
      image: "/placeholder-avatar.jpg",
    },
    package_id: {
      _id: "6517a2b1c6c2d3c7e8f9a0c1",
      name: "Workshop dinh dưỡng",
      price: 200000,
    },
    amount: 200000,
    status: "failed",
    paymentMethod: "bank_transfer",
    transactionId: "BT36925814",
    paymentInfo: {
      phoneNumber: "********789",
    },
    created_at: new Date("2025-02-15T16:45:00"),
    updated_at: new Date("2025-02-15T16:47:00"),
  },
];

export default transactionHistoryData;
