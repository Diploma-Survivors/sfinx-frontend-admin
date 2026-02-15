"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/app-context";
import { SolutionsService } from "@/services/solutions-service";
import { SolutionComment, SolutionCommentVoteType } from "@/types/solution";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import {
  ArrowBigDown,
  ArrowBigUp,
  MessageSquare,
  Trash2,
  Pin,
} from "lucide-react";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/components/providers/toast-provider";
import { PermissionEnum } from "@/types/permission";
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

interface CommentItemProps {
  comment: SolutionComment;
  solutionId: number;
  // solutionAuthorId removed as it's not needed for checking admin
  onReplySuccess: (newComment: SolutionComment) => void;
  onDelete: (commentId: number) => void;
}

export default function CommentItem({
  comment: initialComment,
  solutionId,
  onReplySuccess,
  onDelete,
}: CommentItemProps) {
  const { user, hasPermission } = useApp();
  const t = useTranslations("SolutionDetailPage");
  const locale = useLocale();
  const [comment, setComment] = useState(initialComment);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const toast = useToast();

  const isAuthor = user?.id === comment.author.id;
  const isAdmin = hasPermission(PermissionEnum.ADMIN_ACCESS);
  const dateLocale = locale === "vi" ? vi : enUS;

  const handleVote = async (voteType: SolutionCommentVoteType) => {
    try {
      if (comment.userVote === voteType) {
        await SolutionsService.unvoteComment(comment.id);
        setComment((prev) => ({
          ...prev,
          userVote: undefined,
          upvoteCount:
            voteType === SolutionCommentVoteType.UPVOTE
              ? prev.upvoteCount - 1
              : prev.upvoteCount,
          downvoteCount:
            voteType === SolutionCommentVoteType.DOWNVOTE
              ? prev.downvoteCount - 1
              : prev.downvoteCount,
        }));
      } else {
        await SolutionsService.voteComment(comment.id, voteType);
        setComment((prev) => ({
          ...prev,
          userVote: voteType,
          upvoteCount:
            voteType === SolutionCommentVoteType.UPVOTE
              ? prev.upvoteCount + 1
              : prev.userVote === SolutionCommentVoteType.UPVOTE
                ? prev.upvoteCount - 1
                : prev.upvoteCount,
          downvoteCount:
            voteType === SolutionCommentVoteType.DOWNVOTE
              ? prev.downvoteCount + 1
              : prev.userVote === SolutionCommentVoteType.DOWNVOTE
                ? prev.downvoteCount - 1
                : prev.downvoteCount,
        }));
      }
    } catch (error) {
      toast.error(t("voteError"));
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);
    try {
      const newComment = await SolutionsService.createComment({
        solutionId,
        content: replyContent,
        parentId: comment.id,
      });
      onReplySuccess(newComment);
      setIsReplying(false);
      setReplyContent("");
      toast.success(t("replySuccess"));
    } catch (error) {
      toast.error(t("replyError"));
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    try {
      await SolutionsService.deleteComment(comment.id);
      onDelete(comment.id);
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"));
    }
  };

  const handlePin = async () => {
    try {
      if (comment.isPinned) {
        await SolutionsService.unpinComment(comment.id);
        setComment((prev) => ({ ...prev, isPinned: false }));
        toast.success(t("unpinSuccess"));
      } else {
        await SolutionsService.pinComment(comment.id);
        setComment((prev) => ({ ...prev, isPinned: true }));
        toast.success(t("pinSuccess"));
      }
    } catch (error) {
      toast.error(comment.isPinned ? t("unpinError") : t("pinError"));
    }
  };

  return (
    <div
      className={`flex gap-3 group ${
        comment.isPinned
          ? "bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded-md -mx-2"
          : ""
      }`}
    >
      <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700 mt-1">
        <AvatarImage src={comment.author?.avatarUrl} />
        <AvatarFallback>
          {comment.author?.username?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {comment.isPinned && (
              <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
            )}
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {comment.author?.username}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </span>
          </div>
        </div>

        <div className="text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap">
          {comment.content}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote(SolutionCommentVoteType.UPVOTE)}
              className={`flex cursor-pointer items-center gap-1 hover:text-green-600 transition-colors ${
                comment.userVote === SolutionCommentVoteType.UPVOTE
                  ? "text-green-600"
                  : ""
              }`}
            >
              <ArrowBigUp
                className={`w-4 h-4 ${
                  comment.userVote === SolutionCommentVoteType.UPVOTE
                    ? "fill-current"
                    : ""
                }`}
              />
              <span>{comment.upvoteCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote(SolutionCommentVoteType.DOWNVOTE)}
              className={`flex cursor-pointer items-center gap-1 hover:text-red-600 transition-colors ${
                comment.userVote === SolutionCommentVoteType.DOWNVOTE
                  ? "text-red-600"
                  : ""
              }`}
            >
              <ArrowBigDown
                className={`w-4 h-4 ${
                  comment.userVote === SolutionCommentVoteType.DOWNVOTE
                    ? "fill-current"
                    : ""
                }`}
              />
              <span>{comment.downvoteCount}</span>
            </button>
          </div>

          <button
            onClick={() => setIsReplying(!isReplying)}
            className="cursor-pointer flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t("reply")}</span>
          </button>

          {isAdmin && (
            <button
              onClick={handlePin}
              className={`cursor-pointer flex items-center gap-1 transition-colors ${
                comment.isPinned
                  ? "text-amber-600 hover:text-amber-700"
                  : "hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{comment.isPinned ? t("unpin") : t("pin")}</span>
            </button>
          )}

          {isAuthor && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="cursor-pointer flex items-center gap-1 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t("delete")}</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("deleteConfirm")}
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

        {isReplying && (
          <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t("replyPlaceholder")}
              className="min-h-[80px] text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                size="sm" // Removed extra space
                onClick={handleReplySubmit}
                disabled={!replyContent.trim() || isSubmittingReply}
              >
                {isSubmittingReply ? t("submitting") : t("postReply")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
