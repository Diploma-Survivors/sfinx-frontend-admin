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
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ThumbsUp, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { PaginatedResult } from "@/types/common";

interface SolutionTableProps {
  solutions: Solution[];
  meta: PaginatedResult<Solution>["meta"] | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function SolutionTable({
  solutions,
  meta,
  isLoading,
  onPageChange,
}: SolutionTableProps) {
  const t = useTranslations("SolutionTable");

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
            <TableHead className="text-right">{t("stats")}</TableHead>
            <TableHead className="text-right">{t("created")}</TableHead>
            <TableHead className="w-[100px]"></TableHead>
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
                  <Link
                    href={`/solutions/${solution.id}`}
                    className="hover:underline text-primary font-semibold"
                  >
                    {solution.title}
                  </Link>
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
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-4 text-muted-foreground text-sm">
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
                <TableCell className="text-right text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(solution.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/solutions/${solution.id}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
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
        />
      </div>
    </div>
  );
}
