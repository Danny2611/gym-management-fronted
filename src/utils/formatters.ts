/**
 * Định dạng ngày tháng (ví dụ: "October 15, 2023")
 * @param date - Chuỗi hoặc đối tượng Date
 * @returns Chuỗi ngày tháng đã định dạng
 */
export const formatDate = (date: Date | string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("vi-VN", options);
};

export const formatDate2 = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("vi-VN");
};

export const formatTime = (date?: string | Date): string => {
  if (!date) return "Chưa xác định";
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // dùng định dạng 24h
  };
  return new Date(date).toLocaleTimeString("vi-VN", options);
};

export const formatFullDate = (date: Date | string): string => {
  if (!date) return "Chưa xác định";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // dùng định dạng 24h
  };
  return new Date(date).toLocaleDateString("vi-VN", options);
};

//Định dạng tiền tệ
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};


export 
  const formatDateToday = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Ngày mai";
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };
