"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  MoreHorizontal,
  Edit,
  ListOrdered,
  Globe,
  Archive,
  Trash2,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AdminStudyPlanResponseDto,
  StudyPlanDifficulty,
  StudyPlanStatus,
} from "@/types/study-plan";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export enum StudyPlanTableMode {
  VIEW = "view",
  SELECT = "select",
  MULTIPLE_SELECT = "multiple_select",
}

interface StudyPlanTableProps {
  data: AdminStudyPlanResponseDto[];
  isLoading: boolean;
  onDelete?: (id: number) => void;
  onPublish?: (id: number) => void;
  onArchive?: (id: number) => void;
  mode?: StudyPlanTableMode;
  initialSelectedIds?: Set<number>;
  onSelect?: (plan: AdminStudyPlanResponseDto) => void;
  onMultipleSelect?: (plans: AdminStudyPlanResponseDto[]) => void;
}

export default function StudyPlanTable({
  data,
  isLoading,
  onDelete,
  onPublish,
  onArchive,
  mode = StudyPlanTableMode.VIEW,
  initialSelectedIds,
  onSelect,
  onMultipleSelect,
}: StudyPlanTableProps) {
  const tTable = useTranslations("StudyPlanTable");
  const tPage = useTranslations("StudyPlansPage");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const selectionMode =
    mode === StudyPlanTableMode.SELECT ||
    mode === StudyPlanTableMode.MULTIPLE_SELECT;
  const isMultipleSelect = mode === StudyPlanTableMode.MULTIPLE_SELECT;

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedPlansMap, setSelectedPlansMap] = useState<
    Map<number, AdminStudyPlanResponseDto>
  >(new Map());

  const handlePlanSelection = (plan: AdminStudyPlanResponseDto) => {
    if (isMultipleSelect) {
      setSelectedPlansMap((prev) => {
        const newMap = new Map(prev);
        if (newMap.has(plan.id)) {
          newMap.delete(plan.id);
        } else {
          newMap.set(plan.id, plan);
        }
        return newMap;
      });
    } else {
      setSelectedPlanId(plan.id);
    }
  };

  const handleConfirmSelection = () => {
    if (isMultipleSelect && onMultipleSelect) {
      onMultipleSelect(Array.from(selectedPlansMap.values()));
    } else if (selectedPlanId && onSelect) {
      const selectedPlan = data.find((p) => p.id === selectedPlanId);
      if (selectedPlan) {
        onSelect(selectedPlan);
      }
    }
  };

  const hasSelection = isMultipleSelect
    ? selectedPlansMap.size > 0
    : selectedPlanId !== null;

  const getDifficultyColor = (difficulty: StudyPlanDifficulty) => {
    switch (difficulty) {
      case StudyPlanDifficulty.BEGINNER:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case StudyPlanDifficulty.INTERMEDIATE:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case StudyPlanDifficulty.ADVANCED:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getStatusBadge = (status: StudyPlanStatus) => {
    switch (status) {
      case StudyPlanStatus.PUBLISHED:
        return <Badge className="bg-green-500">{tTable("published")}</Badge>;
      case StudyPlanStatus.DRAFT:
        return <Badge variant="secondary">{tTable("draft")}</Badge>;
      case StudyPlanStatus.ARCHIVED:
        return <Badge variant="destructive">{tTable("archived")}</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <p className="text-slate-500 dark:text-slate-400">
          {tTable("noPlansFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      {selectionMode && (
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {tTable("selectMultiple")}
            </h3>
            <Button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!hasSelection}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
            >
              {isMultipleSelect
                ? tTable("selectCount", { count: selectedPlansMap.size })
                : tTable("selectPlan")}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-transparent">
              {selectionMode && (
                <TableHead className="w-12 text-center">
                  {tTable("select")}
                </TableHead>
              )}
              <TableHead className="w-[80px] font-semibold">
                {tTable("id")}
              </TableHead>
              <TableHead className="font-semibold">{tTable("name")}</TableHead>
              <TableHead className="font-semibold">{tTable("difficulty")}</TableHead>
              <TableHead className="font-semibold">{tTable("premium")}</TableHead>
              <TableHead className="font-semibold">{tTable("duration")}</TableHead>
              <TableHead className="font-semibold">{tTable("status")}</TableHead>
              {!selectionMode && (
                <TableHead className="font-semibold">
                  {tTable("enrollments")}
                </TableHead>
              )}
              {!selectionMode && (
                <TableHead className="text-right font-semibold">
                  {tTable("actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((plan) => {
              const isInitialSelected =
                isMultipleSelect && initialSelectedIds?.has(plan.id);

              return (
                <TableRow
                  key={plan.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${
                    isInitialSelected ? "opacity-60 bg-slate-50 dark:bg-slate-800/50" : ""
                  }`}
                >
                  {selectionMode && (
                    <TableCell className="text-center">
                      <input
                        type={isMultipleSelect ? "checkbox" : "radio"}
                        checked={
                          isMultipleSelect
                            ? selectedPlansMap.has(plan.id)
                            : selectedPlanId === plan.id
                        }
                        onChange={() => handlePlanSelection(plan)}
                        disabled={isInitialSelected}
                        className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500 cursor-pointer"
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium text-slate-500">
                    #{plan.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {plan.name}
                      </span>
                      <span className="text-xs text-slate-500">{plan.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                        plan.difficulty,
                      )}`}
                    >
                      {tTable(`difficultyOptions.${plan.difficulty.toLowerCase()}`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {plan.isPremium ? (
                      <Badge
                        variant="default"
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        {tTable("premium")}
                      </Badge>
                    ) : (
                      <span className="text-slate-500 text-sm">
                        {tTable("free")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 dark:text-slate-300">
                      {plan.estimatedDays} {tTable("days")}
                    </span>
                    <div className="text-xs text-slate-500">
                      {tTable("problemsCount", { count: plan.totalProblems })}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  {!selectionMode && (
                    <TableCell>
                      <span className="font-medium">{plan.enrollmentCount}</span>
                    </TableCell>
                  )}
                  {!selectionMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">
                              {tTable("openMenu")}
                            </span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>
                            {tTable("actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/study-plans/${plan.id}/edit`}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>{tTable("edit")}</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/study-plans/${plan.id}/items`}
                              className="cursor-pointer text-indigo-600 dark:text-indigo-400"
                            >
                              <ListOrdered className="mr-2 h-4 w-4" />
                              <span>{tTable("manageItems")}</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {plan.status !== StudyPlanStatus.PUBLISHED && (
                            <DropdownMenuItem
                              onClick={() => onPublish?.(plan.id)}
                              className="text-green-600 dark:text-green-500 cursor-pointer"
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              <span>{tTable("publish")}</span>
                            </DropdownMenuItem>
                          )}

                          {plan.status !== StudyPlanStatus.ARCHIVED && (
                            <DropdownMenuItem
                              onClick={() => onArchive?.(plan.id)}
                              className="text-amber-600 dark:text-amber-500 cursor-pointer"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              <span>{tTable("archive")}</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setDeletingId(plan.id);
                                }}
                                className="text-red-600 dark:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{tTable("delete")}</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {tPage("deleteTitle")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {tPage("deleteMessage", { name: plan.name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setDeletingId(null)}
                                >
                                  {tPage("cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => {
                                    if (deletingId && onDelete) {
                                      onDelete(deletingId);
                                      setDeletingId(null);
                                    }
                                  }}
                                >
                                  {tPage("deleteConfirm")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
