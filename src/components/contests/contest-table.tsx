'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Contest,
    ContestMeta,
    ContestSortBy,
    ContestStatus,
    CONTEST_STATUS_COLORS,
    CONTEST_STATUS_LABELS,
} from '@/types/contest';
import { SortOrder } from '@/types/problems';
import {
    Edit,
    Eye,
    MoreHorizontal,
    Trash2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Lock,
    Unlock,
    BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import { useApp } from '@/contexts/app-context';
import { PermissionEnum } from '@/types/permission';

interface ContestTableProps {
    contests: Contest[];
    meta: ContestMeta | null;
    totalCount: number;
    isLoading: boolean;
    sortBy: ContestSortBy;
    sortOrder: SortOrder;
    onSortByChange: (sortBy: ContestSortBy) => void;
    onSortOrderChange: (sortOrder: SortOrder) => void;
    onPageChange: (page: number) => void;
    onDelete?: (contest: Contest) => void;
    onStatusChange?: (contest: Contest) => void;
}

export default function ContestTable({
    contests,
    meta,
    totalCount,
    isLoading,
    sortBy,
    sortOrder,
    onSortByChange,
    onSortOrderChange,
    onPageChange,
    onDelete,
    onStatusChange,
}: ContestTableProps) {
    const t = useTranslations('ContestTable');
    const { hasPermission } = useApp();

    const handleSort = (column: ContestSortBy) => {
        if (sortBy === column) {
            onSortOrderChange(
                sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
            );
        } else {
            onSortByChange(column);
            onSortOrderChange(SortOrder.ASC);
        }
    };

    const renderSortIcon = (column: ContestSortBy) => {
        if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
        return sortOrder === SortOrder.ASC ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="rounded-md border border-slate-200 dark:border-slate-700">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">{t('id')}</TableHead>
                                <TableHead>{t('name')}</TableHead>
                                <TableHead>{t('startTime')}</TableHead>
                                <TableHead>{t('duration')}</TableHead>
                                <TableHead>{t('status')}</TableHead>
                                <TableHead className="text-right">{t('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead
                                className="w-[80px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => handleSort(ContestSortBy.ID)}
                            >
                                <div className="flex items-center">
                                    {t('id')}
                                </div>
                            </TableHead>
                            <TableHead>{t('name')}</TableHead>
                            <TableHead
                                className="cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleSort(ContestSortBy.START_TIME)}
                            >
                                {t('startTime')}
                                {sortBy === ContestSortBy.START_TIME && (
                                    <span className="ml-1">{sortOrder === SortOrder.ASC ? '↑' : '↓'}</span>
                                )}
                            </TableHead>
                            <TableHead>
                                {t('duration')}
                            </TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead>{t('participationCount')}</TableHead>
                            <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                    {t('noContestsFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            contests.map((contest) => (
                                <TableRow key={contest.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="font-medium">{contest.id}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">
                                            {contest.title}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate max-w-[300px]">
                                            {contest.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(contest.startTime), 'PP p')}
                                    </TableCell>
                                    <TableCell>
                                        {contest.durationMinutes} {t('mins')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={`${CONTEST_STATUS_COLORS[contest.status || ContestStatus.SCHEDULED]
                                                } border-0`}
                                        >
                                            {CONTEST_STATUS_LABELS[contest.status || ContestStatus.SCHEDULED]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {contest.participantCount || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {contest.status === ContestStatus.SCHEDULED || contest.status === ContestStatus.DRAFT ? (
                                                    hasPermission(PermissionEnum.CONTEST_UPDATE) && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/contests/${contest.id}/edit`} className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                {t('edit')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/contests/${contest.id}`} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                {t('view')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/contests/${contest.id}/statistics`} className='cursor-pointer'>
                                                                <BarChart2 className="mr-2 h-4 w-4" />
                                                                {t('statistics')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}

                                                {hasPermission(PermissionEnum.CONTEST_UPDATE) && (
                                                    <>
                                                        {contest.status === ContestStatus.SCHEDULED && (
                                                            <DropdownMenuItem
                                                                onClick={() => onStatusChange?.({ ...contest, status: ContestStatus.DRAFT })}
                                                                className="cursor-pointer"
                                                            >
                                                                <Lock className="mr-2 h-4 w-4" />
                                                                {t('draft')}
                                                            </DropdownMenuItem>
                                                        )}
                                                        {contest.status === ContestStatus.DRAFT && (
                                                            <DropdownMenuItem
                                                                onClick={() => onStatusChange?.({ ...contest, status: ContestStatus.SCHEDULED })}
                                                                className="cursor-pointer"
                                                            >
                                                                <Unlock className="mr-2 h-4 w-4" />
                                                                {t('scheduled')}
                                                            </DropdownMenuItem>
                                                        )}
                                                        {contest.status === ContestStatus.RUNNING && (
                                                            <DropdownMenuItem
                                                                onClick={() => onStatusChange?.({ ...contest, status: ContestStatus.CANCELLED })}
                                                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                {t('cancel')}
                                                            </DropdownMenuItem>
                                                        )}
                                                    </>
                                                )}

                                                {(contest.status === ContestStatus.DRAFT || contest.status === ContestStatus.SCHEDULED) && hasPermission(PermissionEnum.CONTEST_DELETE) && (
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                                                        onClick={() => onDelete?.(contest)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {t('delete')}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {meta && (
                <DataTablePagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={onPageChange}
                    meta={{
                        page: meta.page,
                        limit: meta.limit,
                        total: totalCount,
                        hasPreviousPage: meta.hasPreviousPage,
                        hasNextPage: meta.hasNextPage,
                    }}
                    entityName={t('entityName')}
                />
            )}
        </div>
    );
}
