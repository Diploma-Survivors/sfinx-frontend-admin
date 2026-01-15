
import { useState, useEffect } from 'react';
import { ProgrammingLanguageService } from '@/services/programing-language-service';
import {
    ProgrammingLanguage,
    QueryProgrammingLanguageParams,
} from '@/types/programing-language-type';

import { toastService } from '@/services/toasts-service';
import { useTranslations } from 'next-intl';

export interface UseProgrammingLanguagesProps {
    initialParams?: QueryProgrammingLanguageParams;
}

export function useProgrammingLanguages({ initialParams }: UseProgrammingLanguagesProps = {}) {
    const t = useTranslations('ProgrammingLanguagePage');
    const [languages, setLanguages] = useState<ProgrammingLanguage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination state
    const [page, setPage] = useState(initialParams?.page || 1);
    const [limit, setLimit] = useState(initialParams?.limit || 10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filter state
    const [filters, setFilters] = useState<QueryProgrammingLanguageParams>({
        isActive: initialParams?.isActive,
        search: initialParams?.search,
    });

    const fetchLanguages = async () => {
        try {
            setIsLoading(true);
            const params: QueryProgrammingLanguageParams = {
                page,
                limit,
                isActive: filters.isActive,
                search: filters.search,
            };

            const response = await ProgrammingLanguageService.getAllProgrammingLanguages(params);

            // Adjust response handling based on actual API response structure
            // Assuming the response structure matches PaginatedProgrammingLanguageResponse
            setLanguages(response.data);
            setTotal(response.meta.total);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            console.error('Failed to fetch programming languages:', error);
            toastService.error('Failed to load programming languages');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch and fetch on dependencies change
    useEffect(() => {
        fetchLanguages();
    }, [page, limit, filters]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1); // Reset to first page when limit changes
    };

    const handleFilterChange = (newFilters: Partial<QueryProgrammingLanguageParams>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // Reset to first page when filters change
    };

    const refresh = () => {
        fetchLanguages();
    };

    return {
        languages,
        isLoading,
        page,
        limit,
        total,
        totalPages,
        filters,
        setPage: handlePageChange,
        setLimit: handleLimitChange,
        setFilters: handleFilterChange,
        refresh,
    };
}
