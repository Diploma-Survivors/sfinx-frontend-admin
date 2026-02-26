import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersService } from "@/services/users-service";
import { Solution, SolutionSortBy } from "@/types/user-detail";
import { format } from "date-fns";
import {
  ArrowRight,
  Loader2,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface UserSolutionsProps {
  userId: number;
}

export function UserSolutions({ userId }: UserSolutionsProps) {
  const t = useTranslations("UserDetailPage.components.solutions");
  const [userSolutions, setUserSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SolutionSortBy>(SolutionSortBy.RECENT);

  const fetchUserSolutions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await usersService.getUserSolutions(userId, {
        page,
        limit: 10,
        sortBy,
      });
      // Assuming response.data.data contains the array of solutions
      setUserSolutions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching user solutions:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, page, sortBy]);

  useEffect(() => {
    fetchUserSolutions();
  }, [fetchUserSolutions]);

  return (
    <Card className="border border-border shadow-md bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <div className="flex items-center gap-4">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SolutionSortBy)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SolutionSortBy.RECENT}>
                {t("mostRecent")}
              </SelectItem>
              <SelectItem value={SolutionSortBy.MOST_VOTED}>
                {t("mostVoted")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : userSolutions.length > 0 ? (
          <div className="space-y-4">
            {userSolutions.map((solution) => (
              <div
                key={solution.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground hover:text-primary transition-colors">
                    {solution.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {format(new Date(solution.createdAt), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {solution.upvoteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3" />
                      {solution.downvoteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {solution.commentCount}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {t("empty")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
