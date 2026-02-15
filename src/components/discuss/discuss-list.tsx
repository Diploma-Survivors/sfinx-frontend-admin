"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DiscussService } from "@/services/discuss-service";
import { Post } from "@/types/discuss";
import { format } from "date-fns";
import {
  ArrowBigUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Badge } from "@/components/ui/badge";

import { useTranslations } from "next-intl";
import { DeletePostDialog } from "@/components/discuss/delete-post-dialog";

export function DiscussList() {
  const t = useTranslations("Discuss.List");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error, success } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC";
  const showDeleted = searchParams.get("showDeleted") === "true";

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const result = await DiscussService.getPosts({
          page,
          limit: 10,
          search,
          sortBy,
          sortOrder,
          showDeleted,
        });
        setPosts(result.data || []);
        setTotalPages(result.meta.totalPages);
      } catch (err) {
        error(t("messages.fetchError"));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [page, search, sortBy, sortOrder, showDeleted]);

  const updateFilters = (
    updates: Record<string, string | number | boolean>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`?${params.toString()}`);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await DiscussService.deletePost(postToDelete, true);
      success(t("messages.deleteSuccess"));
      // Refresh list
      const result = await DiscussService.getPosts({
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        showDeleted,
      });
      setPosts(result.data || []);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      error(t("messages.deleteError"));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchExample")}
            value={search}
            onChange={(e) => {
              // Debouncing could be added here
              updateFilters({ search: e.target.value, page: 1 });
            }}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={sortBy}
            onValueChange={(value) => updateFilters({ sortBy: value, page: 1 })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">
                {t("sortOptions.newest")}
              </SelectItem>
              <SelectItem value="viewCount">
                {t("sortOptions.mostViewed")}
              </SelectItem>
              <SelectItem value="upvoteCount">
                {t("sortOptions.mostUpvoted")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={showDeleted ? "true" : "false"}
            onValueChange={(value) =>
              updateFilters({ showDeleted: value === "true", page: 1 })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("status.label")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">{t("status.active")}</SelectItem>
              <SelectItem value="true">{t("status.deletedAdmin")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.title")}</TableHead>
              <TableHead>{t("table.author")}</TableHead>
              <TableHead>{t("table.stats")}</TableHead>
              <TableHead>{t("table.createdAt")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24 mt-2" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t("noDiscussions")}
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow
                  key={post.id}
                  className={post.isDeleted ? "opacity-60 bg-muted/50" : ""}
                >
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/discussions/${post.id}`}
                        className="font-medium hover:underline flex items-center gap-2"
                      >
                        {post.title}
                        {post.isDeleted && (
                          <Badge
                            variant="destructive"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            {t("badges.deleted")}
                          </Badge>
                        )}
                      </Link>
                      <div className="flex gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author?.avatarUrl} />
                        <AvatarFallback className="text-[10px]">
                          {(post.author?.fullName ||
                            post.author?.username ||
                            "A")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {post.author?.fullName ||
                          post.author?.username ||
                          "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-3 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.commentCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.viewCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowBigUp className="w-5 h-5" />
                        {post.upvoteCount}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/discussions/${post.id}`}>
                            {t("actions.viewDetails")}
                          </Link>
                        </DropdownMenuItem>
                        {/* Add Admin Actions */}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => confirmDelete(post.id)}
                        >
                          {t("actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateFilters({ page: page - 1 })}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateFilters({ page: page + 1 })}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
      <DeletePostDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
