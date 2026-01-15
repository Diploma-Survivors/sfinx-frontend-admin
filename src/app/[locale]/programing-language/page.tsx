'use client';

import { useTranslations } from 'next-intl';
import { Plus, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useProgrammingLanguages } from '@/hooks/use-programming-languages';
import { ProgrammingLanguageTable } from '@/components/programming-language/programming-language-table';

export default function ProgrammingLanguagePage() {
    const t = useTranslations('ProgrammingLanguagePage');

    const {
        languages,
        isLoading,
        page,
        totalPages,
        filters,
        setPage,
        setFilters,
        refresh,
    } = useProgrammingLanguages();

    const handleSearch = (value: string) => {
        setFilters({ search: value });
    };

    const handleStatusFilter = (value: string) => {
        setFilters({ isActive: value === 'all' ? undefined : value === 'active' });
    };

    const handleReset = () => {
        setFilters({ search: '', isActive: undefined });
    };

    const handleCreate = () => {
        // Placeholder for Create Dialog
        console.log('Open Create Dialog');
    };

    const handleEdit = (language: any) => {
        // Placeholder for Edit Dialog
        console.log('Edit language:', language);
    };

    const handleDelete = (language: any) => {
        // Placeholder for Delete Action
        console.log('Delete language:', language);
    };

    const handleStatusChange = (language: any) => {
        // Placeholder for Status Change
        console.log('Change status:', language);
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {t('description')}
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createLanguage')}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={filters.search || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <Select
                        value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
                        onValueChange={handleStatusFilter}
                    >
                        <SelectTrigger className="w-full sm:w-[140px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-0 focus:ring-offset-0 cursor-pointer">
                            <SelectValue placeholder={t('allStatuses')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="cursor-pointer">{t('allStatuses')}</SelectItem>
                            <SelectItem value="active" className="cursor-pointer">{t('active')}</SelectItem>
                            <SelectItem value="inactive" className="cursor-pointer">{t('inactive')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleReset}
                        className="h-10 w-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                        title={t('resetFilters')}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ProgrammingLanguageTable
                languages={languages}
                loading={isLoading}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}
