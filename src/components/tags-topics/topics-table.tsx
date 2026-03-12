import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
} from '@/components/ui/pagination';
import { Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';
import { TopicsService } from '@/services/topics-service';
import { Topic, TopicSortBy } from '@/types/topics';
import { toastService } from '@/services/toasts-service';
import { Tooltip } from '@/components/ui/tooltip';
import { TableSkeleton } from './table-skeleton';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useTranslations } from 'next-intl';

interface TopicsTableProps {
    topics: Topic[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onEdit: (topic: Topic) => void;
    onDelete: (topic: Topic) => void;
    onStatusChange?: (topic: Topic) => void;
}

export function TopicsTable({
    topics,
    loading,
    page,
    totalPages,
    onPageChange,
    onEdit,
    onDelete,
    onStatusChange,
}: TopicsTableProps) {
    const t = useTranslations('TopicsTable');
    const limit = 10;

    if (loading) {
        return <TableSkeleton columnCount={7} rowCount={10} />;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-left">{t('topicId')}</TableHead>
                            <TableHead className="text-left">{t('topicName')}</TableHead>
                            <TableHead className="text-left">{t('slug')}</TableHead>
                            <TableHead className="text-left">{t('status')}</TableHead>
                            <TableHead className="text-left">{t('createdDate')}</TableHead>
                            <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topics.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    {t('noTopicsFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            topics.map((topic) => (
                                <TableRow key={topic.id}>
                                    <TableCell className="font-medium text-left">{topic.id}</TableCell>
                                    <TableCell className="font-medium text-left">{topic.name}</TableCell>
                                    <TableCell className="text-left">
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {topic.slug}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <Badge
                                            variant={topic.isActive ? 'default' : 'secondary'}
                                            className={
                                                topic.isActive
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                                            }
                                        >
                                            {topic.isActive ? t('active') : t('inactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        {topic.createdAt ? format(new Date(topic.createdAt), 'dd/MM/yyyy') : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Tooltip content={t('edit')}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    onClick={() => onEdit(topic)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip
                                                content={
                                                    topic.isActive ? t('deactivate') : t('activate')
                                                }
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-8 w-8 ${topic.isActive
                                                        ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                        : 'text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        }`}
                                                    onClick={() => onStatusChange?.(topic)}
                                                >
                                                    {topic.isActive ? (
                                                        <Lock className="h-4 w-4" />
                                                    ) : (
                                                        <Unlock className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content={t('delete')}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => onDelete(topic)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <DataTablePagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                entityName={t('entityName')}
            />
        </div>
    );
}
