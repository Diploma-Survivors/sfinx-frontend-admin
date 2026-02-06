'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useDialog } from '@/components/providers/dialog-provider';
import { Problem } from '@/types/problems';
import { Contest } from '@/types/contest';
import { format } from 'date-fns';
import { ContestSchema, ContestFormValues } from './schema';
import { GeneralInfoSection } from './general-info-section';
import { SelectedProblem, ProblemSelectionSection } from './problem-selection-section';
import { toastService } from '@/services/toasts-service';

interface EditContestFormProps {
    initialData: Contest;
    initialSelectedProblems: SelectedProblem[];
    onSubmit: (data: ContestFormValues) => Promise<void>;
    isSubmitting: boolean;
}

export default function EditContestForm({
    initialData,
    initialSelectedProblems,
    onSubmit,
    isSubmitting,
}: EditContestFormProps) {
    const { confirm } = useDialog();
    const t = useTranslations('EditContestPage.form');

    const defaultValues = {
        title: initialData.title,
        description: initialData.description,
        startTime: initialData.startTime
            ? format(new Date(initialData.startTime), "yyyy-MM-dd'T'HH:mm")
            : '',
        durationMinutes: initialData.durationMinutes,
        status: initialData.status,
        problems: initialData.contestProblems?.map((p) => ({
            problemId: p.problem.id,
            orderIndex: p.orderIndex,
            points: p.points || 0,
        })) || [],
    };

    const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>(initialSelectedProblems);

    const form = useForm<ContestFormValues>({
        resolver: zodResolver(ContestSchema) as any,
        defaultValues,
        mode: 'onTouched',
    });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = form;

    const handleProblemsChange = (problems: SelectedProblem[]) => {
        setSelectedProblems(problems);
        const formProblems = problems.map((p, index) => ({
            problemId: p.id,
            orderIndex: index,
            points: p.points,
        }));
        setValue('problems', formProblems, { shouldValidate: true, shouldDirty: true });
    };

    const handleCancel = async () => {
        const confirmed = await confirm({
            title: t('cancelTitle'),
            message: t('cancelMessage'),
            confirmText: t('confirmCancel'),
            cancelText: t('keepEditing'),
            color: 'red',
        });

        if (confirmed) {
            window.history.back();
        }
    };

    const onError = (errors: any) => {
        toastService.error('Failed to update contest');
    };

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
            <div className="flex flex-col gap-8">
                <GeneralInfoSection
                    register={register}
                    control={control}
                    errors={errors}
                />
                <ProblemSelectionSection
                    selectedProblems={selectedProblems}
                    onProblemsChange={handleProblemsChange}
                    errors={errors}
                />
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                    {t('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t('saving') : t('update')}
                </Button>
            </div>
        </form>
    );
}
