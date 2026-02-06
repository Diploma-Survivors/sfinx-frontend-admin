'use client';

import ProblemCreateForm from '@/components/problems/problem-create-form';
import { useTranslations } from 'next-intl';

export default function CreateProblemPage() {
  const t = useTranslations('CreateProblemPage');

  return (
    <div className="container mx-auto py-8 px-6 pt-0">
      <div className="mb-8">
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t('title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {t('description')}
          </p>
        </div>
      </div>

      <ProblemCreateForm />
    </div>
  );
}
