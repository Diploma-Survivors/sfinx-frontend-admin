'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import useContest from '@/hooks/use-contest';
import ContestFilter from '@/components/contest-filters/contest-filter';
import ContestTable from '@/components/contests/contest-table';
import { useDialog } from '@/components/providers/dialog-provider';
import { toastService } from '@/services/toasts-service';
import { Contest, ContestStatus } from '@/types/contest';
import { ContestsService } from '@/services/contests-service';
import { useTranslations } from 'next-intl';

import { useApp } from '@/contexts/app-context';
import { PermissionEnum } from '@/types/permission';

export default function ContestsPage() {
    const t = useTranslations('ContestsPage');
    const { hasPermission } = useApp();
    const {
        // State
        contests,
        meta,
        totalCount,
        isLoading,
        error,

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
    } = useContest();

    const { confirm } = useDialog();

    const handleDelete = async (contest: Contest) => {
        const confirmed = await confirm({
            title: t('deleteTitle'),
            message: (
                <span>
                    {t.rich('deleteMessage', {
                        name: contest.title,
                        span: (chunks) => <span className="font-semibold text-foreground"> "{chunks}"</span>
                    })}
                </span>
            ),
            confirmText: t('deleteConfirm'),
            cancelText: t('cancel'),
            color: 'red',
        });

        if (confirmed) {
            try {
                await ContestsService.deleteContest(contest.id!);

                toastService.success(t('deleteSuccess'));
                refresh();
            } catch (error) {
                console.error('Failed to delete contest:', error);
                toastService.error(t('deleteError'));
            }
        }
    };

    const handleStatusChange = async (updatedContest: Contest) => {
        const newStatus = updatedContest.status;
        const action = newStatus === ContestStatus.SCHEDULED ? 'schedule' :
            newStatus === ContestStatus.DRAFT ? 'draft' :
                newStatus === ContestStatus.CANCELLED ? 'cancel' : 'update';

        const confirmed = await confirm({
            title: t(`confirm${action.charAt(0).toUpperCase() + action.slice(1)}Title`),
            message: (
                <span>
                    {t.rich(`confirm${action.charAt(0).toUpperCase() + action.slice(1)}Message`, {
                        name: updatedContest.title,
                        span: (chunks) => <span className="font-semibold text-foreground"> "{chunks}"</span>
                    })}
                </span>
            ),
            confirmText: t(action),
            cancelText: t('cancel'),
            color: newStatus === ContestStatus.CANCELLED ? 'red' : 'blue',
        });

        if (confirmed) {
            try {
                await ContestsService.updateContest(updatedContest.id!.toString(), {
                    status: newStatus
                });

                toastService.success(t(`${action}Success`));
                refresh();
            } catch (error) {
                console.error(`Failed to ${action} contest:`, error);
                toastService.error(t(`${action}Error`));
            }
        }
    };

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

                            {hasPermission(PermissionEnum.CONTEST_CREATE) && (
                                <Button
                                    asChild
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Link href="/contests/create">
                                        <Plus className="w-5 h-5 mr-2" />
                                        {t('createContest')}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8" style={{ maxWidth: 'none' }}>
                <div className="space-y-6">
                    {/* Filter Section */}
                    <ContestFilter
                        keyword={keyword}
                        filters={filters}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onKeywordChange={handleKeywordChange}
                        onFiltersChange={handleFiltersChange}
                        onSortByChange={handleSortByChange}
                        onSortOrderChange={handleSortOrderChange}
                        onSearch={handleSearch}
                        onReset={handleReset}
                        isLoading={isLoading}
                    />

                    {/* Contests Table */}
                    {error ? (
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl p-8 text-center">
                            <div className="text-slate-500 dark:text-slate-400 text-lg">
                                {error}
                            </div>
                        </div>
                    ) : (
                        <ContestTable
                            contests={contests}
                            meta={meta}
                            totalCount={totalCount}
                            onPageChange={handlePageChange}
                            isLoading={isLoading}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortByChange={handleSortByChange}
                            onSortOrderChange={handleSortOrderChange}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
