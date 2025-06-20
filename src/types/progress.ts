// types/progress.ts

export interface Progress {
  _id?: string; // nếu bạn cần dùng để hiển thị hoặc chỉnh sửa
  member_id: string;
  weight: number;
  height: number;
  muscle_mass: number;
  body_fat: number;
  bmi: number;
  created_at: string; // ISO string từ MongoDB
  updated_at: string;
}

export interface BodyStats {
  _id?: string;
  member_id: string;
  weight: number;
  height: number;
  muscle_mass: number;
  body_fat: number;
  bmi: number;
  created_at: string;
  updated_at: string;
}

export interface BodyStatsProgress {
  month: string;
  weight: number;
  body_fat: number;
  muscle_mass: number;
  bmi: number;
}

export interface FitnessRadarData {
  subject: string;
  current: number;
  initial: number;
  full: number;
}
// Interface cho dữ liệu hoàn thành mục tiêu
export interface GoalCompletionData {
  name: string;
  value: number;
}
export interface BodyMetricsComparison {
  current: Progress | null;
  initial: Progress | null;
  previous?: Progress | null;
}

export interface BodyMetricsChange {
  changes: {
    weight: number;
    body_fat: number;
    muscle_mass: number;
    bmi: number;
  };
  current: BodyStats;
  initial: BodyStats;
}

export interface UpdateBodyMetricsParams {
  weight?: number;
  height?: number;
  muscle_mass?: number;
  body_fat?: number;
}
