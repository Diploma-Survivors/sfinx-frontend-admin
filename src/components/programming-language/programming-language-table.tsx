
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
import { ProgrammingLanguage } from '@/types/programing-language-type';
import { Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Pagination } from '@/components/ui/pagination'; // Adjust import based on your Pagination component
import { DataTablePagination } from '@/components/ui/data-table-pagination'; // Using existing pagination component if available

interface ProgrammingLanguageTableProps {
    languages: ProgrammingLanguage[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onEdit?: (language: ProgrammingLanguage) => void;
    onDelete?: (language: ProgrammingLanguage) => void;
    onStatusChange?: (language: ProgrammingLanguage) => void;
}

export function ProgrammingLanguageTable({
    languages,
    loading,
    page,
    totalPages,
    onPageChange,
    onEdit,
    onDelete,
    onStatusChange,
}: ProgrammingLanguageTableProps) {
    const t = useTranslations('ProgrammingLanguageTable');

    if (loading) {
        return <div className="p-4 text-center">{t('nodata')}</div>; // Or a spinner
    }

    if (languages.length === 0) {
        return <div className="p-4 text-center text-slate-500">{t('nodata')}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-slate-200 dark:border-slate-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">{t('id')}</TableHead>
                            <TableHead>{t('name')}</TableHead>
                            <TableHead>{t('slug')}</TableHead>
                            <TableHead>{t('judge0Id')}</TableHead>
                            <TableHead>{t('monacoLanguage')}</TableHead>
                            <TableHead className="text-center">{t('orderIndex')}</TableHead>
                            <TableHead className="text-center">{t('status')}</TableHead>
                            <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {languages.map((language) => (
                            <TableRow key={language.id}>
                                <TableCell className="font-medium">{language.id}</TableCell>
                                <TableCell>{language.name}</TableCell>
                                <TableCell className="text-slate-500">{language.slug}</TableCell>
                                <TableCell>{language.judge0Id || '-'}</TableCell>
                                <TableCell>{language.monacoLanguage || '-'}</TableCell>
                                <TableCell className="text-center">{language.orderIndex}</TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant="secondary"
                                        className={language.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' : ''}
                                    >
                                        {language.isActive ? t('active') : t('inactive')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {onStatusChange && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onStatusChange(language)}
                                                title={language.isActive ? t('deactivate') : t('activate')}
                                                className={language.isActive ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-green-500 hover:text-green-600 hover:bg-green-50"}
                                            >
                                                {language.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                            </Button>
                                        )}
                                        {onEdit && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(language)}
                                                title={t('edit')}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(language)}
                                                title={t('delete')}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-end">
                    {/* Assuming you have a reusable pagination component, otherwise implement basic buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center text-sm px-2">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
