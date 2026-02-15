"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserActivityHeatmap } from "@/components/user/user-details/user-activity-heatmap";
import { UserContestHistory } from "@/components/user/user-details/user-contest-history";
import { UserProfileSidebar } from "@/components/user/user-details/user-profile-sidebar";
import { UserRecentActivity } from "@/components/user/user-details/user-recent-activity";
import { UserSolutions } from "@/components/user/user-details/user-solutions";
import { UserSolvedProblemsChart } from "@/components/user/user-details/user-solved-problems-chart";
import { UserSubmissionStatsChart } from "@/components/user/user-details/user-submission-stats-chart";
import { usersService } from "@/services/users-service";
import { UserProfile } from "@/types/user";
import { UserProblemStats, UserSubmissionStats } from "@/types/user-detail";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userIdString } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Stats
  const [problemStats, setProblemStats] = useState<UserProblemStats | null>(
    null,
  );
  const [submissionStats, setSubmissionStats] =
    useState<UserSubmissionStats | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = Number(userIdString);

        // Fetch User Profile
        const userRes = await usersService.getUserProfile(userId);
        setUser(userRes.data);

        // Fetch Stats
        const statsRes = await usersService.getUserStats(userId);
        // @ts-ignore - The response structure might need adjustment based on exact API response
        setProblemStats(statsRes.problemStats);
        // @ts-ignore
        setSubmissionStats(statsRes.submissionStats);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userIdString]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <div>User not found</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: User Profile Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <UserProfileSidebar user={user} />
        </div>

        {/* Right Column: Stats, Heatmap, Activity */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {problemStats && <UserSolvedProblemsChart stats={problemStats} />}
            {submissionStats && (
              <UserSubmissionStatsChart stats={submissionStats} />
            )}
          </div>

          {/* Heatmap */}
          <UserActivityHeatmap userId={user.id} />

          {/* Tabs: Recent AC & Solutions & Contest History */}
          <Tabs defaultValue="recent-ac" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
              <TabsTrigger value="recent-ac">Recent AC Problems</TabsTrigger>
              <TabsTrigger value="solutions">Solutions</TabsTrigger>
              <TabsTrigger value="contest-history">Contest History</TabsTrigger>
            </TabsList>

            <TabsContent value="recent-ac" className="mt-6">
              <UserRecentActivity userId={user.id} />
            </TabsContent>

            <TabsContent value="solutions" className="mt-6">
              <UserSolutions userId={user.id} />
            </TabsContent>

            <TabsContent value="contest-history" className="mt-6">
              <UserContestHistory userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
