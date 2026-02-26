"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromptStatus } from "@/types/ai-prompt";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import {
    MoreHorizontal,
    Settings2,
    Trash2,
    ExternalLink,
    RefreshCw,
    Clock,
    Database,
    Hash,
} from "lucide-react";

interface PromptTableProps {
    prompts: PromptStatus[];
    loading: boolean;
    onEdit: (prompt: PromptStatus) => void;
    onDeactivate: (prompt: PromptStatus) => void;
    onClearCache: (prompt: PromptStatus) => void;
    clearingCacheId: number | null;
}

function getLabelBadgeClass(label: string): string {
    switch (label.toLowerCase()) {
        case "production":
            return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
        case "staging":
            return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
        default:
            return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
}

function CardSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </CardContent>
            <CardFooter className="border-t pt-3">
                <Skeleton className="h-8 w-full" />
            </CardFooter>
        </Card>
    );
}

export function PromptTable({
    prompts,
    loading,
    onEdit,
    onDeactivate,
    onClearCache,
    clearingCacheId,
}: PromptTableProps) {
    const t = useTranslations("AiPromptsTable");

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (prompts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                <Database className="h-10 w-10 mb-3 opacity-30" />
                <p className="font-medium">{t("noPromptsFound")}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((prompt) => (
                <Card
                    key={prompt.id}
                    className={`flex flex-col transition-all duration-150 ${
                        prompt.langfuseUrl
                            ? "cursor-pointer hover:shadow-md hover:border-primary/40 group"
                            : ""
                    }`}
                    onClick={() =>
                        prompt.langfuseUrl && window.open(prompt.langfuseUrl, "_blank")
                    }
                >
                    {/* Header: name + active badge */}
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                                    {prompt.featureName}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                    {prompt.description ?? (
                                        <span className="italic opacity-60">{t("noDescription")}</span>
                                    )}
                                </p>
                            </div>
                            <Badge
                                variant="secondary"
                                className={`shrink-0 ${
                                    prompt.isActive
                                        ? "bg-primary/10 text-primary border-primary/20"
                                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                            >
                                {prompt.isActive ? t("active") : t("inactive")}
                            </Badge>
                        </div>
                    </CardHeader>

                    {/* Body: prompt name, label, cache info */}
                    <CardContent className="flex-1 space-y-2.5 pt-0">
                        {/* Langfuse prompt name + label */}
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                                {t("langfusePrompt")}
                            </span>
                            <div className="flex items-center gap-2 min-w-0">
                                <code className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
                                    {prompt.langfusePromptName}
                                </code>
                                <Badge
                                    variant="outline"
                                    className={`shrink-0 text-xs ${getLabelBadgeClass(prompt.langfuseLabel)}`}
                                >
                                    {prompt.langfuseLabel}
                                </Badge>
                            </div>
                        </div>

                        {/* Cache status */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                                <Database className="h-3.5 w-3.5" />
                                {t("cached")}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={`h-2 w-2 rounded-full shrink-0 ${
                                        prompt.cached ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                                    }`}
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {prompt.cached ? t("cachedYes") : t("cachedNo")}
                                </span>
                                {prompt.cachedVersion != null && (
                                    <span className="flex items-center gap-0.5 text-xs text-slate-400">
                                        <Hash className="h-3 w-3" />
                                        {prompt.cachedVersion}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Last synced */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                                <Clock className="h-3.5 w-3.5" />
                                {t("lastSynced")}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {prompt.lastSyncedAt
                                    ? formatDistanceToNow(new Date(prompt.lastSyncedAt), {
                                          addSuffix: true,
                                      })
                                    : t("never")}
                            </span>
                        </div>
                    </CardContent>

                    {/* Footer: langfuse hint + actions menu */}
                    <CardFooter
                        className="border-t pt-3 flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {prompt.langfuseUrl ? (
                            <span className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-primary transition-colors">
                                <ExternalLink className="h-3.5 w-3.5" />
                                {t("clickToEdit")}
                            </span>
                        ) : (
                            <span className="text-xs text-slate-300 dark:text-slate-600">
                                {t("noLangfuseUrl")}
                            </span>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">{t("openMenu")}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {prompt.langfuseUrl && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            window.open(prompt.langfuseUrl!, "_blank")
                                        }
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        {t("openInLangfuse")}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => onEdit(prompt)}>
                                    <Settings2 className="mr-2 h-4 w-4" />
                                    {t("editMapping")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onClearCache(prompt)}
                                    disabled={clearingCacheId === prompt.id}
                                >
                                    <RefreshCw
                                        className={`mr-2 h-4 w-4 ${
                                            clearingCacheId === prompt.id ? "animate-spin" : ""
                                        }`}
                                    />
                                    {t("clearCache")}
                                </DropdownMenuItem>
                                {prompt.isActive && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onDeactivate(prompt)}
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t("deactivate")}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
