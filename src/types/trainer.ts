//types/trainer.ts

export interface IWorkingHours {
  start: string; // Định dạng "HH:MM"
  end: string; // Định dạng "HH:MM"
  available: boolean;
}

export interface ISchedule {
  dayOfWeek: number; // 0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7
  available: boolean;
  workingHours?: IWorkingHours[];
}
export type TrainerStatus = "active" | "inactive";
export interface Trainer {
  _id: string; // MongoDB sử dụng _id thay vì id
  image?: string;
  name: string;
  bio?: string;
  specialization?: string;
  experience?: number;
  phone?: string;
  email: string;
  schedule?: ISchedule[];
  status: TrainerStatus;
  created_at: string;
  updated_at: string;
}

// Định nghĩa kiểu dữ liệu cho props của TrainerCard
export interface TrainerCardProps {
  trainer: Trainer;
  onBookTrainer: () => void;
  isBooking: boolean;
}
export interface TrainerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  status?: string;
  experience?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TrainerCreateUpdateData {
  name: string;
  email: string;
  image?: string;
  bio?: string;
  specialization?: string;
  experience?: number;
  phone?: string;
  schedule?: ISchedule[];
}

export interface TrainerStats {
  total: number;
  bySpecialization: Record<string, number>;
  experienceRanges: {
    novice: number; // 0-2 years
    intermediate: number; // 3-5 years
    experienced: number; // 6-10 years
    expert: number; // 11+ years
  };
}

export interface TrainerAvailability {
  date: Date;
  dayOfWeek: number;
  workingHours: IWorkingHours[];
}
