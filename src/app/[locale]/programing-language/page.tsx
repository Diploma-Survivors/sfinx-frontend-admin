'use client';

import { useTranslations } from 'next-intl';
import { RotateCcw, Search } from 'lucide-react';
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

import { toastService } from '@/services/toasts-service';
import { useDialog } from '@/components/providers/dialog-provider';
import { ProgrammingLanguageService } from '@/services/programing-language-service';
import { CreateProgrammingLanguageDialog } from '@/components/programming-language/create-programming-language-dialog';
import { EditProgrammingLanguageDialog } from '@/components/programming-language/edit-programming-language-dialog';
import { ProgrammingLanguage } from '@/types/programing-language-type';
import { useState } from 'react';

export default function ProgrammingLanguagePage() {
    const t = useTranslations('ProgrammingLanguagePage');
    const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const { confirm } = useDialog();

    const {
        languages,
        isLoading,
        page,
        totalPages,
        total,
        limit,
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

    const handleEdit = (language: ProgrammingLanguage) => {
        setSelectedLanguage(language);
        setIsEditOpen(true);
    };

    const handleDelete = async (language: ProgrammingLanguage) => {
        const confirmed = await confirm({
            title: t('confirmDeleteTitle'),
            message: (
                <span>
                    {t.rich('confirmDeleteMessage', {
                        name: language.name,
                        span: (chunks) => <span className="font-semibold text-foreground"> "{chunks}" </span>
                    })}
                </span>
            ),
            confirmText: t('delete'),
            cancelText: t('cancel'),
            color: 'red',
        });

        if (confirmed) {
            try {
                await ProgrammingLanguageService.deleteProgrammingLanguage(language.id);
                toastService.success(t('deleteSuccess'));
                refresh();
            } catch (error) {
                console.error('Failed to delete language:', error);
                toastService.error(t('deleteError'));
            }
        }
    };

    const handleStatusChange = async (language: ProgrammingLanguage) => {
        const newStatus = !language.isActive;
        const action = newStatus ? 'activate' : 'deactivate';

        const confirmed = await confirm({
            title: newStatus ? t('confirmActivateTitle') : t('confirmDeactivateTitle'),
            message: (
                <span>
                    {t.rich(newStatus ? 'confirmActivateMessage' : 'confirmDeactivateMessage', {
                        name: language.name,
                        span: (chunks) => <span className="font-semibold text-foreground"> "{chunks}" </span>
                    })}
                </span>
            ),
            confirmText: newStatus ? t('activate') : t('deactivate'),
            cancelText: t('cancel'),
            color: newStatus ? 'green' : 'red',
        });

        if (confirmed) {
            try {
                if (newStatus) {
                    await ProgrammingLanguageService.activateProgrammingLanguage(language.id);
                } else {
                    await ProgrammingLanguageService.deactivateProgrammingLanguage(language.id);
                }
                toastService.success(newStatus ? t('activateSuccess') : t('deactivateSuccess'));
                refresh();
            } catch (error) {
                console.error(`Failed to ${action} language:`, error);
                toastService.error(newStatus ? t('activateError') : t('deactivateError'));
            }
        }
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
                <CreateProgrammingLanguageDialog onSuccess={refresh} />
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
                total={total}
                limit={limit}
                onPageChange={setPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
            />

            <EditProgrammingLanguageDialog
                language={selectedLanguage}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={refresh}
            />
        </div>
    );
}
