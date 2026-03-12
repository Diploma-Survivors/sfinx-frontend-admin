"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Solution } from "@/types/solution"; // Fixed import path
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  ThumbsUp,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { PaginatedResult } from "@/types/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SolutionTableProps {
  solutions: Solution[];
  meta: PaginatedResult<Solution>["meta"] | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onDelete?: (solution: Solution) => void;
}

export default function SolutionTable({
  solutions,
  meta,
  isLoading,
  onPageChange,
  onDelete,
}: SolutionTableProps) {
  const t = useTranslations("SolutionTable");
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("title")}</TableHead>
            <TableHead>{t("author")}</TableHead>
            <TableHead>{t("tags")}</TableHead>
            <TableHead className="text-left">{t("stats")}</TableHead>
            <TableHead className="text-left">{t("created")}</TableHead>
            <TableHead className="w-[100px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solutions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {t("noSolutionsFound")}
              </TableCell>
            </TableRow>
          ) : (
            solutions.map((solution) => (
              <TableRow key={solution.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1 items-start">
                    <Link
                      href={`/solutions/${solution.id}`}
                      className="hover:underline text-primary font-semibold"
                    >
                      {solution.title}
                    </Link>
                    {solution.isEditorial && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-orange-50 text-orange-700 border-orange-200"
                      >
                        {t("editorial")}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={solution.author.avatarUrl} />
                      <AvatarFallback>
                        {solution.author.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {solution.author.username}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {solution.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center justify-start gap-4 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{solution.upvoteCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{solution.commentCount}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-left text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(solution.createdAt), {
                    addSuffix: true,
                    locale: locale === "vi" ? vi : undefined,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t("openMenu")}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/solutions/${solution.id}`}
                          className="flex items-center cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>{t("view")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/solutions/${solution.id}/edit`}
                          className="flex items-center cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>{t("edit")}</span>
                        </Link>
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(solution)}
                          className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>{t("delete")}</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="p-4 border-t">
        <DataTablePagination
          currentPage={meta?.page || 1}
          totalPages={meta?.totalPages || 1}
          onPageChange={onPageChange}
          meta={
            meta
              ? {
                  ...meta,
                  hasPreviousPage: meta.page > 1,
                  hasNextPage: meta.page < meta.totalPages,
                }
              : undefined
          }
          entityName={t("entityName")}
        />
      </div>
    </div>
  );
}
