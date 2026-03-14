"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SubmissionFilters,
  SubmissionSortBy,
  SubmissionStatus,
} from "@/types/submissions";
import { ProgrammingLanguage } from "@/types/languages";
import {
  ChevronDown,
  RotateCcw,
  Check,
  Loader2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import useContest from "@/hooks/use-contest";
import useProblems from "@/hooks/use-problems";
import { ProblemEndpointType, Problem, SortOrder } from "@/types/problems";
import { Contest } from "@/types/contest";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/ui/tooltip";

import { getStatusLabel } from "@/services/submissions-service";
import useUsers from "@/hooks/use-users";
import { UserProfile } from "@/types/user";

interface SubmissionFilterProps {
  filters: SubmissionFilters;
  onFiltersChange: (newFilters: SubmissionFilters) => void;
  onReset: () => void;
  isLoading: boolean;
  languages: ProgrammingLanguage[];
}

export default function SubmissionFilter({
  filters,
  onFiltersChange,
  onReset,
  languages,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: SubmissionFilterProps & {
  sortBy: SubmissionSortBy;
  onSortByChange: (sortBy: SubmissionSortBy) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}) {
  const t = useTranslations("SubmissionFilter");
  const tGeneral = useTranslations("General");
  // Problem Filter State
  const [problemSearch, setProblemSearch] = useState("");
  const [accumulatedProblems, setAccumulatedProblems] = useState<Problem[]>([]);
  const [isProblemDropdownOpen, setIsProblemDropdownOpen] = useState(false);
  const problemObserverTarget = useRef<HTMLDivElement>(null);

  // Contest Filter State
  const [contestSearch, setContestSearch] = useState("");
  const [accumulatedContests, setAccumulatedContests] = useState<Contest[]>([]);
  const [isContestDropdownOpen, setIsContestDropdownOpen] = useState(false);
  const contestObserverTarget = useRef<HTMLDivElement>(null);

  const {
    problems,
    meta: problemsMeta,
    isLoading: isProblemsLoading,
    handleKeywordChange: handleProblemKeywordChange,
    handlePageChange: handleProblemPageChange,
  } = useProblems(ProblemEndpointType.PROBLEM_MANAGEMENT);

  const {
    contests,
    meta: contestsMeta,
    isLoading: isContestsLoading,
    handleKeywordChange: handleContestKeywordChange,
    handlePageChange: handleContestPageChange,
  } = useContest();

  const {
    users,
    meta: usersMeta,
    isLoading: isUsersLoading,
    handleKeywordChange: handleUserKeywordChange,
    handlePageChange: handleUserPageChange,
  } = useUsers();

  // User Filter State
  const [userSearch, setUserSearch] = useState("");
  const [accumulatedUsers, setAccumulatedUsers] = useState<UserProfile[]>([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userObserverTarget = useRef<HTMLDivElement>(null);

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

  // Sync accumulated contests with fetched contests
  useEffect(() => {
    if (contestsMeta?.page === 1) {
      setAccumulatedContests(contests);
    } else if (contests.length > 0) {
      setAccumulatedContests((prev) => {
        const newContests = contests.filter(
          (c) => !prev.some((existing) => existing.id === c.id),
        );
        return [...prev, ...newContests];
      });
    }
  }, [contests, contestsMeta?.page]);

  // Sync accumulated users with fetched users
  useEffect(() => {
    if (usersMeta?.page === 1) {
      setAccumulatedUsers(users);
    } else if (users.length > 0) {
      setAccumulatedUsers((prev) => {
        const newUsers = users.filter(
          (u) => !prev.some((existing) => existing.id === u.id),
        );
        return [...prev, ...newUsers];
      });
    }
  }, [users, usersMeta?.page]);

  // Handle problem search
  useEffect(() => {
    handleProblemKeywordChange(problemSearch);
  }, [problemSearch, handleProblemKeywordChange]);

  // Handle contest search
  useEffect(() => {
    handleContestKeywordChange(contestSearch);
  }, [contestSearch, handleContestKeywordChange]);

  // Handle user search
  useEffect(() => {
    handleUserKeywordChange(userSearch);
  }, [userSearch, handleUserKeywordChange]);

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

  // Infinite scroll observer for contests
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          contestsMeta?.hasNextPage &&
          !isContestsLoading
        ) {
          handleContestPageChange((contestsMeta.page || 1) + 1);
        }
      },
      { threshold: 1.0 },
    );

    if (contestObserverTarget.current) {
      observer.observe(contestObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [
    contestsMeta?.hasNextPage,
    isContestsLoading,
    handleContestPageChange,
    contestsMeta?.page,
  ]);

  // Infinite scroll observer for users
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          usersMeta?.hasNextPage &&
          !isUsersLoading
        ) {
          handleUserPageChange((usersMeta.page || 1) + 1);
        }
      },
      { threshold: 1.0 },
    );

    if (userObserverTarget.current) {
      observer.observe(userObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [
    usersMeta?.hasNextPage,
    isUsersLoading,
    handleUserPageChange,
    usersMeta?.page,
  ]);

  // Language Filter
  const [languageSearch, setLanguageSearch] = useState("");
  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()),
  );

  const handleContestSelect = (contestId: number) => {
    onFiltersChange({
      ...filters,
      contestId: filters.contestId === contestId ? undefined : contestId,
    });
    setIsContestDropdownOpen(false);
  };

  // Status Filter Logic
  // Status Filter Logic
  const handleStatusChange = (status: SubmissionStatus) => {
    onFiltersChange({ ...filters, status });
  };

  const handleProblemSelect = (problemId: number) => {
    onFiltersChange({
      ...filters,
      problemId: filters.problemId === problemId ? undefined : problemId,
    });
    setIsProblemDropdownOpen(false);
  };

  const handleLanguageSelect = (languageId: number) => {
    onFiltersChange({
      ...filters,
      languageId: filters.languageId === languageId ? undefined : languageId,
    });
  };

  const handleUserSelect = (userId: number) => {
    onFiltersChange({
      ...filters,
      userId: filters.userId === userId ? undefined : userId,
    });
    setIsUserDropdownOpen(false);
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, fromDate: e.target.value || undefined });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, toDate: e.target.value || undefined });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Column 1: Filters (3/4 width) */}
        <div className="lg:col-span-3 flex flex-wrap items-center gap-3">
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
                  t("problems")
                )}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 max-h-80 overflow-y-auto"
            >
              <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10">
                <Input
                  placeholder={t("searchProblems")}
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  className="h-8 text-xs focus-visible:ring-0"
                />
              </div>
              <DropdownMenuSeparator />
              {accumulatedProblems.length === 0 && !isProblemsLoading ? (
                <div className="p-2 text-sm text-slate-500">
                  {t("noProblemsFound")}
                </div>
              ) : (
                accumulatedProblems.map((problem) => (
                  <DropdownMenuItem
                    key={problem.id}
                    className="flex items-center justify-between px-2 py-2 cursor-pointer"
                    onSelect={() => handleProblemSelect(problem.id)}
                  >
                    <span className="text-sm truncate mr-2">
                      {problem.title}
                    </span>
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

          {/* Contest Filter */}
          <DropdownMenu
            open={isContestDropdownOpen}
            onOpenChange={setIsContestDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer min-w-[150px] justify-between"
              >
                {filters.contestId ? (
                  <span className="truncate max-w-[120px]">
                    {accumulatedContests.find((c) => c.id === filters.contestId)
                      ?.title || `Contest ${filters.contestId}`}
                  </span>
                ) : (
                  t("contests")
                )}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 max-h-80 overflow-y-auto"
            >
              <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10">
                <Input
                  placeholder={t("searchContests")}
                  value={contestSearch}
                  onChange={(e) => setContestSearch(e.target.value)}
                  className="h-8 text-xs focus-visible:ring-0"
                />
              </div>
              <DropdownMenuSeparator />
              {accumulatedContests.length === 0 && !isContestsLoading ? (
                <div className="p-2 text-sm text-slate-500">
                  {t("noContestsFound")}
                </div>
              ) : (
                accumulatedContests.map((contest) => (
                  <DropdownMenuItem
                    key={contest.id}
                    className="flex items-center justify-between px-2 py-2 cursor-pointer"
                    onSelect={() => handleContestSelect(contest.id!)}
                  >
                    <span className="text-sm truncate mr-2">
                      {contest.title}
                    </span>
                    {filters.contestId === contest.id && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
              {isContestsLoading && (
                <div className="flex justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              <div ref={contestObserverTarget} className="h-1" />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer min-w-[150px] justify-between"
              >
                {filters.languageId ? (
                  <span className="truncate max-w-[120px]">
                    {languages.find((l) => l.id === filters.languageId)?.name ||
                      `Language ${filters.languageId}`}
                  </span>
                ) : (
                  t("languages")
                )}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 max-h-80 overflow-y-auto"
            >
              <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10">
                <Input
                  placeholder={t("searchLanguages")}
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className="h-8 text-xs focus-visible:ring-0"
                />
              </div>
              <DropdownMenuSeparator />
              {filteredLanguages.length === 0 ? (
                <div className="p-2 text-sm text-slate-500">
                  {t("noLanguagesFound")}
                </div>
              ) : (
                filteredLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.id}
                    className="flex items-center justify-between px-2 py-2 cursor-pointer"
                    onSelect={() => handleLanguageSelect(lang.id)}
                  >
                    <span className="text-sm mr-2">{lang.name}</span>
                    {filters.languageId === lang.id && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                const { status, ...rest } = filters;
                onFiltersChange(rest);
              } else {
                handleStatusChange(value as SubmissionStatus);
              }
            }}
          >
            <SelectTrigger className="w-[180px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
              <SelectValue placeholder={t("status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                {t("allStatuses")}
              </SelectItem>
              {Object.values(SubmissionStatus).map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="cursor-pointer"
                >
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User Filter */}
          <DropdownMenu
            open={isUserDropdownOpen}
            onOpenChange={setIsUserDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer min-w-[150px] justify-between"
              >
                {filters.userId ? (
                  <span className="truncate max-w-[120px]">
                    {accumulatedUsers.find((u) => u.id === filters.userId)
                      ?.username || `User ${filters.userId}`}
                  </span>
                ) : (
                  t("userId")
                )}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 max-h-80 overflow-y-auto"
            >
              <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10">
                <Input
                  placeholder={t("searchUsers")}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="h-8 text-xs focus-visible:ring-0"
                />
              </div>
              <DropdownMenuSeparator />
              {accumulatedUsers.length === 0 && !isUsersLoading ? (
                <div className="p-2 text-sm text-slate-500">
                  {t("noUsersFound")}
                </div>
              ) : (
                accumulatedUsers.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    className="flex items-center justify-between px-2 py-2 cursor-pointer"
                    onSelect={() => handleUserSelect(user.id)}
                  >
                    <span className="text-sm truncate mr-2">
                      {user.username}
                    </span>
                    {filters.userId === user.id && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
              {isUsersLoading && (
                <div className="flex justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              <div ref={userObserverTarget} className="h-1" />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Filters */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.fromDate || ""}
              onChange={handleFromDateChange}
              className="w-[150px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-0"
            />
            <span className="text-slate-400">-</span>
            <Input
              type="date"
              value={filters.toDate || ""}
              onChange={handleToDateChange}
              className="w-[150px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Column 2: Sort and Reset (1/4 width) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 w-full">
            <Select
              value={sortBy}
              onValueChange={(value) =>
                onSortByChange(value as SubmissionSortBy)
              }
            >
              <SelectTrigger className="flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SubmissionSortBy.ID}>{t("id")}</SelectItem>
                <SelectItem value={SubmissionSortBy.SUBMITTED_AT}>
                  {t("submittedAt")}
                </SelectItem>
                <SelectItem value={SubmissionSortBy.RUNTIME_MS}>
                  {t("runtimeMs")}
                </SelectItem>
                <SelectItem value={SubmissionSortBy.MEMORY_KB}>
                  {t("memoryKb")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Tooltip content={sortOrder === SortOrder.DESC ? tGeneral("desc") : tGeneral("asc")}>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  onSortOrderChange(
                    sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
                  )
                }
                className="shrink-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              >
                {sortOrder === SortOrder.DESC ? (
                  <ArrowDown className="h-4 w-4" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </Tooltip>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setProblemSearch("");
              setLanguageSearch("");
              setContestSearch("");
              setUserSearch("");
              onReset();
            }}
            className="w-full h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("reset")}
          </Button>
        </div>
      </div>
    </div>
  );
}
