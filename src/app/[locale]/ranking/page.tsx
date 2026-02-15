"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { RankingService } from "@/services/ranking-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Trophy } from "lucide-react";
import { PaginatedResult } from "@/types/common";
import { ContestRatingLeaderboardEntry } from "@/types/ranking";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslations } from "next-intl";

export default function RankingPage() {
  const router = useRouter();
  const t = useTranslations("RankingPage");
  const [page, setPage] = useState(1);
  const limit = 50;
  const [isLoading, setIsLoading] = useState(true);
  const [rankingData, setRankingData] =
    useState<PaginatedResult<ContestRatingLeaderboardEntry> | null>(null);

  const fetchRanking = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await RankingService.getContestRatingLeaderboard(
        page,
        limit,
      );
      setRankingData(data);
    } catch (error) {
      console.error("Failed to fetch ranking:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="font-mono font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const { success, error: toastError } = useToast();

  const handleRebuild = async (type: "all" | "problems" | "contests") => {
    try {
      setIsLoading(true);
      if (type === "all") await RankingService.rebuildAll();
      else if (type === "problems") await RankingService.rebuildProblems();
      else if (type === "contests") await RankingService.rebuildContests();
      success(t("messages.rebuildSuccess", { type }));
      fetchRanking();
    } catch (error) {
      console.error("Failed to rebuild ranking:", error);
      toastError(t("messages.rebuildError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          {/* TODO: Check for Admin permission here if possible, or leave it accessible as requested */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRebuild("problems")}
          >
            {t("buttons.rebuildProblems")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRebuild("contests")}
          >
            {t("buttons.rebuildContests")}
          </Button>
          <Button size="sm" onClick={() => handleRebuild("all")}>
            {t("buttons.rebuildAll")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("leaderboard.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-center">
                    {t("leaderboard.rank")}
                  </TableHead>
                  <TableHead>{t("leaderboard.user")}</TableHead>
                  <TableHead className="text-right">
                    {t("leaderboard.rating")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("leaderboard.contests")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {t("leaderboard.loading")}
                    </TableCell>
                  </TableRow>
                ) : (
                  rankingData?.data.map((entry) => (
                    <TableRow
                      key={entry.user.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/users/${entry.user.id}`)}
                    >
                      <TableCell className="font-medium text-center">
                        <div className="flex justify-center">
                          {getRankIcon(entry.rank)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={entry.user.avatarUrl || undefined}
                              alt={entry.user.username}
                            />
                            <AvatarFallback>
                              {entry.user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {entry.user.fullName || entry.user.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              @{entry.user.username}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {Math.round(entry.contestRating)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {entry.contestsParticipated}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!isLoading && rankingData?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {t("leaderboard.noData")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && rankingData && rankingData.meta.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      aria-disabled={page <= 1}
                      className={
                        page <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-4 text-sm font-medium">
                      {t("leaderboard.page", {
                        page,
                        totalPages: rankingData.meta.totalPages,
                      })}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(rankingData.meta.totalPages, page + 1),
                        )
                      }
                      aria-disabled={page >= rankingData.meta.totalPages}
                      className={
                        page >= rankingData.meta.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
