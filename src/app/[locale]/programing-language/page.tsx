'use client';

import { useTranslations } from 'next-intl';
import { useProgrammingLanguages } from '@/hooks/use-programming-languages';
import { ProgrammingLanguageTable } from '@/components/programming-language/programming-language-table';
import { toastService } from '@/services/toasts-service';
import { ProgrammingLanguageService } from '@/services/programing-language-service';
import { EditProgrammingLanguageDialog } from '@/components/programming-language/edit-programming-language-dialog';
import { ProgrammingLanguage } from '@/types/programing-language-type';
import { useState } from 'react';
import { DeleteProgrammingLanguageDialog } from '@/components/programming-language/delete-programming-language-dialog';
import { StatusChangeProgrammingLanguageDialog } from '@/components/programming-language/status-change-programming-language-dialog';
import { ProgrammingLanguageHeader } from '@/components/programming-language/programming-language-header';

export default function ProgrammingLanguagePage() {
    const t = useTranslations('ProgrammingLanguagePage');
    const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // New state for confirmation dialogs
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

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
        setLanguages,
        refresh,
    } = useProgrammingLanguages({ initialParams: { isActive: true } });

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

    const handleDeleteClick = (language: ProgrammingLanguage) => {
        setSelectedLanguage(language);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedLanguage) return;

        setActionLoading(true);
        try {
            await ProgrammingLanguageService.deleteProgrammingLanguage(selectedLanguage.id);
            toastService.success(t('deleteSuccess'));
            refresh();
            setIsDeleteOpen(false);
        } catch (error) {
            if ((error as any)?.response?.status === 409) {
                toastService.error((error as any).response.data.message || t('deleteError'));
            } else {
                toastService.error(t('deleteError'));
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChangeClick = (language: ProgrammingLanguage) => {
        setSelectedLanguage(language);
        setIsStatusChangeOpen(true);
    };

    const handleConfirmStatusChange = async () => {
        if (!selectedLanguage) return;

        const newStatus = !selectedLanguage.isActive;
        const action = newStatus ? 'activate' : 'deactivate';

        setActionLoading(true);
        try {
            if (newStatus) {
                await ProgrammingLanguageService.activateProgrammingLanguage(selectedLanguage.id);
            } else {
                await ProgrammingLanguageService.deactivateProgrammingLanguage(selectedLanguage.id);
            }
            toastService.success(newStatus ? t('activateSuccess') : t('deactivateSuccess'));
            refresh();
            setIsStatusChangeOpen(false);
        } catch (error) {
            toastService.error(newStatus ? t('activateError') : t('deactivateError'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReorder = async (newOrder: ProgrammingLanguage[]) => {
        // Optimistic update
        const originalOrder = [...languages];
        setLanguages(newOrder);

        try {
            const ids = newOrder.map(l => l.id);
            await ProgrammingLanguageService.reorderProgrammingLanguages(ids);
        } catch (error) {
            console.error('Failed to reorder languages:', error);
            // Revert changes
            setLanguages(originalOrder);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <ProgrammingLanguageHeader
                filters={filters}
                onSearch={handleSearch}
                onStatusFilter={handleStatusFilter}
                onReset={handleReset}
                onRefresh={refresh}
            />

            <ProgrammingLanguageTable
                languages={languages}
                loading={isLoading}
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChangeClick}
                onReorder={handleReorder}
            />

            <EditProgrammingLanguageDialog
                language={selectedLanguage}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={refresh}
            />

            <DeleteProgrammingLanguageDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleConfirmDelete}
                languageName={selectedLanguage?.name || ''}
                loading={actionLoading}
            />

            <StatusChangeProgrammingLanguageDialog
                open={isStatusChangeOpen}
                onOpenChange={setIsStatusChangeOpen}
                onConfirm={handleConfirmStatusChange}
                languageName={selectedLanguage?.name || ''}
                action={selectedLanguage?.isActive ? 'deactivate' : 'activate'}
                loading={actionLoading}
            />
        </div>
    );
}
