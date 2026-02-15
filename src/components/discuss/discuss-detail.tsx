"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiscussService } from "@/services/discuss-service";
import { Post } from "@/types/discuss";
import { CommentSection } from "@/components/discuss/comments/comment-section";
import { format } from "date-fns";
import {
  ArrowBigDown,
  ArrowBigUp,
  Edit,
  Share2,
  Trash,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/providers/toast-provider";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { DeletePostDialog } from "./delete-post-dialog";

interface DiscussDetailProps {
  postId: string;
}

export function DiscussDetail({ postId }: DiscussDetailProps) {
  const t = useTranslations("Discuss.Detail");
  const router = useRouter();
  const { data: session } = useSession();
  const { error, success } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [localUpvoteCount, setLocalUpvoteCount] = useState(0);
  const [localDownvoteCount, setLocalDownvoteCount] = useState(0);
  const viewCountedRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const postData = await DiscussService.getPost(postId);
        setPost(postData);
        setLocalUpvoteCount(postData.upvoteCount);
        setLocalDownvoteCount(postData.downvoteCount);

        const vote = await DiscussService.getUserVoteForPost(postId);
        setUserVote(vote);
      } catch (err) {
        error(t("messages.fetchError"));
        // router.push("/discussions");
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId, router]);

  useEffect(() => {
    if (postId && viewCountedRef.current !== postId) {
      DiscussService.incrementViewCount(postId);
      viewCountedRef.current = postId;
    }
  }, [postId]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      if (post) {
        await DiscussService.deletePost(post.id, true);
        success(t("messages.deleteSuccess"));
        router.push("/discussions");
      }
    } catch (err) {
      error(t("messages.deleteError"));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleUpvote = async () => {
    if (!post) return;

    const previousVote = userVote;
    const previousUpvoteCount = localUpvoteCount;
    const previousDownvoteCount = localDownvoteCount;

    try {
      let newVote: 1 | -1 | null = 1;
      if (userVote === 1) {
        newVote = null;
        await DiscussService.unvotePost(post.id);
        setLocalUpvoteCount((prev) => prev - 1);
      } else {
        if (userVote === -1) {
          setLocalDownvoteCount((prev) => prev - 1);
        }
        const counts = await DiscussService.votePost(post.id, 1);
        setLocalUpvoteCount(counts.upvoteCount);
        setLocalDownvoteCount(counts.downvoteCount);
      }
      setUserVote(newVote);
    } catch (err) {
      console.error("Failed to upvote:", err);
      setUserVote(previousVote);
      setLocalUpvoteCount(previousUpvoteCount);
      setLocalDownvoteCount(previousDownvoteCount);
    }
  };

  const handleDownvote = async () => {
    if (!post) return;

    const previousVote = userVote;
    const previousUpvoteCount = localUpvoteCount;
    const previousDownvoteCount = localDownvoteCount;

    try {
      let newVote: 1 | -1 | null = -1;
      if (userVote === -1) {
        newVote = null;
        await DiscussService.unvotePost(post.id);
        setLocalDownvoteCount((prev) => prev - 1);
      } else {
        if (userVote === 1) {
          setLocalUpvoteCount((prev) => prev - 1);
        }
        const counts = await DiscussService.votePost(post.id, -1);
        setLocalUpvoteCount(counts.upvoteCount);
        setLocalDownvoteCount(counts.downvoteCount);
      }
      setUserVote(newVote);
    } catch (err) {
      console.error("Failed to downvote:", err);
      setUserVote(previousVote);
      setLocalUpvoteCount(previousUpvoteCount);
      setLocalDownvoteCount(previousDownvoteCount);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-24 bg-muted rounded" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">{t("notFound")}</h2>
        <p className="text-muted-foreground mb-6">{t("notFoundDesc")}</p>
        <Link href="/discussions">
          <Button variant="outline">{t("backToDiscussions")}</Button>
        </Link>
      </div>
    );
  }

  const getDisplayName = () => {
    return post.author.fullName || post.author.username || "Anonymous";
  };

  const getAvatarUrl = () => {
    return post.author.avatarUrl;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8">
      {/* Back Button */}
      <Link
        href="/discussions"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("backToDiscussions")}
      </Link>

      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeletePost}
        isDeleting={isDeleting}
      />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex gap-2 mb-2">
          {post.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance text-foreground leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-between pb-4 pt-2 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
              <AvatarFallback>
                {getDisplayName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm sm:text-base">
                {getDisplayName()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {t("postedDate", {
                  date: format(new Date(post.createdAt), "PPP"),
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Improved Edit Button */}
            {session?.user?.id === post.author.id && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-2 h-8"
                  onClick={() => router.push(`/discussions/${post.id}/edit`)}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="text-xs">{t("actions.edit")}</span>
                </Button>
                {/* Mobile Edit Icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => router.push(`/discussions/${post.id}/edit`)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Improved Delete Button */}
            <Button
              variant="ghost"
              size="icon"
              title={t("actions.delete")}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title={t("actions.share")}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Actions (Vote) */}
      <div className="flex items-center gap-4 py-4 border-t border-b border-border my-6">
        <div className="flex items-center bg-muted/50 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            className={cn(
              "hover:bg-background hover:shadow-sm transition-all duration-300 gap-1",
              userVote === 1 && "text-green-600 hover:text-green-700",
            )}
          >
            <ArrowBigUp
              className={cn("w-5 h-5", userVote === 1 && "fill-current")}
            />
            <span className="text-xs font-medium min-w-[1ch]">
              {localUpvoteCount}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownvote}
            className={cn(
              "hover:bg-background hover:shadow-sm transition-all duration-300",
              userVote === -1 && "text-blue-500 hover:text-blue-600",
            )}
          >
            <ArrowBigDown
              className={cn("w-5 h-5", userVote === -1 && "fill-current")}
            />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground ml-auto">
          {t("views", { count: post.viewCount })}
        </div>
      </div>

      {/* Comments */}
      <CommentSection postId={postId} />
    </div>
  );
}
