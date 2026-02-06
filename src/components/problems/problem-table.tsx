'use client'
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Problem, ProblemMeta, SortBy, SortOrder } from '@/types/problems';
import { getDifficultyColor, getDifficultyLabel } from '@/types/problems';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Lock,
  MoreHorizontal,
  Trash2,
  Unlock,
  BarChart2,
  Crown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/routing';
import React, { useState } from 'react';
import { FaList } from 'react-icons/fa6';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/app-context';
import { PermissionEnum } from '@/types/permission';

export enum ProblemTableMode {
  VIEW = 'view',
  SELECT = 'select',
  MULTIPLE_SELECT = 'multiple_select',
}

interface ProblemTableProps {
  problems: Problem[];
  meta: ProblemMeta | null;
  totalCount?: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  mode: ProblemTableMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  initialSelectedProblemIds?: Set<number>;
  onSortByChange: (newSortBy: SortBy) => void;
  onSortOrderChange: (newSortOrder: SortOrder) => void;
  onProblemSelect?: (problem: Problem) => void;
  onMultipleProblemsSelect?: (problems: Problem[]) => void;
  onProblemView?: (problem: Problem) => void;
  onStatusChange?: (problem: Problem) => void;
}

export default function ProblemTable({
  problems,
  meta,
  totalCount = 0,
  onPageChange,
  isLoading = false,
  mode,
  sortBy,
  sortOrder,
  initialSelectedProblemIds,
  onSortByChange,
  onSortOrderChange,
  onProblemSelect,
  onMultipleProblemsSelect,
  onProblemView,
  onStatusChange,
}: ProblemTableProps) {
  const t = useTranslations('ProblemTable');
  const { hasPermission } = useApp();
  const selectionMode =
    mode === ProblemTableMode.SELECT ||
    mode === ProblemTableMode.MULTIPLE_SELECT;
  const isMultipleSelect = mode === ProblemTableMode.MULTIPLE_SELECT;
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null
  );
  const [selectedProblemsMap, setSelectedProblemsMap] = useState<
    Map<number, Problem>
  >(new Map());

  const handleProblemClick = (problemId: number) => {
    if (selectionMode && onProblemView) {
      const selectedProblem = problems.find(
        (problem) => problem.id === problemId
      );
      if (selectedProblem) {
        onProblemView(selectedProblem);
      }
    }
  };

  const handleProblemSelection = (problem: Problem) => {
    if (isMultipleSelect) {
      setSelectedProblemsMap((prev) => {
        const newMap = new Map(prev);
        if (newMap.has(problem.id)) {
          newMap.delete(problem.id);
        } else {
          newMap.set(problem.id, problem);
        }
        return newMap;
      });
    } else {
      setSelectedProblemId(problem.id);
    }
  };

  const handleConfirmSelection = () => {
    if (isMultipleSelect && onMultipleProblemsSelect) {
      // Return all selected problems from the map
      const selectedProblems = Array.from(selectedProblemsMap.values());
      if (selectedProblems.length > 0) {
        onMultipleProblemsSelect(selectedProblems);
      }
    } else if (selectedProblemId && onProblemSelect) {
      const selectedProblem = problems.find(
        (problem) => problem.id === selectedProblemId
      );
      if (selectedProblem) {
        onProblemSelect(selectedProblem);
      }
    }
  };

  const hasSelection = isMultipleSelect
    ? selectedProblemsMap.size > 0
    : selectedProblemId !== null;

  // Pagination Logic
  const currentPage = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;


  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Table Header with Selection Actions */}
      {selectionMode && (
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {t('selectMultiple')}
            </h3>
            <Button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!hasSelection}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
            >
              {isMultipleSelect
                ? t('selectCount', { count: selectedProblemsMap.size })
                : t('selectProblem')}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-700/20 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 border-b border-slate-200 dark:border-slate-700">
              {selectionMode && (
                <TableHead className="w-12 text-center">{t('select')}</TableHead>
              )}
              <TableHead className="w-20 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t('id')}
              </TableHead>
              <TableHead className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t('title')}
              </TableHead>
              <TableHead className="w-32 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t('difficulty')}
              </TableHead>
              <TableHead className="w-32 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t('status')}
              </TableHead>
              <TableHead className="w-48 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t('acceptance')}
              </TableHead>
              <TableHead className="w-48 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t('tags')}
              </TableHead>
              <TableHead className="w-48 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t('topics')}
              </TableHead>
              {!selectionMode && (
                <TableHead className="w-24 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">
                  {t('actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {selectionMode && (
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-4 rounded mx-auto" />
                    </TableCell>
                  )}
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2 w-24" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </TableCell>
                  {!selectionMode && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : problems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={selectionMode ? 9 : 8}
                  className="h-32 text-center text-slate-500"
                >
                  {t('noProblemsFound')}
                </TableCell>
              </TableRow>
            ) : (
              problems.map((problem) => {
                const isInitialSelected =
                  isMultipleSelect &&
                  initialSelectedProblemIds?.has(problem.id);
                return (
                  <TableRow
                    key={problem.id}
                    className={`group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isInitialSelected
                      ? 'bg-slate-50 dark:bg-slate-800 opacity-60'
                      : ''
                      }`}
                  >
                    {selectionMode && (
                      <TableCell className="text-center">
                        <input
                          type={isMultipleSelect ? 'checkbox' : 'radio'}
                          checked={
                            isMultipleSelect
                              ? selectedProblemsMap.has(problem.id)
                              : selectedProblemId === problem.id
                          }
                          onChange={() => handleProblemSelection(problem)}
                          disabled={isInitialSelected}
                          className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                      {problem.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {selectionMode ? (
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {problem.title}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/problems/${problem.id}/edit`}
                              className="font-bold text-slate-800 dark:text-slate-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            >
                              {problem.title}
                            </Link>
                            {problem.isPremium && (
                              <Tooltip content={t('premium')}>
                                <Crown className="h-4 w-4 text-yellow-500" />
                              </Tooltip>
                            )}
                          </div>
                        )}
                        <span className="text-xs text-slate-500 mt-1">
                          {t('lastUpdated')}{' '}
                          {new Date(
                            problem.updatedAt || ''
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${getDifficultyColor(
                          problem.difficulty
                        )} border-0`}
                      >
                        {getDifficultyLabel(problem.difficulty)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={problem.isActive ? 'default' : 'secondary'}
                        className={`${problem.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          } border-0`}
                      >
                        {problem.isActive ? t('active') : t('inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Number(problem.acceptanceRate) || 0}
                          className="h-2 w-24"
                          indicatorClassName="bg-green-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {Number(problem.acceptanceRate)?.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs font-normal text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {problem.tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          >
                            +{problem.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {problem.topics.slice(0, 2).map((topic) => (
                          <Badge
                            key={topic.id}
                            variant="outline"
                            className="text-xs font-normal text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          >
                            {topic.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    {!selectionMode && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t('openMenu')}</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>

                              {hasPermission(PermissionEnum.PROBLEM_UPDATE) && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/problems/${problem.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('edit')}
                                  </Link>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem asChild>
                                <Link href={`/problems/${problem.id}/statistics`}>
                                  <BarChart2 className="mr-2 h-4 w-4" />
                                  {t('statistics')}
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild>
                                <Link href={`/submissions?problemId=${problem.id}`}>
                                  <FaList className="mr-2 h-4 w-4" />
                                  {t('viewSubmissions')}
                                </Link>
                              </DropdownMenuItem>

                              {hasPermission(PermissionEnum.PROBLEM_UPDATE) && (
                                <DropdownMenuItem onClick={() => onStatusChange?.(problem)}>
                                  {problem.isActive ? (
                                    <>
                                      <Lock className="mr-2 h-4 w-4" />
                                      {t('deactivate')}
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="mr-2 h-4 w-4" />
                                      {t('activate')}
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {hasPermission(PermissionEnum.PROBLEM_DELETE) && (
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('delete')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer & Pagination */}
      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        meta={meta || undefined}
        entityName={t('entityName')}
      />
    </div>
  );
}
