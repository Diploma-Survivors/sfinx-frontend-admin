"use client";

import ReportsTable from "@/components/admin/reports/reports-table";
import { Button } from "@/components/ui/button";
import { ProblemReportsService } from "@/services/problem-reports.service";
import { toastService } from "@/services/toasts-service";
import { ProblemReport, ProblemReportStatus, ProblemReportType } from "@/types/problem-reports";
import { SortOrder } from "@/types/problems";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import ReportFilter from "@/components/admin/reports/report-filter";

export default function ReportsPage() {
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<ProblemReportStatus | "all">("all");
  const [type, setType] = useState<ProblemReportType | "all">("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const t = useTranslations("ReportsPage");

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ProblemReportsService.getProblemReports({
        page,
        limit: 10,
        search: searchQuery,
        status: status === "all" ? undefined : status,
        type: type === "all" ? undefined : type,
        sortBy,
        sortOrder,
      });

      setReports(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toastService.error(t("fetchError"));
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, status, type, sortBy, sortOrder]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Scroll to and highlight a report targeted by URL hash (e.g. #report-123)
  useEffect(() => {
    if (!isLoading && reports.length > 0 && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.startsWith("#report-")) {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.classList.add("is-highlighted");
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);

          setTimeout(() => {
            element.classList.remove("is-highlighted");
          }, 5000);
        }
      }
    }
  }, [isLoading, reports]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    fetchReports();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStatusChange = (newStatus: ProblemReportStatus | "all") => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleTypeChange = (newType: ProblemReportType | "all") => {
    setType(newType);
    setPage(1);
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handleSortOrderChange = (newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              {t("title")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t("description")}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="bg-white dark:bg-slate-800"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {t("refresh")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ReportFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusChange={handleStatusChange}
            type={type}
            onTypeChange={handleTypeChange}
            sortBy={sortBy}
            onSortByChange={handleSortByChange}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
          />
        </div>

        {/* Reports Table */}
        <ReportsTable
          reports={reports}
          meta={meta}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
