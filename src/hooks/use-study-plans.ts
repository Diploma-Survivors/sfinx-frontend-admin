"use client";

import { studyPlanService } from "@/services/study-plan-service";
import {
  AdminStudyPlanResponseDto,
  FilterStudyPlanDto,
} from "@/types/study-plan";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";

const ITEMS_PER_PAGE = 10;

interface UseStudyPlansState {
  studyPlans: AdminStudyPlanResponseDto[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

interface UseStudyPlansActions {
  handleFilterChange: (key: keyof FilterStudyPlanDto, value: any) => void;
  handleSearch: (search: string) => void;
  handlePageChange: (page: number) => void;
  handleReset: () => void;
  refresh: () => void;
}

interface UseStudyPlansReturn extends UseStudyPlansState, UseStudyPlansActions {
  filters: FilterStudyPlanDto;
}

export default function useStudyPlans(
  initialFilters?: FilterStudyPlanDto,
): UseStudyPlansReturn {
  const locale = useLocale();
  const [state, setState] = useState<UseStudyPlansState>({
    studyPlans: [],
    totalCount: 0,
    isLoading: false,
    error: null,
  });

  const [filters, setFilters] = useState<FilterStudyPlanDto>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    ...initialFilters,
  });

  const fetchStudyPlans = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await studyPlanService.getStudyPlans(filters, locale);
      setState({
        studyPlans: response.data,
        totalCount: response.meta.total,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error fetching study plans:", err);
      setState((prev) => ({
        ...prev,
        error: "Failed to load study plans.",
        isLoading: false,
      }));
    }
  }, [filters, locale]);

  useEffect(() => {
    fetchStudyPlans();
  }, [fetchStudyPlans]);

  const handleFilterChange = useCallback(
    (key: keyof FilterStudyPlanDto, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        ...(key !== "page" && { page: 1 }),
      }));
    },
    [],
  );

  const handleSearch = useCallback((search: string) => {
    setFilters((prev) => ({
      ...prev,
      search,
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      page: 1,
      limit: ITEMS_PER_PAGE,
      ...initialFilters,
    });
  }, [initialFilters]);

  return {
    ...state,
    filters,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleReset,
    refresh: fetchStudyPlans,
  };
}
