//types/memberReport
export interface ReportDateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface MemberStatsOptions extends ReportDateRange {
  groupBy?: "day" | "week" | "month" | "year";
  status?: "active" | "inactive" | "pending" | "banned";
  includeRetention?: boolean;
  includeChurn?: boolean;
  cohortAnalysis?: boolean;
}

export interface MemberStatsResponse {
  period: string;
  totalMembers: number;
  newMembers: number;
  expiredMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  pendingMembers: number;
  bannedMembers: number;
  retentionRate?: number;
  churnRate?: number;
  growthRate?: number;
  netGrowth?: number;
}

export interface RetentionAnalysis {
  period: string;
  cohortSize: number;
  retainedMembers: number;
  retentionRate: number;
  churnedMembers: number;
  churnRate: number;
}

export interface MemberGrowthAnalysis {
  totalMembers: number;
  totalGrowth: number;
  growthRate: number;
  periodOverPeriodGrowth: number;
  retentionFunnel: {
    newMembers: number;
    activeAfter30Days: number;
    activeAfter90Days: number;
    activeAfter180Days: number;
    activeAfter365Days: number;
  };
}

export interface StatusDistribution {
  active: { count: number; percentage: number };
  inactive: { count: number; percentage: number };
  pending: { count: number; percentage: number };
  banned: { count: number; percentage: number };
}

export interface ComprehensiveMemberReport {
  summary: MemberGrowthAnalysis;
  timeSeries: MemberStatsResponse[];
  statusDistribution: StatusDistribution;
  retentionAnalysis: RetentionAnalysis[];
  topGrowthPeriods: { period: string; growth: number }[];
  churnAnalysis: {
    averageChurnRate: number;
    highRiskPeriods: string[];
    churnReasons: { reason: string; count: number }[];
  };
}
