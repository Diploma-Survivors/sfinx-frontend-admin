import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DataTablePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    meta?: {
        page: number;
        limit: number;
        total: number;
        hasPreviousPage?: boolean;
        hasNextPage?: boolean;
    };
    entityName?: string; // e.g., "problems", "tags", "topics"
}

export function DataTablePagination({
    currentPage,
    totalPages,
    onPageChange,
    meta,
    entityName = 'items',
}: DataTablePaginationProps) {
    const t = useTranslations('DataTablePagination');

    if (totalPages <= 1 && !meta) return null;

    const renderPaginationButtons = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={meta ? !meta.hasPreviousPage : currentPage <= 1}
                    className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-700"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {startPage > 1 && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(1)}
                            className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-700"
                        >
                            1
                        </Button>
                        {startPage > 2 && <span className="text-slate-400">...</span>}
                    </>
                )}
                {pages.map((page) => (
                    <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className={`h-8 w-8 p-0 rounded-lg ${page === currentPage
                            ? 'bg-green-600 hover:bg-green-700 text-white border-transparent'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        {page}
                    </Button>
                ))}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <span className="text-slate-400">...</span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(totalPages)}
                            className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-700"
                        >
                            {totalPages}
                        </Button>
                    </>
                )}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={meta ? !meta.hasNextPage : currentPage >= totalPages}
                    className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-700"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    const start = meta ? (meta.page - 1) * meta.limit + 1 : (currentPage - 1) * 10 + 1;
    const end = meta ? Math.min(meta.page * meta.limit, meta.total) : Math.min(currentPage * 10, totalPages * 10);
    const total = meta?.total || totalPages * 10;

    return (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
                {t.rich('summary', {
                    start,
                    end,
                    total,
                    entityName,
                    bold: (chunks) => <span className="font-medium text-slate-900 dark:text-slate-200">{chunks}</span>
                })}
            </div>
            {renderPaginationButtons()}
        </div>
    );
}
