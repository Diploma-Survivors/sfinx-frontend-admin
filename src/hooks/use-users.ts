import { useState, useCallback, useEffect } from "react";
import { usersService } from "@/services/users-service";
import { UserProfile, UserSortBy, UserFilters } from "@/types/user";
import { SortOrder } from "@/types/problems";

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

export default function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<UserSortBy>(UserSortBy.ID);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  const [filters, setFilters] = useState<UserFilters>({});
  const limit = 10;

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await usersService.getAllUsers({
        page,
        limit,
        search: keyword,
        isActive: filters.isActive,
        isPremium: filters.isPremium,
        emailVerified: filters.emailVerified,
        sortBy,
        sortOrder,
      });

      if (response.data) {
        // The service already returns data in the expected structure or we need to check if it's wrapped
        // getAllUsers returns Promise<ApiResponse<{ data: UserProfile[]; meta: any }>>
        // response.data is the payload.
        // It has property data (array) and meta.

        // Check structure from users-service:
        // return { ...response.data, data: { ...response.data.data, data: mappedData } };
        // So response.data.data.data is the array? No.
        // users-service.ts returns:
        // { data: usersWithAvatar, meta: ... }
        // So response from getAllUsers is the object with data and meta.

        setUsers(response.data.data || []);
        setTotal(response.data.meta?.total || 0);
        setTotalPages(response.data.meta?.totalPages || 0);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
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
