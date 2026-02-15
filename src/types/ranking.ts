export interface ContestRatingUser {
  id: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface ContestRatingLeaderboardEntry {
  rank: number;
  user: ContestRatingUser;
  contestRating: number;
  contestsParticipated: number;
}

export interface ContestHistoryEntry {
  contestId: number;
  contestTitle: string;
  contestEndTime: string; // Date string
  contestRank: number;
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
}
