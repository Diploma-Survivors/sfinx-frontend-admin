'use client';

import { TagsService } from '@/services/tags-service';
import { SortOrder } from '@/types/problems';
import {
  type GetTagListRequest,
  type Tag,
  type TagFilters,
  type TagMeta,
  TagSortBy,
} from '@/types/tags';
import { useCallback, useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 10;

interface UseTagsState {
  tags: Tag[];
  meta: TagMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface UseTagsActions {
  handleFiltersChange: (newFilters: TagFilters) => void;
  handleKeywordChange: (newKeyword: string) => void;
  handleSortByChange: (newSortBy: TagSortBy) => void;
  handleSortOrderChange: (newSortOrder: SortOrder) => void;
  handleSearch: () => void;
  handleReset: () => void;
  handlePageChange: (page: number) => void;
  refresh: () => void;
}

interface UseTagsReturn extends UseTagsState, UseTagsActions {
  totalCount: number;
  // Request params (exposed for UI)
  filters: TagFilters;
  keyword: string;
  sortBy: TagSortBy;
  sortOrder: SortOrder;
}

export default function useTags(): UseTagsReturn {
  // Main state to manage tags and loading/error states
  const [state, setState] = useState<UseTagsState>({
    tags: [],
    meta: null,
    isLoading: false,
    error: null,
  });

  // states for filters and keyword to manage input values
  const [filters, setFilters] = useState<TagFilters>({});
  const [keyword, setKeyword] = useState<string>('');

  // state for sorting
  const [sortBy, setSortBy] = useState<TagSortBy>(TagSortBy.ID);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  // Request state to manage API request parameters
  const [request, setRequest] = useState<GetTagListRequest>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: sortBy || TagSortBy.ID,
    sortOrder: sortOrder || SortOrder.ASC,
    filters: {
      ...filters,
    },
  });

  // Fetch tags function
  const fetchTags = useCallback(async (requestParams: GetTagListRequest) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await TagsService.getAllTagsWithPagination(requestParams);

      setState((prev) => ({
        ...prev,
        tags: response.data.data.data,
        meta: response.data.data.meta,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Error fetching tags:', err);
      setState((prev) => ({
        ...prev,
        error: "Can't load the tags.",
        isLoading: false,
      }));
    }
  }, []);

  // Effect to fetch tags when request changes
  useEffect(() => {
    fetchTags(request);
  }, [request, fetchTags]);

  // Helper function to update request
  const updateRequest = useCallback(
    (updates: Partial<GetTagListRequest>) => {
      setRequest((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  // handle filter, keyword changes
  const handleFiltersChange = useCallback(
    (newFilters: TagFilters) => {
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
    (newSortBy: TagSortBy) => {
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
    setSortBy(TagSortBy.ID);
    setSortOrder(SortOrder.ASC);

    updateRequest({
      search: undefined,
      filters: {},
      page: 1,
      sortBy: TagSortBy.ID,
      sortOrder: SortOrder.ASC,
    });
  }, [updateRequest]);

  const refresh = useCallback(() => {
    fetchTags(request);
  }, [fetchTags, request]);

  return {
    // State
    tags: state.tags,
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
