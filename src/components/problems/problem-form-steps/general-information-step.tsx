import { Controller, useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { SelectProblemsModal } from '@/components/problems/related-problems-modal';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIFFICULTY_OPTIONS } from '@/types/problems';
import type { Topic } from '@/types/topics';
import type { Tag } from '@/types/tags';
import type { CreateProblemFormValues } from '@/components/problems/problem-create-form';
import { useTranslations } from 'next-intl';

interface GeneralInformationStepProps {
  availableTopics: Topic[];
  availableTags: Tag[];
}

export function GeneralInformationStep({
  availableTopics,
  availableTags,
}: GeneralInformationStepProps) {
  const t = useTranslations('CreateProblemForm.generalInfo');
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<CreateProblemFormValues>();

  // Map topics and tags to options for MultiSelect
  const topicOptions = availableTopics.map((topic) => ({
    label: topic.name,
    value: topic.id.toString(),
  }));

  const tagOptions = availableTags.map((tag) => ({
    label: tag.name,
    value: tag.id.toString(),
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          {t('titleLabel')} <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="title"
              placeholder={t('titlePlaceholder')}
              className={cn(
                'focus-visible:ring-0 focus-visible:ring-offset-0',
                errors.title ? 'border-red-500' : ''
              )}
            />
          )}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="difficulty">{t('difficultyLabel')}</Label>
          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="focus:ring-0 focus:ring-offset-0 cursor-pointer">
                  <SelectValue placeholder={t('difficultyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <Controller
            name="isPremium"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="isPremium"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="cursor-pointer"
              />
            )}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="isPremium"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t('premiumLabel')}
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('premiumDescription')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('topicsLabel')}</Label>
        <MultiSelect
          options={topicOptions}
          selectedValues={
            watch('topics')?.map((t: any) => t.id.toString()) || []
          }
          onChange={(values) => {
            const selectedTopics = values
              .map((v) => availableTopics.find((t) => t.id.toString() === v))
              .filter(Boolean);
            setValue('topics', selectedTopics as any);
          }}
          placeholder={t('topicsPlaceholder')}
          searchPlaceholder={t('topicsSearchPlaceholder')}
        />
        {errors.topics && (
          <p className="text-sm text-red-500">
            {errors.topics.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t('tagsLabel')}</Label>
        <MultiSelect
          options={tagOptions}
          selectedValues={watch('tags')?.map((t: any) => t.id.toString()) || []}
          onChange={(values) => {
            const selectedTags = values
              .map((v) => availableTags.find((t) => t.id.toString() === v))
              .filter(Boolean);
            setValue('tags', selectedTags as any);
          }}
          placeholder={t('tagsPlaceholder')}
          searchPlaceholder={t('tagsSearchPlaceholder')}
        />
        {errors.tags && (
          <p className="text-sm text-red-500">
            {errors.tags.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t('similarProblemsLabel')}</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Display selected similar problems */}
          {watch('similarProblems')?.map((id) => (
            <Badge key={id} variant="outline" className="gap-1">
              {t('problemPrefix')}{id}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const current = watch('similarProblems') || [];
                  setValue(
                    'similarProblems',
                    current.filter((pid) => pid !== id)
                  );
                }}
              />
            </Badge>
          ))}
        </div>
        <SelectProblemsModal
          title={t('selectSimilarProblems')}
          selectedProblemIds={watch('similarProblems') || []}
          onProblemsSelect={(problems) => {
            const newIds = problems.map((p) => p.id);
            const currentIds = watch('similarProblems') || [];
            // Merge and dedupe
            const uniqueIds = Array.from(new Set([...currentIds, ...newIds]));
            setValue('similarProblems', uniqueIds);
          }}
        />
      </div>
    </div>
  );
}
