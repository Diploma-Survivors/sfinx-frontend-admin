"use client";

import { useEffect, useState } from "react";
import { RankingService } from "@/services/ranking-service";
import { ContestHistoryEntry } from "@/types/ranking";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface UserContestHistoryProps {
  userId: number;
}

export function UserContestHistory({ userId }: UserContestHistoryProps) {
  const t = useTranslations("UserDetailPage.components.contestHistory");
  const [history, setHistory] = useState<ContestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await RankingService.getUserContestHistory(
          userId,
          page,
          limit,
        );
        setHistory(data.data);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch contest history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, page]);

  const getDeltaBadge = (delta: number) => {
    if (delta > 0) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <TrendingUp className="mr-1 h-3 w-3" />+{delta}
        </Badge>
      );
    } else if (delta < 0) {
      return (
        <Badge variant="destructive">
          <TrendingDown className="mr-1 h-3 w-3" />
          {delta}
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Minus className="mr-1 h-3 w-3" />0
        </Badge>
      );
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t("loading")}</div>;
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          {t("empty")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("tableContest")}</TableHead>
              <TableHead className="text-right">{t("tableRank")}</TableHead>
              <TableHead className="text-right">
                {t("tableRatingCheck")}
              </TableHead>
              <TableHead className="text-right">
                {t("tableNewRating")}
              </TableHead>
              <TableHead className="text-right">{t("tableDate")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.contestId}>
                <TableCell className="font-medium">
                  {entry.contestTitle}
                </TableCell>
                <TableCell className="text-right">
                  #{entry.contestRank}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    {getDeltaBadge(entry.ratingDelta)}
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">
                  {entry.ratingAfter}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {format(new Date(entry.contestEndTime), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              {t("page", { page, totalPages })}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                {t("previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                {t("next")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
