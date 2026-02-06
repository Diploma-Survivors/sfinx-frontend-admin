'use client';

import { TopicsService } from '@/services/topics-service';
import { SortOrder } from '@/types/problems';
import {
  type GetTopicListRequest,
  type Topic,
  type TopicFilters,
  type TopicMeta,
  TopicSortBy,
} from '@/types/topics';
import { useCallback, useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 10;

interface UseTopicsState {
  topics: Topic[];
  meta: TopicMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface UseTopicsActions {
  handleFiltersChange: (newFilters: TopicFilters) => void;
  handleKeywordChange: (newKeyword: string) => void;
  handleSortByChange: (newSortBy: TopicSortBy) => void;
  handleSortOrderChange: (newSortOrder: SortOrder) => void;
  handleSearch: () => void;
  handleReset: () => void;
  handlePageChange: (page: number) => void;
  refresh: () => void;
}

interface UseTopicsReturn extends UseTopicsState, UseTopicsActions {
  totalCount: number;
  // Request params (exposed for UI)
  filters: TopicFilters;
  keyword: string;
  sortBy: TopicSortBy;
  sortOrder: SortOrder;
}

export default function useTopics(): UseTopicsReturn {
  // Main state to manage topics and loading/error states
  const [state, setState] = useState<UseTopicsState>({
    topics: [],
    meta: null,
    isLoading: false,
    error: null,
  });

  // states for filters and keyword to manage input values
  const [filters, setFilters] = useState<TopicFilters>({});
  const [keyword, setKeyword] = useState<string>('');

  // state for sorting
  const [sortBy, setSortBy] = useState<TopicSortBy>(TopicSortBy.ID);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  // Request state to manage API request parameters
  const [request, setRequest] = useState<GetTopicListRequest>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: sortBy || TopicSortBy.ID,
    sortOrder: sortOrder || SortOrder.ASC,
    filters: {
      ...filters,
    },
  });

  // Fetch topics function
  const fetchTopics = useCallback(
    async (requestParams: GetTopicListRequest) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await TopicsService.getAllTopicsWithPagination(requestParams);

        setState((prev) => ({
          ...prev,
          topics: response.data.data.data,
          meta: response.data.data.meta,
          isLoading: false,
        }));
      } catch (err) {
        console.error('Error fetching topics:', err);
        setState((prev) => ({
          ...prev,
          error: "Can't load the topics.",
          isLoading: false,
        }));
      }
    },
    []
  );

  // Effect to fetch topics when request changes
  useEffect(() => {
    fetchTopics(request);
  }, [request, fetchTopics]);

  // Helper function to update request
  const updateRequest = useCallback(
    (updates: Partial<GetTopicListRequest>) => {
      setRequest((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  // handle filter, keyword changes
  const handleFiltersChange = useCallback(
    (newFilters: TopicFilters) => {
      setFilters(newFilters);
      // When filters change, reset to page 1
      updateRequest({ filters: newFilters, page: 1 });
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
    (newSortBy: TopicSortBy) => {
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
      filters: { ...filters },
      page: 1,
    });
  }, [keyword, filters, updateRequest]);

  // handle reset
  const handleReset = useCallback(() => {
    setFilters({});
    setKeyword('');
    setSortBy(TopicSortBy.ID);
    setSortOrder(SortOrder.ASC);

    updateRequest({
      search: undefined,
      filters: {},
      page: 1,
      sortBy: TopicSortBy.ID,
      sortOrder: SortOrder.ASC,
    });
  }, [updateRequest]);

  const refresh = useCallback(() => {
    fetchTopics(request);
  }, [fetchTopics, request]);

  return {
    // State
    topics: state.topics,
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
