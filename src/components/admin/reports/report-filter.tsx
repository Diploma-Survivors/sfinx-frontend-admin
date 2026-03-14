"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import type { ProblemReportStatus, ProblemReportType } from "@/types/problem-reports";
import { SortOrder } from "@/types/problems";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface ReportFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  status: ProblemReportStatus | "all";
  onStatusChange: (status: ProblemReportStatus | "all") => void;
  type: ProblemReportType | "all";
  onTypeChange: (type: ProblemReportType | "all") => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

export default function ReportFilter({
  searchQuery,
  onSearchChange,
  status = "all",
  onStatusChange,
  type = "all",
  onTypeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: ReportFilterProps) {
  const t = useTranslations("ReportFilter");
  const tGeneral = useTranslations("General");
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local state when prop changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce logic for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <Label htmlFor="search" className="text-sm font-medium mb-1 block">
              {t("searchPlaceholder")}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="search"
                type="text"
                placeholder={t("searchPlaceholder")}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status" className="text-sm font-medium mb-1 block">
              {t("status")}
            </Label>
            <Select
              value={status}
              onValueChange={(value) => onStatusChange(value as ProblemReportStatus | "all")}
            >
              <SelectTrigger id="status" className="h-9">
                <SelectValue placeholder={t("allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="PENDING">{t("statusOptions.PENDING")}</SelectItem>
                <SelectItem value="IN_PROGRESS">{t("statusOptions.IN_PROGRESS")}</SelectItem>
                <SelectItem value="RESOLVED">{t("statusOptions.RESOLVED")}</SelectItem>
                <SelectItem value="REJECTED">{t("statusOptions.REJECTED")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div>
            <Label htmlFor="type" className="text-sm font-medium mb-1 block">
              {t("type")}
            </Label>
            <Select
              value={type}
              onValueChange={(value) => onTypeChange(value as ProblemReportType | "all")}
            >
              <SelectTrigger id="type" className="h-9">
                <SelectValue placeholder={t("allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTypes")}</SelectItem>
                <SelectItem value="WRONG_DESCRIPTION">{t("typeOptions.WRONG_DESCRIPTION")}</SelectItem>
                <SelectItem value="WRONG_ANSWER">{t("typeOptions.WRONG_ANSWER")}</SelectItem>
                <SelectItem value="WRONG_TEST_CASE">{t("typeOptions.WRONG_TEST_CASE")}</SelectItem>
                <SelectItem value="OTHER">{t("typeOptions.OTHER")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Filter */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="sort-by" className="text-sm font-medium mb-1 block">
              {t("sortByLabel")}
            </Label>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger id="sort-by" className="h-9 flex-1">
                  <SelectValue placeholder={t("sortByPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">{t("createdAt")}</SelectItem>
                  <SelectItem value="updatedAt">{t("updatedAt")}</SelectItem>
                </SelectContent>
              </Select>
              
              <Tooltip
                content={sortOrder === SortOrder.DESC ? tGeneral("desc") : tGeneral("asc")}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 bg-white dark:bg-slate-800"
                  onClick={() => onSortOrderChange(sortOrder === SortOrder.DESC ? SortOrder.ASC : SortOrder.DESC)}
                >
                  {sortOrder === SortOrder.DESC ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
