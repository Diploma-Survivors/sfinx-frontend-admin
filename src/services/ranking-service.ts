import clientApi from "@/lib/apis/axios-client";
import { PaginatedResult } from "../types/common";
import {
  ContestHistoryEntry,
  ContestRatingLeaderboardEntry,
} from "../types/ranking";

export const RankingService = {
  /**
   * Get global contest rating leaderboard
   */
  async getContestRatingLeaderboard(
    page = 1,
    limit = 50,
  ): Promise<PaginatedResult<ContestRatingLeaderboardEntry>> {
    const response = await clientApi.get("/users/ranking/contest", {
      params: { page, limit },
    });
    // The response from axios is wrapped in `data` (axios default)
    // The backend interceptor wraps the result in `data` property
    // So if the backend returns PaginatedResultDto as data, it will be in response.data.data
    return response.data.data;
  },

  /**
   * Get user contest history
   */
  async getUserContestHistory(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<ContestHistoryEntry>> {
    const response = await clientApi.get(`/users/${userId}/contest-history`, {
      params: { page, limit },
    });
    // @ts-ignore
    return response.data.data || response.data;
  },

  async rebuildAll() {
    return clientApi.post("/admin/rankings/rebuild");
  },

  async rebuildProblems() {
    return clientApi.post("/admin/rankings/rebuild/problems");
  },

  async rebuildContests() {
    return clientApi.post("/admin/rankings/rebuild/contests");
  },
};
