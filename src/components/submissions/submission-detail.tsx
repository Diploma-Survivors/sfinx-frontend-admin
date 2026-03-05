"use client";

import { Submission, SubmissionStatus, languageMap } from "@/types/submissions";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Cpu,
  Download,
  XCircle,
  AlertCircle,
  Timer,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { toastService } from "@/services/toasts-service";
import { useAppSelector } from "@/store/hooks";
import { getStatusLabel } from "@/services/submissions-service";
import { format } from "date-fns";

interface SubmissionDetailProps {
  submission: Submission | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function SubmissionDetail({
  submission,
  isLoading,
  error,
}: SubmissionDetailProps) {
  const { languages } = useAppSelector((state) => state.metadata);
  const t = useTranslations("SubmissionDetail");

  const handleCopyCode = () => {
    if (submission?.sourceCode) {
      navigator.clipboard.writeText(submission.sourceCode);
      toastService.success(t("sourceCode.copySuccess"));
    }
  };

  const handleDownloadCode = () => {
    if (submission?.sourceCode) {
      const blob = new Blob([submission.sourceCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `submission_${submission.id}.${languageMap[getLanguageName(submission.languageId)] || "txt"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toastService.success(t("sourceCode.downloadSuccess"));
      URL.revokeObjectURL(url);
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.ACCEPTED:
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case SubmissionStatus.WRONG_ANSWER:
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case SubmissionStatus.PENDING:
      case SubmissionStatus.RUNNING:
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      default:
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
    }
  };

  const getStatusTextColor = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.ACCEPTED:
        return "text-green-600 dark:text-green-400";
      case SubmissionStatus.WRONG_ANSWER:
        return "text-red-600 dark:text-red-400";
      case SubmissionStatus.PENDING:
      case SubmissionStatus.RUNNING:
        return "text-blue-600 dark:text-blue-400";
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-orange-600 dark:text-orange-400";
    }
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.ACCEPTED:
        return (
          <CheckCircle2 className={cn("h-4 w-4", getStatusTextColor(status))} />
        );
      case SubmissionStatus.WRONG_ANSWER:
        return (
          <XCircle className={cn("h-4 w-4", getStatusTextColor(status))} />
        );
      case SubmissionStatus.PENDING:
      case SubmissionStatus.RUNNING:
        return <Timer className={cn("h-4 w-4", getStatusTextColor(status))} />;
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
        return <Clock className={cn("h-4 w-4", getStatusTextColor(status))} />;
      default:
        return (
          <AlertCircle className={cn("h-4 w-4", getStatusTextColor(status))} />
        );
    }
  };

  // Helper to get language name from Redux store
  const getLanguageName = (id: number) => {
    const language = languages.find((l) => l.id === id);
    return language ? language.monacoLanguage : "Unknown";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-5xl">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">{t("errors.title")}</h2>
          <p className="text-muted-foreground">
            {error || t("errors.notFound")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {t("title", { id: submission.id })}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1 flex items-center gap-1.5",
                getStatusColor(submission.status),
              )}
            >
              {getStatusIcon(submission.status)}
              {getStatusLabel(submission.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>{t("submittedBy")}</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={
                    submission.user?.avatarUrl ||
                    submission.author?.avatarUrl ||
                    ""
                  }
                />
                <AvatarFallback>
                  {(submission.user?.username ||
                    submission.author?.username ||
                    "U")?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {submission.user?.username ||
                submission.author?.username ||
                "Unknown User"}
            </div>
            <span>•</span>
            <span>
              {format(new Date(submission.submittedAt), "dd/MM/yyyy HH:mm:ss")}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getStatusIcon(submission.status)}
              <span className={getStatusTextColor(submission.status)}>
                {getStatusLabel(submission.status)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                getStatusTextColor(submission.status),
              )}
            >
              {getStatusLabel(submission.status)}
            </div>
            {/* Placeholder for sub-status info if any */}
            <div className="text-xs text-muted-foreground mt-1">
              {submission.status === SubmissionStatus.ACCEPTED
                ? t("status.allPassed")
                : t("status.checkDetails")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              {t("metrics.runtime")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submission.status === SubmissionStatus.PENDING && (
              <div className="text-2xl font-bold">N/A</div>
            )}
            {submission.status !== SubmissionStatus.PENDING && (
              <div className="text-2xl font-bold">
                {submission.executionTime != null
                  ? `${submission.executionTime} ms`
                  : "N/A"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-500" />
              {t("metrics.memory")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submission.status === SubmissionStatus.PENDING && (
              <div className="text-2xl font-bold">N/A</div>
            )}
            {submission.status !== SubmissionStatus.PENDING && (
              <div className="text-2xl font-bold">
                {submission.memoryUsed != null
                  ? `${(submission.memoryUsed / 1024).toFixed(1)} MB`
                  : "N/A"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Code2 className="h-4 w-4 text-orange-500" />
              {t("metrics.language")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submission.language?.name}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Code */}
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/40 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center font-medium text-sm">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            {t("sourceCode.title")}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleCopyCode}
            >
              <Copy className="h-3.5 w-3.5" />
              {t("sourceCode.copy")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleDownloadCode}
            >
              <Download className="h-3.5 w-3.5" />
              {t("sourceCode.download")}
            </Button>
          </div>
        </div>
        <div className="text-sm">
          <SyntaxHighlighter
            language={getLanguageName(submission.languageId)}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: "14px",
              lineHeight: "1.5",
            }}
            showLineNumbers={true}
            wrapLines={true}
          >
            {submission.sourceCode || ""}
          </SyntaxHighlighter>
        </div>
      </Card>

      {/* Test Case Results Summary */}
      {submission.totalTestcases > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("testCases.title")}</h2>
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                {t("testCases.total", { count: submission.totalTestcases })}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
              >
                {t("testCases.passed", { count: submission.testcasesPassed })}
              </Badge>
            </div>
          </div>

          {submission.resultDescription && (
            <Card
              className={cn(
                "overflow-hidden border bg-white",
                submission.status === SubmissionStatus.ACCEPTED
                  ? "border-green-200 dark:border-green-900/50"
                  : submission.status === SubmissionStatus.RUNTIME_ERROR ||
                      submission.status === SubmissionStatus.COMPILATION_ERROR
                    ? "border-yellow-200 dark:border-yellow-900/50"
                    : "border-red-200 dark:border-red-900/50",
              )}
            >
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      submission.status === SubmissionStatus.ACCEPTED
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : submission.status ===
                              SubmissionStatus.RUNTIME_ERROR ||
                            submission.status ===
                              SubmissionStatus.COMPILATION_ERROR
                          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                    )}
                  >
                    {submission.status === SubmissionStatus.ACCEPTED ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : submission.status === SubmissionStatus.RUNTIME_ERROR ||
                      submission.status ===
                        SubmissionStatus.COMPILATION_ERROR ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "font-medium font-semibold",
                        submission.status === SubmissionStatus.ACCEPTED
                          ? "text-green-600 dark:text-green-400"
                          : submission.status ===
                                SubmissionStatus.RUNTIME_ERROR ||
                              submission.status ===
                                SubmissionStatus.COMPILATION_ERROR
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {submission.resultDescription.message}
                    </span>
                  </div>
                </div>

                {/* Content */}
                {submission.resultDescription.compileOutput && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">
                      {t("testCases.errorMessage")}
                    </span>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-md p-3 text-sm font-mono text-yellow-800 dark:text-yellow-200 flex items-start gap-2 whitespace-pre-wrap">
                      {submission.resultDescription.compileOutput}
                    </div>
                  </div>
                )}

                {submission.resultDescription.stderr && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">
                      {t("testCases.errorMessage")}
                    </span>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-md p-3 text-sm font-mono text-yellow-800 dark:text-yellow-200 flex items-start gap-2 whitespace-pre-wrap">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {submission.resultDescription.stderr}
                    </div>
                  </div>
                )}

                {(submission.resultDescription.stdin ||
                  submission.resultDescription.expectedOutput ||
                  submission.resultDescription.stdout) && (
                  <div className="space-y-4">
                    {submission.resultDescription.stdin && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Input
                        </span>
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-md p-3 text-sm font-mono text-muted-foreground whitespace-pre-wrap">
                          {submission.resultDescription.stdin}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {submission.resultDescription.expectedOutput && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t("testCases.expectedOutput")}
                          </span>
                          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-md p-3 text-sm font-mono text-muted-foreground min-h-[3rem] whitespace-pre-wrap">
                            {submission.resultDescription.expectedOutput}
                          </div>
                        </div>
                      )}
                      {submission.resultDescription.stdout && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider">
                            {t("testCases.actualOutput")}
                          </span>
                          <div className="border rounded-md p-3 text-sm font-mono min-h-[3rem] bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-200 whitespace-pre-wrap">
                            {submission.resultDescription.stdout}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
