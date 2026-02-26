import { getLexicalTextLength } from "@/lib/utils";
import { z } from "zod";
import type { UserProfile } from "./user";
import type { UserInfo } from "./states";
import type { Tag } from "./tags";
import type { SampleTestCase } from "./testcases";
export type { SampleTestCase };
import type { Topic } from "./topics";

export enum ProblemDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum ProblemVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum SortBy {
  ID = "id",
  TITLE = "title",
  DIFFICULTY = "difficulty",
  ACCEPTANCE_RATE = "acceptanceRate",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export enum ProblemType {
  STANDALONE = "standalone",
  CONTEST = "contest",
}

export enum MatchMode {
  ANY = "any",
  ALL = "all",
}

export interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  isSystemRole: boolean;
  priority: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Hint {
  order: number;
  content: string;
}

export interface CreateProblemRequest {
  id?: number;
  title: string;
  description: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  difficulty: ProblemDifficulty;
  tagIds: number[];
  topicIds: number[];
  testcaseFile: File | null;
  sampleTestcases: SampleTestCase[];
  constraints: string;
  isPremium: boolean;
  isPublished?: boolean;
  hints?: Hint[];
  officialSolutionContent?: string;
  hasOfficialSolution?: boolean;
  similarProblems?: number[];
  isDraft?: boolean;
}

export interface TestcaseFileResponse {
  id: number;
  fileUrl: string;
}

export interface ProblemQuickStats {
  totalSubmissions: number;
  totalAcceptedSubmissions: number;
  acceptanceRate: number;
  solvedUsers: number;
  averageAttempts: number;
}

export interface Problem {
  id: number;
  title: string;
  slug?: string;
  description: string;
  constraints: string;
  difficulty: ProblemDifficulty;
  isPremium: boolean;
  isPublished?: boolean;
  isActive: boolean;
  totalSubmissions?: number;
  totalAccepted?: number;
  acceptanceRate?: string;
  totalAttempts?: number;
  isDraft?: boolean;
  totalSolved?: number;
  averageTimeToSolve?: number;
  difficultyRating?: number;
  testcaseFileKey?: any;
  testcaseCount?: number;
  timeLimitMs: number;
  memoryLimitKb: number;
  sampleTestcases: SampleTestCase[];
  hints?: Hint[];
  hasOfficialSolution?: boolean;
  officialSolutionContent?: string;
  createdBy?: UserProfile;
  updatedBy?: UserProfile;
  similarProblems?: number[];
  topics: Topic[];
  tags: Tag[];
  createdAt?: string;
  updatedAt?: string;

  // Legacy/Form fields (optional to avoid breaking UI immediately)
  inputDescription?: string;
  outputDescription?: string;
  type?: ProblemType;
  visibility?: ProblemVisibility;
  testcase?: File | null;
  testcaseSamples?: SampleTestCase[]; // Alias for sampleTestcases?
  testcaseFileUrl?: string;
  quickStats?: ProblemQuickStats;
}

export interface ProblemDataResponse {
  id: number;
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  maxScore: number;
  timeLimitMs: number;
  memoryLimitKb: number;
  difficulty: ProblemDifficulty;
  visibility: ProblemVisibility;
  type: ProblemType;
  isDraft?: boolean;
  createdAt?: string;
  updatedAt?: string;
  author: UserInfo;
  tags: Tag[];
  topics: Topic[];
  testcaseFileUrl: string;
  testcaseSamples: SampleTestCase[];
  quickStats: ProblemQuickStats;
}

export const initialProblemData: Problem = {
  id: 0,
  title: "",
  slug: "",
  description: "",
  constraints: "",
  difficulty: ProblemDifficulty.EASY,
  isPremium: false,
  isPublished: true,
  isActive: true,
  totalSubmissions: 0,
  totalAccepted: 0,
  acceptanceRate: "0",
  totalAttempts: 0,
  isDraft: true,
  totalSolved: 0,
  averageTimeToSolve: 0,
  difficultyRating: 0,
  testcaseFileKey: {},
  testcaseCount: 0,
  timeLimitMs: 1000,
  memoryLimitKb: 256000,
  sampleTestcases: [],
  hints: [],
  hasOfficialSolution: false,
  officialSolutionContent: "",
  createdBy: {} as UserProfile, // Placeholder
  updatedBy: {} as UserProfile, // Placeholder
  similarProblems: [],
  topics: [],
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  // Legacy
  inputDescription: "",
  outputDescription: "",
  type: ProblemType.CONTEST,
  visibility: ProblemVisibility.PUBLIC,
  testcase: null,
  testcaseSamples: [],
};

export interface ProblemFilters {
  difficulty?: ProblemDifficulty;
  isActive?: boolean;
  isPremium?: boolean;
  isDraft?: boolean;
  topicIds?: number[];
  tagIds?: number[];
}

export interface GetProblemListRequest {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
  sortBy?: SortBy;
  filters?: ProblemFilters;
  search?: string;
}

export interface ProblemMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProblemListResponse {
  data: Problem[];
  meta: ProblemMeta;
}

export const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const TAG_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

export const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export enum ProblemEndpointType {
  SELECTABLE_FOR_CONTEST = "selectable-for-contest",
  PROBLEM_MANAGEMENT = "managable/teacher",
  TRAINING = "training",
}

export const DIFFICULTY_LABELS = new Map([
  [ProblemDifficulty.EASY, "Easy"],
  [ProblemDifficulty.MEDIUM, "Medium"],
  [ProblemDifficulty.HARD, "Hard"],
]);

export const DIFFICULTY_COLORS = new Map([
  [ProblemDifficulty.EASY, "bg-green-100 text-green-800 hover:bg-green-200"],
  [
    ProblemDifficulty.MEDIUM,
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  ],
  [ProblemDifficulty.HARD, "bg-red-100 text-red-800 hover:bg-red-200"],
]);

export const DEFAULT_DIFFICULTY_COLOR =
  "bg-gray-100 text-gray-800 hover:bg-gray-200";

export const getDifficultyColor = (difficulty: ProblemDifficulty): string => {
  return DIFFICULTY_COLORS.get(difficulty) || DEFAULT_DIFFICULTY_COLOR;
};

export const getDifficultyLabel = (difficulty: ProblemDifficulty): string => {
  return DIFFICULTY_LABELS.get(difficulty) || difficulty;
};

export const ProblemSchema = z.object({
  id: z.number(),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(128, "Title must be at most 128 characters long"),

  slug: z.string().optional(),
  constraints: z
    .string()
    .min(10, "Constraints must be at least 10 characters long"),
  isPremium: z.boolean({ message: "Premium status is required" }),
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  isActive: z.boolean().optional(),
  totalSubmissions: z.number().optional(),
  totalAccepted: z.number().optional(),
  acceptanceRate: z.number().optional(),
  totalAttempts: z.number().optional(),
  totalSolved: z.number().optional(),
  averageTimeToSolve: z.number().optional(),
  difficultyRating: z.number().optional(),
  testcaseFileKey: z.any().optional(),
  sampleTestcases: z.array(z.any()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  testcaseCount: z.number().optional(),
  hints: z.array(z.any()).optional(),
  hasOfficialSolution: z.boolean().optional(),
  officialSolutionContent: z.string().optional(),
  createdBy: z.any().optional(), // Should be User schema but any is fine for now
  updatedBy: z.any().optional(),
  similarProblems: z.array(z.number()).optional(),

  description: z.string().superRefine((val, ctx) => {
    const len = val.trim().length;
    if (len < 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Description must be at least 16 characters long",
      });
    }
    if (len > 5000) {
      // Increased limit for markdown
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Description must be at most 5000 characters long",
      });
    }
  }),

  inputDescription: z.string().optional(),
  outputDescription: z.string().optional(),

  timeLimitMs: z
    .number("Time limit must be a number")
    .positive("Time limit must be a positive number"),

  memoryLimitKb: z
    .number("Memory limit must be a number")
    .positive("Memory limit must be a positive number"),

  difficulty: z.enum(ProblemDifficulty, {
    error: () => ({ message: "Please select a difficulty" }),
  }),
  topics: z
    .array(z.any())
    .min(1, "Please select at least one topic")
    .max(3, "Only 3 topics can be selected"),
  tags: z
    .array(z.any())
    .min(1, "Please select at least one tag")
    .max(4, "Only 4 tags can be selected"),
  // testcase: z.instanceof(File).nullable(), // We'll add custom validation for this
  // testcaseSamples: z
  //   .array(z.any())
  //   .min(1, 'Vui lòng thêm ít nhất một test case mẫu'),
});

export const AllowedTypes = ["application/json"];

export const AllowedExtensions = [".json"];
