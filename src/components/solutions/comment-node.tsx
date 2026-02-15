"use client";

import { Button } from "@/components/ui/button";
import { SolutionComment } from "@/types/solution";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import CommentItem from "./comment-item";
import { useState } from "react";

interface CommentNodeProps {
  comment: SolutionComment;
  getReplies: (parentId: number) => SolutionComment[];
  solutionId: number;
  onReplySuccess: (newComment: SolutionComment) => void;
  onDelete: (commentId: number) => void;
  depth?: number;
}

export default function CommentNode({
  comment,
  getReplies,
  solutionId,
  onReplySuccess,
  onDelete,
  depth = 0,
}: CommentNodeProps) {
  const t = useTranslations("SolutionDetailPage");
  const replies = getReplies(comment.id);
  const hasReplies = comment.replyCounts > 0 || replies.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand if we just added a reply (handled by logic in parent usually, or locally here if we add simplistic state)
  // For simplicity, we just toggle.

  const containerClass =
    depth === 0
      ? "bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg space-y-4"
      : "bg-slate-100 dark:bg-slate-800 p-3 rounded-lg space-y-3";

  return (
    <div className={containerClass}>
      <CommentItem
        comment={comment}
        solutionId={solutionId}
        onReplySuccess={(newComment) => {
          onReplySuccess(newComment);
          setIsExpanded(true); // Expand to show new reply
        }}
        onDelete={onDelete}
      />

      {hasReplies && (
        <div className={depth === 0 ? "pl-4 sm:pl-8" : "pl-2 sm:pl-4"}>
          {!isExpanded ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-slate-500 h-auto p-0 hover:bg-transparent hover:text-slate-800 dark:hover:text-slate-300"
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              {t("viewReplies", {
                count: replies.length || comment.replyCounts,
              })}
            </Button>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-slate-500 h-auto p-0 hover:bg-transparent hover:text-slate-800 dark:hover:text-slate-300"
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                {t("hideReplies")}
              </Button>

              <div className="space-y-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                {replies.map((reply) => (
                  <CommentNode
                    key={reply.id}
                    comment={reply}
                    getReplies={getReplies}
                    solutionId={solutionId}
                    onReplySuccess={onReplySuccess}
                    onDelete={onDelete}
                    depth={depth + 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
