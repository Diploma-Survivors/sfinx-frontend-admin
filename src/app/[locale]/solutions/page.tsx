"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FilterSolutionDto, Solution, SolutionSortBy } from "@/types/solution";
import { SolutionsService } from "@/services/solutions-service";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import SolutionTable from "@/components/solutions/solution-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function SolutionsPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("SolutionsPage");
  const problemId = searchParams.get("problemId")
    ? Number(searchParams.get("problemId"))
    : undefined;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState<SolutionSortBy>(SolutionSortBy.RECENT);

  const { data, isLoading } = useQuery({
    queryKey: ["solutions", problemId, page, limit, sortBy],
    queryFn: () => {
      const filters: FilterSolutionDto = {
        problemId,
        page,
        limit,
        sortBy,
      };
      return SolutionsService.getSolutions(filters);
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
        {problemId && (
          <Button asChild>
            <Link href={`/problems/${problemId}/solutions/new`}>
              <Plus className="mr-2 h-4 w-4" />
              {t("createSolution")}
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-background rounded-lg border shadow-sm">
        <SolutionTable
          solutions={data?.data || []}
          meta={data?.meta || null}
          isLoading={isLoading}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
