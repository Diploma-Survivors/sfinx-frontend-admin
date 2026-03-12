"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Plus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { studyPlanService } from "@/services/study-plan-service";
import {
  AdminStudyPlanResponseDto,
  FilterStudyPlanDto,
} from "@/types/study-plan";
import { useToast } from "@/components/providers/toast-provider";
import Breadcrumbs from "@/components/layout/breadcrumbs";

import StudyPlanFilter from "@/components/study-plans/study-plan-filter";
import StudyPlanTable from "@/components/study-plans/study-plan-table";

export default function StudyPlansPage() {
  const t = useTranslations("StudyPlansPage");
  const locale = useLocale();
  const toast = useToast();

  const [data, setData] = useState<AdminStudyPlanResponseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<FilterStudyPlanDto>({
    page: 1,
    limit: 10,
    search: "",
  });

  const debouncedSearch = useDebounce(filters.search ?? "", 500);

  const fetchStudyPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await studyPlanService.getStudyPlans(
        {
          ...filters,
          search: debouncedSearch,
        },
        locale,
      );
      setData(res.data);
      setTotal(res.meta.total);
    } catch (error) {
      toast.error(t("fetchError"));
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.difficulty,
    filters.isPremium,
    filters.topicId,
    filters.tagId,
    filters.sortBy,
    filters.sortOrder,
    debouncedSearch,
    locale,
    toast,
  ]);

  useEffect(() => {
    fetchStudyPlans();
  }, [fetchStudyPlans]);

  const handleFilterChange = (key: keyof FilterStudyPlanDto, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" && { page: 1 }), // Reset to page 1 on filter change
    }));
  };

  const handlePublish = async (id: number) => {
    try {
      await studyPlanService.publishStudyPlan(id);
      toast.success(t("publishSuccess"));
      fetchStudyPlans();
    } catch (error) {
      toast.error(t("publishError"));
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await studyPlanService.archiveStudyPlan(id);
      toast.success(t("archiveSuccess"));
      fetchStudyPlans();
    } catch (error) {
      toast.error(t("archiveError"));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await studyPlanService.deleteStudyPlan(id);
      toast.success(t("deleteSuccess"));
      fetchStudyPlans();
    } catch (error) {
      toast.error(t("deleteError"));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("description")}
          </p>
        </div>
        <Link href="/study-plans/create">
          <Button className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            {t("createPlan")}
          </Button>
        </Link>
      </div>

      <StudyPlanFilter filters={filters} onFilterChange={handleFilterChange} />

      <StudyPlanTable
        data={data}
        isLoading={isLoading}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onArchive={handleArchive}
      />

      {total > 0 && (
        <DataTablePagination
          currentPage={filters.page || 1}
          totalPages={Math.ceil(total / (filters.limit || 10))}
          onPageChange={(page) => handleFilterChange("page", page)}
          meta={{
            page: filters.page || 1,
            limit: filters.limit || 10,
            total,
          }}
          entityName={t("title")}
        />
      )}
    </div>
  );
}
