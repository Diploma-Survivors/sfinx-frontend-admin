"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { ContestsService } from "@/services/contests-service";
import { Contest, ContestStatus } from "@/types/contest";
import { toastService } from "@/services/toasts-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MarkdownRenderer from "@/components/markdown-editor/markdown-renderer";
import { Calendar, Clock, Trophy, ArrowLeft } from "lucide-react";

import { ProblemDifficulty } from "@/types/problems";

export default function ViewContestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [contest, setContest] = useState<Contest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("ViewContestPage");

  useEffect(() => {
    const fetchContest = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await ContestsService.getContestById(id);
        setContest(response.data.data as Contest);
      } catch (error) {
        console.error("Failed to fetch contest:", error);
        toastService.error(t("loadError"));
        router.push("/contests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContest();
  }, [id, router, t]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!contest) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/contests">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-slate-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("back")}
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {contest.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(contest.startTime).toLocaleString()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {contest.durationMinutes} {t("minutes")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("description")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownRenderer content={contest.description} />
          </div>
        </CardContent>
      </Card>

      {/* Problems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {t("problems.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">
                  {t("problems.order")}
                </TableHead>
                <TableHead>{t("problems.problem")}</TableHead>
                <TableHead>{t("problems.difficulty")}</TableHead>
                <TableHead className="text-right">
                  {t("problems.points")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contest.contestProblems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-slate-500"
                  >
                    {t("problems.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                contest.contestProblems
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((p) => (
                    <TableRow key={p.problem.id}>
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="font-mono">
                          {p.orderIndex + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{p.problem.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            p.problem.difficulty === ProblemDifficulty.EASY
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : p.problem.difficulty ===
                                  ProblemDifficulty.MEDIUM
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {p.problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-500">
                        {p.points}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
