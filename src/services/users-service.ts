import clientApi from '@/lib/apis/axios-client';
import { ApiResponse } from '@/types/api';
import type { UserProfile } from '@/types/user';

export interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  name?: string; // fallback
}

export interface UserStatistics {
  id: number;
  totalSolved: number;
  totalSubmissions: number;
  totalAccepted: number;
  acceptanceRate: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
}

export interface ActivityCalendar {
  [date: string]: number; // date in YYYY-MM-DD format, value is submission count
}

export interface RecentProblem {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  submittedAt: string;
  status: string;
}

export interface PracticeHistory {
  data: {
    id: number;
    problemId: number;
    problemTitle: string;
    status: string;
    submittedAt: string;
    runtime?: number;
    memory?: number;
  }[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SystemUserStatistics {
  total: number;
  active: number;
  premium: number;
  banned: number;
}

export const usersService = {
  /**
   * Get user profile by userId
   */
  async getUserProfile(userId: number): Promise<ApiResponse<UserProfile>> {
    const response = await clientApi.get('/users/profile', {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: number): Promise<Permission[]> {
    const response = await clientApi.get('/users/permissions', {
      params: { userId }
    });
    // Ensure we handle the response correctly. If backend returns standard array, fine.
    // If wrapped in ApiResponse, we need to extract data.
    // Based on previous mocks, it seemed to return array directly in some contexts, but let's assume standard API response wrapper if consistent.
    // Actually, backend controller for permissions usually returns plain array or DTO.
    // Let's assume it returns `data` wrapped or direct array.
    // For safety with current axios-client, if response.data is array, return it.
    if (Array.isArray(response.data)) return response.data;
    return response.data.data || response.data;
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: number): Promise<UserStatistics> {
    const response = await clientApi.get(`/users/${userId}/stats`);
    return response.data.data || response.data;
  },

  /**
   * Get years with user activity
   */
  async getActivityYears(userId: number): Promise<number[]> {
    const response = await clientApi.get(`/users/${userId}/activity-years`);
    return response.data.data || response.data;
  },

  /**
   * Get activity calendar for a year
   */
  async getActivityCalendar(userId: number, year?: number): Promise<ActivityCalendar> {
    const response = await clientApi.get(`/users/${userId}/activity-calendar`, {
      params: { year }
    });
    return response.data.data || response.data;
  },

  /**
   * Get recent accepted problems
   */
  async getRecentAcProblems(userId: number, limit = 15): Promise<RecentProblem[]> {
    const response = await clientApi.get(`/users/${userId}/recent-ac-problems`, {
      params: { limit }
    });
    return response.data.data || response.data;
  },

  /**
   * Get practice history with pagination
   */
  async getPracticeHistory(
    userId: number,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<PracticeHistory> {
    const response = await clientApi.get(`/users/${userId}/practice-history`, {
      params
    });
    return response.data.data || response.data;
  },

  /**
   * Get all users (admin function)
   */
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isPremium?: boolean;
    emailVerified?: boolean;
    status?: 'active' | 'banned' | 'not_verified';
  }): Promise<ApiResponse<{ data: UserProfile[]; meta: any }>> {
    const response = await clientApi.get('/users', {
      params
    });

    // Map backend response to match UserProfile interface
    // response.data.data is the PaginatedResultDto, which contains { data: User[], meta: ... }
    const usersArray = response.data.data.data;

    if (!Array.isArray(usersArray)) {
      console.error("Expected array in response.data.data.data but got:", usersArray);
      return response.data; // Return as is to avoid crash, though it might be empty
    }

    const mappedData = usersArray.map((user: any) => ({
      ...user,
      // Construct avatarUrl from avatarKey if present, otherwise null or empty
      avatarUrl: user.avatarKey ? `${process.env.NEXT_PUBLIC_S3_URL || 'https://d2q27bhg0k9x68.cloudfront.net'}/${user.avatarKey}` : user.avatarUrl,
      // Default missing stats to 0 to avoid NaN
      solvedEasy: user.solvedEasy || 0,
      solvedMedium: user.solvedMedium || 0,
      solvedHard: user.solvedHard || 0,
    }));

    return {
      ...response.data,
      data: {
        ...response.data.data,
        data: mappedData
      }
    };
  },

  /**
   * Ban user (admin function)
   */
  async banUser(userId: number): Promise<void> {
    await clientApi.post(`/users/${userId}/ban`);
  },

  /**
   * Unban user (admin function)
   */
  async unbanUser(userId: number): Promise<void> {
    await clientApi.post(`/users/${userId}/unban`);
  },

  /**
   * Get system wide statistics
   */
  async getSystemStatistics(): Promise<SystemUserStatistics> {
    const response = await clientApi.get('/users/statistics');
    // Return the data payload directly as expected by UsersPage
    return response.data.data;
  }
};
