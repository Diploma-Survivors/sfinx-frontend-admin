import { Controller, useFormContext } from 'react-hook-form';
import MarkdownEditor from '@/components/markdown-editor/markdown-editor';
import { cn } from '@/lib/utils';
import type { CreateProblemFormValues } from '@/components/problems/problem-create-form';

export function ProblemDescriptionStep() {
  const { control } = useFormContext<CreateProblemFormValues>();

  return (
    <div className="h-[600px]">
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <div className="h-full flex flex-col gap-2">
            <MarkdownEditor
              content={field.value}
              onChange={field.onChange}
              className={cn('h-full', fieldState.error && 'border-red-500')}
            />
            {fieldState.error && (
              <p className="text-sm text-red-500">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
}
