export interface Author {
  id: number;
  username: string;
  fullName: string | null;
  avatarKey: string | null;
  avatarUrl?: string; // Comments return pre-signed URL/full URL
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  parentId: number | null;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  upvoteCount: number;
  downvoteCount: number;
  replyCount: number;
  isPinned: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  voteScore: number;
  userVote: number | null; // 1 for UPVOTE, -1 for DOWNVOTE (if using enum values)
  replies?: Comment[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  isLocked: boolean;
  isDeleted: boolean;
  author: Author;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
  tagIds?: number[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  tagIds?: number[];
}

export interface FilterPostDto {
  page?: number;
  limit?: number;
  search?: string;
  tagIds?: number[];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  userId?: number;
  showDeleted?: boolean;
}

export interface FilterTagDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}
