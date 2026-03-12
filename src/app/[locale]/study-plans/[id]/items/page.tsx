"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";

import StudyPlanItemsManager from "@/components/study-plans/study-plan-items-manager";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { studyPlanService } from "@/services/study-plan-service";
import {
  AdminStudyPlanDetailResponseDto,
  AddStudyPlanItemDto,
} from "@/types/study-plan";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProblemTable, {
  ProblemTableMode,
} from "@/components/problems/problem-table";
import useProblems from "@/hooks/use-problems";
import { ProblemEndpointType, Problem } from "@/types/problems";
import ProblemFilter from "@/components/problem-filters/problem-filter";
import { useAppSelector } from "@/store/hooks";

export default function StudyPlanItemsPage() {
  const t = useTranslations("StudyPlanItemsPage");
  const params = useParams();
  const id = Number(params.id);
  const toast = useToast();

  const [studyPlan, setStudyPlan] =
    useState<AdminStudyPlanDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Problem Selection Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetDay, setTargetDay] = useState<number | null>(null);
  const [isAddingProblem, setIsAddingProblem] = useState(false);

  // Problems List hook for search
  const {
    problems,
    meta,
    totalCount,
    isLoading: isProblemsLoading,
    keyword,
    filters,
    sortBy,
    sortOrder,
    handleFiltersChange,
    handleKeywordChange,
    handleSortByChange,
    handleSortOrderChange,
    handleSearch,
    handleReset,
    handlePageChange,
  } = useProblems(ProblemEndpointType.PROBLEM_MANAGEMENT);

  const { tags, topics } = useAppSelector((state) => state.metadata);

  const fetchStudyPlan = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await studyPlanService.getStudyPlanById(id);
      setStudyPlan(response.data);
    } catch (error) {
      toast.error(t("fetchError"));
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchStudyPlan();
  }, [fetchStudyPlan]);

  const handleOpenAddProblem = (day: number) => {
    setTargetDay(day);
    setIsDialogOpen(true);
  };

  const handleSelectProblem = async (problem: Problem) => {
    if (!targetDay) return;

    setIsAddingProblem(true);

    try {
      const payload: AddStudyPlanItemDto = {
        problemId: problem.id,
        dayNumber: targetDay,
      };

      await studyPlanService.addItem(id, payload);
      toast.success(t("addSuccess"));
      setIsDialogOpen(false);
      fetchStudyPlan(); // Refresh
    } catch (error) {
      toast.error(t("actionError"));
    } finally {
      setIsAddingProblem(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-[400px] w-full mt-4 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {t("title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {studyPlan ? t("description", { name: studyPlan.name }) : ""}
        </p>
      </div>

      {studyPlan && (
        <StudyPlanItemsManager
          planId={id}
          initialData={studyPlan}
          onRefresh={fetchStudyPlan}
          onAddProblemClick={handleOpenAddProblem}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>
              {t("addProblemToDay", { day: targetDay ?? 0 })}
            </DialogTitle>
            <DialogDescription>{t("searchProblem")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            <ProblemFilter
              keyWord={keyword}
              filters={filters}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onKeywordChange={handleKeywordChange}
              onFiltersChange={handleFiltersChange}
              onSortByChange={handleSortByChange}
              onSortOrderChange={handleSortOrderChange}
              onSearch={handleSearch}
              onReset={handleReset}
              isLoading={isProblemsLoading}
              tags={tags}
              topics={topics}
            />

            <div className="border rounded-md overflow-hidden relative">
              {isAddingProblem && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center backdrop-blur-sm">
                  <div className="font-medium">{t("addingProblem")}</div>
                </div>
              )}
              <ProblemTable
                problems={problems}
                meta={meta}
                totalCount={totalCount}
                onPageChange={handlePageChange}
                isLoading={isProblemsLoading}
                mode={ProblemTableMode.SELECT}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={handleSortByChange}
                onSortOrderChange={handleSortOrderChange}
                onProblemSelect={handleSelectProblem}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
