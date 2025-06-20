// Define types for query options and responses
export interface ReportDateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface RevenueReportOptions extends ReportDateRange {
  groupBy?: "day" | "week" | "month" | "year";
  packageId?: string;
  category?: "basic" | "fitness" | "premium" | "platinum" | "vip";
}

export interface MemberStatsOptions extends ReportDateRange {
  groupBy?: "day" | "week" | "month" | "year";
  status?: "active" | "inactive" | "pending" | "banned";
}

export interface RevenueByPackageResponse {
  packageId: string;
  packageName: string;
  category: string;
  totalRevenue: number;
  totalSales: number;
  averageRevenue: number;
}

export interface RevenueTimeSeriesResponse {
  period: string;
  totalRevenue: number;
  totalSales: number;
  packages: {
    packageId: string;
    packageName: string;
    revenue: number;
    sales: number;
  }[];
}

export interface ComprehensiveRevenueReport {
  summary: {
    totalRevenue: number;
    totalSales: number;
    averageOrderValue: number;
    periodOverPeriodGrowth: number;
    topPerformingPackage: {
      name: string;
      revenue: number;
      sales: number;
    };
  };
  revenueByPackages: RevenueByPackageResponse[];
  timeSeries: RevenueTimeSeriesResponse[];
  analytics: {
    memberRetentionRate: number;
    averageLifetimeValue: number;
    churnRate: number;
    packagePopularity: {
      packageName: string;
      percentage: number;
      memberCount: number;
    }[];
    revenueByPaymentMethod: {
      method: string;
      revenue: number;
      percentage: number;
    }[];
  };
}

export interface AdvancedAnalyticsResponse {
  memberRetentionRate: number;
  averageLifetimeValue: number;
  churnRate: number;
  packagePopularity: {
    packageName: string;
    percentage: number;
    memberCount: number;
  }[];
  revenueByPaymentMethod: {
    method: string;
    revenue: number;
    percentage: number;
  }[];
}
