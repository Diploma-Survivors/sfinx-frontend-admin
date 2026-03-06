"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useProblems from "@/hooks/use-problems";
import type { ProgrammingLanguage } from "@/types/languages";
import { Problem, ProblemEndpointType } from "@/types/problems";
import { FilterSolutionDto, SolutionSortBy } from "@/types/solution";
import type { Tag } from "@/types/tags";
import { Check, ChevronDown, Loader2, RotateCcw, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface SolutionFilterProps {
  filters: FilterSolutionDto;
  onFiltersChange: (newFilters: FilterSolutionDto) => void;
  onReset: () => void;
  tags: Tag[];
  languages: ProgrammingLanguage[];
}

export default function SolutionFilter({
  filters,
  onFiltersChange,
  onReset,
  tags,
  languages,
}: SolutionFilterProps) {
  const t = useTranslations("SolutionFilter");
  // Search states for dropdowns
  const [tagSearch, setTagSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");
  // Problem Filter State
  const [problemSearch, setProblemSearch] = useState("");
  const [accumulatedProblems, setAccumulatedProblems] = useState<Problem[]>([]);
  const [isProblemDropdownOpen, setIsProblemDropdownOpen] = useState(false);
  const problemObserverTarget = useRef<HTMLDivElement>(null);

  const {
    problems,
    meta: problemsMeta,
    isLoading: isProblemsLoading,
    handleKeywordChange: handleProblemKeywordChange,
    handlePageChange: handleProblemPageChange,
  } = useProblems(ProblemEndpointType.PROBLEM_MANAGEMENT);

  // Sync accumulated problems with fetched problems
  useEffect(() => {
    if (problemsMeta?.page === 1) {
      setAccumulatedProblems(problems);
    } else if (problems.length > 0) {
      setAccumulatedProblems((prev) => {
        const newProblems = problems.filter(
          (p) => !prev.some((existing) => existing.id === p.id),
        );
        return [...prev, ...newProblems];
      });
    }
  }, [problems, problemsMeta?.page]);

  // Handle problem search
  useEffect(() => {
    handleProblemKeywordChange(problemSearch);
  }, [problemSearch, handleProblemKeywordChange]);

  // Infinite scroll observer for problems
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          problemsMeta?.hasNextPage &&
          !isProblemsLoading
        ) {
          handleProblemPageChange((problemsMeta.page || 1) + 1);
        }
      },
      { threshold: 1.0 },
    );

    if (problemObserverTarget.current) {
      observer.observe(problemObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [
    problemsMeta?.hasNextPage,
    isProblemsLoading,
    handleProblemPageChange,
    problemsMeta?.page,
  ]);

  const handleProblemSelect = (problemId: number) => {
    onFiltersChange({
      ...filters,
      problemId: filters.problemId === problemId ? undefined : problemId,
    });
    setIsProblemDropdownOpen(false);
  };

  // Helper to handle multi-select changes
  const handleMultiSelectChange = (
    key: "tagIds" | "languageIds",
    value: number,
  ) => {
    const currentValues = (filters[key] as number[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: number) => v !== value)
      : [...currentValues, value];

    onFiltersChange({ ...filters, [key]: newValues });
  };

  const handleEditorialChange = (value: string) => {
    const isEditorial =
      value === "editorial" ? true : value === "user" ? false : undefined;
    onFiltersChange({ ...filters, isEditorial });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ ...filters, sortBy: value as SolutionSortBy });
  };

  // Filtered lists based on search
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()),
  );

  return (
    <div className="space-y-4 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Row 1: Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={filters.keyword || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, keyword: e.target.value })
            }
            className="pl-10 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <div>{t("sortByLabel")}</div>
          <Select
            value={filters.sortBy || SolutionSortBy.RECENT}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
              <SelectValue placeholder={t("sortByPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={SolutionSortBy.RECENT}
                className="cursor-pointer"
              >
                {t("recent")}
              </SelectItem>
              <SelectItem
                value={SolutionSortBy.MOST_VOTED}
                className="cursor-pointer"
              >
                {t("mostVoted")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Solution Type Filter (Editorial vs User) */}
        <Select
          value={
            filters.isEditorial === true
              ? "editorial"
              : filters.isEditorial === false
                ? "user"
                : "all"
          }
          onValueChange={handleEditorialChange}
        >
          <SelectTrigger className="w-[150px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
            <SelectValue placeholder={t("allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              {t("allTypes")}
            </SelectItem>
            <SelectItem value="editorial" className="cursor-pointer">
              {t("editorial")}
            </SelectItem>
            <SelectItem value="user" className="cursor-pointer">
              {t("user")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Problem Filter */}
        <DropdownMenu
          open={isProblemDropdownOpen}
          onOpenChange={setIsProblemDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer min-w-[150px] justify-between"
            >
              {filters.problemId ? (
                <span className="truncate max-w-[120px]">
                  {accumulatedProblems.find((p) => p.id === filters.problemId)
                    ?.title || `Problem ${filters.problemId}`}
                </span>
              ) : (
                t("selectProblem")
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-80 max-h-80 overflow-y-auto"
          >
            <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10 w-full box-border">
              <Input
                placeholder={t("searchProblems")}
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                className="h-8 text-xs focus-visible:ring-0 w-full"
              />
            </div>
            <DropdownMenuSeparator />
            {accumulatedProblems.length === 0 && !isProblemsLoading ? (
              <div className="p-2 text-sm text-slate-500">
                {t("noProblemFound")}
              </div>
            ) : (
              accumulatedProblems.map((problem) => (
                <DropdownMenuItem
                  key={problem.id}
                  className="flex items-center justify-between px-2 py-2 cursor-pointer"
                  onSelect={() => handleProblemSelect(problem.id)}
                >
                  <span className="text-sm truncate mr-2">{problem.title}</span>
                  {filters.problemId === problem.id && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </DropdownMenuItem>
              ))
            )}
            {isProblemsLoading && (
              <div className="flex justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            <div ref={problemObserverTarget} className="h-1" />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer flex items-center"
            >
              {t("tags")}
              {filters.tagIds && filters.tagIds.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 px-1.5 flex items-center justify-center"
                >
                  {filters.tagIds.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 max-h-80 overflow-y-auto"
          >
            <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10 w-full box-border">
              <Input
                placeholder={t("searchTags")}
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="h-8 text-xs focus-visible:ring-0 w-full"
              />
            </div>
            <DropdownMenuSeparator />
            {filteredTags.length === 0 ? (
              <div className="p-2 text-sm text-slate-500">
                {t("noTagsFound")}
              </div>
            ) : (
              filteredTags.map((tag) => {
                const isChecked = filters.tagIds?.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    className="flex items-center px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMultiSelectChange("tagIds", tag.id);
                    }}
                  >
                    <div
                      className={`flex items-center justify-center w-4 h-4 mr-2 border rounded ${isChecked ? "bg-green-700 border-green-700 text-white" : "border-slate-300"}`}
                    >
                      {isChecked && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-sm">{tag.name}</span>
                  </div>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Languages Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer flex items-center"
            >
              {t("languages")}
              {filters.languageIds && filters.languageIds.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 px-1.5 flex items-center justify-center"
                >
                  {filters.languageIds.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 max-h-80 overflow-y-auto"
          >
            <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10 w-full box-border">
              <Input
                placeholder={t("searchLanguages")}
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                className="h-8 text-xs focus-visible:ring-0 w-full"
              />
            </div>
            <DropdownMenuSeparator />
            {filteredLanguages.length === 0 ? (
              <div className="p-2 text-sm text-slate-500">
                {t("noLanguagesFound")}
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isChecked = filters.languageIds?.includes(lang.id);
                return (
                  <div
                    key={lang.id}
                    className="flex items-center px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMultiSelectChange("languageIds", lang.id);
                    }}
                  >
                    <div
                      className={`flex items-center justify-center w-4 h-4 mr-2 border rounded ${isChecked ? "bg-green-700 border-green-700 text-white" : "border-slate-300"}`}
                    >
                      {isChecked && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-sm">{lang.name}</span>
                  </div>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset Button */}
        <Button
          variant="ghost"
          onClick={() => {
            setProblemSearch("");
            setIsProblemDropdownOpen(false);
            setTagSearch("");
            setLanguageSearch("");
            onReset();
          }}
          className="h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}
