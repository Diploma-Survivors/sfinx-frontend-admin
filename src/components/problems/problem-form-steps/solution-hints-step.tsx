import { Controller, useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import MarkdownEditor from '@/components/markdown-editor/markdown-editor';
import { cn } from '@/lib/utils';
import type { CreateProblemFormValues } from '@/components/problems/problem-create-form';
import { useTranslations } from 'next-intl';

export function SolutionHintsStep() {
  const t = useTranslations('CreateProblemForm.solutionHints');
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateProblemFormValues>();

  return (
    <div className="space-y-6">
      {/* Official Solution Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">{t('officialSolutionLabel')}</Label>
            <p className="text-sm text-slate-500">
              {t('officialSolutionDescription')}
            </p>
          </div>
          <Controller
            name="hasOfficialSolution"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="scale-110"
              />
            )}
          />
        </div>

        {watch('hasOfficialSolution') && (
          <div className="h-[500px] animate-in fade-in slide-in-from-top-4 duration-300">
            <Controller
              name="officialSolutionContent"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  content={field.value || ''}
                  onChange={field.onChange}
                  className="h-full"
                />
              )}
            />
          </div>
        )}
        {errors.officialSolutionContent && (
          <p className="text-sm text-red-500">
            {errors.officialSolutionContent.message}
          </p>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 my-6" />

      {/* Hints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">{t('hintsLabel')}</Label>
            <p className="text-sm text-slate-500">
              {t('hintsDescription')}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const current = watch('hints') || [];
              setValue(
                'hints',
                [...current, { content: '', order: current.length + 1 }],
                { shouldValidate: true }
              );
            }}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('addHint')}
          </Button>
        </div>

        <div className="space-y-4">
          {watch('hints')?.map((hint, index) => (
            <div
              key={index}
              className="flex gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <Badge variant="outline" className="mt-2 shrink-0">
                {t('hintPrefix')} {index + 1}
              </Badge>
              <div className="flex-1">
                <Textarea
                  value={hint.content}
                  onChange={(e) => {
                    const current = [...(watch('hints') || [])];
                    current[index] = {
                      ...current[index],
                      content: e.target.value,
                    };
                    setValue('hints', current, { shouldValidate: true });
                  }}
                  placeholder={t('hintPlaceholder', { index: index + 1 })}
                  className={cn(
                    'min-h-[80px] focus-visible:ring-0 focus-visible:ring-offset-0',
                    errors.hints?.[index]?.content && 'border-red-500'
                  )}
                />
                {errors.hints?.[index]?.content && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.hints[index]?.content?.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const current = watch('hints') || [];
                  setValue(
                    'hints',
                    current.filter((_, i) => i !== index),
                    { shouldValidate: true }
                  );
                }}
                className="text-slate-400 hover:text-red-500 cursor-pointer mt-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(!watch('hints') || watch('hints')?.length === 0) && (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              {t('noHints')}
            </div>
          )}
        </div>
        {errors.hints && (
          <p className="text-sm text-red-500">
            {errors.hints.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
