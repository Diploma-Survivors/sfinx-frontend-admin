'use client';
import { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ProblemType,
    ProblemVisibility,
    ProblemSchema,
} from '@/types/problems';

import { toastService } from '@/services/toasts-service';
import { useRouter } from '@/i18n/routing';
import { useDialog } from '@/components/providers/dialog-provider';

import { useAppSelector } from '@/store/hooks';
import { ProblemsService } from '@/services/problems-service';

import { GeneralInformationStep } from '@/components/problems/problem-form-steps/general-information-step';
import { ProblemDescriptionStep } from '@/components/problems/problem-form-steps/problem-description-step';
import { ConstraintsStep } from '@/components/problems/problem-form-steps/constraints-step';
import { TestCasesStep } from '@/components/problems/problem-form-steps/test-cases-step';
import { SolutionHintsStep } from '@/components/problems/problem-form-steps/solution-hints-step';
import type { Tag } from '@/types/tags';
import type { Topic } from '@/types/topics';
import type { CreateProblemRequest, Problem } from '@/types/problems';
import {
    getCreateProblemSchema,
    type CreateProblemFormValues,
} from '@/components/problems/problem-create-form';
import { useTranslations } from 'next-intl';

interface ProblemEditFormProps {
    problemId: number;
}

export default function ProblemEditForm({ problemId }: ProblemEditFormProps) {
    const t = useTranslations('CreateProblemForm');
    const tEdit = useTranslations('EditProblemForm');
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { tags: availableTags, topics: availableTopics } = useAppSelector((state) => state.metadata);
    const [originalProblem, setOriginalProblem] = useState<Problem | null>(null);

    const router = useRouter();
    const { confirm } = useDialog();

    const schema = useMemo(() => getCreateProblemSchema(t), [t]);

    const form = useForm<CreateProblemFormValues>({
        resolver: zodResolver(schema),
        mode: 'onChange',
    });

    const [errorSteps, setErrorSteps] = useState<number[]>([]);

    const { handleSubmit, reset } = form;

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [problemRes] = await Promise.all([
                    ProblemsService.getProblemById(problemId),
                ]);

                const problem = problemRes.data.data;
                setOriginalProblem(problem);

                // Map problem data to form values
                const formValues = ProblemsService.mapProblemToDTO(problem);

                // We need to map the DTO back to form values format where needed
                // Specifically for topics and tags which expect objects in the form but IDs in DTO
                // But wait, mapProblemToDTO returns IDs for tags/topics.
                // The form expects objects for MultiSelect.
                // So we need to manually map IDs back to objects from the available lists.

                const selectedTopics = availableTopics.filter((t) =>
                    formValues.topicIds.includes(t.id)
                );
                const selectedTags = availableTags.filter((t) =>
                    formValues.tagIds.includes(t.id)
                );

                reset({
                    ...formValues,
                    topics: selectedTopics,
                    tags: selectedTags,
                    // Ensure arrays are initialized
                    sampleTestcases: formValues.sampleTestcases || [],
                    hints: formValues.hints || [],
                    testcaseFile: null, // File input cannot be pre-populated
                    testcaseFileUrl: problem.testcaseFileUrl,
                });
            } catch (err) {
                console.error('Failed to fetch problem data', err);
                toastService.error(tEdit('messages.loadError'));
                router.push('/problems');
            } finally {
                setIsLoading(false);
            }
        };
        if (availableTopics.length > 0 && availableTags.length > 0) {
            fetchData();
        }
    }, [problemId, reset, router, availableTopics, availableTags, tEdit]);

    const STEPS = [
        { title: t('steps.generalInfo'), description: 'General Info' },
        { title: t('steps.description'), description: 'Description' },
        { title: t('steps.constraints'), description: 'Constraints' },
        { title: t('steps.testCases'), description: 'Test Cases' },
        { title: t('steps.solutionHints'), description: 'Solution & Hints' },
    ];

    const handleCancel = async () => {
        const confirmed = await confirm({
            title: tEdit('cancelDialog.title'),
            message: tEdit('cancelDialog.message'),
            confirmText: tEdit('cancelDialog.yes'),
            cancelText: tEdit('cancelDialog.no'),
            color: 'red',
        });

        if (confirmed) {
            router.back();
        }
    };

    const onError = (errors: any) => {
        const newErrorSteps: number[] = [];

        // Step 1: General Info
        if (errors.title || errors.difficulty || errors.topics || errors.tags) {
            newErrorSteps.push(0);
        }

        // Step 2: Description
        if (errors.description) {
            newErrorSteps.push(1);
        }

        // Step 3: Constraints
        if (errors.constraints) {
            newErrorSteps.push(2);
        }

        // Step 4: Test Cases
        if (errors.testcaseFile || errors.sampleTestcases) {
            newErrorSteps.push(3);
        }

        // Step 5: Solution & Hints
        if (errors.officialSolutionContent || errors.hints) {
            newErrorSteps.push(4);
        }

        setErrorSteps(newErrorSteps);
        toastService.error(t('messages.fixErrors'));
    };

    const onSubmit = async (data: CreateProblemFormValues) => {
        if (!originalProblem) return;

        setIsSubmitting(true);
        setErrorSteps([]); // Reset errors

        try {
            // Construct the updated problem object
            // We need to merge the form data with the original problem ID
            const updatedProblem: CreateProblemRequest = {
                ...data,
                id: originalProblem.id,
                tagIds: data.tags.map((t: any) => t.id),
                topicIds: data.topics.map((t: any) => t.id),
                testcaseFile: null, // Handled separately in edit mode
                sampleTestcases:
                    data.sampleTestcases?.map((tc) => ({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        explanation: tc.explanation,
                    })) || [],
                hints: data.hints,
            };


            await ProblemsService.updateProblem(originalProblem.id, updatedProblem);

            toastService.success(tEdit('messages.updateSuccess'));
            router.push('/problems');
        } catch (err) {
            console.error('Error updating problem:', err);
            toastService.error(tEdit('messages.updateError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-900">
                {/* Stepper Skeleton */}
                <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="container py-4">
                        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-3 flex-1 min-w-[120px] justify-center">
                                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                    <Skeleton className="h-4 w-24 hidden sm:block" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="container py-8 flex-1">
                    <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="mb-6">
                            <Skeleton className="h-8 w-48" />
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-32 w-full" />
                            </div>

                            {/* Footer Buttons Skeleton */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-900">
            {/* Stepper Header */}
            <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="container">
                    <Stepper
                        steps={STEPS}
                        currentStep={currentStep}
                        onStepClick={setCurrentStep}
                        errorSteps={errorSteps}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="container py-8 flex-1">
                <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {STEPS[currentStep].title}
                        </h2>
                    </div>

                    <FormProvider {...form}>
                        <form
                            onSubmit={handleSubmit(onSubmit, onError)}
                            className="space-y-6"
                        >
                            {/* Step 1: General Information */}
                            {currentStep === 0 && (
                                <GeneralInformationStep
                                    availableTopics={availableTopics}
                                    availableTags={availableTags}
                                />
                            )}

                            {/* Step 2: Problem Description */}
                            {currentStep === 1 && <ProblemDescriptionStep />}

                            {/* Step 3: Constraints */}
                            {currentStep === 2 && <ConstraintsStep />}

                            {/* Step 4: Test Cases */}
                            {currentStep === 3 && <TestCasesStep isEditMode={true} problemId={problemId} />}

                            {/* Step 5: Solution & Hints */}
                            {currentStep === 4 && <SolutionHintsStep />}

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="min-w-[100px] cursor-pointer"
                                >
                                    {t('buttons.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="min-w-[100px] bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                                >
                                    {isSubmitting ? tEdit('buttons.updating') : tEdit('buttons.updateProblem')}
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>
    );
}
