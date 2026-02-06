'use client'
import ProblemEditForm from '@/components/problems/problem-edit-form';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';



export default function EditProblemPage() {
  const params = useParams();
  const id = params?.id as string;
  const t = useTranslations('EditProblemPage');

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

      <ProblemEditForm problemId={Number.parseInt(id)} />
    </div>
  );
}
