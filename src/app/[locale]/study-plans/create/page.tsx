"use client";

import StudyPlanCreateForm from "@/components/study-plans/study-plan-create-form";
import { useTranslations } from "next-intl";

export default function CreateStudyPlanPage() {
  const t = useTranslations("CreateStudyPlanPage");

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

      <StudyPlanCreateForm />
    </div>
  );
}
