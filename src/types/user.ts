import { Role } from "./role";

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  address: string;
  phone: string;

  problemRank?: number;
  contestRank?: number;
  globalScore: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;

  lastSolveAt: Record<string, unknown>;

  websiteUrl: string;
  githubUsername: string;
  linkedinUrl: string;
  preferredLanguage: string;

  googleId: string;
  emailVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  isPremium: boolean;

  premiumStartedAt: string; // ISO datetime
  premiumExpiresAt: string; // ISO datetime
  createdAt: string; // ISO datetime
  lastLoginAt: string; // ISO datetime
  lastActiveAt: string; // ISO datetime
  role?: Role;
}

export enum UserSortBy {
  ID = "id",
  RANK = "rank",
  GLOBAL_SCORE = "globalScore",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  LAST_LOGIN_AT = "lastLoginAt",
  LAST_ACTIVE_AT = "lastActiveAt",
}

export interface UserFilters {
  isActive?: boolean;
  isPremium?: boolean;
  emailVerified?: boolean;
  status?: "active" | "banned" | "not_verified";
}

export interface ContestRatingDataPoint {
  contestId: number;
  contestTitle: string;
  contestEndTime: string;
  rating: number;
  ratingDelta: number;
  contestRank: number;
}

export interface ContestRatingChartData {
  history: ContestRatingDataPoint[];
  currentRating: number;
  globalRank: number | null;
  totalRanked: number;
  contestsAttended: number;
  topPercentage: number | null;
  peakRating: number | null;
  lowestRating: number | null;
}
