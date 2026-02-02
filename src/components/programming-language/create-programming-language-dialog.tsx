
import { useState } from 'react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { ProgrammingLanguageService } from '@/services/programing-language-service';
import { toastService } from '@/services/toasts-service';
import { useTranslations } from 'next-intl';

interface CreateProgrammingLanguageDialogProps {
    onSuccess: () => void;
}

export function CreateProgrammingLanguageDialog({ onSuccess }: CreateProgrammingLanguageDialogProps) {
    const t = useTranslations('CreateProgrammingLanguageDialog');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const formSchema = z.object({
        name: z.string().min(1, t('nameRequired')),
        judge0Id: z.string().optional(),
        monacoLanguage: z.string().optional(),
        starterCode: z.string().min(1, t('starterCodeRequired')),
    });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            judge0Id: '',
            monacoLanguage: '',
            starterCode: '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            await ProgrammingLanguageService.createProgrammingLanguage({
                name: values.name,
                judge0Id: values.judge0Id ? Number(values.judge0Id) : undefined,
                monacoLanguage: values.monacoLanguage,
                starterCode: values.starterCode,
                isActive: true, // Default to active
            });
            toastService.success(t('createSuccess'));
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error('Failed to create language:', error);
            toastService.error(t('createError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('create')}
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[550px] data-[state=open]:slide-in-from-top-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
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

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="judge0Id">{t('judge0IdLabel')}</Label>
                            <Input
                                id="judge0Id"
                                type="number"
                                placeholder={t('judge0IdPlaceholder')}
                                {...form.register('judge0Id')}
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
                            {loading ? t('creating') : t('create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
