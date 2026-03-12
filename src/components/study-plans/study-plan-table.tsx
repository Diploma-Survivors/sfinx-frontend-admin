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

interface StudyPlanTableProps {
  data: AdminStudyPlanResponseDto[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
  onArchive: (id: number) => void;
}

export default function StudyPlanTable({
  data,
  isLoading,
  onDelete,
  onPublish,
  onArchive,
}: StudyPlanTableProps) {
  const t = useTranslations("StudyPlanTable");
  const tPage = useTranslations("StudyPlansPage");
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
        return <Badge className="bg-green-500">{t("published")}</Badge>;
      case StudyPlanStatus.DRAFT:
        return <Badge variant="secondary">{t("draft")}</Badge>;
      case StudyPlanStatus.ARCHIVED:
        return <Badge variant="destructive">{t("archived")}</Badge>;
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
          {t("noPlansFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] font-semibold">
                {t("id")}
              </TableHead>
              <TableHead className="font-semibold">{t("name")}</TableHead>
              <TableHead className="font-semibold">{t("difficulty")}</TableHead>
              <TableHead className="font-semibold">{t("premium")}</TableHead>
              <TableHead className="font-semibold">{t("duration")}</TableHead>
              <TableHead className="font-semibold">{t("status")}</TableHead>
              <TableHead className="font-semibold">
                {t("enrollments")}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((plan) => (
              <TableRow
                key={plan.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
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
                    {t(`difficultyOptions.${plan.difficulty.toLowerCase()}`)}
                  </span>
                </TableCell>
                <TableCell>
                  {plan.isPremium ? (
                    <Badge
                      variant="default"
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      {t("premium")}
                    </Badge>
                  ) : (
                    <span className="text-slate-500 text-sm">{t("free")}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-slate-600 dark:text-slate-300">
                    {plan.estimatedDays} {t("days")}
                  </span>
                  <div className="text-xs text-slate-500">
                    {t("problemsCount", { count: plan.totalProblems })}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(plan.status)}</TableCell>
                <TableCell>
                  <span className="font-medium">{plan.enrollmentCount}</span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t("openMenu")}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/study-plans/${plan.id}/edit`}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>{t("edit")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/study-plans/${plan.id}/items`}
                          className="cursor-pointer text-indigo-600 dark:text-indigo-400"
                        >
                          <ListOrdered className="mr-2 h-4 w-4" />
                          <span>{t("manageItems")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      {plan.status !== StudyPlanStatus.PUBLISHED && (
                        <DropdownMenuItem
                          onClick={() => onPublish(plan.id)}
                          className="text-green-600 dark:text-green-500 cursor-pointer"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          <span>{t("publish")}</span>
                        </DropdownMenuItem>
                      )}

                      {plan.status !== StudyPlanStatus.ARCHIVED && (
                        <DropdownMenuItem
                          onClick={() => onArchive(plan.id)}
                          className="text-amber-600 dark:text-amber-500 cursor-pointer"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          <span>{t("archive")}</span>
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
                            <span>{t("delete")}</span>
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
                                if (deletingId) {
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
