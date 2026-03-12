"use client";

import StudyPlanEditForm from "@/components/study-plans/study-plan-edit-form";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function EditStudyPlanPage() {
  const t = useTranslations("EditStudyPlanPage");
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {t("title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {t("description")}
        </p>
      </div>

      <StudyPlanEditForm id={id} />
    </div>
  );
}
