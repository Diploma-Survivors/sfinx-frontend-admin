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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    Submission,
    SubmissionMeta,
    SubmissionSortBy,
    SubmissionStatus,
} from '@/types/submissions';
import { ProgrammingLanguage } from '@/types/languages';
import {
    MoreHorizontal,
    Eye,
    Trash2,
    Clock,
    Cpu,
    ArrowUpDown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { getLanguageName, getStatusColor, getStatusLabel } from '@/services/submissions-service';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { SortOrder } from '@/types/problems';

interface SubmissionTableProps {
    submissions: Submission[];
    meta: SubmissionMeta | null;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    sortBy: SubmissionSortBy;
    sortOrder: SortOrder;
    onSortByChange: (sortBy: SubmissionSortBy) => void;
    onSortOrderChange: (sortOrder: SortOrder) => void;
    languages: ProgrammingLanguage[];
}

export default function SubmissionTable({
    submissions,
    meta,
    isLoading,
    onPageChange,
    sortBy,
    sortOrder,
    onSortByChange,
    onSortOrderChange,
    languages,
}: SubmissionTableProps) {
    const t = useTranslations('SubmissionTable');

    const handleSort = (column: SubmissionSortBy) => {
        if (sortBy === column) {
            onSortOrderChange(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
        } else {
            onSortByChange(column);
            onSortOrderChange(SortOrder.ASC);
        }
    };

    const currentPage = meta?.page || 1;
    const totalPages = meta?.totalPages || 1;



    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('id')}</TableHead>
                                <TableHead>{t('user')}</TableHead>
                                <TableHead>{t('contest')}</TableHead>
                                <TableHead>{t('problem')}</TableHead>
                                <TableHead>{t('status')}</TableHead>
                                <TableHead>{t('statistics')}</TableHead>
                                <TableHead>{t('language')}</TableHead>
                                <TableHead>{t('submittedAt')}</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
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
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('id')}</TableHead>
                            <TableHead>{t('user')}</TableHead>
                            <TableHead>{t('contest')}</TableHead>
                            <TableHead>{t('problem')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead>{t('statistics')}</TableHead>
                            <TableHead>{t('language')}</TableHead>
                            <TableHead>{t('submittedAt')}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    {t('noSubmissionsFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            submissions.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell className="font-medium">#{submission.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={submission.author.avatarUrl} />
                                                <AvatarFallback>
                                                    <img
                                                        src="/avatars/placeholder.png"
                                                        alt={submission.author.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {submission.author.username}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{submission.contest?.title || 'N/A'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{submission.problem.title}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn('font-normal', getStatusColor(submission.status))}
                                        >
                                            {getStatusLabel(submission.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                            {submission.status === SubmissionStatus.PENDING ? (
                                                <div className="flex items-center gap-1">
                                                    N/A
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {submission.executionTime} ms
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Cpu className="h-3 w-3" />
                                                        {(submission.memoryUsed / 1024).toFixed(1)} MB
                                                    </div>
                                                </>

                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getLanguageName(submission.languageId, languages)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(submission.submittedAt || '').toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <Link href={`/submissions/${submission.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        {t('viewDetails')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t('delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Footer & Pagination */}
            <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                meta={meta || undefined}
                entityName={t('entityName')}
            />
        </div>
    );
}
