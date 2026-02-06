import { useState, useCallback, useEffect } from 'react';
import { UserProfile, UserSortBy, UserFilters } from '@/types/user';
import { SortOrder } from '@/types/problems';

interface UseUsersResult {
    users: UserProfile[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    isLoading: boolean;
    handleKeywordChange: (keyword: string) => void;
    handlePageChange: (page: number) => void;
    sortBy: UserSortBy;
    handleSortByChange: (sortBy: UserSortBy) => void;
    sortOrder: SortOrder;
    handleSortOrderChange: (sortOrder: SortOrder) => void;
    filters: UserFilters;
    handleFiltersChange: (filters: UserFilters) => void;
}

// Mock data for users
const MOCK_USERS: UserProfile[] = Array.from({ length: 50 }, (_, i) => {
    const id = i + 1;
    const isPremium = id % 5 === 0;
    const now = new Date().toISOString();

    return {
        id,
        email: `user${id}@example.com`,
        username: `user${id}`,
        fullName: `User ${id}`,
        avatarUrl: `https://cdn.example.com/avatars/${id}/1735500000.jpg`,
        bio: `This is bio of user ${id}`,
        address: `${id} Example Street, City`,
        phone: `0900000${String(id).padStart(3, "0")}`,

        rank: id,
        globalScore: Math.floor(Math.random() * 5000),
        solvedEasy: Math.floor(Math.random() * 100),
        solvedMedium: Math.floor(Math.random() * 50),
        solvedHard: Math.floor(Math.random() * 20),

        lastSolveAt: {},

        websiteUrl: `https://user${id}.example.com`,
        githubUsername: `github-user-${id}`,
        linkedinUrl: `https://linkedin.com/in/user${id}`,
        preferredLanguage: "en",

        googleId: `google-id-${id}`,
        emailVerified: true,
        isActive: true,
        isBanned: false,
        isPremium,

        premiumStartedAt: isPremium ? now : "",
        premiumExpiresAt: isPremium ? now : "",
        createdAt: now,
        lastLoginAt: now,
        lastActiveAt: now,
    };
});


export default function useUsers(): UseUsersResult {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<UserSortBy>(UserSortBy.ID);
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
    const [filters, setFilters] = useState<UserFilters>({});
    const limit = 10;

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        let filteredUsers = MOCK_USERS.filter((user) =>
            user.username.toLowerCase().includes(keyword.toLowerCase()) ||
            user.fullName.toLowerCase().includes(keyword.toLowerCase())
        );

        // Apply filters
        if (filters.isActive !== undefined) {
            filteredUsers = filteredUsers.filter(u => u.isActive === filters.isActive);
        }
        if (filters.isPremium !== undefined) {
            filteredUsers = filteredUsers.filter(u => u.isPremium === filters.isPremium);
        }
        if (filters.emailVerified !== undefined) {
            filteredUsers = filteredUsers.filter(u => u.emailVerified === filters.emailVerified);
        }

        // Apply sorting
        filteredUsers.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case UserSortBy.RANK:
                    comparison = a.rank - b.rank;
                    break;
                case UserSortBy.GLOBAL_SCORE:
                    comparison = a.globalScore - b.globalScore;
                    break;
                case UserSortBy.ID:
                default:
                    comparison = a.id - b.id;
                    break;
            }
            return sortOrder === SortOrder.ASC ? comparison : -comparison;
        });

        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedUsers = filteredUsers.slice(start, end);

        setUsers(paginatedUsers);
        setIsLoading(false);
    }, [keyword, page, sortBy, sortOrder, filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleKeywordChange = (newKeyword: string) => {
        setKeyword(newKeyword);
        setPage(1); // Reset to first page on search
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleSortByChange = (newSortBy: UserSortBy) => {
        setSortBy(newSortBy);
    };

    const handleSortOrderChange = (newSortOrder: SortOrder) => {
        setSortOrder(newSortOrder);
    };

    const handleFiltersChange = (newFilters: UserFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const total = MOCK_USERS.filter((user) => {
        const matchesKeyword = user.username.toLowerCase().includes(keyword.toLowerCase()) ||
            user.fullName.toLowerCase().includes(keyword.toLowerCase());

        const matchesActive = filters.isActive === undefined || user.isActive === filters.isActive;
        const matchesPremium = filters.isPremium === undefined || user.isPremium === filters.isPremium;
        const matchesEmail = filters.emailVerified === undefined || user.emailVerified === filters.emailVerified;

        return matchesKeyword && matchesActive && matchesPremium && matchesEmail;
    }).length;

    const totalPages = Math.ceil(total / limit);

    return {
        users,
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
        isLoading,
        handleKeywordChange,
        handlePageChange,
        sortBy,
        handleSortByChange,
        sortOrder,
        handleSortOrderChange,
        filters,
        handleFiltersChange,
    };
}
