
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Editor from '@monaco-editor/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProgrammingLanguageService } from '@/services/programing-language-service';
import { toastService } from '@/services/toasts-service';
import { useTranslations } from 'next-intl';
import { ProgrammingLanguage } from '@/types/programing-language-type';

interface EditProgrammingLanguageDialogProps {
    language: ProgrammingLanguage | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditProgrammingLanguageDialog({
    language,
    open,
    onOpenChange,
    onSuccess,
}: EditProgrammingLanguageDialogProps) {
    const t = useTranslations('EditProgrammingLanguageDialog');
    const [loading, setLoading] = useState(false);

    const formSchema = z.object({
        name: z.string().min(1, t('nameRequired')),
        judge0Id: z.string().optional(),
        monacoLanguage: z.string().optional(),
        orderIndex: z.string().optional(),
        starterCode: z.string().min(1, t('starterCodeRequired')),
    });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            judge0Id: '',
            monacoLanguage: '',
            orderIndex: '1',
            starterCode: '',
        },
    });

    useEffect(() => {
        if (language) {
            form.reset({
                name: language.name,
                judge0Id: language.judge0Id?.toString() || '',
                monacoLanguage: language.monacoLanguage || '',
                orderIndex: language.orderIndex?.toString() || '',
                starterCode: language.starterCode || '',
            });
        }
    }, [language, form]);

    const onSubmit = async (values: FormValues) => {
        if (!language) return;

        setLoading(true);
        try {
            await ProgrammingLanguageService.updateProgrammingLanguage(language.id, {
                name: values.name,
                judge0Id: values.judge0Id ? Number(values.judge0Id) : undefined,
                monacoLanguage: values.monacoLanguage,
                orderIndex: values.orderIndex ? Number(values.orderIndex) : undefined,
                starterCode: values.starterCode,
                // We typically don't update isActive here unless explicitly asked, keeping existing value or ignoring it if backend doesn't require it for update
            });
            toastService.success(t('updateSuccess'));
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to update language:', error);
            toastService.error(t('updateError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] data-[state=open]:slide-in-from-top-0">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('nameLabel')}</Label>
                            <Input
                                id="name"
                                placeholder={t('namePlaceholder')}
                                {...form.register('name')}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="monacoLanguage">{t('monacoLanguageLabel')}</Label>
                            <Input
                                id="monacoLanguage"
                                placeholder={t('monacoLanguagePlaceholder')}
                                {...form.register('monacoLanguage')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="judge0Id">{t('judge0IdLabel')}</Label>
                            <Input
                                id="judge0Id"
                                type="number"
                                placeholder={t('judge0IdPlaceholder')}
                                {...form.register('judge0Id')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orderIndex">{t('orderIndexLabel')}</Label>
                            <Input
                                id="orderIndex"
                                type="number"
                                placeholder={t('orderIndexPlaceholder')}
                                {...form.register('orderIndex')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="starterCode">{t('starterCodeLabel')}</Label>
                        <div className="h-[200px] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                            <Controller
                                name="starterCode"
                                control={form.control}
                                render={({ field }) => (
                                    <Editor
                                        height="100%"
                                        defaultLanguage="cpp"
                                        language={form.watch('monacoLanguage') || 'cpp'}
                                        theme="light"
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        options={{
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            fontSize: 14,
                                            lineNumbers: 'on',
                                            automaticLayout: true,
                                        }}
                                    />
                                )}
                            />
                        </div>
                        {form.formState.errors.starterCode && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.starterCode.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? t('saving') : t('save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
