// types/member.ts
export interface MemberResponse {
  _id: string;
  name: string;
  avatar?: string;
  email: string;
  gender?: "male" | "female" | "other";
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  role: {
    _id: string;
    name: string;
  };
  status: "active" | "inactive" | "pending" | "banned";
  isVerified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MemberQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "pending" | "banned";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MemberCreateInput {
  name: string;
  email: string;
  password: string;
  status: "active" | "inactive" | "pending" | "banned";
  gender?: "male" | "female" | "other";
  phone?: string;
  dateOfBirth?: Date | string;
  address?: string;
  avatar?: string | File;
  isVerified?: boolean;
}

export interface MemberUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  gender?: "male" | "female" | "other";
  phone?: string;
  dateOfBirth?: Date | string;
  address?: string;
  avatar?: string | File;
  isVerified?: boolean;
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  pendingMembers: number;
  bannedMembers: number;
  newMembersThisMonth: number;
  membersByRole: {
    role: string;
    count: number;
  }[];
}
export interface MemberProfile {
  _id: string;
  name: string;
  email: string;
  password: string;
  gender?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  avatar?: string;
  status: string;
  created_at: string;
  updated_at: string;
  memberships?: any[];
}

export interface ProfileUpdateData {
  name?: string;
  gender?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  password?: string;
}