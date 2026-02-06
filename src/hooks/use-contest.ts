'use client';

import { ContestsService } from '@/services/contests-service';
import {
  type Contest,
  type ContestFilters,
  type ContestListResponse,
  type ContestMeta,
  ContestSortBy,
  ContestStatus,
  type GetContestListRequest,
} from '@/types/contest';
import { SortOrder } from '@/types/problems';
import { useCallback, useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 20;

interface UseContestState {
  contests: Contest[];
  meta: ContestMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface UseContestActions {
  handleFiltersChange: (newFilters: ContestFilters) => void;
  handleKeywordChange: (newKeyword: string) => void;
  handleSortByChange: (newSortBy: ContestSortBy) => void;
  handleSortOrderChange: (newSortOrder: SortOrder) => void;
  handleSearch: () => void;
  handleReset: () => void;
  handlePageChange: (page: number) => void;
  refresh: () => void;
}

interface UseContestReturn extends UseContestState, UseContestActions {
  totalCount: number;
  // Request params (exposed for UI)
  filters: ContestFilters;
  keyword: string;
  sortBy: ContestSortBy;
  sortOrder: SortOrder;
}

export default function useContest(): UseContestReturn {
  // Main state to manage contests and loading/error states
  const [state, setState] = useState<UseContestState>({
    contests: [],
    meta: null,
    isLoading: false,
    error: null,
  });

  // states for filters and keyword to manage input values
  const [filters, setFilters] = useState<ContestFilters>({});
  const [keyword, setKeyword] = useState<string>('');

  // state for sorting
  const [sortBy, setSortBy] = useState<ContestSortBy>(ContestSortBy.ID);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  // Request state to manage API request parameters
  const [request, setRequest] = useState<GetContestListRequest>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: sortBy || ContestSortBy.ID,
    sortOrder: sortOrder || SortOrder.ASC,
    ...filters,
  });

  // Fetch contests function
  const fetchContests = useCallback(
    async (requestParams: GetContestListRequest) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await ContestsService.getContests(requestParams);
        const data = response.data.data.data;
        const meta = response.data.data.meta;

        setState((prev) => ({
          ...prev,
          contests: data,
          meta: meta,
          isLoading: false,
        }));
      } catch (err) {
        console.error('Error fetching contests:', err);
        setState((prev) => ({
          ...prev,
          error: "Can't load the contests.",
          isLoading: false,
        }));
      }
    },
    []
  );

  // Effect to fetch contests when request changes
  useEffect(() => {
    fetchContests(request);
  }, [request, fetchContests]);

  // Helper function to update request
  const updateRequest = useCallback(
    (updates: Partial<GetContestListRequest>) => {
      setRequest((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  // handle filter, keyword changes
  const handleFiltersChange = useCallback(
    (newFilters: ContestFilters) => {
      setFilters(newFilters);
      // When filters change, reset to page 1
      updateRequest({ ...newFilters, page: 1 });
    },
    [updateRequest]
  );

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedKeyword = keyword.trim() || undefined;
      if (trimmedKeyword !== request.search) {
        updateRequest({
          search: trimmedKeyword,
          page: 1,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [keyword, request.search, updateRequest]);

  // handle sorting changes
  const handleSortByChange = useCallback(
    (newSortBy: ContestSortBy) => {
      setSortBy(newSortBy);
      updateRequest({ sortBy: newSortBy, page: 1 });
    },
    [updateRequest]
  );

  const handleSortOrderChange = useCallback(
    (newSortOrder: SortOrder) => {
      setSortOrder(newSortOrder);
      updateRequest({ sortOrder: newSortOrder, page: 1 });
    },
    [updateRequest]
  );

  // handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      updateRequest({ page });
    },
    [updateRequest]
  );

  // handle search (now just forces a refresh if needed, but debounce handles typing)
  const handleSearch = useCallback(() => {
    const trimmedKeyword = keyword.trim();
    updateRequest({
      search: trimmedKeyword || undefined,
      ...filters,
      page: 1,
    });
  }, [keyword, filters, updateRequest]);

  const handleReset = useCallback(() => {
    setFilters({});
    setKeyword('');
    setSortBy(ContestSortBy.ID);
    setSortOrder(SortOrder.ASC);

    updateRequest({
      search: undefined,
      status: undefined,
      startAfter: undefined,
      startBefore: undefined,
      page: 1,
      sortBy: ContestSortBy.ID,
      sortOrder: SortOrder.ASC,
    });
  }, [updateRequest]);

  const refresh = useCallback(() => {
    fetchContests(request);
  }, [fetchContests, request]);

  return {
    // State
    contests: state.contests,
    meta: state.meta,
    totalCount: state.meta?.total || 0,
    isLoading: state.isLoading,
    error: state.error,

    // Request params (exposed for UI)
    filters,
    keyword,
    sortBy,
    sortOrder,

    // Handlers
    handleFiltersChange,
    handleKeywordChange,
    handleSortByChange,
    handleSortOrderChange,
    handleSearch,
    handleReset,
    handlePageChange,
    refresh,
  };
}
