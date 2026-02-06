'use client';

import { useAppSelector } from '@/store/hooks';
import useSubmissions from '@/hooks/use-submissions';
import SubmissionFilter from '@/components/submission-filters/submission-filter';
import SubmissionTable from '@/components/submissions/submission-table';
import { useTranslations } from 'next-intl';

export default function SubmissionsPage() {
    const t = useTranslations('SubmissionsPage');
    const {
        submissions,
        meta,
        isLoading,
        filters,
        sortBy,
        sortOrder,
        handleFiltersChange,
        handleSortByChange,
        handleSortOrderChange,
        handlePageChange,
        handleReset: resetSubmissions,
    } = useSubmissions();

    const { languages } = useAppSelector((state) => state.metadata);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header Section */}
            <div className="dark:bg-slate-800 dark:border-slate-700">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                    {t('title')}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    {t('description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8" style={{ maxWidth: 'none' }}>
                <div className="space-y-6">
                    {/* Filter Section */}
                    <SubmissionFilter
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onReset={resetSubmissions}
                        isLoading={isLoading}
                        languages={languages}
                        sortBy={sortBy}
                        onSortByChange={handleSortByChange}
                        sortOrder={sortOrder}
                        onSortOrderChange={handleSortOrderChange}
                    />

                    {/* Submissions Table */}
                    <SubmissionTable
                        submissions={submissions}
                        meta={meta}
                        isLoading={isLoading}
                        onPageChange={handlePageChange}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortByChange={handleSortByChange}
                        onSortOrderChange={handleSortOrderChange}
                        languages={languages}
                    />
                </div>
            </div>
        </div>
    );
}
