"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SolutionsService } from "@/services/solutions-service";
import { useTranslations, useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import CommentSection from "@/components/solutions/comment-section";
import { SolutionVoteType } from "@/types/solution";
import { useToast } from "@/components/providers/toast-provider";
import { PermissionEnum } from "@/types/permission";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Flag,
  Trash2,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useRouter } from "next/navigation";

interface SolutionDetailPageProps {
  params: Promise<{
    locale: string;
    id: string; // solutionId
  }>;
}

export default function SolutionDetailPage({
  params,
}: SolutionDetailPageProps) {
  const { id: solutionIdStr } = React.use(params);
  const solutionId = parseInt(solutionIdStr, 10);
  const t = useTranslations("SolutionDetailPage");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: solution, isLoading } = useQuery({
    queryKey: ["solution", solutionId],
    queryFn: () => SolutionsService.getSolution(solutionId),
  });

  const voteMutation = useMutation({
    mutationFn: (type: SolutionVoteType) =>
      SolutionsService.vote(solutionId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solution", solutionId] });
    },
    onError: () => {
      toast.error(t("voteError"));
    },
  });

  const unvoteMutation = useMutation({
    mutationFn: () => SolutionsService.unvote(solutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solution", solutionId] });
    },
    onError: () => {
      toast.error(t("voteError"));
    },
  });

  const { user, hasPermission } = useApp();
  const router = useRouter();

  const handleVote = (type: SolutionVoteType) => {
    if (!solution) return;
    if (solution?.userVote === (type === SolutionVoteType.UPVOTE ? 1 : -1)) {
      unvoteMutation.mutate();
    } else {
      voteMutation.mutate(type);
    }
  };

  const handleDelete = async () => {
    try {
      await SolutionsService.deleteSolutionAdmin(solutionId);
      toast.success(t("deleteSolutionSuccess"));
      router.push(`/problems/${solution?.problemId}/solutions`);
    } catch (error) {
      toast.error(t("deleteSolutionError"));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">{t("notFound")}</h1>
      </div>
    );
  }

  const dateLocale = locale === "vi" ? vi : enUS;
  const isAdmin = hasPermission(PermissionEnum.ADMIN_ACCESS);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {solution.title}
            </h1>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    {t("deleteSolution")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteSolution")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteSolutionConfirm")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={solution.author.avatarUrl} />
                <AvatarFallback>
                  {solution.author.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">
                  {solution.author.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(solution.createdAt), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Actions like Share, Report could go here */}
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          {solution.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>

        <Separator />

        {/* Content */}
        <div className="min-h-[200px]">
          <MarkdownRenderer content={solution.content} />
        </div>

        <Separator />

        {/* Footer / Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={solution.userVote === 1 ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => handleVote(SolutionVoteType.UPVOTE)}
            >
              <ThumbsUp className="h-4 w-4" />
              {solution.upvoteCount}
            </Button>
            <Button
              variant={solution.userVote === -1 ? "destructive" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => handleVote(SolutionVoteType.DOWNVOTE)}
            >
              <ThumbsDown className="h-4 w-4" />
              {solution.downvoteCount}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>
              {solution.commentCount} {t("comments")}
            </span>
          </div>
        </div>

        <Separator />

        <CommentSection solutionId={solutionId} />
      </div>
    </div>
  );
}
