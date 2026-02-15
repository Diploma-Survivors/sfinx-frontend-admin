import { PaginatedResult } from "./common";
import { Problem } from "./problems";
import { Tag } from "./tags";

export interface AuthorDto {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface Solution {
  id: number;
  problemId: number;
  problem: Problem;
  title: string;
  content: string;
  authorId: number;
  author: AuthorDto;
  upvoteCount: number;
  downvoteCount: number;
  voteScore: number;
  commentCount: number;
  userVote: number | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  languageIds: number[];
}

export enum SolutionSortBy {
  RECENT = "recent",
  MOST_VOTED = "most_voted",
}

export enum SolutionVoteType {
  UPVOTE = 1,
  DOWNVOTE = -1,
}

export interface FilterSolutionDto {
  page?: number;
  limit?: number;
  problemId?: number;
  keyword?: string;
  tagIds?: number[];
  languageIds?: number[];
  sortBy?: SolutionSortBy;
}

export interface CreateSolutionDto {
  problemId: number;
  title: string;
  content: string;
  tagIds?: number[];
  languageIds?: number[];
}

export interface UpdateSolutionDto {
  title?: string;
  content?: string;
  tagIds?: number[];
  languageIds?: number[];
}

export interface VoteDto {
  voteType: SolutionVoteType;
}

export enum SolutionCommentVoteType {
  UPVOTE = 1,
  DOWNVOTE = -1,
}

export interface SolutionComment {
  id: number;
  solutionId: number;
  parentId: number | null;
  content: string;
  upvoteCount: number;
  downvoteCount: number;
  replyCount: number;
  replyCounts: number;
  isPinned: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  voteScore: number;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  userVote?: SolutionCommentVoteType | null;
  replies?: SolutionComment[];
}

export interface CreateCommentDto {
  solutionId: number;
  content: string;
  parentId?: number;
}
