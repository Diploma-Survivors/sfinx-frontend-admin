"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { FilterSolutionDto, Solution, SolutionSortBy } from "@/types/solution";
import { SolutionsService } from "@/services/solutions-service";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import SolutionTable from "@/components/solutions/solution-table";
import SolutionFilter from "@/components/solution-filters/solution-filter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "@/i18n/routing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { useQueryClient } from "@tanstack/react-query";

function SolutionsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("SolutionsPage");
  const problemId = searchParams.get("problemId")
    ? Number(searchParams.get("problemId"))
    : undefined;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [solutionToDelete, setSolutionToDelete] = useState<Solution | null>(
    null,
  );

  const toast = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<FilterSolutionDto>({
    problemId: problemId,
    sortBy: SolutionSortBy.RECENT,
  });

  const { tags: availableTags, languages: availableLanguages } = useAppSelector(
    (state) => state.metadata,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["solutions", page, limit, filters],
    queryFn: () => {
      const activeFilters: FilterSolutionDto = {
        ...filters,
        page,
        limit,
      };
      return SolutionsService.getSolutions(activeFilters);
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFiltersChange = (newFilters: FilterSolutionDto) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      problemId: undefined,
      sortBy: SolutionSortBy.RECENT,
    });
    setPage(1);

    // Clear URL parameters if any exist
    if (problemId) {
      router.push("/solutions");
    }
  };

  const handleDeleteSolution = async () => {
    if (!solutionToDelete) return;
    try {
      await SolutionsService.deleteSolutionAdmin(solutionToDelete.id);
      toast.success(t("deleteSuccess"));
      setSolutionToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["solutions"] });
    } catch (error) {
      toast.error(t("deleteError"));
      setSolutionToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("solutionsList")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {problemId
              ? t("viewingSolutionsForProblem", { problemId })
              : t("viewingAllSolutions")}
          </p>
        </div>
        <Button asChild>
          <Link
            href={
              problemId
                ? `/solutions/new?problemId=${problemId}`
                : `/solutions/new`
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("createSolution")}
          </Link>
        </Button>
      </div>

      <SolutionFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        tags={availableTags}
        languages={availableLanguages}
      />

      <div className="bg-background rounded-lg border shadow-sm">
        <SolutionTable
          solutions={data?.data || []}
          meta={data?.meta || null}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onDelete={setSolutionToDelete}
        />
      </div>

      <AlertDialog
        open={!!solutionToDelete}
        onOpenChange={(open: boolean) => !open && setSolutionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteSolution}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function SolutionsPage() {
  return (
    <Suspense>
      <SolutionsPageContent />
    </Suspense>
  );
}
