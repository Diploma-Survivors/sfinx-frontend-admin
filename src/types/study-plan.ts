import { Tag } from "./tags";
import { Topic } from "./topics";
import { Problem } from "./problems";

export enum StudyPlanDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum StudyPlanStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
}

export interface StudyPlanTranslationDto {
  languageCode: string;
  name: string;
  description: string;
}

export interface StudyPlanDayResponseDto {
  dayNumber: number;
  items: StudyPlanItemResponseDto[];
}

export interface StudyPlanItemResponseDto {
  id: number;
  dayNumber: number;
  orderIndex: number;
  note: string | null;
  problem: Problem;
  progressStatus: string | null;
}

export interface AdminStudyPlanItemResponseDto {
  id: number;
  dayNumber: number;
  orderIndex: number;
  note: Record<string, string> | null;
  problem: Problem;
}

export interface AdminStudyPlanDayResponseDto {
  dayNumber: number;
  items: AdminStudyPlanItemResponseDto[];
}

export interface StudyPlanCardResponseDto {
  id: number;
  slug: string;
  name: string;
  difficulty: StudyPlanDifficulty;
  coverImageUrl: string | null;
  estimatedDays: number;
  isPremium: boolean;
  totalProblems: number;
}

export interface AdminStudyPlanResponseDto extends StudyPlanCardResponseDto {
  description: string;
  status: StudyPlanStatus;
  enrollmentCount: number;
  similarPlanIds: number[];
  topics: Topic[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStudyPlanDetailResponseDto extends AdminStudyPlanResponseDto {
  translations: StudyPlanTranslationDto[];
  days: AdminStudyPlanDayResponseDto[];
}

export interface StudyPlanDetailResponseDto extends StudyPlanCardResponseDto {
  description: string;
  enrollmentCount: number;
  topics: Topic[];
  tags: Tag[];
  status: StudyPlanStatus;
  isEnrolled: boolean;
  solvedCount: number;
  enrollmentStatus: EnrollmentStatus;
  days: StudyPlanDayResponseDto[];
  translations?: StudyPlanTranslationDto[];
}

export interface CreateStudyPlanDto {
  slug: string;
  difficulty: StudyPlanDifficulty;
  isPremium?: boolean;
  translations: StudyPlanTranslationDto[];
  topicIds?: number[];
  tagIds?: number[];
  similarPlanIds?: number[];
}

export interface UpdateStudyPlanDto extends Partial<CreateStudyPlanDto> {
  status?: StudyPlanStatus;
}

export interface AddStudyPlanItemDto {
  problemId: number;
  dayNumber: number;
  orderIndex?: number;
  note?: Record<string, string>;
}

export interface ReorderItemDto {
  id: number;
  dayNumber: number;
  orderIndex: number;
}

export interface ReorderItemsDto {
  items: ReorderItemDto[];
}

export interface FilterStudyPlanDto {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: StudyPlanDifficulty;
  status?: StudyPlanStatus;
  topicId?: number;
  tagId?: number;
  isPremium?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  lang?: string;
}
