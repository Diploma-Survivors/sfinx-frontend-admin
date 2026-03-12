'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setContestDraft, clearContestDraft } from '@/store/slices/create-contest-slice';
import { useDialog } from '@/components/providers/dialog-provider';
import { Problem } from '@/types/problems';
import { ContestStatus } from '@/types/contest';
import { ContestSchema, ContestFormValues } from './schema';
import { GeneralInfoSection } from './general-info-section';
import { ProblemSelectionSection, SelectedProblem } from './problem-selection-section';

interface CreateContestFormProps {
    onSubmit: (data: ContestFormValues) => Promise<void>;
    isSubmitting: boolean;
}

export default function CreateContestForm({ onSubmit, isSubmitting }: CreateContestFormProps) {
    const dispatch = useAppDispatch();
    const draft = useAppSelector((state) => state.createContest);
    const { confirm } = useDialog();
    const t = useTranslations('CreateContestPage.form');

    const defaultValues = {
        name: draft.title,
        description: draft.description,
        startTime: draft.startTime,
        durationMinutes: draft.durationMinutes,
        status: draft.status || ContestStatus.DRAFT,
        problems: (draft.problems || []).map((p, index) => ({
            problemId: p.problemId,
            point: p.points,
            orderIndex: (p as any).orderIndex ?? (p as any).order ?? index,
        })),
    };

    const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>(
        (draft.selectedProblems || []).map((p, i) => ({ ...p, points: (p as any).points || 10, orderIndex: (p as any).orderIndex ?? i }))
    );

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
        watch,
        formState: { errors },
    } = form;

    // Watch form changes to persist draft
    useEffect(() => {
        const subscription = watch((value) => {
            dispatch(setContestDraft(value as Partial<ContestFormValues>));
        });
        return () => subscription.unsubscribe();
    }, [watch, dispatch]);

    const handleProblemsChange = (problems: SelectedProblem[]) => {
        setSelectedProblems(problems);
        const formProblems = problems.map((p, index) => ({
            problemId: p.id,
            orderIndex: index,
            points: p.points,
        }));
        setValue('problems', formProblems, { shouldValidate: true, shouldDirty: true });

        // Persist selected problems to draft
        dispatch(setContestDraft({ selectedProblems: problems }));
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
            dispatch(clearContestDraft());
            window.history.back();
        }
    };

    const handleFormSubmit = async (data: ContestFormValues) => {
        await onSubmit(data);
        // Draft clearing is handled by the parent page on success, or we can do it here.
        // The previous implementation did it in the page on success.
        // But here we can do it if onSubmit resolves successfully.
        // Actually, the page handles navigation, so it might be better to let the page handle clearing?
        // But the previous `ContestForm` had `dispatch(clearContestDraft())` in `handleFormSubmit`.
        // Let's keep it here for consistency.
        dispatch(clearContestDraft());
    };

    const onError = (error: any) => {
        console.error('Form submission error:', error);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit, onError)} className="space-y-8">
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
                    {isSubmitting ? t('creating') : t('create')}
                </Button>
            </div>
        </form>
    );
}
