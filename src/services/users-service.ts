import { ApiResponse } from '@/types/api';
import type { UserProfile } from '@/types/user';

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface UserStatistics {
  totalSubmissions: number;
  acceptedSubmissions: number;
  totalProblems: number;
  solvedProblems: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;
  acceptanceRate: number;
}

export interface ActivityCalendar {
  [date: string]: number; // date in YYYY-MM-DD format, value is submission count
}

export interface RecentProblem {
  id: number;
  title: string;
  difficulty: string;
  solvedAt: string;
}

export interface PracticeHistory {
  data: {
    id: number;
    problemId: number;
    problemTitle: string;
    status: string;
    submittedAt: string;
  }[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Mock data generator
const generateMockUsers = (): UserProfile[] => {
  return Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    const isPremium = id % 5 === 0;
    const isActive = id % 10 !== 0; // 90% active
    const emailVerified = id % 15 !== 0; // Most verified
    const now = new Date();
    const lastLogin = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    return {
      id,
      email: `user${id}@example.com`,
      username: `user${id}`,
      fullName: `User Full Name ${id}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      bio: `Passionate software engineer and competitive programmer. Love solving challenging problems!`,
      address: `${id} Tech Street, Silicon Valley, CA`,
      phone: `+1 555-${String(id).padStart(4, '0')}`,
      rank: id,
      globalScore: Math.floor(Math.random() * 5000),
      solvedEasy: Math.floor(Math.random() * 100),
      solvedMedium: Math.floor(Math.random() * 80),
      solvedHard: Math.floor(Math.random() * 40),
      lastSolveAt: {},
      websiteUrl: `https://portfolio-user${id}.dev`,
      githubUsername: `github-user-${id}`,
      linkedinUrl: `https://linkedin.com/in/user${id}`,
      preferredLanguage: 'en',
      googleId: `google-oauth-id-${id}`,
      emailVerified,
      isActive,
      isPremium,
      premiumStartedAt: isPremium ? new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString() : '',
      premiumExpiresAt: isPremium ? new Date(now.getTime() + 275 * 24 * 60 * 60 * 1000).toISOString() : '',
      lastLoginAt: lastLogin.toISOString(),
      lastActiveAt: new Date(lastLogin.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const MOCK_USERS = generateMockUsers();

const MOCK_PERMISSIONS: Permission[] = [
  { id: 1, name: 'PROBLEM_CREATE', description: 'Create new problems' },
  { id: 2, name: 'PROBLEM_UPDATE', description: 'Update existing problems' },
  { id: 3, name: 'PROBLEM_DELETE', description: 'Delete problems' },
  { id: 4, name: 'USER_MANAGE', description: 'Manage users' },
  { id: 5, name: 'CONTEST_CREATE', description: 'Create contests' },
  { id: 6, name: 'CONTEST_UPDATE', description: 'Update contests' },
];

export const usersService = {
  /**
   * Get user profile by userId
   * Mock implementation for: GET /users/profile?userId={userId}
   */
  async getUserProfile(userId: number): Promise<ApiResponse<UserProfile>> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/users/profile?userId=${userId}`,
      data: user,
    };
  },

  /**
   * Get user permissions
   * Mock implementation for: GET /users/permissions?userId={userId}
   */
  async getUserPermissions(userId: number): Promise<ApiResponse<Permission[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock: Admins (user id < 5) get all permissions, others get random subset
    const permissions = userId < 5 
      ? MOCK_PERMISSIONS 
      : MOCK_PERMISSIONS.slice(0, Math.floor(Math.random() * 3) + 1);

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/users/permissions?userId=${userId}`,
      data: permissions,
    };
  },

  /**
   * Get user statistics
   * Mock implementation for: GET /users/:userId/stats
   */
  async getUserStats(userId: number): Promise<ApiResponse<UserStatistics>> {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const totalSubmissions = Math.floor(Math.random() * 500) + 100;
    const acceptedSubmissions = Math.floor(totalSubmissions * (0.3 + Math.random() * 0.4));
    const totalProblems = Math.floor(Math.random() * 200) + 50;
    const solvedProblems = Math.floor(totalProblems * (0.4 + Math.random() * 0.3));

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/users/${userId}/stats`,
      data: {
        totalSubmissions,
        acceptedSubmissions,
        totalProblems,
        solvedProblems,
        easyProblems: Math.floor(solvedProblems * 0.5),
        mediumProblems: Math.floor(solvedProblems * 0.35),
        hardProblems: Math.floor(solvedProblems * 0.15),
        acceptanceRate: (acceptedSubmissions / totalSubmissions) * 100,
      },
    };
  },

  /**
   * Get years with user activity
   * Mock implementation for: GET /users/:userId/activity-years
   */
  async getActivityYears(userId: number): Promise<ApiResponse<number[]>> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1];
    
    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/users/${userId}/activity-years`,
      data: years,
    };
  },

  /**
   * Get activity calendar for a year
   * Mock implementation for: GET /users/:userId/activity-calendar?year={year}
   */
  async getActivityCalendar(userId: number, year?: number): Promise<ApiResponse<ActivityCalendar>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const targetYear = year || new Date().getFullYear();
    const calendar: ActivityCalendar = {};
    
    // Generate random activity for past 365 days
    for (let i = 0; i < 365; i++) {
      const date = new Date(targetYear, 0, 1);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      calendar[dateStr] = Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0;
    }

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/users/${userId}/activity-calendar`,
      data: calendar,
    };
  },

  /**
   * Get recent accepted problems
   * Mock implementation for: GET /users/:userId/recent-ac-problems?limit={limit}
   */
  async getRecentAcProblems(userId: number, limit = 15): Promise<ApiResponse<RecentProblem[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const problems: RecentProblem[] = Array.from({ length: Math.min(limit, 15) }, (_, i) => ({
      id: i + 1,
      title: `Problem ${i + 1}: ${['Two Sum', 'Add Two Numbers', 'Longest Substring', 'Median of Arrays', 'Palindrome'][i % 5]}`,
      difficulty: ['Easy', 'Medium', 'Hard'][i % 3],
      solvedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    }));

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/users/${userId}/recent-ac-problems`,
      data: problems,
    };
  },

  /**
   * Get practice history with pagination
   * Mock implementation for: GET /users/:userId/practice-history
   */
  async getPracticeHistory(
    userId: number,
    page = 1,
    limit = 20,
    status?: string
  ): Promise<ApiResponse<PracticeHistory>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const total = 150;
    const data = Array.from({ length: limit }, (_, i) => {
      const index = (page - 1) * limit + i;
      return {
        id: index + 1,
        problemId: index + 1,
        problemTitle: `Problem ${index + 1}`,
        status: status || ['ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT'][index % 3],
        submittedAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
      };
    });

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/users/${userId}/practice-history`,
      data: {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  },

  /**
   * Get all users (admin function)
   * This is not in the backend controller but needed for user management
   */
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isPremium?: boolean;
    emailVerified?: boolean;
  }): Promise<ApiResponse<{ data: UserProfile[]; meta: any }>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const { page = 1, limit = 10, search = '', isActive, isPremium, emailVerified } = params || {};
    
    let filtered = MOCK_USERS.filter(user => {
      const matchesSearch = !search || 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesActive = isActive === undefined || user.isActive === isActive;
      const matchesPremium = isPremium === undefined || user.isPremium === isPremium;
      const matchesVerified = emailVerified === undefined || user.emailVerified === emailVerified;
      
      return matchesSearch && matchesActive && matchesPremium && matchesVerified;
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginatedUsers = filtered.slice(start, start + limit);

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: '/users',
      data: {
        data: paginatedUsers,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
      },
    };
  },

  /**
   * Ban user (admin function)
   */
  async banUser(userId: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      user.isActive = false;
    }

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/users/${userId}/ban`,
      data: {
        success: true,
        message: `User ${userId} has been banned successfully`,
      },
    };
  },

  /**
   * Unban user (admin function)
   */
  async unbanUser(userId: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      user.isActive = true;
    }

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: `/users/${userId}/unban`,
      data: {
        success: true,
        message: `User ${userId} has been unbanned successfully`,
      },
    };
  },
};
