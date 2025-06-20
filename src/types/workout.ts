// types/workout.ts

import { AppointmentStatusType, ScheduleTime } from "./schedule";

export interface RepsRecommended {
  min: number;
  max: number;
}

export interface ExerciseSuggestion {
  name: string;
  description: string;
  youtube_link: string;
  sets_recommended: number;
  reps_recommended: RepsRecommended;
  rest_recommended: number; // tính bằng giây
}

export interface WorkoutSuggestion {
  _id: string;
  muscle_group: string;
  goal:
    | "weight_loss"
    | "muscle_gain"
    | "endurance"
    | "strength"
    | "flexibility";
  level: "beginner" | "intermediate" | "advanced";
  equipment: "bodyweight" | "dumbbell" | "barbell" | "machine" | "mixed";
  exercises: ExerciseSuggestion[];
  created_at: Date;
  updated_at: Date;
}

export interface ScheduledExercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutStatusType {
  status: "upcoming" | "completed" | "missed";
}
export interface WorkoutSchedule {
  _id: string;
  member_id: string;
  date: string;
  timeStart: Date;
  duration: number; // phút
  muscle_groups: string[];
  exercises?: ScheduledExercise[];
  workout_suggestion_id?: WorkoutSuggestion;
  location: string;
  status: AppointmentStatusType;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TrainingLocationsResponse {
  success: boolean;
  count: number;
  data: string[];
  message?: string;
  errors?: any[];
}

// Danh sách nhóm cơ
export const muscleGroups = [
  "Ngực (Chest)",
  "Lưng (Back)",
  "Vai (Shoulders)",
  "Tay trước (Biceps)",
  "Tay sau (Triceps)",
  "Chân (Legs)",
  "Bụng (Abs)",
  "Core (Core)",
  "Toàn thân (Full body)",
];

// Danh sách mục tiêu tập luyện
export const workoutGoals = [
  { value: "weight_loss", label: "Giảm cân" },
  { value: "muscle_gain", label: "Tăng cơ" },
  { value: "endurance", label: "Sức bền" },
  { value: "strength", label: "Sức mạnh" },
  { value: "flexibility", label: "Dẻo dai" },
];

// Danh sách cấp độ tập luyện
export const experienceLevels = [
  { value: "beginner", label: "Người mới" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
];

// Danh sách thiết bị tập luyện
export const equipmentTypes = [
  { value: "bodyweight", label: "Cân nặng cơ thể" },
  { value: "dumbbell", label: "Tạ đơn" },
  { value: "barbell", label: "Tạ đòn" },
  { value: "machine", label: "Máy tập" },
  { value: "mixed", label: "Kết hợp" },
];

// Danh sách địa điểm tập luyện
export const workoutLocations = [
  "Phòng tập chính - Tầng 1",
  "Khu vực tự do tập luyện",
  "Phòng Yoga & Pilates",
  "Khu vực cardio",
  "Phòng tập riêng VIP",
  "Tại nhà",
];

// Định nghĩa kiểu dữ liệu mới để xử lý cả lịch hẹn và lịch tập

export interface CombinedSchedule {
  _id: string;
  type: "appointment" | "workout"; // Phân biệt lịch hẹn PT hoặc tự tập
  date: string; // yyyy-MM-dd
  time?: ScheduleTime | null; // dùng cho appoint
  timeStart?: Date; // workout

  status: AppointmentStatusType;
  location?: string;
  notes?: string;
  // Thông tin riêng cho lịch hẹn với PT
  trainer_name?: string | null;
  trainer_image?: string | null;
  package_name?: string;

  // Workout Schedule specific fields
  member_id?: string;
  muscle_groups?: string[];
  exercises?: ScheduledExercise[];
  workout_suggestion_id?: WorkoutSuggestion | string; // Can be object or just ID
  duration?: number; // in minutes (for workout)
}

// Interface cho dữ liệu buổi tập theo tuần
export interface WeeklyWorkout {
  name: string;
  sessions: number;
  duration: number;
  target: number;
}

export interface MonthComparison {
  current: MonthlyStats;
  previous: MonthlyStats;
}
export interface MonthlyStats {
  totalSessions: number;
  totalDuration: number; // phút
  completionRate: number;
  avgSessionLength: number;
}
export interface RecentWorkoutLog {
  created_at: Date;
  muscle_groups: string[];
  duration: number;
  status: "upcoming" | "completed" | "missed";
}
export interface WorkoutScheduleNextWeek {
  date: Date;
  timeStart: Date;
  timeEnd?: Date;
  location: string;
  status: string;
}
