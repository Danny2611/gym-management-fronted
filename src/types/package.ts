//types/package.ts
import { PackageDetail } from "./packageDetail";

export type PackageStatus = "active" | "inactive";
export type PackageCategory =
  | "basic"
  | "premium"
  | "fitness"
  | "platinum"
  | "vip";

export interface Package {
  _id?: string; // thường sẽ có khi lấy từ DB
  name: string;
  max_members?: number;
  price: number;
  duration: number;
  description?: string;
  benefits: string[];
  status: PackageStatus;
  created_at: string; // ISO date string khi truyền từ backend
  deleted_at?: string;
  updated_at: string;
  category?: PackageCategory;
  popular?: boolean;
  training_sessions: number;
  session_duration: number;
  packageDetail?: PackageDetail;
}

export interface PackageQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
  category?: "basic" | "fitness" | "premium" | "platinum" | "vip";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  popular?: boolean;
}

export interface PackageStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
  popular: number;
  withTrainingSessions: number;
}

export interface PackageCreateUpdateData {
  name: string;
  max_members?: number;
  price: number;
  duration: number;
  description?: string;
  benefits: string[];
  status?: "active" | "inactive";
  category?: "basic" | "fitness" | "premium" | "platinum" | "vip";
  popular?: boolean;
  training_sessions?: number;
  session_duration?: number;
  packageDetail?: {
    schedule?: string[];
    training_areas?: string[];
    additional_services?: string[];
  };
}
