export interface PackageSummary {
  _id: string;
  name: string;
  price: number;
  benefits: string[];
}

export interface PromotionResponse {
  _id?: string;
  name: string;
  description?: string;
  discount: number;
  start_date: Date;
  end_date: Date;
  status: "active" | "inactive";
  applicable_packages: PackageSummary[];
  created_at: Date;
  updated_at: Date;
}

export interface PromotionQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreatePromotionData {
  name: string;
  description?: string;
  discount: number;
  start_date: Date;
  end_date: Date;
  status?: "active" | "inactive";
  applicable_packages: string[];
}

export interface UpdatePromotionData {
  name?: string;
  description?: string;
  discount?: number;
  start_date?: Date;
  end_date?: Date;
  status?: "active" | "inactive";
  applicable_packages?: string[];
}

export interface PromotionEffectiveness {
  promotion_id: string;
  promotion_name: string;
  promotion_period: {
    start_date: Date;
    end_date: Date;
  };
  package_stats: {
    package_id: string;
    package_name: string;
    total_memberships: number;
    total_revenue: number;
    conversion_rate: number;
  }[];
  total_memberships: number;
  total_revenue: number;
  average_conversion_rate: number;
}
export interface PromotionStat {
  total: number;
  active: number;
  inactive: number;
  expiredThisMonth: number;
  upcomingThisMonth: number;
}
