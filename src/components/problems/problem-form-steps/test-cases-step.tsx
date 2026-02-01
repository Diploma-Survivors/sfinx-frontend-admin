import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileJson, CloudUpload, Plus, X, Loader2 } from 'lucide-react';
import { toastService } from '@/services/toasts-service';
import {
  validateTestcaseFileFormat,
  validateTestcaseFileContent,
} from '@/lib/utils/testcase-file-validations';
import { cn } from '@/lib/utils';
import type { CreateProblemFormValues } from '@/components/problems/problem-create-form';
import { useTranslations } from 'next-intl';
import { ProblemsService } from '@/services/problems-service';
import { useDialog } from '@/components/providers/dialog-provider';
import { Tooltip } from '@/components/ui/tooltip';

interface TestCasesStepProps {
  isEditMode?: boolean;
  problemId?: number;
}

export function TestCasesStep({ isEditMode, problemId }: TestCasesStepProps) {
  const t = useTranslations('CreateProblemForm.testCases');
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateProblemFormValues>();
  const { confirm } = useDialog();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileRemove = async () => {
    if (isEditMode && problemId) {
      const confirmed = await confirm({
        title: t('removeFileConfirmTitle'),
        message: t('removeFileConfirmMessage'),
        confirmText: t('removeFileConfirmYes'),
        cancelText: t('removeFileConfirmNo'),
        color: 'red',
      });

      if (!confirmed) return;

      setIsUploading(true);
      try {
        await ProblemsService.removeTestcaseFile(problemId);
        setValue('testcaseFileUrl', undefined, { shouldValidate: true });
        toastService.success(t('fileRemovedSuccess'));
      } catch (error) {
        console.error('Remove failed', error);
        toastService.error(t('fileRemoveError'));
      } finally {
        setIsUploading(false);
      }
    } else {
      setValue('testcaseFile', null, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold mb-2">
          <FileJson className="h-5 w-5" />
          {t('instructionsTitle')}
        </h4>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          {t('instructions')}
        </p>
      </div>

      {/* Hidden Test Cases Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            {t('systemTestCasesLabel')}
          </Label>
          <span className="text-xs text-slate-500">
            {t('systemTestCasesDescription')}
          </span>
        </div>

        {!(watch('testcaseFile') || (isEditMode && watch('testcaseFileUrl'))) ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer relative group">
            <Input
              type="file"
              accept=".json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formatValidation = validateTestcaseFileFormat(file);
                if (!formatValidation.isValid) {
                  toastService.error(
                    formatValidation.error || t('invalidFormat')
                  );
                  return;
                }

                const text = await file.text();
                const contentValidation = validateTestcaseFileContent(text);
                if (!contentValidation.isValid) {
                  toastService.error(
                    contentValidation.error || t('invalidContent')
                  );
                  return;
                }

                if (isEditMode && problemId) {
                  setIsUploading(true);
                  try {
                    await ProblemsService.uploadTestcaseFile(problemId, file);
                    setValue('testcaseFileUrl', 'uploaded', { shouldValidate: true });
                    toastService.success(t('validFileLoaded', { count: contentValidation.testcaseCount || 0 }));
                  } catch (error) {
                    toastService.error('Upload failed');
                  } finally {
                    setIsUploading(false);
                  }
                } else {
                  setValue('testcaseFile', file, { shouldValidate: true });
                  toastService.success(
                    t('validFileLoaded', { count: contentValidation.testcaseCount || 0 })
                  );
                }
              }}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-slate-500">Uploading...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    <span className="text-green-600 dark:text-green-500">
                      {t('uploadClick')}
                    </span>{' '}
                    {t('uploadDrag')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t('uploadFormat')}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between bg-white dark:bg-slate-950 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                <FileJson className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {watch('testcaseFile')?.name || (watch('testcaseFileUrl') ? 'Testcase File' : '')}
                </p>
                <p className="text-xs text-slate-500">
                  {watch('testcaseFile') ? `${(watch('testcaseFile').size / 1024 / 1024).toFixed(2)} MB •` : ''}
                  {watch('testcaseFile') && t('uploadedJustNow')}
                </p>
                {isEditMode && watch('testcaseFileUrl') && !watch('testcaseFile') && (
                  <Tooltip content={t('rightClickToSave')}>
                    <a
                      href={watch('testcaseFileUrl')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-auto p-0 text-xs text-blue-600 hover:underline flex items-center gap-1"
                      download={`testcase-${problemId || 'file'}.json`}
                    >
                      Download
                    </a>
                  </Tooltip>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleFileRemove}
              disabled={isUploading}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </Button>
          </div>
        )}
        {errors.testcaseFile && (
          <p className="text-sm text-red-500">
            {errors.testcaseFile.message as string}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">{t('sampleTestCasesLabel')}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const current = watch('sampleTestcases') || [];
              setValue(
                'sampleTestcases',
                [...current, { input: '', expectedOutput: '', explanation: '' }],
                { shouldValidate: true }
              );
            }}
            className="text-green-600 border-green-200 hover:bg-green-50 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('addSampleTestCase')}
          </Button>
        </div>

        {watch('sampleTestcases')?.map((sampleTestCase, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50"
          >
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{t('examplePrefix')} {index + 1}</Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const current = watch('sampleTestcases') || [];
                  setValue(
                    'sampleTestcases',
                    current.filter((_, i) => i !== index),
                    { shouldValidate: true }
                  );
                }}
                className="text-slate-400 hover:text-red-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('inputLabel')}</Label>
                <Textarea
                  value={sampleTestCase.input}
                  onChange={(e) => {
                    const current = [...watch('sampleTestcases')];
                    current[index].input = e.target.value;
                    setValue('sampleTestcases', current, {
                      shouldValidate: true,
                    });
                  }}
                  placeholder={t('inputPlaceholder')}
                  className={cn(
                    'font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0',
                    errors.sampleTestcases?.[index]?.input && 'border-red-500'
                  )}
                />
                {errors.sampleTestcases?.[index]?.input && (
                  <p className="text-sm text-red-500">
                    {errors.sampleTestcases[index]?.input?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('outputLabel')}</Label>
                <Textarea
                  value={sampleTestCase.expectedOutput}
                  onChange={(e) => {
                    const current = [...watch('sampleTestcases')];
                    current[index].expectedOutput = e.target.value;
                    setValue('sampleTestcases', current, {
                      shouldValidate: true,
                    });
                  }}
                  placeholder={t('outputPlaceholder')}
                  className={cn(
                    'font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0',
                    errors.sampleTestcases?.[index]?.expectedOutput && 'border-red-500'
                  )}
                />
                {errors.sampleTestcases?.[index]?.expectedOutput && (
                  <p className="text-sm text-red-500">
                    {errors.sampleTestcases[index]?.expectedOutput?.message}
                  </p>
                )}
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label>{t('explanationLabel')}</Label>
                <Textarea
                  value={sampleTestCase.explanation || ''}
                  onChange={(e) => {
                    const current = [...watch('sampleTestcases')];
                    current[index].explanation = e.target.value;
                    setValue('sampleTestcases', current, {
                      shouldValidate: true,
                    });
                  }}
                  placeholder={t('explanationPlaceholder')}
                  className="text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {
        errors.sampleTestcases && (
          <p className="text-sm text-red-500">
            {errors.sampleTestcases.message as string}
          </p>
        )
      }
    </div >
  );
}
