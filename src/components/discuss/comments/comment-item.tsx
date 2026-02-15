"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { DiscussService, type Comment } from "@/services/discuss-service";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Reply,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { DeleteCommentDialog } from "./delete-comment-dialog";
import { CommentForm } from "./comment-form";
import { useSession } from "next-auth/react";

import { useTranslations, useFormatter } from "next-intl";
import { PermissionEnum } from "@/types/permission";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReplySuccess: () => void;
  onDeleteSuccess: () => void;
  depth?: number;
  isLast?: boolean;
  rootId?: number; // Added rootId prop
}

export function CommentItem({
  comment,
  postId,
  onReplySuccess,
  onDeleteSuccess,
  depth = 0,
  isLast = false,
  rootId,
}: CommentItemProps) {
  const t = useTranslations("Discuss.Comments");
  const { data: session } = useSession();
  const { user: appUser, hasPermission } = useApp();
  const { error: toastError, success: toastSuccess } = useToast();

  // Fallback logic for user
  const user =
    appUser ||
    (session?.user ? { ...session.user, id: Number(session.user.id) } : null);

  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(
    comment.userVote || null,
  );
  const [upvoteCount, setUpvoteCount] = useState(comment.upvoteCount);
  // Initialize to false to hide replies by default
  const [areRepliesExpanded, setAreRepliesExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Identify the root ID (level 0 comment ID)
  const currentRootId = depth === 0 ? comment.id : rootId;

  const isAuthor = user?.id === comment.author.id;
  const getAvatarUrl = () =>
    comment.author.avatarUrl || comment.author.avatarKey || undefined;
  const getDisplayName = () =>
    comment.author.fullName || comment.author.username || "Anonymous";

  // LeetCode style: relative time
  // const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
  //   addSuffix: true,
  // });
  const format = useFormatter();
  const formattedDate = format.relativeTime(
    new Date(comment.createdAt),
    new Date(),
  );

  // Fetch user vote on mount
  useEffect(() => {
    const fetchVote = async () => {
      // In teacher frontend, we might not need to fetch vote if it's already in comment
      // But if we want real-time accuracy:
      if (user) {
        const vote = await DiscussService.getUserVoteForComment(comment.id);
        setUserVote(vote);
      }
    };
    fetchVote();
  }, [comment.id, user]);

  const handleVote = async (type: "UPVOTE" | "DOWNVOTE") => {
    if (!user) {
      toastError(t("messages.loginToVote"));
      return;
    }

    const voteValue = type === "UPVOTE" ? 1 : -1;
    // Optimistic update
    const previousVote = userVote;
    const previousUpvoteCount = upvoteCount;

    let newVote: number | null = voteValue;
    if (userVote === voteValue) {
      newVote = null;
    }

    setUserVote(newVote);

    if (type === "UPVOTE") {
      if (userVote === 1) {
        // Toggling off upvote
        setUpvoteCount((prev) => Math.max(0, prev - 1));
      } else {
        // Toggling on upvote (from null or downvote)
        setUpvoteCount((prev) => prev + 1);
      }
    } else {
      // If we switch from Upvote to Downvote, upvote count should decrease.
      if (userVote === 1) {
        setUpvoteCount((prev) => Math.max(0, prev - 1));
      }
    }

    try {
      if (newVote === null) {
        await DiscussService.unvoteComment(comment.id);
      } else {
        await DiscussService.voteComment(comment.id, voteValue);
      }
    } catch (error) {
      // Revert on error
      setUserVote(previousVote);
      setUpvoteCount(previousUpvoteCount);
      toastError(t("messages.voteError"));
    }
  };

  const handleReply = async (content: string) => {
    const targetParentId = depth === 0 ? comment.id : currentRootId;

    if (!targetParentId) {
      toastError(t("messages.missingContext"));
      return;
    }

    // Transform plain @username to markdown link if present at the start
    let finalContent = content;
    if (
      comment.author.username &&
      content.startsWith(`@${comment.author.username} `)
    ) {
      // In teacher frontend, we might not have a profile page yet, so just leave as text or link to user management if exists
      // For now, keeping it simple or linking to dummy profile
      const link = `**@${comment.author.username}** `;
      finalContent = content.replace(`@${comment.author.username} `, link);
    }

    await DiscussService.createComment(postId, finalContent, targetParentId);
    setIsReplying(false);
    setAreRepliesExpanded(true); // Auto-expand to show new reply
    onReplySuccess();
    toastSuccess(t("messages.replySuccess"));
  };

  // Helper to extract mentions and their links from the ORIGINAL content
  const extractMentions = (text: string) => {
    const mentions = new Map<string, string>();
    const regex = /\[(@[^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1].startsWith("@")) {
        mentions.set(match[1], match[2]);
      }
    }
    return mentions;
  };

  // Helper to simplify content for display in the textarea (remove links)
  const simplifyContent = (text: string) => {
    return text.replace(/\[(@[^\]]+)\]\(([^)]+)\)/g, "$1");
  };

  // Helper to restore links to mentions before saving
  const restoreContent = (text: string, originalText: string) => {
    // Simple restoration logic if needed, or just pass as is if we simplify implementation
    return text;
  };

  const handleEdit = async (content: string) => {
    // For simplicity in teacher frontend, we might skip complex mention restoration for now
    // const finalContent = restoreContent(content, comment.content);
    const finalContent = content;

    await DiscussService.updateComment(comment.id, finalContent);
    setIsEditing(false);
    onReplySuccess();
    toastSuccess(t("messages.updateSuccess"));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DiscussService.deleteComment(comment.id);
      onDeleteSuccess();
      toastSuccess(t("messages.deleteSuccess"));
    } catch (error) {
      toastError(t("messages.deleteError"));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Pre-fill @Username as plain text for clean UX
  const replyInitialValue = comment.author.username
    ? `@${comment.author.username} `
    : "";

  return (
    <div
      className={cn(
        "relative animate-in fade-in slide-in-from-top-1",
        depth > 0 ? "mt-2" : "py-2 border-b border-border/40 last:border-0",
      )}
    >
      <div
        className={cn(
          "group flex gap-4 p-3 rounded-xl transition-all",
          depth > 0
            ? "bg-muted/30 border border-border/40 hover:bg-muted/60"
            : "hover:bg-muted/40",
        )}
      >
        {/* Avatar Column */}
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-border/50 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
            <AvatarFallback className="bg-muted text-xs sm:text-sm font-medium text-muted-foreground">
              {getDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span
                className={cn(
                  "font-semibold transition-colors",
                  comment.isDeleted
                    ? "text-muted-foreground italic"
                    : "text-foreground hover:text-primary cursor-pointer",
                )}
              >
                {comment.isDeleted ? t("item.deleted") : getDisplayName()}
              </span>

              <span className="text-muted-foreground text-xs">
                {formattedDate}
              </span>
              {!comment.isDeleted && comment.isEdited && (
                <span className="text-[10px] text-muted-foreground italic">
                  {t("item.edited")}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="mt-2">
              <CommentForm
                onSubmit={handleEdit}
                onCancel={() => setIsEditing(false)}
                placeholder={t("placeholders.edit")}
                submitLabel={t("actions.save")}
                autoFocus
                initialValue={simplifyContent(comment.content)}
                showAvatar={false}
              />
            </div>
          ) : (
            <div className="mt-1 text-sm text-foreground/90 prose prose-sm dark:prose-invert max-w-none leading-relaxed">
              {comment.isDeleted ? (
                <span className="text-muted-foreground italic">
                  {t("item.deletedContent")}
                </span>
              ) : (
                <MarkdownRenderer content={comment.content} />
              )}
            </div>
          )}

          {/* Footer Actions */}
          {!isEditing && !comment.isDeleted && (
            <div className="flex items-center gap-6 pt-2">
              {/* Vote Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-1.5 text-muted-foreground hover:text-foreground gap-1 hover:bg-transparent p-0",
                    userVote === 1 && "text-green-600 hover:text-green-700",
                  )}
                  onClick={() => handleVote("UPVOTE")}
                >
                  <ArrowBigUp
                    className={cn("h-5 w-5", userVote === 1 && "fill-current")}
                  />
                  <span className="text-xs font-medium min-w-[1ch]">
                    {upvoteCount}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-1 text-muted-foreground hover:text-foreground hover:bg-transparent p-0",
                    userVote === -1 && "text-blue-500 hover:text-blue-600",
                  )}
                  onClick={() => handleVote("DOWNVOTE")}
                >
                  <ArrowBigDown
                    className={cn("h-5 w-5", userVote === -1 && "fill-current")}
                  />
                </Button>
              </div>

              {/* Hide/Show Replies - Inline */}
              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAreRepliesExpanded(!areRepliesExpanded)}
                  className="h-6 px-0 text-muted-foreground hover:text-foreground gap-1.5 font-medium text-xs hover:bg-transparent"
                >
                  <MessageSquare className="h-4 w-4" />
                  {areRepliesExpanded
                    ? t("actions.hideReplies")
                    : t("actions.showReplies", {
                        count: comment.replies.length,
                      })}
                </Button>
              )}

              {/* Reply Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-0 text-muted-foreground hover:text-foreground gap-1.5 font-medium text-xs hover:bg-transparent"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-4 w-4" />
                {t("actions.reply")}
              </Button>

              {/* Edit (if author) */}
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-6 px-0 text-muted-foreground hover:text-foreground gap-1.5 font-medium text-xs hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("actions.edit")}
                </Button>
              )}

              {/* Delete (if author or admin) */}
              {(isAuthor || hasPermission(PermissionEnum.ADMIN_ACCESS)) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-6 px-0 text-muted-foreground hover:text-destructive gap-1.5 font-medium text-xs hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("actions.delete")}
                </Button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 pl-0">
              <CommentForm
                onSubmit={handleReply}
                onCancel={() => setIsReplying(false)}
                placeholder={t("placeholders.replyTo", {
                  name: getDisplayName(),
                })}
                submitLabel={t("actions.reply")}
                autoFocus
                initialValue={replyInitialValue}
                className="animate-in fade-in slide-in-from-top-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div
          className={cn(
            "mt-2 pl-4 sm:pl-14 transition-all duration-300 ease-in-out",
            !areRepliesExpanded && "hidden",
          )}
        >
          {areRepliesExpanded && (
            <div className="space-y-2">
              {comment.replies.map((reply, index) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onReplySuccess={onReplySuccess}
                  onDeleteSuccess={onDeleteSuccess}
                  depth={depth + 1}
                  isLast={index === comment.replies!.length - 1}
                  rootId={currentRootId} // Pass down the rootId
                />
              ))}
            </div>
          )}
        </div>
      )}

      <DeleteCommentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
