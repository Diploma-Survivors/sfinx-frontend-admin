'use client';
import { ProblemsService } from '@/services/problems-service';
import {
  type GetProblemListRequest,
  type Problem,
  type ProblemEndpointType,
  type ProblemFilters,
  type ProblemListResponse,
  type ProblemMeta,
  SortBy,
  SortOrder,
} from '@/types/problems';
import { HttpStatus } from '@/types/api';
import { useCallback, useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 20;

interface UseProblemsState {
  problems: Problem[];
  meta: ProblemMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface UseProblemsActions {
  handleFiltersChange: (newFilters: ProblemFilters) => void;
  handleKeywordChange: (newKeyword: string) => void;
  handleSortByChange: (newSortBy: SortBy) => void;
  handleSortOrderChange: (newSortOrder: SortOrder) => void;
  handleSearch: () => void;
  handleReset: () => void;
  handlePageChange: (page: number) => void;
  refresh: () => void;
}

interface UseProblemsReturn extends UseProblemsState, UseProblemsActions {
  totalCount: number;
  // Request params (exposed for UI)
  filters: ProblemFilters;
  keyword: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export default function useProblems(
  endpointType: ProblemEndpointType
): UseProblemsReturn {
  // Main state to manage problems and loading/error states
  const [state, setState] = useState<UseProblemsState>({
    problems: [],
    meta: null,
    isLoading: false,
    error: null,
  });

  // states for filters and keyword to manage input values
  const [filters, setFilters] = useState<ProblemFilters>({});
  const [keyword, setKeyword] = useState<string>('');

  // state for sorting
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.ID);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  // Request state to manage API request parameters
  const [request, setRequest] = useState<GetProblemListRequest>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: sortBy || SortBy.ID,
    sortOrder: sortOrder || SortOrder.ASC,
    filters: {
      ...filters,
    },
  });

  // Fetch problems function
  const fetchProblems = useCallback(
    async (requestParams: GetProblemListRequest) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await ProblemsService.getProblemList(
          requestParams,
        );
        setState((prev) => ({
          ...prev,
          problems: response?.data?.data?.data,
          meta: response?.data?.data?.meta,
          isLoading: false,
        }));
      } catch (err) {
        console.error('Error fetching problems:', err);
        setState((prev) => ({
          ...prev,
          error: "Can't load the problems.",
          isLoading: false,
        }));
      }
    },
    []
  );

  // Effect to fetch problems when request changes
  useEffect(() => {
    fetchProblems(request);
  }, [request, fetchProblems]);

  // Helper function to update request
  const updateRequest = useCallback(
    (updates: Partial<GetProblemListRequest>) => {
      setRequest((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  // handle filter, keyword changes
  const handleFiltersChange = useCallback((newFilters: ProblemFilters) => {
    setFilters(newFilters);
    // When filters change, reset to page 1
    updateRequest({ filters: newFilters, page: 1 });
  }, [updateRequest]);

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
    (newSortBy: SortBy) => {
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
  const handlePageChange = useCallback((page: number) => {
    updateRequest({ page });
  }, [updateRequest]);

  // handle search (now just forces a refresh if needed, but debounce handles typing)
  const handleSearch = useCallback(() => {
    const trimmedKeyword = keyword.trim();
    updateRequest({
      search: trimmedKeyword || undefined,
      filters: { ...filters },
      page: 1,
    });
  }, [keyword, filters, updateRequest]);

  const handleReset = useCallback(() => {
    setFilters({});
    setKeyword('');
    setSortBy(SortBy.ID);
    setSortOrder(SortOrder.ASC);

    updateRequest({
      search: undefined,
      filters: {},
      page: 1,
      sortBy: SortBy.ID,
      sortOrder: SortOrder.ASC,
    });
  }, [updateRequest]);

  const refresh = useCallback(() => {
    fetchProblems(request);
  }, [fetchProblems, request]);

  return {
    // State
    problems: state.problems,
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
