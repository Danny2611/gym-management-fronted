import { Membership } from "~/types/membership";

// Hàm tính ngày và phần trăm còn lại của gói tập
export const calculateMembershipRemaining = (
  membership: Membership,
): {
  remaining_days: number | string;
  remaining_percent: number | string;
} => {
  const today = new Date();
  const startDate = membership.start_date
    ? new Date(membership.start_date)
    : null;
  const endDate = membership.end_date ? new Date(membership.end_date) : null;

  // Mặc định kết quả
  let remaining_days: number | string = "Chưa xác định";
  let remaining_percent: number | string = "Chưa xác định";

  // Chỉ tính toán khi có ngày kết thúc
  if (endDate) {
    // Xử lý theo trạng thái
    switch (membership.status) {
      case "active":
        // Tính số ngày còn lại
        const diffTime = endDate.getTime() - today.getTime();
        remaining_days = Math.max(
          0,
          Math.floor(diffTime / (1000 * 60 * 60 * 24)),
        );

        // Tính phần trăm thời gian còn lại
        if (startDate) {
          const totalDuration = endDate.getTime() - startDate.getTime();
          // Tránh chia cho 0
          if (totalDuration > 0) {
            const remainingDuration = endDate.getTime() - today.getTime();
            remaining_percent = Math.max(
              0,
              Math.min(
                100,
                Math.round((remainingDuration / totalDuration) * 100),
              ),
            );
          } else {
            remaining_percent = 0;
          }
        }
        break;

      case "paused":
        // Đối với gói đã tạm dừng, vẫn hiển thị số ngày còn lại
        // nhưng đánh dấu là đã tạm dừng bằng cách thêm thông tin
        if (endDate) {
          const diffTime = endDate.getTime() - today.getTime();
          const days = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          remaining_days = days;

          // Phần trăm thời gian còn lại khi tạm dừng
          if (startDate) {
            const totalDuration = endDate.getTime() - startDate.getTime();
            if (totalDuration > 0) {
              const remainingDuration = endDate.getTime() - today.getTime();
              remaining_percent = Math.max(
                0,
                Math.min(
                  100,
                  Math.round((remainingDuration / totalDuration) * 100),
                ),
              );
            } else {
              remaining_percent = 0;
            }
          }
        }
        break;

      case "expired":
        // Nếu hết hạn, cả hai đều là 0
        remaining_days = 0;
        remaining_percent = 0;
        break;

      case "pending":
        // Nếu chưa kích hoạt, hiển thị số ngày của gói
        if (startDate && endDate) {
          const totalDuration = endDate.getTime() - startDate.getTime();
          remaining_days = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
          remaining_percent = 100; // Vì chưa bắt đầu sử dụng
        }
        break;
    }
  }

  return {
    remaining_days,
    remaining_percent,
  };
};
