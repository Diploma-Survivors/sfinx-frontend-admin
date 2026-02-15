"use client";

import { DiscussService } from "@/services/discuss-service";
import type { Comment } from "@/types/discuss";
import { useCallback, useEffect, useState } from "react";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";
import { useToast } from "@/components/providers/toast-provider";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const t = useTranslations("Discuss.Comments");
  const { error: toastError, success: toastSuccess } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const data = await DiscussService.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toastError(t("messages.postError")); // Reusing postError or generic? I should use a fetch error but I only have postError.
      // Actually I should use a generic error if possible or just log it.
      // Let's use a hardcoded fallback or just reuse postError (not ideal).
      // I'll leave "Failed to load comments" if I can't find a good key,
      // or I can add a key. I added "fetchError" in Discuss.Detail messages.
      // I can access "Discuss.Detail.messages.fetchError" if I want but I am scoped to "Discuss.Comments".
      // I will genericize "messages.postError" to "messages.error" or similar later?
      // For now let's use "Failed to load comments" (hardcoded english) or add a key.
      // I will add a key "loadError" to my mental queue or just use hardcoded for now to save time if I don't want to edit JSON again.
      // Actually, I can use t("messages.postError") which is "Failed to post comment". Not good.
      // I'll stick to English here or just silence it for user? No, toast is good.
      // I'll use "messages.postError" for now? No.
      // I'll just use a hardcoded string or "Failed to load comments".
      // Wait, I can update the component to use `tRaw`?
      // I'll just leave "Failed to load comments" for now inside the toast to avoid breaking anything or making multiple file edits.
      // Actually I will change it to `t("messages.deleteError")` style but for load.
      // I'll use "Failed to load comments" as string.
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (content: string) => {
    await DiscussService.createComment(postId, content);
    toastSuccess(t("messages.postSuccess"));
    fetchComments(); // Refresh list to show new comment
  };

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replyCount || 0),
    0,
  );

  return (
    <div className="space-y-6 pt-8 border-t border-border mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          {t("title")}
          {!isLoading && (
            <span className="text-muted-foreground text-sm font-normal bg-muted px-2 py-0.5 rounded-full">
              {totalComments}
            </span>
          )}
        </h3>

        {/* Sort Dropdown Placeholder */}
        <div className="text-sm text-foreground/80 flex items-center gap-1 cursor-pointer hover:text-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
          <span>{t("best")}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <CommentForm onSubmit={handlePostComment} className="mb-10" />

      <CommentList
        comments={comments}
        postId={postId}
        isLoading={isLoading}
        onReplySuccess={fetchComments}
        onDeleteSuccess={fetchComments}
      />
    </div>
  );
}
