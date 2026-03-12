"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import StudyPlanTable, {
  StudyPlanTableMode,
} from "@/components/study-plans/study-plan-table";
import StudyPlanFilter from "@/components/study-plans/study-plan-filter";
import useStudyPlans from "@/hooks/use-study-plans";
import { AdminStudyPlanResponseDto, StudyPlanStatus } from "@/types/study-plan";

interface SelectStudyPlansModalProps {
  title: string;
  selectedPlanIds: number[];
  onPlansSelect: (plans: AdminStudyPlanResponseDto[]) => void;
  excludePlanId?: number;
}

export function SelectStudyPlansModal({
  title,
  selectedPlanIds,
  onPlansSelect,
  excludePlanId,
}: SelectStudyPlansModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<number>>(
    new Set(selectedPlanIds),
  );
  const t = useTranslations("SelectProblemsModal"); // Reusing translations for "Add Problems" -> "Add Plans"
  const tStudyPlan = useTranslations("StudyPlanTable");

  // Sync with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIds(new Set(selectedPlanIds));
    }
  }, [isOpen, selectedPlanIds]);

  const {
    studyPlans,
    isLoading,
    totalCount,
    filters,
    handleFilterChange,
    handlePageChange,
    handleReset,
  } = useStudyPlans({
    status: StudyPlanStatus.PUBLISHED, // Only select published plans for similarity
  });

  // Filter out the current plan if we're in edit mode
  const filteredPlans = excludePlanId
    ? studyPlans.filter((p) => p.id !== excludePlanId)
    : studyPlans;

  const handleMultipleSelect = (selectedPlans: AdminStudyPlanResponseDto[]) => {
    onPlansSelect(selectedPlans);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-slate-500 font-normal h-10 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:text-primary transition-all shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("addPlans")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-950">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <StudyPlanFilter
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          <StudyPlanTable
            data={filteredPlans}
            isLoading={isLoading}
            mode={StudyPlanTableMode.MULTIPLE_SELECT}
            initialSelectedIds={localSelectedIds}
            onMultipleSelect={handleMultipleSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
