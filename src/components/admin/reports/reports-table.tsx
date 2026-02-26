import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ProblemReport,
  ProblemReportStatus,
  ProblemReportType,
} from "@/types/problem-reports";
import {
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ProblemReportsService } from "@/services/problem-reports.service";
import { toastService } from "@/services/toasts-service";
import { useRouter } from "next/navigation";

export const reportTypeKeys: Record<ProblemReportType, string> = {
  [ProblemReportType.WRONG_DESCRIPTION]: "types.wrongDescription",
  [ProblemReportType.WRONG_ANSWER]: "types.wrongAnswer",
  [ProblemReportType.WRONG_TEST_CASE]: "types.wrongTestCase",
  [ProblemReportType.OTHER]: "types.other",
};

export const reportStatusKeys: Record<ProblemReportStatus, string> = {
  [ProblemReportStatus.PENDING]: "statuses.pending",
  [ProblemReportStatus.IN_PROGRESS]: "statuses.inProgress",
  [ProblemReportStatus.RESOLVED]: "statuses.resolved",
  [ProblemReportStatus.REJECTED]: "statuses.rejected",
};

interface ReportsTableProps {
  reports: ProblemReport[];
  meta: any | null;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function ReportsTable({
  reports,
  meta,
  onPageChange,
  isLoading = false,
  onRefresh,
}: ReportsTableProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ReportsTable");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const paginationMeta = meta
    ? {
        page: meta.currentPage || meta.page || 1,
        limit: meta.itemsPerPage || meta.limit || 10,
        total: meta.totalItems || meta.total || 0,
        totalPages: meta.totalPages || 1,
      }
    : undefined;

  const currentPage = paginationMeta?.page || 1;
  const totalPages = paginationMeta?.totalPages || 1;

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdateStatus = async (
    id: string,
    status: ProblemReportStatus,
  ) => {
    setUpdatingId(id);
    try {
      await ProblemReportsService.updateProblemReportStatus(id, status);
      toastService.success(
        t("statusUpdateSuccess", { status: t(reportStatusKeys[status]) }),
      );
      onRefresh?.();
    } catch (error) {
      toastService.error(t("statusUpdateError"));
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: ProblemReportStatus) => {
    switch (status) {
      case ProblemReportStatus.PENDING:
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none";
      case ProblemReportStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none";
      case ProblemReportStatus.RESOLVED:
        return "bg-green-100 text-green-700 hover:bg-green-200 border-none";
      case ProblemReportStatus.REJECTED:
        return "bg-slate-100 text-slate-700 hover:bg-slate-200 border-none";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: ProblemReportStatus) => {
    switch (status) {
      case ProblemReportStatus.PENDING:
        return <Clock className="h-3 w-3 mr-1" />;
      case ProblemReportStatus.IN_PROGRESS:
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case ProblemReportStatus.RESOLVED:
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case ProblemReportStatus.REJECTED:
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-700/20 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 border-b border-slate-200 dark:border-slate-700">
              <TableHead className="w-64 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t("columns.problem")}
              </TableHead>
              <TableHead className="w-48 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t("columns.reportType")}
              </TableHead>
              <TableHead className="w-64 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t("columns.description")}
              </TableHead>
              <TableHead className="w-56 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t("columns.reporter")}
              </TableHead>
              <TableHead className="w-40 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t("columns.status")}
              </TableHead>
              <TableHead className="w-48 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                {t("columns.submittedAt")}
              </TableHead>
              <TableHead className="w-24 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">
                {t("columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-slate-500"
                >
                  {t("noReports")}
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow
                  key={report.id}
                  className={`group transition-colors ${
                    updatingId === report.id
                      ? "opacity-50 pointer-events-none"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  }`}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      {report.problem?.id ? (
                        <Link
                          href={`/${locale}/problems/${report.problem.id}/edit`}
                          className="font-semibold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer"
                        >
                          {report.problem.title || t("unknownProblem")}
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {t("unknownProblem")}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        ID: {report.problem?.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t(reportTypeKeys[report.type] as string)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p
                      className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2"
                      title={report.description}
                    >
                      {report.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                        <AvatarImage
                          src={report.user?.avatarUrl}
                          alt={report.user?.username}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {getInitials(
                            report.user?.fullName ||
                              report.user?.username ||
                              t("unknownUser"),
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {report.user?.fullName ||
                            report.user?.username ||
                            t("unknownUser")}
                        </span>
                        <span className="text-xs text-slate-500">
                          @{report.user?.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(report.status)}>
                      {getStatusIcon(report.status)}
                      {t(reportStatusKeys[report.status] as string)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDateTime(report.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {t("actions.changeStatus")}
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(
                              report.id,
                              ProblemReportStatus.PENDING,
                            )
                          }
                          disabled={
                            report.status === ProblemReportStatus.PENDING
                          }
                        >
                          {t("actions.markAsPending")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(
                              report.id,
                              ProblemReportStatus.IN_PROGRESS,
                            )
                          }
                          disabled={
                            report.status === ProblemReportStatus.IN_PROGRESS
                          }
                        >
                          {t("actions.markAsInProgress")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(
                              report.id,
                              ProblemReportStatus.RESOLVED,
                            )
                          }
                          disabled={
                            report.status === ProblemReportStatus.RESOLVED
                          }
                        >
                          {t("actions.markAsResolved")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(
                              report.id,
                              ProblemReportStatus.REJECTED,
                            )
                          }
                          disabled={
                            report.status === ProblemReportStatus.REJECTED
                          }
                        >
                          {t("actions.markAsRejected")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        meta={paginationMeta}
        entityName={t("entityName")}
      />
    </div>
  );
}
