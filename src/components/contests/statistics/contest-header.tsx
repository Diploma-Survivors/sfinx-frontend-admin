"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContestStatus } from "@/types/contest";
import { ContestStatistics } from "@/types/contest-statistics";
import { Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface ContestHeaderProps {
  stats: ContestStatistics;
}

export function ContestHeader({ stats }: ContestHeaderProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const t = useTranslations("ContestStatistics.header");

  useEffect(() => {
    if (stats.status !== ContestStatus.RUNNING) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(stats.endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.endTime, stats.status]);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.contestName}
          </h1>
          <Badge
            variant={
              stats.status === ContestStatus.RUNNING
                ? "default"
                : stats.status === ContestStatus.SCHEDULED
                  ? "secondary"
                  : "outline"
            }
            className={
              stats.status === ContestStatus.RUNNING
                ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                : ""
            }
          >
            {stats.status}
          </Badge>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t("startedAt")}{" "}
          {format(new Date(stats.startTime), "dd/MM/yyyy HH:mm")}
        </div>
      </div>

      {stats.status === ContestStatus.RUNNING && (
        <div className="flex items-center gap-3 px-6 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50">
          <Timer className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
          <span className="text-2xl font-mono font-bold text-green-700 dark:text-green-400">
            {timeLeft || "--:--:--"}
          </span>
        </div>
      )}


    </div>
  );
}
