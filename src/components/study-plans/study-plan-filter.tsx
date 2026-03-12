"use client";

import { useTranslations } from "next-intl";
import { Search, X, ChevronDown, Check } from "lucide-react";
import {
  FilterStudyPlanDto,
  StudyPlanDifficulty,
  StudyPlanStatus,
} from "@/types/study-plan";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { TopicsService } from "@/services/topics-service";
import { TagsService } from "@/services/tags-service";
import { Topic } from "@/types/topics";
import { Tag } from "@/types/tags";

interface StudyPlanFilterProps {
  filters: FilterStudyPlanDto;
  onFilterChange: (key: keyof FilterStudyPlanDto, value: any) => void;
}

export default function StudyPlanFilter({
  filters,
  onFilterChange,
}: StudyPlanFilterProps) {
  const t = useTranslations("ProblemFilter"); // Reusing for common filter terms (Search, Reset)
  const tTable = useTranslations("StudyPlanTable");

  const [topics, setTopics] = useState<Topic[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [topicSearch, setTopicSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, tagsRes] = await Promise.all([
          TopicsService.getAllTopics(),
          TagsService.getAllTags(),
        ]);
        setTopics(topicsRes.data.data);
        setTags(tagsRes.data.data);
      } catch (error) {
        console.error("Failed to fetch filter data", error);
      }
    };
    fetchData();
  }, []);

  const handleReset = () => {
    onFilterChange("search", "");
    onFilterChange("difficulty", undefined);
    onFilterChange("status", undefined);
    onFilterChange("isPremium", undefined);
    onFilterChange("topicId", undefined);
    onFilterChange("tagId", undefined);
    onFilterChange("sortBy", undefined);
    onFilterChange("sortOrder", undefined);
    onFilterChange("page", 1);
    setTopicSearch("");
    setTagSearch("");
  };

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(topicSearch.toLowerCase()),
  );

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end sm:items-center">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-9 h-10 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary shadow-sm"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            onClick={() => onFilterChange("search", "")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select
        value={filters.difficulty || "ALL"}
        onValueChange={(value) =>
          onFilterChange("difficulty", value === "ALL" ? undefined : value)
        }
      >
        <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <SelectValue placeholder={t("selectDifficulty")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("allDifficulties")}</SelectItem>
          <SelectItem value={StudyPlanDifficulty.BEGINNER}>
            {t("difficultyOptions.easy")}
          </SelectItem>
          <SelectItem value={StudyPlanDifficulty.INTERMEDIATE}>
            {t("difficultyOptions.medium")}
          </SelectItem>
          <SelectItem value={StudyPlanDifficulty.ADVANCED}>
            {t("difficultyOptions.hard")}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status || "ALL"}
        onValueChange={(value) =>
          onFilterChange("status", value === "ALL" ? undefined : value)
        }
      >
        <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <SelectValue placeholder={t("status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("allStatus")}</SelectItem>
          <SelectItem value={StudyPlanStatus.DRAFT}>
            {tTable("draft")}
          </SelectItem>
          <SelectItem value={StudyPlanStatus.PUBLISHED}>
            {tTable("published")}
          </SelectItem>
          <SelectItem value={StudyPlanStatus.ARCHIVED}>
            {tTable("archived")}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={
          filters.isPremium === undefined ? "ALL" : String(filters.isPremium)
        }
        onValueChange={(value) =>
          onFilterChange(
            "isPremium",
            value === "ALL" ? undefined : value === "true",
          )
        }
      >
        <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <SelectValue placeholder={t("allTypes")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("allTypes")}</SelectItem>
          <SelectItem value="true">{t("premium")}</SelectItem>
          <SelectItem value="false">{t("free")}</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-[160px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm justify-between px-3 font-normal"
          >
            <span className="truncate">
              {filters.topicId
                ? topics.find((t) => t.id === filters.topicId)?.name
                : t("allTopics")}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
          <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10">
            <Input
              placeholder={t("searchTopics")}
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              className="h-8 text-xs focus-visible:ring-0"
            />
          </div>
          <DropdownMenuSeparator />
          <div
            className="flex items-center px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            onClick={() => onFilterChange("topicId", undefined)}
          >
            <div
              className={`flex items-center justify-center w-4 h-4 mr-2 border rounded ${!filters.topicId ? "bg-green-700 border-green-700 text-white" : "border-slate-300"}`}
            >
              {!filters.topicId && <Check className="h-3 w-3" />}
            </div>
            <span className="text-sm">{t("allTopics")}</span>
          </div>
          {filteredTopics.map((topic) => {
            const isChecked = filters.topicId === topic.id;
            return (
              <div
                key={topic.id}
                className="flex items-center px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => onFilterChange("topicId", topic.id)}
              >
                <div
                  className={`flex items-center justify-center w-4 h-4 mr-2 border rounded ${isChecked ? "bg-green-700 border-green-700 text-white" : "border-slate-300"}`}
                >
                  {isChecked && <Check className="h-3 w-3" />}
                </div>
                <span className="text-sm truncate">{topic.name}</span>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-[160px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm justify-between px-3 font-normal"
          >
            <span className="truncate">
              {filters.tagId
                ? tags.find((t) => t.id === filters.tagId)?.name
                : t("allTags")}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
          <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10">
            <Input
              placeholder={t("searchTags")}
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="h-8 text-xs focus-visible:ring-0"
            />
          </div>
          <DropdownMenuSeparator />
          <div
            className="flex items-center px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            onClick={() => onFilterChange("tagId", undefined)}
          >
            <div
              className={`flex items-center justify-center w-4 h-4 mr-2 border rounded ${!filters.tagId ? "bg-green-700 border-green-700 text-white" : "border-slate-300"}`}
            >
              {!filters.tagId && <Check className="h-3 w-3" />}
            </div>
            <span className="text-sm">{t("allTags")}</span>
          </div>
          {filteredTags.map((tag) => {
            const isChecked = filters.tagId === tag.id;
            return (
              <div
                key={tag.id}
                className="flex items-center px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => onFilterChange("tagId", tag.id)}
              >
                <div
                  className={`flex items-center justify-center w-4 h-4 mr-2 border rounded ${isChecked ? "bg-green-700 border-green-700 text-white" : "border-slate-300"}`}
                >
                  {isChecked && <Check className="h-3 w-3" />}
                </div>
                <span className="text-sm truncate">{tag.name}</span>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2">
        <Select
          value={filters.sortBy || "createdAt"}
          onValueChange={(value) => onFilterChange("sortBy", value)}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <SelectValue placeholder={t("sortByLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{tTable("name")}</SelectItem>
            <SelectItem value="estimatedDays">{tTable("duration")}</SelectItem>
            <SelectItem value="enrollmentCount">{tTable("enrollments")}</SelectItem>
            <SelectItem value="createdAt">{t("createdAt")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder || "DESC"}
          onValueChange={(value) => onFilterChange("sortOrder", value)}
        >
          <SelectTrigger className="w-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm p-0 flex items-center justify-center">
             <span className="sr-only">Sort Order</span>
             {filters.sortOrder === "ASC" ? "↑" : "↓"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ASC">ASC</SelectItem>
            <SelectItem value="DESC">DESC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(filters.search ||
        filters.difficulty ||
        filters.status ||
        filters.isPremium !== undefined ||
        filters.topicId ||
        filters.tagId ||
        filters.sortBy ||
        filters.sortOrder) && (
        <Button
          variant="outline"
          onClick={handleReset}
          className="h-10 border-slate-200 dark:border-slate-800 shadow-sm whitespace-nowrap"
        >
          {t("reset")}
        </Button>
      )}
    </div>
  );
}
