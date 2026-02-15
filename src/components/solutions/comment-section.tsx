"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/app-context";
import { SolutionsService } from "@/services/solutions-service";
import { SolutionComment } from "@/types/solution";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import CommentNode from "./comment-node";
import { useToast } from "@/components/providers/toast-provider";

interface CommentSectionProps {
  solutionId: number;
}

export default function CommentSection({ solutionId }: CommentSectionProps) {
  const { user } = useApp();
  const t = useTranslations("SolutionDetailPage");
  const [comments, setComments] = useState<SolutionComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const data = await SolutionsService.getComments(solutionId);
        // Ensure uniqueness if API behavior is weird, though frontend shouldn't really have to.
        // Assuming API returns flat list
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [solutionId]);

  const handleSubmitComment = async () => {
    if (!newCommentContent.trim()) return;
    setIsSubmitting(true);
    try {
      const newComment = await SolutionsService.createComment({
        solutionId,
        content: newCommentContent,
      });
      setComments((prev) => [newComment, ...prev]);
      setNewCommentContent("");
      toast.success(t("postSuccess"));
    } catch (error) {
      toast.error(t("postError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySuccess = (newReply: SolutionComment) => {
    setComments((prev) => [...prev, newReply]);
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const getReplies = (parentId: number) => {
    return comments
      .filter((c) => c.parentId === parentId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  };

  const topLevelComments = comments
    .filter((c) => !c.parentId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">
            {comments.length} {t("comments")}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={t("commentPlaceholder")}
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newCommentContent.trim() || isSubmitting}
            >
              {isSubmitting ? t("submitting") : t("postComment")}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))
          : topLevelComments.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                getReplies={getReplies}
                solutionId={solutionId}
                onReplySuccess={handleReplySuccess}
                onDelete={handleDeleteComment}
              />
            ))}
      </div>
    </div>
  );
}
