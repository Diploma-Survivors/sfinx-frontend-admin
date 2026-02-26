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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type ProblemFilters,
  SortBy,
  SortOrder,
  DIFFICULTY_OPTIONS,
} from "@/types/problems";
import type { Tag } from "@/types/tags";
import type { Topic } from "@/types/topics";
import {
  ChevronDown,
  RotateCcw,
  Search,
  ArrowDown,
  ArrowUp,
  Check,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

interface ProblemFilterProps {
  keyWord: string;
  filters: ProblemFilters;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onKeywordChange: (newKeyword: string) => void;
  onFiltersChange: (newFilters: ProblemFilters) => void;
  onSortByChange: (newSortBy: SortBy) => void;
  onSortOrderChange: (newSortOrder: SortOrder) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading: boolean;
  tags: Tag[];
  topics: Topic[];
}

export default function ProblemFilter({
  keyWord,
  filters,
  sortBy,
  sortOrder,
  onKeywordChange,
  onFiltersChange,
  onSortByChange,
  onSortOrderChange,
  onSearch,
  onReset,
  tags,
  topics,
}: ProblemFilterProps) {
  const t = useTranslations("ProblemFilter");
  // Search states for dropdowns
  const [topicSearch, setTopicSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  // Helper to handle multi-select changes
  const handleMultiSelectChange = (key: "topicIds" | "tagIds", value: any) => {
    const currentValues = (filters[key] as any[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: any) => v !== value)
      : [...currentValues, value];

    onFiltersChange({ ...filters, [key]: newValues });
  };

  const handleStatusChange = (value: string) => {
    const isActive =
      value === "active" ? true : value === "inactive" ? false : undefined;
    onFiltersChange({ ...filters, isActive });
  };

  const handleDifficultyChange = (value: string) => {
    const difficulty = value === "all" ? undefined : (value as any);
    onFiltersChange({ ...filters, difficulty });
  };

  const handlePremiumChange = (value: string) => {
    const isPremium =
      value === "premium" ? true : value === "free" ? false : undefined;
    onFiltersChange({ ...filters, isPremium });
  };

  const handleDraftChange = (value: string) => {
    const isDraft =
      value === "draft" ? true : value === "published" ? false : undefined;
    onFiltersChange({ ...filters, isDraft });
  };

  // Filtered lists based on search
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(topicSearch.toLowerCase()),
  );

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  return (
    <div className="space-y-4 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Row 1: Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={keyWord}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="pl-10 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <div>{t("sortByLabel")}</div>
          <Select
            value={sortBy}
            onValueChange={(value) => onSortByChange(value as SortBy)}
          >
            <SelectTrigger className="w-[180px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
              <SelectValue placeholder={t("sortByPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SortBy.ID} className="cursor-pointer">
                {t("id")}
              </SelectItem>
              <SelectItem value={SortBy.DIFFICULTY} className="cursor-pointer">
                {t("difficulty")}
              </SelectItem>
              <SelectItem
                value={SortBy.ACCEPTANCE_RATE}
                className="cursor-pointer"
              >
                {t("acceptance")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              onSortOrderChange(
                sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
              )
            }
            className="h-10 w-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
          >
            {sortOrder === SortOrder.ASC ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Row 2: Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Difficulty Filter */}
        <Select
          value={filters.difficulty || "all"}
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger className="w-[150px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
            <SelectValue placeholder={t("difficulty")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              {t("allDifficulties")}
            </SelectItem>
            {DIFFICULTY_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                {t(`difficultyOptions.${option.value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={
            filters.isActive === true
              ? "active"
              : filters.isActive === false
                ? "inactive"
                : "all"
          }
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[150px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
            <SelectValue placeholder={t("status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              {t("allStatus")}
            </SelectItem>
            <SelectItem value="active" className="cursor-pointer">
              {t("active")}
            </SelectItem>
            <SelectItem value="inactive" className="cursor-pointer">
              {t("inactive")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Premium Filter */}
        <Select
          value={
            filters.isPremium === true
              ? "premium"
              : filters.isPremium === false
                ? "free"
                : "all"
          }
          onValueChange={handlePremiumChange}
        >
          <SelectTrigger className="w-[150px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
            <SelectValue placeholder={t("allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              {t("allTypes")}
            </SelectItem>
            <SelectItem value="premium" className="cursor-pointer">
              {t("premium")}
            </SelectItem>
            <SelectItem value="free" className="cursor-pointer">
              {t("free")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Draft Filter */}
        <Select
          value={
            filters.isDraft === true
              ? "draft"
              : filters.isDraft === false
                ? "published"
                : "all"
          }
          onValueChange={handleDraftChange}
        >
          <SelectTrigger className="w-[150px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
            <SelectValue placeholder={t("allVisibility")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              {t("allVisibility")}
            </SelectItem>
            <SelectItem value="draft" className="cursor-pointer">
              {t("draft")}
            </SelectItem>
            <SelectItem value="published" className="cursor-pointer">
              {t("published")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Topics Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
            >
              {t("topics")}
              {filters.topicIds && filters.topicIds.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filters.topicIds.length}
                </Badge>
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
                placeholder={t("searchTopics")}
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="h-8 text-xs focus-visible:ring-0"
              />
            </div>
            <DropdownMenuSeparator />
            {filteredTopics.length === 0 ? (
              <div className="p-2 text-sm text-slate-500">
                {t("noTopicsFound")}
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const isChecked = filters.topicIds?.includes(topic.id);
                return (
                  <div
                    key={topic.id}
                    className="flex items-center px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMultiSelectChange("topicIds", topic.id);
                    }}
                  >
                    <div
                      className={`flex items-center justify-center w-4 h-4 mr-2 border rounded ${isChecked ? "bg-green-700 border-green-700 text-white" : "border-slate-300"}`}
                    >
                      {isChecked && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-sm">{topic.name}</span>
                  </div>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
            >
              {t("tags")}
              {filters.tagIds && filters.tagIds.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
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
            <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10">
              <Input
                placeholder={t("searchTags")}
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="h-8 text-xs focus-visible:ring-0"
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

        {/* Reset Button */}
        <Button
          variant="ghost"
          onClick={onReset}
          className="h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}
