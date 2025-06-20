import { Package } from "./package";

export type PackageDetailStatus = "active" | "inactive";

export interface PackageDetail {
  _id?: string;
  package_id: string;
  package: Package; // Khi được populate từ backend
  schedule: string[];
  training_areas: string[];
  additional_services: string[];
  status: PackageDetailStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
